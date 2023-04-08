import {
  Button,
  Card,
  Dropdown,
  notification,
  Popover,
  Tooltip,
  Alert,
} from "antd";
import "antd/dist/reset.css";
import { Edit2, MoreVertical, Play, Trash2 } from "lucide-react";
import React from "react";
import { Link, useLocation } from "wouter";
import { useAppState } from "../App";
import RunModal from "../components/RunModal";
import MainLayout from "../layouts/MainLayout";
const Home: React.FC = () => {
  const [_location, navigate] = useLocation();
  const app = useAppState();

  const createPrompt = async () => {
    navigate(`/prompts/new`);
  };

  const deletePrompt = async (id: string) => {
    app.setAppState((prev) => ({
      ...prev,
      prompts: prev.prompts.filter((p) => p.id !== id),
    }));
    notification.success({ message: "Deleted!", placement: "bottomRight" });
  };

  return (
    <MainLayout>
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
          {app.prompts
            .sort((a, b) => {
              const aDate: any = new Date(a.updated);
              const bDate: any = new Date(b.updated);
              return bDate - aDate;
            })
            .map((prompt) => (
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
                  <RunModal prompt={prompt}>
                    <Tooltip title="Run prompt">
                      <Button
                        block
                        type="primary"
                        icon={<Play size={12} className="mr-1" />}
                      >
                        Run
                      </Button>
                    </Tooltip>
                  </RunModal>
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
