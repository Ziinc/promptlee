import { isEqual } from "lodash";
import { useMemo } from "react";
import { Workflow, WorkflowRunHistoryItem } from "../App";
import { listTerminalOutputNodes, listTerminalOutputNodesFlow } from "../utils";
import PromptResult from "./PromptResult";
import pickBy from "lodash/pickBy";
import { Flow, FlowRun, FlowVersion } from "../api/flows";

interface Props {
  flowVersion: FlowVersion;
  run: FlowRun;
}

const FlowResult: React.FC<Props> = ({ flowVersion, run }) => {
  if (run.outputs.flowError)
    return <div>{`Flow error: ${run.outputs.flowError}`}</div>;
  if (run.status === "complete" && isEqual(run.outputs.nodeResponses, {}))
    return <span>No prompt responses!</span>;

  const [_terminalNodes, terminalNodeIds] = useMemo(() => {
    const nodes = listTerminalOutputNodesFlow(flowVersion);
    const nodeIds = nodes.map((n) => n.id);
    return [nodes, nodeIds];
  }, [flowVersion.edges, flowVersion.nodes]);

  const responses = useMemo(() => {
    const nodeResponses = pickBy(run.outputs.nodeResponses, (_value, key) => {
      return terminalNodeIds.includes(key);
    });

    return Object.values(nodeResponses).sort((a, b) => a.created - b.created);
  }, [
    JSON.stringify(terminalNodeIds),
    JSON.stringify(run.outputs.nodeResponses),
  ]);

  return (
    <div className="flex flex-col gap-2">
      {responses.map((response) => (
        <PromptResult key={response.id} result={response} />
      ))}
    </div>
  );
};
export default FlowResult;
