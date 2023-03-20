import {
  Button,
  Card,
  Dropdown,
  notification,
  Popover,
  Tooltip,
  Menu,
} from "antd";
import "antd/dist/reset.css";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import React from "react";
import { useLocation } from "wouter";
import { useAppState } from "../App";
import MainLayout from "../layouts/MainLayout";
const Home: React.FC = () => {
  const [location, navigate] = useLocation();
  const app = useAppState();

  const createPrompt = async () => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const prompt = {
      id,
      name: "Untitled",
      messages: [""],
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

  return (
    <MainLayout>
      <div className="flex flex-col gap-10 container mx-auto py-6">
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
                          icon: <Trash2 size={12} />,
                          danger: true,
                          key: "delete",
                        },
                      ],
                    }}
                  >
                    <Button
                      danger
                      type="ghost"
                      icon={<MoreVertical size={12} />}
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
              <div className="flex flex-row justify-end gap-4 px-4 cursor-default">
                <Tooltip title="Edit prompt">
                  <Button
                    type="default"
                    onClick={() => navigate(`/prompts/${prompt.id}/edit`)}
                    icon={<Edit2 size={12} className="mr-1" />}
                  >
                    Edit
                  </Button>
                </Tooltip>
              </div>
            </Card>
          ))}
        </div>
        <span className="ml-auto">{prompt.length} prompts</span>
      </div>
    </MainLayout>
  );
};

export default Home;
