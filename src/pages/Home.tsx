import {
  Button,
  Card,
  Dropdown,
  notification,
  Popover,
  Tooltip,
  Menu,
  Alert,
  Modal,
  Spin,
} from "antd";
import "antd/dist/reset.css";
import {
  Copy,
  Edit2,
  MoreVertical,
  Play,
  RefreshCcw,
  RefreshCw,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Prompt, useAppState } from "../App";
import PromptResult from "../components/PromptResult";
import useChat from "../hooks/useChat";
import MainLayout from "../layouts/MainLayout";
const Home: React.FC = () => {
  const [location, navigate] = useLocation();
  const app = useAppState();
  const {
    result,
    getResponse,
    clearResult,
    isLoading: IsChatLoading,
  } = useChat();
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
    await getResponse(prompt);
  };

  const handleCopyToClipboard = async () => {
    if (!result) return;
    const text = result.choices[0].message?.content;
    await navigator.clipboard.writeText(text || "");
    notification.info({ message: "Copied to clipboard" });
  };
  return (
    <MainLayout>
      <Modal
        title="Run prompt"
        open={!!result || IsChatLoading}
        onCancel={clearResult}
        okText="Copy"
        okButtonProps={{
          hidden: !result,
          icon: <Copy size={14} className="mr-1" />,
        }}
        onOk={handleCopyToClipboard}
        cancelText="Close"
      >
        {IsChatLoading && (
          <div className="h-64 w-full flex flex-row justify-center items-center">
            <Spin
              className="mx-auto"
              size="large"
              tip="Loading..."
              indicator={<RefreshCw className="animate-spin" />}
            />
          </div>
        )}
        {result && (
          <div>
            <PromptResult result={result} />
          </div>
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
              className="border-2 border-gray-300 w-[24%]"
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
              {prompt.description ? (
                <Popover title={prompt.description} overlayClassName="max-w-sm">
                  <span className="block text-gray-700 text-sm truncate">
                    {prompt.description}
                  </span>
                </Popover>
              ) : (
                <span className="italic">No description</span>
              )}
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
