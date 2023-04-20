import { isEqual } from "lodash";
import { useMemo } from "react";
import { Workflow, WorkflowRunHistoryItem } from "../App";
import { listTerminalOutputNodes } from "../utils";
import PromptResult from "./PromptResult";
import pickBy from "lodash/pickBy";

interface Props {
  workflow: Workflow;
  run: WorkflowRunHistoryItem;
}

const WorkflowResult: React.FC<Props> = ({ workflow, run }) => {
  if (run.outputs.workflowError)
    return <div>{`Workflow error: ${run.outputs.workflowError}`}</div>;
  if (run.status === "complete" && isEqual(run.outputs.nodeResponses, {}))
    return <span>No prompt responses!</span>;

  const [_terminalNodes, terminalNodeIds] = useMemo(() => {
    const nodes = listTerminalOutputNodes(workflow);
    const nodeIds = nodes.map((n) => n.id);
    return [nodes, nodeIds];
  }, [workflow.edges, workflow.nodes]);

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
export default WorkflowResult;
