import { notification } from "antd";
import { isEqual } from "lodash";
import { useMemo, useState } from "react";
import { getPromptOutput, getResponse } from "../api/chat";
import {
  AppState,
  Prompt,
  useAppState,
  Workflow,
  WorkflowRunHistoryItem,
} from "../App";
import {
  batchToposortDag,
  filterInputNodes,
  getNodePromptMapping,
  workflowToDag,
  mergeWorkflowRunOutputs,
  resolvePrompt,
  filterInputFlowNodes,
  flowToDag,
  getNodePromptTextMapping,
  buildPrompt,
  resolveTextParams,
} from "../utils";
import merge from "lodash/merge";
import { createFlowRun, FlowVersion, updateFlowRun } from "../api/flows";
import { FlowRun } from "../api/flows";

const useFlow = (flowVersion: FlowVersion) => {
  console.log("Loaded useFlow with flow version", flowVersion);
  const app = useAppState();
  const [runId, setRunId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRun, setLastRun] = useState<FlowRun | null>(null);
  // const pastRunIndex = useMemo(() => {
  //   return app.workflowRuns.findIndex((r) => r.id === runId);
  // }, [app.workflowRuns, runId]);
  // const lastRun = pastRunIndex !== -1 ? app.workflowRuns[pastRunIndex] : null;
  const updateRun = async (run: FlowRun, attrs: Partial<FlowRun>) => {
    const { data, error } = await updateFlowRun(run, attrs);
    if (!data || error) {
      console.error("Coudl not update flow!", error);
    }
    setLastRun(data);
    return data as FlowRun;
    // setLastRun((prev) => merge(prev, values));
  };
  const runFlow = async (parameters: Record<string, string>) => {
    if (!flowVersion?.id || !flowVersion.edges || !flowVersion.nodes) {
      console.error("Flow version not provided!");
      return;
    }
    console.log("flowVersion", flowVersion);

    // TODO: move this to a edge function
    try {
      // create the run item
      let run: FlowRun | null;
      const { data, error: createRunError } = await createFlowRun(
        flowVersion,
        parameters
      );
      run = data;
      if (!run || createRunError) {
        console.error("Could not create run!", createRunError);
        return;
      }
      setLastRun(run);
      console.log("Create flow", { parameters });
      // run the flow
      const inputNodeIds = filterInputFlowNodes(flowVersion).map((n) => n.id);
      const nodePromptTextMapping = getNodePromptTextMapping(flowVersion);

      const dag = flowToDag(flowVersion);
      const batches = batchToposortDag(dag);

      let nodeResponses: FlowRun["outputs"]["nodeResponses"] = {};
      let nodeErrors: FlowRun["outputs"]["nodeErrors"] = {};

      // setLastRun(updatedStatusRun);
      run = await updateRun(run, { status: "running" });
      console.log("update flow status to running");

      // work through the batch in parallel
      for (const batch of batches) {
        // return early if previous batches had errors
        if (!isEqual(nodeErrors, {})) {
          throw new Error("Previous batch has error.");
        }

        const resultsWithIndex = await Promise.all(
          batch.map((nodeId) => {
            const prompt_text = nodePromptTextMapping[nodeId];
            if (!prompt_text) {
              throw new Error("Prompt text is empty!");
            }
            // if input node, merge with params, otherwise only use prev outputs
            const isInputNode = inputNodeIds.includes(nodeId);
            const nodeParameters = flowVersion.edges.reduce(
              (acc, edge) => {
                if (
                  edge.from_node_id &&
                  nodeResponses[edge.from_node_id] &&
                  edge.to_node_id === nodeId
                ) {
                  const response = nodeResponses[edge.from_node_id];
                  const content = response.choices[0]?.message?.content || "";
                  acc[edge.to_input] = content;
                  return acc;
                }
                return acc;
              },
              isInputNode ? parameters : ({} as Record<string, string>)
            );

            // resolve prompt with starting parameters and
            // output parameters.
            const resolvedPrompt = resolveTextParams(
              prompt_text,
              nodeParameters
            );

            return getPromptOutput(resolvedPrompt).then((response) => {
              console.log("Received prompt output :", response);
              return [nodeId, response];
            });
          })
        );
        const batchResults: typeof nodeResponses =
          Object.fromEntries(resultsWithIndex);
        nodeResponses = merge(nodeResponses, batchResults);
        run = await updateRun(run, {
          outputs: {
            nodeErrors: run.outputs.nodeErrors,
            flowError: run.outputs.flowError,
            nodeResponses,
          } as FlowRun["outputs"],
        });

        console.log("update output.nodeResponses:", { nodeResponses });
        // mergeWorkflowRunOutputs(app, runId, { outputs: { nodeResponses } });
      }

      // update history item
      // mergeWorkflowRunOutputs(app, runId, { status: "complete" });
    } catch (e: any) {
      // update the history item of error
      console.error("Error while fetching response", e);
      notification.error({
        message: `Error occured while running workflow.\n${e?.message || ""}`,
      });
      console.log("update flow status", "error");
      console.log("update output.flowError:", e?.message);
      // mergeWorkflowRunOutputs(app, runId, {
      //   status: "error",
      //   outputs: { workflowError: e?.message },
      // });
    }
  };

  return {
    runFlow,
    isLoading,
    lastRun,
    clearLastRun: () => setLastRun(null),
  };
};

export default useFlow;
