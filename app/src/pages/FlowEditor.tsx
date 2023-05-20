import MainLayout from "../layouts/MainLayout";
import {
  Button,
  Card,
  Tooltip,
  Form,
  notification,
  Input,
  Drawer,
  Table,
  Descriptions,
  Tabs,
  Tag,
  Popover,
  Dropdown,
  Divider,
  FormInstance,
} from "antd";
import dayjs from "dayjs";
import { Link, useLocation } from "wouter";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Prompt, useAppState, Workflow } from "../App";
import {
  ArrowLeft,
  Eye,
  MoreHorizontal,
  Play,
  Plus,
  Save,
  FileText,
  X,
  Check,
  AlignLeft,
  Unlink,
  Trash,
} from "lucide-react";
import { countWorkflowOutputs, countWorkflowParameters } from "../utils";
import DagEditor from "../components/DagEditor";
import useWorkflow from "../hooks/useWorkflow";
import RunWorkflowModal from "../components/RunWorkflowModal";
import PreviewPromptModal from "../components/PreviewPromptModal";
import WorkflowResult from "../components/WorkflowResult";
import LoadingSpinner from "../components/LoadingSpinner";
import FlowsLayout from "../layouts/FlowsLayout";
import {
  createFlow,
  createFlowVersion,
  Flow,
  FlowVersion,
  getLatestFlowVersion,
} from "../api/flows";
import FlowDagEditor from "../components/FlowDagEditor";
import debounce from "lodash/debounce";

export interface FlowEditorState {
  selectedNodeId: string | null;
}

export interface FlowEditorContextValue extends FlowEditorState {
  form: FormInstance | null;
  mergeState: (partial: Partial<FlowEditorState>) => void;
}
const DEFAULT_STATE = {
  selectedNodeId: null,
};

export const FlowEditorContext = createContext<FlowEditorContextValue>({
  ...DEFAULT_STATE,
  form: null,
  mergeState: () => null,
});

export const useFlowEditorState = () => useContext(FlowEditorContext);

const FlowEditor = ({ params }: { params: { id: string } }) => {
  const [form] = Form.useForm();
  const [editorState, setEditorState] =
    useState<FlowEditorState>(DEFAULT_STATE);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [_location, navigate] = useLocation();
  const app = useAppState();

  const [version, setVersion] = useState<FlowVersion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const flow = (app.flows || [])?.find((flow) => flow.id == params?.id);

  useEffect(() => {
    // on mount, load latest version
    if (params.id) {
      fetchVersion();
    } else {
      setShowSidebar(true);
    }
  }, []);
  const fetchVersion = async () => {
    setIsLoading(true);
    const res = await getLatestFlowVersion(params.id);
    const { data, error } = res;
    console.log("res", res);
    if (error) {
      console.error("Unable to fetch latest version", error);
    }
    console.log("data", data);
    if (data) {
      // no version fetched, return
      console.log("setting latest version", data);
      setVersion(data as any);
      console.log("data", data);
      form.setFieldsValue(data);
    }
    setIsLoading(false);
  };

  const mergeState: FlowEditorContextValue["mergeState"] = (partial) => {
    setEditorState((prev) => ({ ...prev, ...partial }));
  };
  // const handleDelete = async () => {
  //   const cfm = confirm(
  //     "Are you sure you want to delete this workflow? This cannot be undone."
  //   );
  //   if (!cfm) return;
  //   app.setAppState((prev) => ({
  //     ...prev,
  //     workflows: prev.workflows.filter((p) => p.id !== params.id),
  //   }));
  //   navigate("/workflows");
  //   notification.success({ message: "Deleted!", placement: "bottomRight" });
  // };
  const handleSave = useCallback(async () => {
    if (!flow) return;
    const attrs = form.getFieldValue([]);
    console.log("saving attrs", attrs);
    await createFlowVersion(flow.id, attrs);
  }, [form, flow]);
  const debouncedHandleSave = useMemo(
    () => debounce(handleSave, 600),
    [handleSave]
  );

  const handleAddPrompt = () => {
    const formNodes = form.getFieldValue("nodes") || [];
    form.setFieldValue("nodes", [
      ...formNodes,
      {
        id: crypto.randomUUID(),
        prompt_text: "As a ____, do ____ with the following text:\n@text",
      } as FlowVersion["nodes"][number],
    ]);
  };

  const handleDeletePrompt = async (nodeId: string) => {
    const nodes: FlowVersion["nodes"] = form.getFieldValue("nodes") || [];
    const edges: FlowVersion["edges"] = form.getFieldValue("edges") || [];
    const newNodes = nodes.filter((node) => node.id !== nodeId);
    const newEdges = edges.filter(
      (edge) => edge.from_node_id !== nodeId && edge.to_node_id !== nodeId
    );

    form.setFieldsValue({
      nodes: newNodes,
      edges: newEdges,
    });
    debouncedHandleSave();
  };

  const handleUnlink = async () => {
    if (!editorState.selectedNodeId) return;
    const nodeId = editorState.selectedNodeId;
    const edges: FlowVersion["edges"] = form.getFieldValue("edges") || [];
    const newEdges = edges.filter(
      (edge) => edge.from_node_id !== nodeId && edge.to_node_id !== nodeId
    );
    form.setFieldValue("edges", newEdges);
    debouncedHandleSave();
  };

  const formValues = Form.useWatch([], form);
  const isToolbarDisabled = !flow;

  return (
    <FlowEditorContext.Provider
      value={{
        ...editorState,
        form,
        mergeState,
      }}
    >
      <Form
        className=""
        form={form}
        initialValues={{ nodes: [], edges: [] }}
        onFieldsChange={() => {
          // trigger save
          debouncedHandleSave.cancel();
          debouncedHandleSave();
        }}
      >
        <Form.Item hidden name="nodes" />
        <Form.Item hidden name="edges" />
        <FlowsLayout
          showSidebar={showSidebar}
          toolbarActions={
            <div>
              {/* second layer */}
              <div className="px-2 py-1 flex flex-row gap-1">
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    className: "w-48",
                    items: [
                      {
                        key: "new",
                        label: "New",
                        onClick: async () => {
                          const { data, error } = await createFlow();
                          if (error) return;
                          window.open(`/flows/${data!.id}`);
                        },
                      },
                      {
                        key: "open",
                        label: "Open",
                        onClick: () => {
                          setTimeout(() => {
                            setShowSidebar(true);
                          }, 200);
                        },
                      },
                      {
                        key: "copy",
                        label: "Make a copy",
                        onClick: async () => {
                          if (!flow) {
                            console.error("No flow selected!");
                            return;
                          }
                          const { data, error } = await createFlow({
                            name: `${flow.name} copy`,
                          });
                          window.open(`/flows/${data!.id}`);
                        },
                      },
                      { key: "div", type: "divider" },
                      {
                        key: "versions",
                        disabled: true,
                        label: (
                          <span className="flex justify-between align-center">
                            <span>Version history</span>
                            <Tag rootClassName="rounded-full m-0 dark:bg-purple-900 dark:border-purple-700 border-purple-500 text-purple-900 dark:text-purple-100 font-bold border-none bg-purple-200">
                              Pro
                            </Tag>
                          </span>
                        ),
                      },
                    ],
                  }}
                  disabled={isToolbarDisabled}
                >
                  <Button size="small" type="text" disabled={isToolbarDisabled}>
                    File
                  </Button>
                </Dropdown>
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    className: "w-48",
                    items: [
                      {
                        key: "unlink",
                        label: "Remove connections",
                        onClick: handleUnlink,
                        icon: <Unlink size={16} />,
                        disabled: editorState.selectedNodeId == null,
                      },
                      { key: "div", type: "divider" },
                      {
                        key: "delete",
                        label: "Delete",
                        icon: <Trash size={14} />,
                        disabled: editorState.selectedNodeId === null,
                        onClick: () =>
                          handleDeletePrompt(editorState.selectedNodeId!),
                      },
                    ],
                  }}
                  disabled={isToolbarDisabled}
                >
                  <Button size="small" type="text">
                    Edit
                  </Button>
                </Dropdown>
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    className: "w-48",
                    items: [
                      {
                        key: "prompt",
                        label: "Prompt",
                        icon: <AddPromptIcon />,
                        className: "flex gap-2 items-center align-center",
                        onClick: handleAddPrompt,
                      },
                    ],
                  }}
                  disabled={isToolbarDisabled}
                >
                  <Button size="small" type="text">
                    Insert
                  </Button>
                </Dropdown>
              </div>
              {/* third layer */}
              <Divider type="horizontal" className="w-full my-1" />
              <div className="flex gap-1 items-center justify-start">
                <ToolbarActionButton
                  label="Add prompt"
                  icon={<AddPromptIcon />}
                  onClick={handleAddPrompt}
                />
                <span className="h-full w-px  min-h-[24px] dark:bg-slate-700 bg-neutral-300">
                </span>
                <ToolbarActionButton
                  label="Unlink connections"
                  icon={<Unlink size={18} />}
                  onClick={handleUnlink}
                  disabled={editorState.selectedNodeId === null}
                />
              </div>
            </div>
          }
        >
          {/* {!version && (
            <div>
              <h3>Add a step to your flow</h3>
              <Tabs
                tabPosition="left"
                items={[
                  {
                    label: `Prompt`,
                    key: "prompt",
                    children: `Content of Tab`,
                  },
                ]}
              />
            </div>
          )} */}
          {formValues && (
            <FlowDagEditor
              // run={useWorkflowHook.lastRun || undefined}
              // onMove={() => {
              //   if (!minimize) {
              //     setMinimze(true);
              //   }
              // }}
              onPromptRemove={handleDeletePrompt}
              onMove={() => {
                if (editorState.selectedNodeId) {
                  mergeState({ selectedNodeId: null });
                }
              }}
              // workflow={formValues}
              onChange={(values) => {
                console.log("change registered", values);
                form.setFieldsValue(values);
                debouncedHandleSave();
              }}
              className="h-[80vh] z-10"
              flowVersion={formValues}
            />
          )}
        </FlowsLayout>
      </Form>
    </FlowEditorContext.Provider>
  );
};

const ToolbarActionButton = ({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <Tooltip title={label} placement="bottom">
    <Button
      onClick={onClick}
      type="text"
      disabled={disabled}
      rootClassName="w-10 h-10 p-0"
      className="flex flex-row items-center justify-center "
      icon={icon}
    >
      <span className="sr-only">Add prompt</span>
    </Button>
  </Tooltip>
);

const AddPromptIcon = () => (
  <span className="mt-1 relative flex items-center justify-center">
    <AlignLeft size={18} />
    <Plus size={12} className="absolute bottom-0 -left-2" />
  </span>
);
export default FlowEditor;
