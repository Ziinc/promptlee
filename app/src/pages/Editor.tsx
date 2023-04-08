import {
  Button,
  Input,
  Form,
  notification,
  Tooltip,
  Typography,
  Drawer,
  Select,
  Dropdown,
  Divider,
  Tabs,
  List,
  Tag,
  Empty,
  Card,
} from "antd";
import "antd/dist/reset.css";
import React, { ComponentProps, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Copy,
  ListPlus,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Play,
  Plus,
  Save,
} from "lucide-react";
import { Message, Prompt, useAppState } from "../App";
import MainLayout from "../layouts/MainLayout";
import { ChatCompletionResponseMessage } from "openai";
import useChat from "../hooks/useChat";
import PromptResult from "../components/PromptResult";
import {
  countWords,
  getQueryParams,
  removeParamsFromMessage,
  resolveTextParams,
} from "../utils";
import LoadingSpinner from "../components/LoadingSpinner";

const Editor: React.FC<{ params: { id: string | "new" } }> = ({ params }) => {
  const [_location, navigate] = useLocation();
  const [form] = Form.useForm();

  const [paramsForm] = Form.useForm();
  const [showDetails, setShowDetails] = useState(false);
  const app = useAppState();
  const isNew = params.id === "new";
  const prompt = app.prompts.find((p) => p.id === params.id);

  const initialValues = useMemo(() => {
    let values: Partial<Prompt>;
    const query = getQueryParams();
    if (isNew && query.attrs) {
      values = JSON.parse(query.attrs);
    } else if (isNew && !query.attrs) {
      values = {
        name: "Untitled Prompt",
        messages: [{ role: "user", content: "" }],
      };
    } else {
      values = prompt || {};
    }
    return values;
  }, [prompt?.id, isNew]);

  const { result, getResponse, isLoading: isChatLoading } = useChat();

  const handleRun = async () => {
    const promptFields = form.getFieldsValue();
    const params = paramsForm.getFieldsValue();

    const resolvedmessages = promptFields?.messages.map((message: Message) => ({
      ...message,
      content: resolveTextParams(message.content, params),
    }));
    await getResponse({ ...promptFields, messages: resolvedmessages });
  };

  const handleNew = (attrs: Prompt) => {
    app.setAppState((prev) => ({
      ...prev,
      prompts: [...prev.prompts, attrs],
    }));
    navigate(`/prompts/${attrs.id}/edit`, { replace: true });
  };
  const handleSave = (attrs: Partial<Prompt>) => {
    if (!prompt) return;
    const newPrompt = {
      ...prompt,
      ...attrs,
      updated: new Date().toISOString(),
    };
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

  const inputMessages: Prompt["messages"] =
    Form.useWatch("messages", form) || [];

  const parsedParamNames = inputMessages.flatMap((message) => {
    if (!message) return [];
    if (!message.content) return [];
    const promptParams = [...message.content.matchAll(/\s\@(\S+)\s?/g)];
    return promptParams.flatMap(([_match, paramName]) => paramName);
  });
  const promptParameters = [...new Set(parsedParamNames)];
  const paramValues = Form.useWatch([], paramsForm) || {};

  const resolvedMessages = inputMessages.map((message) => ({
    ...message,
    content: resolveTextParams(message?.content || "", paramValues),
  }));

  return (
    <MainLayout variant="wide" contentClassName="h-full">
      <Form
        name="prompt-editor"
        form={form}
        initialValues={initialValues}
        onFinish={handleRun}
        autoComplete="off"
        className="min-h-full relative"
      >
        <Form.Item hidden name="id" initialValue={crypto.randomUUID()} />
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
            <Link
              to="/"
              className="flex flex-row justify-center items-center w-fit"
            >
              <ArrowLeft size={14} className="mr-1" />
              Back
            </Link>

            <Form.Item
              required
              name="name"
              noStyle
              initialValue="Untitled Prompt"
            >
              <Input type="text" />
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
          <div className="w-1/2 py-2 px-4 border-r-2 border-gray-200 min-h-[86vh]">
            <Typography.Title level={4}>Chat Template</Typography.Title>
            <Form.List name="messages">
              {(fields, { add, remove }, { errors }) => (
                <div className="flex flex-col gap-2">
                  {fields.map((field, index) => {
                    const inputMessage = inputMessages[index];
                    const wordCount =
                      inputMessage && inputMessage.content
                        ? countWords(
                            removeParamsFromMessage(inputMessage).content
                          )
                        : 0;

                    return (
                      <React.Fragment key={field.key}>
                        <div className="flex flex-row gap-2 items-stretch">
                          <div className="w-1/6 flex flex-col justify-between ">
                            <Form.Item
                              {...field}
                              name={[field.name, "role"]}
                              initialValue="user"
                              className="mb-0"
                            >
                              <Select
                                size="small"
                                defaultValue="user"
                                options={[
                                  { value: "system", label: "System" },
                                  { value: "user", label: "User" },
                                  { value: "assistant", label: "Assistant" },
                                ]}
                              />
                            </Form.Item>
                            <div className="flex flex-row justify-end">
                              <span className="text-xs">{wordCount} words</span>
                            </div>
                          </div>
                          <div className="relative w-full">
                            <Form.Item
                              {...field}
                              name={[field.name, "content"]}
                              noStyle
                            >
                              <Input.TextArea
                                className="pr-6 w-full  min-h-32"
                                autoSize={{ minRows: 4 }}
                              />
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
                        {index !== fields.length - 1 && (
                          <Divider className="my-1" />
                        )}
                      </React.Fragment>
                    );
                  })}
                  <Button
                    type="dashed"
                    block
                    onClick={() => add()}
                    className="flex items-center justify-center w-full dark:border-slate-500"
                    icon={<Plus size={14} className="mr-1" />}
                  >
                    Add a message
                  </Button>
                </div>
              )}
            </Form.List>
          </div>

          <div className="w-1/2 py-2 px-4">
            <Tabs
              className="w-full"
              defaultActiveKey="test"
              items={[
                {
                  label: "Test",
                  key: "test",
                  children: (
                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex flex-row gap-2"></div>

                      <h3>
                        Parameters{" "}
                        <Tooltip title="Declare parameters with @ followed by the name. For example, @my_param">
                          <Tag className="text-xs ml-4">
                            {promptParameters.length} detected
                          </Tag>
                        </Tooltip>
                      </h3>
                      {promptParameters.length === 0 && (
                        <p className="text-sm">
                          No prompt parameters detected. Use the <code>@</code>{" "}
                          symbol to specify a new paramter in a message.
                        </p>
                      )}
                      {promptParameters.length > 0 && (
                        <Form
                          size="small"
                          form={paramsForm}
                          onSubmitCapture={(e) => e.preventDefault()}
                          autoComplete="off"
                          colon={false}
                          labelAlign="right"
                          labelWrap
                          labelCol={{ span: 8 }}
                        >
                          {promptParameters.map((name) => (
                            <Form.Item name={name} label={name} initialValue="">
                              <Input type="text" />
                            </Form.Item>
                          ))}
                        </Form>
                      )}
                      <Card
                        title="Preview"
                        className="shadow"
                        size="small"
                        actions={[
                          <div className="flex flex-row justify-end px-4">
                            <Button
                              type="primary"
                              className="flex flex-row items-center"
                              icon={<Play size={14} className="mr-1" />}
                              htmlType="button"
                              onClick={handleRun}
                            >
                              Run
                            </Button>
                          </div>,
                        ]}
                      >
                        {resolvedMessages.map((message) => (
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
                        ))}
                      </Card>

                      {(result || isChatLoading) && (
                        <Card
                          title="Response"
                          size="small"
                          className="shadow transition-all"
                        >
                          {isChatLoading && <LoadingSpinner />}
                          {result && (
                            <PromptResultWithActions
                              onAddToContext={() =>
                                handleAddToContext(result.choices[0].message!)
                              }
                              result={result}
                            />
                          )}
                        </Card>
                      )}
                    </div>
                  ),
                },
                {
                  label: "History",
                  key: "history",
                  children: prompt ? (
                    <List
                      pagination={{ align: "end", defaultPageSize: 8 }}
                      dataSource={app.runHistory.filter(
                        (item) => item.prompt_id == prompt.id
                      )}
                      renderItem={(item) => (
                        <List.Item className="!p-4">
                          <PromptResultWithActions
                            onAddToContext={() =>
                              handleAddToContext(
                                item.outputs.apiResponse.choices[0].message!
                              )
                            }
                            result={item.outputs.apiResponse}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="Save the prompt to start storing run history." />
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Form>
    </MainLayout>
  );
};

const PromptResultWithActions = ({
  result,
  onAddToContext,
}: {
  result: ComponentProps<typeof PromptResult>["result"];
  onAddToContext: () => void;
}) => (
  <div>
    <div className="flex flex-row justify-start gap-2">
      <div className="flex flex-col gap-2">
        <Tooltip title="Add to context">
          <Button
            size="small"
            className="flex flex-row justify-center items-center"
            onClick={onAddToContext}
            icon={<ListPlus size={14} />}
          ></Button>
        </Tooltip>
        <Tooltip title="Copy to clipboard">
          <Button
            size="small"
            className="flex flex-row justify-center items-center"
            onClick={() => {
              if (!navigator.clipboard || !result.choices[0].message) return;
              navigator.clipboard.writeText(
                result.choices[0].message?.content!
              );
            }}
            icon={<Copy size={14} />}
          ></Button>
        </Tooltip>
      </div>
      <PromptResult result={result} />
    </div>
  </div>
);

export default Editor;
