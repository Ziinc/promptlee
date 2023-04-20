import { notification } from "antd";
import { isEqual } from "lodash";
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionResponse,
} from "openai";
import { useMemo, useState } from "react";
import { getResponse } from "../api/chat";
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
} from "../utils";
import merge from "lodash/merge";

const useWorkflow = () => {
  const app = useAppState();
  const [workflowRunId, setWorkflowRunId] = useState("");
  const pastRunIndex = useMemo(() => {
    return app.workflowRuns.findIndex((r) => r.id === workflowRunId);
  }, [app.workflowRuns, workflowRunId]);
  const lastRun = pastRunIndex !== -1 ? app.workflowRuns[pastRunIndex] : null;
  const runWorkflow = async (
    workflow: Workflow,
    parameters: WorkflowRunHistoryItem["inputs"]["parameters"]
  ) => {
    if (!workflow.edges || !workflow.nodes) return;
    // create the history item
    const runId = crypto.randomUUID();
    app.mergeAppState({
      workflowRuns: [
        ...app.workflowRuns,
        {
          id: runId,
          workflow_id: workflow.id,
          inputs: { parameters },
          status: "started",
          outputs: {
            nodeResponses: {},
            nodeErrors: {},
            workflowError: null,
          },
          started_at: new Date().toISOString(),
          stopped_at: null,
        },
      ],
    });

    setWorkflowRunId(runId);
    try {
      const inputNodeIds = filterInputNodes(workflow).map((n) => n.id);
      // run workflow until all endpoints done.
      const nodePromptMapping = getNodePromptMapping(app, workflow);

      const dag = workflowToDag(workflow);
      const batches = batchToposortDag(dag);

      let nodeResponses: WorkflowRunHistoryItem["outputs"]["nodeResponses"] =
        {};
      let nodeErrors: WorkflowRunHistoryItem["outputs"]["nodeErrors"] = {};
      // work through the batch in parallel
      let nodeOutputs: Record<string, string> = {};

      mergeWorkflowRunOutputs(app, runId, {
        status: "running",
      });

      for (const batch of batches) {
        // return early if previous batches had errors
        if (!isEqual(nodeErrors, {})) {
          throw new Error("Previous batch has error.");
        }

        const resultsWithIndex = await Promise.all(
          batch.map((nodeId) => {
            const prompt = nodePromptMapping[nodeId];
            if (!prompt) {
              throw new Error(
                "Prompt could not be found and may have been deleted."
              );
            }
            // if input node, merge with params, otherwise only use prev outputs
            const isInputNode = inputNodeIds.includes(nodeId);
            const nodeParameters = workflow.edges.reduce(
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
            const resolvedPrompt = resolvePrompt(prompt, nodeParameters);

            return getPromptResponse(app, resolvedPrompt).then((response) => {
              return [nodeId, response];
            });
          })
        );
        const batchResults: typeof nodeResponses =
          Object.fromEntries(resultsWithIndex);
        nodeResponses = merge(nodeResponses, batchResults);
        mergeWorkflowRunOutputs(app, runId, { outputs: { nodeResponses } });
      }

      // update history item
      mergeWorkflowRunOutputs(app, runId, { status: "complete" });
    } catch (e: any) {
      // update the history item of error
      console.error("Error while fetching response", e);
      notification.error({
        message: `Error occured while running workflow.\n${e?.message || ""}`,
      });
      mergeWorkflowRunOutputs(app, runId, {
        status: "error",
        outputs: { workflowError: e?.message },
      });
    }
  };

  return {
    runWorkflow,
    lastRun,
    clearLastRun: () => setWorkflowRunId(""),
  };
};

const getPromptResponse = async (app: AppState, prompt: Prompt) => {
  return await getResponse(prompt.messages, {
    apiKey: app.apiKey,
  });
};

export default useWorkflow;
