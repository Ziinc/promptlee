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
} from "antd";
import dayjs from "dayjs";
import { Link, useLocation } from "wouter";
import { useCallback, useEffect, useMemo, useState } from "react";
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
const FlowEditor = ({ params }: { params: { id: string } }) => {
  const [form] = Form.useForm();
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
    () => debounce(handleSave, 800),
    [handleSave]
  );

  const handleAddPrompt = () => {
    console.log("clicked");
    const formNodes = form.getFieldValue("nodes") || [];
    console.log({ formNodes });
    form.setFieldValue("nodes", [
      ...formNodes,
      {
        id: crypto.randomUUID(),
        prompt_text: "",
      } as FlowVersion["nodes"][number],
    ]);
  };

  // const handleMinimizeToggle = () => {
  //   setMinimze((prev) => !prev);
  // };
  // const formValues = Form.useWatch([], form);
  const formValues = Form.useWatch([], form);
  console.log({ formValues });
  const isToolbarDisabled = !flow;

  return (
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
                  ],
                }}
                disabled={isToolbarDisabled}
              >
                <Button size="small" type="text" disabled={isToolbarDisabled}>
                  File
                </Button>
              </Dropdown>
              <Dropdown
                menu={{
                  className: "w-48",
                  items: [],
                }}
                disabled={isToolbarDisabled}
              >
                <Button size="small" type="text">
                  Edit
                </Button>
              </Dropdown>
              <Dropdown
                menu={{
                  className: "w-48",
                  items: [
                    {
                      key: "prompt",
                      label: "Prompt",
                      onClick: () => {
                        console.log("new prompt");
                      },
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
            <div className="flex gap-2">
              <ToolbarActionButton
                label="Add prompt"
                icon={<AddPromptIcon />}
                onClick={handleAddPrompt}
              />
            </div>
          </div>
        }
      >
        {!version && (
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
        )}
        {formValues && (
          <FlowDagEditor
            // run={useWorkflowHook.lastRun || undefined}
            // onMove={() => {
            //   if (!minimize) {
            //     setMinimze(true);
            //   }
            // }}
            // onDrag={() => {
            //   if (!minimize) {
            //     setMinimze(true);
            //   }
            // }}
            // workflow={formValues}
            onChange={(values) => {
              form.setFieldsValue(values);
            }}
            className="h-[80vh] z-10"
            flowVersion={formValues}
          />
        )}
      </FlowsLayout>
    </Form>
  );
};

const ToolbarActionButton = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <Tooltip title={label}>
    <Button
      onClick={onClick}
      type="text"
      icon={icon}
      className="flex flex-row items-center justify-center py-1 px-2"
    >
      <span className="sr-only">Add prompt</span>
    </Button>
  </Tooltip>
);

const AddPromptIcon = () => (
  <span className="inline-block mt-1 relative flex items-center justify-center">
    <AlignLeft size={18} />
    <Plus size={12} className="absolute bottom-0 -left-2" />
  </span>
);
export default FlowEditor;
