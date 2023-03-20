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
} from "antd";
import "antd/dist/reset.css";
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowBigLeft,
  ArrowLeft,
  Minus,
  MoreHorizontal,
  Plus,
  Save,
} from "lucide-react";
import { Prompt, useAppState } from "../App";
import MainLayout from "../layouts/MainLayout";

const Editor: React.FC<{ params: { id: string } }> = ({ params }) => {
  const [location, navigate] = useLocation();
  const [form] = Form.useForm();
  const [paramsForm] = Form.useForm();
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const app = useAppState();
  const prompt = app.prompts.find((p) => p.id === params.id);
  const [toggleDesc, setToggleDesc] = useState(false);
  const showDesc = !!prompt?.description || toggleDesc;
  const [promptParameters, setPromptParameters] = useState<string[]>([]);
  if (!prompt) return null;
  const handleRun = async () => {
    const values = paramsForm.getFieldsValue();
    console.log("do test run with values: ", values);
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
    <MainLayout>
      <Form
        name="prompt-editor"
        form={form}
        initialValues={prompt}
        onFinish={handleRun}
        onFinishFailed={console.log}
        autoComplete="off"
        labelCol={{ span: 4 }}
        onFieldsChange={handleFieldsChange}
      >
        <div className="flex flex-row justify-between pb-3 border-b-2 border-gray-200">
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
        <div className="w-1/2">
          <Typography.Title level={4}>Messages</Typography.Title>
          <Form.List name="messages">
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Row>
                    <Col key={field.key} span={23}>
                      <Form.Item
                        label={index + 1}
                        name={[index]}
                        labelCol={{ span: 1 }}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                    </Col>
                    <Col
                      span={1}
                      className="flex flex-col justify-start items-center gap-4"
                    >
                      {fields.length > 1 && (
                        <Tooltip title="Remove this message">
                          <Button
                            size="small"
                            danger
                            icon={<Minus size={12} />}
                            onClick={() => remove(field.name)}
                          />
                        </Tooltip>
                      )}
                    </Col>
                  </Row>
                ))}
                <Col span={23} offset={1}>
                  <Button
                    type="dashed"
                    block
                    onClick={() => add()}
                    className="flex items-center justify-center"
                    icon={<Plus size={14} className="mr-1" />}
                  >
                    Add a message
                  </Button>
                </Col>
              </>
            )}
          </Form.List>

          <Form.Item wrapperCol={{ span: 24 }}>
            <div className="flex flex-row gap-4 p-4">
              <Button type="default" htmlType="submit">
                Run
              </Button>
            </div>
          </Form.Item>
        </div>

        <div>
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
        </div>
      </Form>

      {/* results pane */}
      {results && <div>{JSON.stringify(results, null, 2)}</div>}
    </MainLayout>
  );
};
export default Editor;
