import { Button, Descriptions, Form, Input } from "antd";
import { useState } from "react";
import { Link } from "wouter";
import { useAppState } from "../App";
import MainLayout from "../layouts/MainLayout";

const Settings: React.FC = () => {
  const app = useAppState();
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const handleSave = (attrs: { apiKey: string }) => {
    setEditing(false);
    app.mergeAppState({ apiKey: attrs.apiKey });
  };
  return (
    <MainLayout>
      <div className="flex flex-col gap-10 container mx-auto py-6">
        <h2>Settings</h2>

        <Form onFinish={handleSave} form={form}>
          <Descriptions
            bordered
            title="OpenAI"
            size="middle"
            extra={
              editing ? (
                <Button type="primary" onClick={form.submit}>
                  Save
                </Button>
              ) : (
                <Button type="primary" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )
            }
          >
            <Descriptions.Item label="API Key">
              {editing ? (
                <Form.Item
                  name="apiKey"
                  extra={
                    <span>
                      You can obtain the API key from the
                      <a
                        target="_blank"
                        href="https://platform.openai.com/account/api-keys"
                      >
                        OpenAI Platform
                      </a>
                    </span>
                  }
                >
                  <Input type="password" defaultValue={app.apiKey} />
                </Form.Item>
              ) : (
                <>{app.apiKey ? "********" : "Not set"}</>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Form>
      </div>
    </MainLayout>
  );
};

export default Settings;
