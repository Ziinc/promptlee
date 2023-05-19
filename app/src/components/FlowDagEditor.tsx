import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppState, WorkflowRunHistoryItem } from "../App";

import ReactFlow, {
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  Edge,
  Node,
  Handle,
  Position,
  NodeToolbar,
  NodeProps,
  NodeChange,
  EdgeChange,
  Connection,
} from "reactflow";
import {
  Form,
  Input,
  Button,
  Card,
  Divider,
  List,
  Tooltip,
  message,
  Popover,
} from "antd";
import {
  batchToposortDag,
  extractParametersFromText,
  extractPromptParameters,
  flowToDag,
  getNodePromptMapping,
  workflowToDag,
} from "../utils";
import { Check, Copy, Eye, Unlink, X } from "lucide-react";
import isEqual from "lodash/isEqual";
import PreviewPromptModal from "./PreviewPromptModal";
import PromptResult from "./PromptResult";
import { FlowVersion } from "../api/flows";
import { CreateChatCompletionResponse } from "openai";
export interface DagEditorProps {
  onChange: (attrs: Attrs) => void;
  className?: string;
  flowVersion?: FlowVersion;
  onMove?: () => void;
  onDrag?: () => void;
  run?: WorkflowRunHistoryItem;
}

interface Attrs {
  nodes?: FlowVersion["nodes"];
  edges?: FlowVersion["edges"];
}

const rfNodeToFvNode = (node: Node): FlowVersion["nodes"][number] => ({
  id: node.id,
  prompt_text: node.data.prompt_text,
  rf_meta: { position: node.position },
});
const rfEdgeToWfEdge = (edge: Edge): FlowVersion["edges"][number] => {
  return {
    id: edge.id,
    from_node_id: edge.source,
    to_node_id: edge.target,
    to_input: edge.targetHandle as string,
  };
};

const FlowDagEditor: React.FC<DagEditorProps> = ({
  onChange,
  flowVersion,
  className,
  onMove,
  onDrag,
  run,
}) => {
  const app = useAppState();

  const maybeChange = (attrs: Attrs) => {
    const edgesChanged = Boolean(
      attrs.edges && !isEqual(attrs.edges, flowVersion?.edges)
    );
    const nodesChanged = Boolean(
      attrs.nodes && !isEqual(attrs.nodes, flowVersion?.nodes)
    );
    if (nodesChanged || edgesChanged) {
      onChange(attrs);
    }
  };
  const [nodes, nodePromptMapping] = useMemo(() => {
    const nodes: Node[] = (flowVersion?.nodes || []).map((node, index) => {
      return {
        id: node.id,

        position: node?.rf_meta?.position || {
          x: 100 + index * 40,
          y: 100 + index * 20,
        },

        data: {
          id: node.id,
          index: index,
          onRemove: () => {
            onNodesChange([{ id: node.id, type: "remove" }]);
          },
          onUnlink: () => {
            const toRemove = edges
              .filter(
                (edge) => edge.source === node.id || edge.target === node.id
              )
              .map((edge) => ({ type: "remove" as const, id: edge.id }));
            onEdgesChange(toRemove);
          },
          prompt_text: node.prompt_text,
          nodeResponse: run?.outputs.nodeResponses[node.id],
          nodeError: run?.outputs.nodeErrors[node.id],
        },
        type: "prompt",
      };
    });
    const mapping =
      flowVersion && flowVersion.nodes
        ? getNodePromptMapping(app, flowVersion)
        : {};
    return [nodes, mapping];
  }, [flowVersion?.nodes, JSON.stringify(run?.outputs.nodeResponses)]);
  const edges: Edge[] = useMemo(() => {
    return (flowVersion?.edges || []).map((edge, index) => {
      return {
        id: edge.id,
        source: edge.from_node_id || "",
        target: edge.to_node_id || "",
        targetHandle: edge.to_input,
        animated: true,
      };
    });
  }, [flowVersion?.edges]);
  //   const [edges, setEdges] = useState<Edge[]>([]);
  const nodeTypes = useMemo(
    () => ({
      prompt: PromptNode,
    }),
    []
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes).map(rfNodeToFvNode);
      maybeChange({ nodes: newNodes });
    },
    [nodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const nodeIds = nodes.map((node) => node.id);
      const cleanedEdges = edges.filter(
        (edge) =>
          nodeIds?.includes(edge.source) && nodeIds?.includes(edge.target)
      );
      const newEdges = applyEdgeChanges(changes, cleanedEdges).map(
        rfEdgeToWfEdge
      );
      maybeChange({ edges: newEdges });
    },
    [edges, nodes]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const nodeIds = nodes.map((node) => node.id);
      const cleanedEdges = edges.filter(
        (edge) =>
          nodeIds?.includes(edge.source) && nodeIds?.includes(edge.target)
      );

      // don't allow two edges to conflict with same node-parameter edge
      const conflictingEdge = cleanedEdges.find(
        (e) =>
          e.target === params.target && e.targetHandle == params.targetHandle
      );
      if (conflictingEdge) {
        message.open({ type: "error", content: "Parameter already filled!" });
        return;
      }
      const newEdges = addEdge(params, cleanedEdges).map(rfEdgeToWfEdge);

      // check if valid dag
      try {
        const dag = flowToDag({
          ...flowVersion,
          edges: newEdges,
        } as FlowVersion);
        batchToposortDag(dag);
      } catch (e: any) {
        if (e && (e.message as string).toLowerCase().includes("cycle"))
          message.open({
            type: "error",
            content: `Workflows cannot be cyclic`,
          });
        return;
      }
      maybeChange({ edges: newEdges });
    },
    [edges, nodes]
  );

  return (
    <div className={[className, "relative"].join(" ")}>
      <ReactFlow
        onMove={onMove}
        onNodeDrag={onDrag}
        className="h-72"
        edges={edges}
        nodes={nodes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

interface PromptNodeProps extends NodeProps {
  data: {
    id: string; // node id
    index: number;
    prompt_text: string;

    nodeResponse: CreateChatCompletionResponse;
    nodeErrors: string[];
    onUnlink: () => void;
    onRemove: () => void;
  };
}

const PromptNode = (props: PromptNodeProps) => {
  const promptText = props.data.prompt_text;
  const nodeId = props.data.id;
  const nodeIndex = props.data.index;
  const nodeResponse:
    | WorkflowRunHistoryItem["outputs"]["nodeResponses"][string]
    | undefined = props.data.nodeResponse;
  const nodeError:
    | WorkflowRunHistoryItem["outputs"]["nodeErrors"][string]
    | undefined = props.data.nodeErrors;
  const inputs = extractParametersFromText(promptText);
  const [showToolbar, setShowToolbar] = useState(false);

  useEffect(() => {
    setShowToolbar(false);
  }, [props.xPos, props.yPos, props.dragging]);
  const showStatus = !!(nodeResponse || nodeError);
  return (
    <>
      <NodeToolbar
        isVisible={showToolbar}
        position={Position.Top}
        onBlur={() => setShowToolbar(false)}
      >
        <div className="w-48 flex justify-end gap-2">
          <Tooltip title="Remove all input-output flows">
            <Button
              icon={<Unlink size={12} />}
              size="small"
              danger
              onClick={() => {
                props.data.onUnlink();
                setShowToolbar(false);
              }}
            />
          </Tooltip>
          <Tooltip title="Remove prompt">
            <Button
              icon={<X size={12} />}
              size="small"
              danger
              onClick={() => {
                props.data.onRemove();
                setShowToolbar(false);
              }}
            />
          </Tooltip>
        </div>
      </NodeToolbar>
      <Card
        className="w-64 px-3 py-2 shadow-lg"
        bodyStyle={{ padding: 0 }}
        size="small"
        onClick={() => setShowToolbar((prev) => !prev)}
        onBlur={() => setShowToolbar(false)}
      >
        <Tooltip title={`Output for '${props.data.prompt_text}'`}>
          <Handle
            type="source"
            position={Position.Right}
            className="-right-3 opacity-75 w-5 h-5 !cursor-pointer dark:hover:bg-gray-500 hover:bg-gray-400 "
          />
        </Tooltip>
        <div className="pb-2 flex flex-row justify-between items-center pr-1">
          <div className={[showStatus ? "w-52" : "w-full"].join(" ")}>
            <Form.Item name={["nodes", nodeIndex, "id"]} hidden />
            <Form.Item name={["nodes", nodeIndex, "prompt_text"]}>
              <Input.TextArea />
            </Form.Item>
            {/* <PreviewPromptModal prompt={props.data.prompt_text}>
              <Tooltip title={`Preview '${props.data.prompt_text}'`}>
                <Button
                  type="text"
                  className=" group px-2 py-1 flex flex-row text-left justify-start gap-2 items-center"
                >
                  <h4
                    className={[
                      "m-0 font-bold truncate ",
                      showStatus ? "w-40" : "w-full",
                    ].join(" ")}
                  >
                    {props.data.prompt_text}
                  </h4>
                  <Eye
                    size={12}
                    className="group-hover:opacity-100 opacity-0 transition-all duration-500"
                  />
                </Button>
              </Tooltip>
            </PreviewPromptModal> */}
          </div>
          {showStatus && (
            <Popover
              content={
                <>
                  {nodeResponse && (
                    <div className="flex flex-col items-end gap-2">
                      <PromptResult result={nodeResponse} />

                      <Tooltip title="Copy to clipboard">
                        <Button
                          size="small"
                          className="flex flex-row justify-center items-center gap-1"
                          onClick={() => {
                            if (
                              !navigator.clipboard ||
                              !nodeResponse.choices[0].message
                            )
                              return;
                            navigator.clipboard.writeText(
                              nodeResponse.choices[0].message?.content!
                            );
                          }}
                          icon={<Copy size={14} />}
                        >
                          Copy to clipboard
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                  {nodeError && (
                    <p className="text-sm font-mono">
                      {JSON.stringify(nodeError)}
                    </p>
                  )}
                </>
              }
            >
              <div
                className={[
                  "w-5 h-5 flex justify-center items-center rounded-full",
                  "cursor-pointer",
                  nodeResponse
                    ? "dark:text-green-400 text-green-800 dark:bg-green-900 bg-green-200"
                    : "",
                  nodeError
                    ? "dark:text-red-400 text-red-800 dark:bg-red-900 bg-red-200"
                    : "",
                ].join(" ")}
              >
                {nodeResponse && <Check size={14} strokeWidth={2} />}
                {nodeError && <X size={14} strokeWidth={2} />}
              </div>
            </Popover>
          )}
        </div>
        {inputs.length > 0 && (
          <>
            <Divider className="my-0" />

            <List
              dataSource={inputs}
              renderItem={(input) => (
                <div className="relative mt-1 py-1 px-2  rounded">
                  <Tooltip title={`Input for @${input} parameter`}>
                    <Handle
                      type="target"
                      id={input}
                      position={Position.Left}
                      className="absolute -left-5 opacity-75 w-3.5 h-3.5 dark:hover:bg-gray-500 hover:bg-gray-400 !cursor-pointer"
                    />
                  </Tooltip>
                  <span className="font-mono text-xs">{input}</span>
                </div>
              )}
            />
          </>
        )}
      </Card>
    </>
  );
};
export default FlowDagEditor;
