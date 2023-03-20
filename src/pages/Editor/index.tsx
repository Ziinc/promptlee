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
} from "antd";
import "antd/dist/reset.css";
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Minus, Plus } from "lucide-react";
import styles from "./Editor.module.css";
import { Prompt, useAppState } from "../../App";

const Editor: React.FC<{ params: { id: string } }> = ({ params }) => {
  const [location, navigate] = useLocation();
  const [form] = Form.useForm();
  const [paramsForm] = Form.useForm();
  const [results, setResults] = useState(null);
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
    notification.success({ message: "Saved!", placement: "bottomRight" });
  };

  const handleDelete = async () => {
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

  return (
    <div>
      {/* chat edit area */}
      <Form
        name="prompt-editor"
        form={form}
        initialValues={prompt}
        onFinish={handleRun}
        onFinishFailed={console.log}
        autoComplete="off"
        labelCol={{ span: 4 }}
        onFieldsChange={([field], fields) => {
          console.log("fields", fields);
          const messageFields = fields.filter(
            (f) => typeof (f.name as any)[1] === "number"
          );
          const messagesValus: string[] = messageFields
            .map((f) => f.value)
            .filter((v) => v);
          console.log("messagesValus", messagesValus);
          const promptParams = [
            ...messagesValus.join(" ").matchAll(/\@(\S+)/g),
          ];
          console.log("promptParams", promptParams);
          const paramNames = promptParams.flatMap(
            ([_match, paramName]) => paramName
          );
          console.log("paramNames", paramNames);
          if (paramNames !== promptParameters) {
            setPromptParameters(paramNames);
          }
        }}
      >
        <div className="mx-auto container">
          <Form.Item label="Name" required name="name">
            <Input type="text" placeholder="generate.article" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={2}
              placeholder="Describe this prompt's usage..."
            />
          </Form.Item>
          <Typography.Title level={4}>Messages</Typography.Title>
          <Form.List name="messages">
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Row>
                    <Col key={field.key} span={23}>
                      <Form.Item label={index + 1} name={[index]} labelCol={{span: 1}}>
                        <Input.TextArea rows={5} />
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
                    icon={<Plus size={12} />}
                  >
                    Add field
                  </Button>
                </Col>
              </>
            )}
          </Form.List>

          <Form.Item wrapperCol={{ span: 24 }}>
            <div className="flex flex-row gap-4 p-4">
              <Button danger type="default" onClick={handleDelete}>
                Delete
              </Button>

              <Link to="/">
                <Button type="default">Cancel</Button>
              </Link>
              <Button type="default" htmlType="submit">
                Run
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  const values = form.getFieldsValue();
                  console.log(values);
                  handleSave(values);
                }}
              >
                Save
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
    </div>
  );
};
export default Editor;
