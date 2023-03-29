import {
  Button,
  Card,
  Dropdown,
  notification,
  Popover,
  Tooltip,
  Alert,
  Modal,
  Spin,
  Form,
  Input,
  Divider,
} from "antd";
import "antd/dist/reset.css";
import {
  Copy,
  Divide,
  Edit2,
  MoreVertical,
  Play,
  RefreshCw,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Prompt, useAppState } from "../App";
import LoadingSpinner from "../components/LoadingSpinner";
import PromptResult from "../components/PromptResult";
import useChat from "../hooks/useChat";
import MainLayout from "../layouts/MainLayout";
import { extractPromptParameters, resolvePrompt } from "../utils";
const Home: React.FC = () => {
  const [paramsForm] = Form.useForm();
  const [location, navigate] = useLocation();
  const app = useAppState();
  const [runStep, setRunStep] = useState<"params" | "preview" | "result">(
    "params"
  );
  const {
    result,
    getResponse,
    clearResult,
    isLoading: IsChatLoading,
  } = useChat();

  const [selectedId, setSelectedId] = useState("");
  const selectedPrompt = app.prompts.find((prompt) => prompt.id === selectedId);
  const createPrompt = async () => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const prompt = {
      id,
      name: "Untitled",
      messages: [{ role: "user" as const, content: "" }],
      created: now,
      updated: now,
    };
    app.setAppState((prev) => ({
      ...prev,
      prompts: [...prev.prompts, prompt],
    }));
    navigate(`/prompts/${id}/edit`);
  };

  const deletePrompt = async (id: string) => {
    app.setAppState((prev) => ({
      ...prev,
      prompts: prev.prompts.filter((p) => p.id !== id),
    }));
    notification.success({ message: "Deleted!", placement: "bottomRight" });
  };
  const handleRun = async (prompt: Prompt) => {
    setSelectedId(prompt.id);
    paramsForm.resetFields();
    setRunStep("params");
  };
  const handleCancelRun = () => {
    setSelectedId("");
    clearResult();
  };
  const handleRunInputsNext = async () => {
    if (!selectedPrompt) return;
    const params = paramsForm.getFieldsValue() || {};
    const resolvedPrompt = resolvePrompt(selectedPrompt, params);
    getResponse(resolvedPrompt);
    setRunStep("result");
  };

  const handleCopyToClipboard = async () => {
    if (!result) return;
    const text = result.choices[0].message?.content;
    await navigator.clipboard.writeText(text || "");
    notification.info({
      message: "Copied to clipboard",
      placement: "bottomRight",
    });
  };
  const promptParameters = selectedPrompt
    ? extractPromptParameters(selectedPrompt)
    : [];
  const paramValues = Form.useWatch([], paramsForm) || {};

  const resolvedMessages = selectedPrompt
    ? resolvePrompt(selectedPrompt, paramValues).messages
    : [];
  return (
    <MainLayout>
      <Modal
        title={`Run ${selectedPrompt?.name || ""}`}
        open={!!selectedId}
        onCancel={handleCancelRun}
        okText={runStep === "params" ? "Go" : "Copy"}
        okButtonProps={{
          hidden: runStep === "result" && !result,
          icon:
            runStep === "result" ? (
              <Copy size={14} className="mr-1" />
            ) : (
              <Play size={14} className="mr-1" />
            ),
        }}
        onOk={
          runStep === "params" ? handleRunInputsNext : handleCopyToClipboard
        }
        cancelText="Close"
      >
        {runStep === "params" && (
          <div className="flex flex-col gap-4">
            <Form
              size="small"
              onSubmitCapture={(e) => e.preventDefault()}
              form={paramsForm}
              autoComplete="off"
              colon={false}
              labelAlign="right"
              labelWrap
              labelCol={{ span: 6 }}
              className="pt-4"
            >
              {promptParameters.map((name) => (
                <Form.Item name={name} label={name} initialValue="">
                  <Input type="text" />
                </Form.Item>
              ))}
            </Form>

            <Divider className="my-0" />
            {resolvedMessages.map((message) => (
              <p>{message.content}</p>
            ))}
          </div>
        )}

        {runStep === "result" && (
          <>
            {IsChatLoading && <LoadingSpinner />}
            {result && (
              <div>
                <PromptResult result={result} />
              </div>
            )}
          </>
        )}
      </Modal>
      <div className="flex flex-col gap-10 container mx-auto">
        {!app.apiKey && (
          <Alert
            message={
              <span>
                <strong>No API Key Set.</strong> An OpenAI API key is required
                for PromptPro to work correctly.
              </span>
            }
            action={
              <Link to="/settings">
                <Button>Configure</Button>
              </Link>
            }
            type="warning"
            showIcon
          />
        )}

        <section className="flex flex-row justify-between">
          <h2>Prompts</h2>

          <Button type="primary" onClick={createPrompt}>
            Create Prompt
          </Button>
        </section>

        <div className="flex flex-row flex-wrap  justify-start gap-3">
          {app.prompts.map((prompt) => (
            <Card
              className="border-2 dark:border-slate-700 border-gray-300 w-[24%]"
              key={prompt.id}
              size="small"
              title={prompt.name}
              extra={
                <Tooltip title="View more actions">
                  <Dropdown
                    trigger={["click"]}
                    menu={{
                      items: [
                        {
                          label: "Delete prompt",
                          onClick: () => deletePrompt(prompt.id),
                          icon: <Trash2 size={14} />,
                          danger: true,
                          key: "delete",
                        },
                      ],
                    }}
                  >
                    <Button
                      danger
                      type="ghost"
                      size="small"
                      icon={<MoreVertical size={14} />}
                    />
                  </Dropdown>
                </Tooltip>
              }
            >
              <div className="text-gray-700 dark:text-gray-400">
                {prompt.description ? (
                  <Popover
                    title={prompt.description}
                    overlayClassName="max-w-sm"
                  >
                    <span className="block text-sm truncate">
                      {prompt.description}
                    </span>
                  </Popover>
                ) : (
                  <span className="italic">No description</span>
                )}
              </div>
              <div className="flex flex-row justify-between w-full pt-2 gap-3 cursor-default">
                <Tooltip title="Edit prompt">
                  <Button
                    type="default"
                    block
                    onClick={() => navigate(`/prompts/${prompt.id}/edit`)}
                    icon={<Edit2 size={12} className="mr-1" />}
                  >
                    Edit
                  </Button>
                </Tooltip>
                <Tooltip title="Run prompt">
                  <Button
                    block
                    type="primary"
                    onClick={() => handleRun(prompt)}
                    icon={<Play size={12} className="mr-1" />}
                  >
                    Run
                  </Button>
                </Tooltip>
              </div>
            </Card>
          ))}
        </div>
        <span className="ml-auto text-xs">{app.prompts.length} prompts</span>
      </div>
    </MainLayout>
  );
};

export default Home;
