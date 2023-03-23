import {
  Button,
  Input,
  Form,
  notification,
  Space,
  Tooltip,
  Typography,
  Col,
  Row,
  Drawer,
  FormProps,
  Select,
  Dropdown,
  Divider,
} from "antd";
import "antd/dist/reset.css";
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowBigLeft,
  ArrowLeft,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Save,
} from "lucide-react";
import { Prompt, useAppState } from "../App";
import MainLayout from "../layouts/MainLayout";
import {
  ChatCompletionResponseMessage,
  CreateChatCompletionResponse,
} from "openai";
import useChat from "../hooks/useChat";

const Editor: React.FC<{ params: { id: string } }> = ({ params }) => {
  const [location, navigate] = useLocation();
  const [form] = Form.useForm();
  const [paramsForm] = Form.useForm();
  const [showDetails, setShowDetails] = useState(false);
  const app = useAppState();
  const prompt = app.prompts.find((p) => p.id === params.id);
  const [toggleDesc, setToggleDesc] = useState(false);
  const showDesc = !!prompt?.description || toggleDesc;
  const [promptParameters, setPromptParameters] = useState<string[]>([]);
  const { result, getResponse, clearResult } = useChat();
  if (!prompt) return null;
  const handleRun = async () => {
    const promptFields = form.getFieldsValue();
    const params = paramsForm.getFieldsValue();
    console.log("do test run with values: ", prompt, params);
    await getResponse(promptFields);
  };

  const handleSave = (attrs: Partial<Prompt>) => {
    const newPrompt = { ...prompt, ...attrs };
    app.setAppState((prev) => {
      const unchanged = prev.prompts.filter((p) => p.id !== newPrompt.id);
      const newPrompts = [...unchanged, newPrompt];
      return { ...prev, prompts: newPrompts };
    });
    notification.success({
      message: "Saved progress!",
      placement: "bottomRight",
    });
  };

  const handleDelete = async () => {
    const cfm = confirm(
      "Are you sure you want to delete this prompt? This cannot be undone."
    );
    if (!cfm) return;
    app.setAppState((prev) => ({
      ...prev,
      prompts: prev.prompts.filter((p) => p.id !== params.id),
    }));
    navigate("/");
    notification.success({ message: "Deleted!", placement: "bottomRight" });
  };

  const handleAddToContext = (message: ChatCompletionResponseMessage) => {
    const values = form.getFieldsValue();
    form.setFieldsValue({
      messages: [
        ...values.messages,
        {
          role: message?.role,
          content: message?.content,
        },
      ],
    });
  };
  // const messagesValus: string[] = form.getFieldValue("messages") || [];
  // const promptParams = messagesValus.join(" ").matchAll(/\@(\S+)/g);
  // console.log("promptParams", promptParams);

  const handleFieldsChange: FormProps["onFieldsChange"] = ([field], fields) => {
    console.log("fields", fields);
    const messageFields = fields.filter(
      (f) => typeof (f.name as any)[1] === "number"
    );
    const messagesValus: string[] = messageFields
      .map((f) => f.value)
      .filter((v) => v);
    console.log("messagesValus", messagesValus);
    const promptParams = [...messagesValus.join(" ").matchAll(/\@(\S+)/g)];
    console.log("promptParams", promptParams);
    const paramNames = promptParams.flatMap(([_match, paramName]) => paramName);
    console.log("paramNames", paramNames);
    if (paramNames !== promptParameters) {
      setPromptParameters(paramNames);
    }
  };
  return (
    <MainLayout variant="wide" contentClassName="h-full">
      <Form
        name="prompt-editor"
        form={form}
        initialValues={prompt}
        onFinish={handleRun}
        onFinishFailed={console.log}
        autoComplete="off"
        onFieldsChange={handleFieldsChange}
        className="min-h-full"
      >
        <Form.Item hideen name="id" />
        <div className="flex flex-row justify-between pb-3 border-b-2 border-gray-200 px-4">
          <div className="flex gap-4 items-center">
            <Link
              to="/"
              className="flex flex-row justify-center items-center w-fit"
            >
              <ArrowLeft size={14} className="mr-1" />
              Back
            </Link>

            <Form.Item required name="name" noStyle>
              <Input type="text" placeholder="your.prompt.name" />
            </Form.Item>
            <Button
              onClick={() => setShowDetails(true)}
              type="text"
              className="italic text-gray-500 text-sm"
            >
              <span className="max-w-lg truncate">
                {form.getFieldValue("description") || "No description yet"}
              </span>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="primary"
              onClick={() => {
                const values = form.getFieldsValue();
                console.log(values);
                handleSave(values);
              }}
              className="flex justify-center items-center"
              icon={<Save size={14} className="mr-1" />}
            >
              Save
            </Button>
            <Tooltip title="Edit more details">
              <Button
                icon={<MoreHorizontal size={14} />}
                onClick={() => setShowDetails(true)}
              ></Button>
            </Tooltip>
          </div>

          <Drawer
            title="Edit Prompt Details"
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
                Delete this prompt
              </Button>
            </div>
          </Drawer>
        </div>

        <div className="flex flex-row h-full">
          {/* messages panel */}
          <div className="w-1/2 py-2 px-4 ">
            <Typography.Title level={4}>Messages</Typography.Title>
            <Form.List name="messages">
              {(fields, { add, remove }, { errors }) => (
                <div className="flex flex-col gap-2">
                  {fields.map((field, index) => (
                    <div key={field.key} className="flex flex-row gap-2">
                      <Form.Item
                        {...field}
                        name={[field.name, "role"]}
                        noStyle
                        initialValue="user"
                      >
                        <Select
                          size="small"
                          defaultValue="user"
                          className="w-1/6"
                          options={[
                            { value: "system", label: "System" },
                            { value: "user", label: "User" },
                            { value: "assistant", label: "Assistant" },
                          ]}
                        />
                      </Form.Item>
                      <div className="relative w-full">
                        <Form.Item
                          {...field}
                          name={[field.name, "content"]}
                          noStyle
                        >
                          <Input.TextArea rows={4} className="pr-6 w-full" />
                        </Form.Item>

                        <Tooltip
                          title="More message actions"
                          className="absolute right-1 top-1"
                        >
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  label: "Remove message",
                                  onClick: () => remove(field.name),
                                  icon: <Minus size={14} />,
                                  danger: true,
                                  disabled: index === 0,
                                  key: "remove",
                                },
                              ],
                            }}
                          >
                            <Button
                              type="ghost"
                              size="small"
                              icon={<MoreVertical size={14} />}
                            />
                          </Dropdown>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    block
                    onClick={() => add()}
                    className="flex items-center justify-center w-full"
                    icon={<Plus size={14} className="mr-1" />}
                  >
                    Add a message
                  </Button>
                </div>
              )}
            </Form.List>

            <Form.Item noStyle>
              <div className="flex flex-row gap-4 p-4">
                <Button type="default" htmlType="submit">
                  Run
                </Button>
              </div>
            </Form.Item>
          </div>

          <Divider type="vertical" className="flex-grow h-full" />
          <div className="w-1/2 py-2 px-4">
            <Form
              form={paramsForm}
              onFinish={console.log}
              onFinishFailed={console.log}
              autoComplete="off"
            >
              {promptParameters.map((name) => (
                <Form.Item name={name}>
                  <Input type="text" />
                </Form.Item>
              ))}
            </Form>

            {/* results pane */}
            {result && (
              <div>
                <div>
                  Total tokens used: {result.usage?.total_tokens}{" "}
                  <span>
                    ({result.usage?.prompt_tokens} prompt,{" "}
                    {result.usage?.completion_tokens} completion)
                  </span>
                  {result.usage?.total_tokens && (
                    <div>
                      Estimated cost per run:{" "}
                      {(result.usage?.total_tokens * 0.002) / 1000}
                      <span>$0.002 /1k tokens</span>
                    </div>
                  )}
                </div>

                <div>
                  {result.choices.map((choice) => (
                    <div className="flex flex-col">
                      <div className="flex flex-row gap-4">
                        <strong>{choice.message?.role}</strong>
                        <Button
                          onClick={() => handleAddToContext(choice.message!)}
                        >
                          Add to context
                        </Button>
                      </div>
                      <p>{choice.message?.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3>History</h3>
            {app.runHistory
              .filter((item) => item.prompt_id == prompt.id)
              .map((item) => (
                <div>
                  {item.outputs.apiResponse.choices.map((choice) => (
                    <div className="flex flex-col">
                      <div className="flex flex-row gap-4">
                        <strong>{choice.message?.role}</strong>
                        <Button
                          onClick={() => handleAddToContext(choice.message!)}
                        >
                          Add to context
                        </Button>
                      </div>
                      <p>{choice.message?.content}</p>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </Form>
    </MainLayout>
  );
};
export default Editor;
