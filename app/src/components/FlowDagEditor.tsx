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
  Dropdown,
} from "antd";
import {
  batchToposortDag,
  extractParametersFromText,
  extractPromptParameters,
  flowToDag,
  getNodePromptMapping,
  workflowToDag,
} from "../utils";
import { Check, Copy, Eye, Trash, Unlink, X } from "lucide-react";
import isEqual from "lodash/isEqual";
import PreviewPromptModal from "./PreviewPromptModal";
import PromptResult from "./PromptResult";
import { FlowVersion } from "../api/flows";
import { CreateChatCompletionResponse } from "openai";
import { useFlowEditorState } from "../pages/FlowEditor";
import MonacoEditor from "./MonacoEditor";
export interface FlowDagEditorProps {
  onChange: (attrs: Attrs) => void;
  className?: string;
  flowVersion?: FlowVersion;
  onMove?: () => void;
  onDrag?: () => void;
  onPromptRemove: (nodeId: string) => void;
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

const FlowDagEditor = ({
  onChange,
  flowVersion,
  className,
  onMove,
  onDrag,
  onPromptRemove,
  run,
}: FlowDagEditorProps) => {
  const app = useAppState();
  const editor = useFlowEditorState();

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
          onRemove: onPromptRemove,
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
        onPaneClick={() => {
          editor.mergeState({ selectedNodeId: null });
        }}
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
    onRemove: FlowDagEditorProps["onPromptRemove"];
  };
}

const PromptNode = (props: PromptNodeProps) => {
  const editor = useFlowEditorState();
  const app = useAppState();
  const promptText = props.data.prompt_text;
  const nodeId = props.data.id;
  const nodeIndex = props.data.index;
  const nodeResponse:
    | WorkflowRunHistoryItem["outputs"]["nodeResponses"][string]
    | undefined = props.data.nodeResponse;
  const nodeError:
    | WorkflowRunHistoryItem["outputs"]["nodeErrors"][string]
    | undefined = props.data.nodeErrors;
  const inputs = extractParametersFromText(promptText || "");

  useEffect(() => {
    if (props.dragging && editor.selectedNodeId !== nodeId) {
      onSelect();
    }
  }, [props.xPos, props.yPos, props.dragging]);
  const showStatus = !!(nodeResponse || nodeError);

  const onSelect = () => {
    editor.mergeState({ selectedNodeId: nodeId });
  };

  // needed so that when we remove the prompt, the currently rendererd prompt node will stop rendering
  if (props.data.prompt_text === undefined) return null;

  return (
    <>
      <Dropdown
        trigger={["contextMenu"]}
        placement="bottomLeft"
        menu={{
          className: "w-48",
          items: [
            {
              key: "unlink",
              icon: <Unlink size={16} />,
              label: "Remove connections",
              onClick: props.data.onUnlink,
            },
            {
              key: "delete",
              icon: <Trash size={16} />,
              label: "Delete",
              onClick: () => props.data.onRemove(nodeId),
            },
          ],
        }}
      >
        <Card
          className={[
            "w-96 p-0 transition duration-500",
            props.dragging ? "shadow-xl" : "",
            editor.selectedNodeId === nodeId
              ? "dark:bg-slate-900 dark:border-slate-500 border-blue-500 bg-blue-100"
              : "dark:border-gray-700 dark:bg-neutral-900 border-gray-500 bg-white",
          ].join(" ")}
          bodyStyle={{ padding: 0 }}
          size="small"
          onClick={onSelect}
        >
          <Tooltip title={`Prompt Output`}>
            <Handle
              type="source"
              position={Position.Right}
              className="-right-4 opacity-75 w-5 h-5 !cursor-pointer dark:hover:bg-gray-500 hover:bg-gray-400 "
            />
          </Tooltip>
          <div className="flex flex-row justify-between items-center pr-1">
            <div className={[showStatus ? "w-52" : "w-full"].join(" ")}>
              <Form.Item name={["nodes", nodeIndex, "id"]} hidden />
              {/* <Form.Item name={["nodes", nodeIndex, "prompt_text"]}>
                {/* <Input.TextArea autoSize={{ maxRows: 10, minRows: 5 }} autoFocus/> */}
              {/* </Form.Item> */}
                <MonacoEditor
                  className="rounded-tl-xl rounded-tr-xl h-48"
                  darkMode={app.darkMode}
                  id={`editor-${nodeId}-${nodeIndex}`}
                  defaultValue={promptText}
                  onInputChange={(value) => {
                    editor.form?.setFieldValue(
                      ["nodes", nodeIndex, "prompt_text"],
                      value
                    );
                  }}
                />
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
      </Dropdown>
    </>
  );
};
export default FlowDagEditor;
