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
} from "antd";
import dayjs from "dayjs";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Prompt, useAppState, Workflow } from "../App";
import {
  ArrowLeft,
  Eye,
  MoreHorizontal,
  Play,
  Plus,
  Save,
  FileText,
} from "lucide-react";
import { countWorkflowOutputs, countWorkflowParameters } from "../utils";
import DagEditor from "../components/DagEditor";
import useWorkflow from "../hooks/useWorkflow";
import RunWorkflowModal from "../components/RunWorkflowModal";
import PreviewPromptModal from "../components/PreviewPromptModal";
import WorkflowResult from "../components/WorkflowResult";
const WorkflowEditor = ({ params }: { params: { id: string } }) => {
  const [form] = Form.useForm();
  const [minimize, setMinimze] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [_location, navigate] = useLocation();
  const app = useAppState();
  const useWorkflowHook = useWorkflow();
  const isNew = params.id === "new";

  const workflow = app.workflows.find((w) => w.id === params.id);

  const initialValues =
    isNew && !workflow?.id
      ? {
          name: "Untitled Workflow",
          nodes: [],
          edges: [],
        }
      : workflow;

  const handleNew = (attrs: Workflow) => {
    app.setAppState((prev) => ({
      ...prev,
      workflows: [...prev.workflows, attrs],
    }));
    navigate(`/workflows/${attrs.id}/edit`, { replace: true });
  };
  const handleSave = (attrs: Partial<Workflow>) => {
    if (!workflow) return;
    const newWorkflow = {
      ...workflow,
      ...attrs,
      updated: new Date().toISOString(),
    };
    app.setAppState((prev) => {
      const unchanged = prev.workflows.filter((p) => p.id !== newWorkflow.id);
      const newWorkflows = [...unchanged, newWorkflow];
      return { ...prev, workflows: newWorkflows };
    });
    notification.success({
      message: "Saved progress!",
      placement: "bottomRight",
    });
  };

  const handleDelete = async () => {
    const cfm = confirm(
      "Are you sure you want to delete this workflow? This cannot be undone."
    );
    if (!cfm) return;
    app.setAppState((prev) => ({
      ...prev,
      workflows: prev.workflows.filter((p) => p.id !== params.id),
    }));
    navigate("/workflows");
    notification.success({ message: "Deleted!", placement: "bottomRight" });
  };

  const handleCreateNode = (prompt: Prompt) => {
    const formNodes = form.getFieldValue("nodes") || [];
    form.setFieldValue("nodes", [
      ...formNodes,
      { id: crypto.randomUUID(), prompt_id: prompt.id },
    ] as Workflow["nodes"]);
  };

  const handleMinimizeToggle = () => {
    setMinimze((prev) => !prev);
  };
  const formValues = Form.useWatch([], form);

  if (!isNew && !workflow) return null;
  return (
    <MainLayout variant="wide" contentClassName="flex flex-col">
      <Form
        name="workflow-editor"
        form={form}
        initialValues={initialValues}
        onFinish={handleSave}
        autoComplete="off"
        className="min-h-full relative flex-grow flex flex-col"
      >
        <Form.Item hidden name="id" initialValue={crypto.randomUUID()} />
        <Form.Item hidden name="nodes" initialValue={workflow?.nodes} />
        <Form.Item hidden name="edges" initialValue={workflow?.edges} />
        <Form.Item
          hidden
          name="inserted"
          initialValue={new Date().toISOString()}
        />
        <Form.Item
          hidden
          name="updated"
          initialValue={new Date().toISOString()}
        />
        <div className="sticky top-0 z-10 flex flex-row justify-between p-3 border-b-2 dark:border-gray-700 border-gray-200 px-4 dark:bg-slate-800 bg-slate-100">
          <div className="flex gap-4 items-center">
            <Link to="/workflows">
              <Button
                type="link"
                className="flex flex-row items-center gap-1 no-underline"
                icon={<ArrowLeft size={16} strokeWidth={2} />}
              >
                Back
              </Button>
            </Link>
            <Form.Item
              required
              name="name"
              noStyle
              initialValue="Untitled Workflow"
            >
              <Input type="text" className="w-72" />
            </Form.Item>
            <Button
              onClick={() => setShowDetails(true)}
              type="text"
              className="italic dark:text-gray-300 text-gray-500 text-sm"
            >
              <span className="max-w-lg truncate ">
                {form.getFieldValue("description") || "No description yet"}
              </span>
            </Button>
          </div>

          <div className="flex gap-2">
            {workflow && (
              <RunWorkflowModal workflow={workflow} hook={useWorkflowHook}>
                <Button
                  type="default"
                  className="flex justify-center items-center"
                  icon={<Play size={14} className="mr-1" />}
                >
                  Run
                </Button>
              </RunWorkflowModal>
            )}
            <Button
              type="primary"
              onClick={() => {
                const values = form.getFieldsValue();
                if (isNew) {
                  handleNew(values);
                } else {
                  handleSave(values);
                }
              }}
              className="flex justify-center items-center"
              icon={<Save size={14} className="mr-1" />}
            >
              Save
            </Button>
            <Tooltip title="Edit more details" placement="left">
              <Button
                icon={<MoreHorizontal size={14} />}
                onClick={() => setShowDetails(true)}
              ></Button>
            </Tooltip>
          </div>

          <Drawer
            title="Edit Workflow Details"
            placement="right"
            onClose={() => setShowDetails(false)}
            open={showDetails}
            width="400px"
          >
            <Form.Item
              label="Description"
              name="description"
              labelCol={{ span: 6 }}
              className="w-full"
            >
              <Input.TextArea
                rows={5}
                placeholder="Describe this prompt's usage..."
              />
            </Form.Item>

            <div className="my-4 w-full">
              <Button block danger type="default" onClick={handleDelete}>
                Delete this workflow
              </Button>
            </div>
          </Drawer>
        </div>
        <div className="relative flex-grow">
          {workflow?.nodes && (
            <div className="absolute z-20 inset-x-0 top-0 w-96 flex flex-row justify-between px-4 py-2 w-full">
              <Descriptions className="p-0 w-72" rootClassName="p-0">
                <Descriptions.Item
                  label="Inputs"
                  className="!pb-2"
                  contentStyle={{ padding: 0 }}
                >
                  {countWorkflowParameters(app, workflow)}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Outputs"
                  className="!pb-2"
                  contentStyle={{ padding: 0 }}
                >
                  {countWorkflowOutputs(workflow)}
                </Descriptions.Item>
              </Descriptions>
              {/* {useWorkflowHook.lastRun && (
                <Card className="px-4 py-2">
                  <Tag>{useWorkflowHook.lastRun.status}</Tag>
                  <Tooltip title="Clear">
                    <Button
                      type="text"
                      onClick={useWorkflowHook.clearLastRun}
                      size="small"
                      icon={<X size={14} />}
                    />
                  </Tooltip>
                </Card>
              )} */}
            </div>
          )}
          <DagEditor
            onMove={() => {
              if (!minimize) {
                setMinimze(true);
              }
            }}
            onDrag={() => {
              if (!minimize) {
                setMinimze(true);
              }
            }}
            workflow={formValues}
            onChange={(values) => {
              form.setFieldsValue(values);
            }}
            className="h-[80vh] z-10"
          />
          <Card
            className={[
              "absolute z-20 bottom-5 inset-x-0  w-[90%] mx-auto shadow-2xl transition-all duration-1500",
              minimize ? "h-14" : "h-64",
            ].join(" ")}
            bodyStyle={{ padding: 0 }}
          >
            <Tabs
              className=" px-2 py-1"
              defaultActiveKey="1"
              tabBarExtraContent={{
                right: (
                  <Button onClick={handleMinimizeToggle}>
                    {minimize ? "Expand" : "Minimize"}
                  </Button>
                ),
              }}
              onTabClick={() => setMinimze(false)}
              items={[
                {
                  key: "lib",
                  label: "Prompt Library",
                  children: (
                    <>
                      <Table
                        className={[
                          "overflow-y-auto transition-all duration-1500",
                          minimize
                            ? "hidden  h-0 opacity-0"
                            : "max-h-44 opacity-100",
                        ].join(" ")}
                        size="small"
                        rowKey="id"
                        dataSource={app.prompts}
                        showHeader={false}
                        pagination={false}
                        columns={[
                          { title: "Name", dataIndex: "name" },
                          { title: "Description", dataIndex: "description" },
                          {
                            title: "Action",
                            dataIndex: "action",
                            align: "right",
                            render: (_val, prompt) => (
                              <div className="flex justify-end gap-2">
                                <PreviewPromptModal prompt={prompt}>
                                  <Button
                                    size="small"
                                    className="flex items-center gap-1"
                                    disabled={!Boolean(prompt)}
                                    icon={<Eye size={14} />}
                                  >
                                    Preview
                                  </Button>
                                </PreviewPromptModal>
                                <Button
                                  size="small"
                                  className="flex items-center gap-1"
                                  type="primary"
                                  icon={<Plus size={14} />}
                                  onClick={() => handleCreateNode(prompt)}
                                >
                                  Add
                                </Button>
                              </div>
                            ),
                          },
                        ]}
                      />
                    </>
                  ),
                },
                {
                  key: "runs",
                  label: "Runs",
                  children: (
                    <Table
                      rowKey="id"
                      className={[
                        "overflow-y-auto transition-all duration-1500",
                        minimize
                          ? "hidden h-0 opacity-0"
                          : "max-h-44 opacity-100",
                      ].join(" ")}
                      dataSource={app.workflowRuns.sort(
                        (a, b) =>
                          // @ts-ignore
                          new Date(b.started_at) - new Date(a.started_at)
                      )}
                      size="small"
                      showHeader
                      columns={[
                        {
                          title: "Start Time",
                          dataIndex: "started_at",
                          render: (val) => (
                            <span>
                              {dayjs(val).format("MMM D, YYYY h:mm A")}
                            </span>
                          ),
                        },
                        {
                          title: "Status",
                          dataIndex: "status",
                          render: (val) => (
                            <Tag
                              color={
                                val === "completed"
                                  ? "green"
                                  : val === "error"
                                  ? "red"
                                  : "blue"
                              }
                            >
                              {val}
                            </Tag>
                          ),
                        },
                        {
                          title: "",
                          dataIndex: "id",
                          render: (_val, run) => (
                            <div className="flex justify-end">
                              <Popover
                                overlayClassName="max-w-lg"
                                content={
                                  workflow ? (
                                    <WorkflowResult
                                      workflow={workflow}
                                      run={run}
                                    />
                                  ) : null
                                }
                                trigger="click"
                                placement="left"
                              >
                                <Button
                                  disabled={run.status !== "complete"}
                                  className="flex items-center gap-1"
                                  icon={<FileText size={12} />}
                                >
                                  Outputs
                                </Button>
                              </Popover>
                            </div>
                          ),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </Form>
    </MainLayout>
  );
};
export default WorkflowEditor;
