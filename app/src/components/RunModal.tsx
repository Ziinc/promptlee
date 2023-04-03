import { Modal, Form, notification, Input, Divider } from "antd";
import { Copy, Play } from "lucide-react";
import React, { SetStateAction, useState } from "react";
import { Prompt } from "../App";
import useChat from "../hooks/useChat";
import { extractPromptParameters, resolvePrompt } from "../utils";
import LoadingSpinner from "./LoadingSpinner";
import PromptResult from "./PromptResult";

interface RenderProps {
  onRun: () => Promise<void>;
  isOpen: boolean;
}
interface Props {
  prompt: Prompt;
  triggerClassName?: string;
  children: React.ReactNode | ((args: RenderProps) => React.ReactNode);
}
const RunModal: React.FC<Props> = ({ prompt, triggerClassName, children }) => {
  const [paramsForm] = Form.useForm();
  const [show, setShow] = useState(false);
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

  const handleRun = async () => {
    setShow(true);
    paramsForm.resetFields();
    setRunStep("params");
  };
  const handleCancelRun = () => {
    setShow(false);
    clearResult();
  };
  const handleRunInputsNext = async () => {
    if (!show) return;
    const params = paramsForm.getFieldsValue() || {};
    const resolvedPrompt = resolvePrompt(prompt, params);
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

  const promptParameters = prompt ? extractPromptParameters(prompt) : [];
  const paramValues = Form.useWatch([], paramsForm) || {};

  const resolvedMessages = prompt
    ? resolvePrompt(prompt, paramValues).messages
    : [];

  return (
    <>
      <Modal
        title={`Run ${prompt?.name || ""}`}
        open={show}
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
              <p className="whitespace-pre-wrap">{message.content}</p>
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
      {typeof children === "function" ? (
        children({ onRun: handleRun, isOpen: show })
      ) : (
        <div className={triggerClassName} onClick={handleRun}>
          {children}
        </div>
      )}
    </>
  );
};

export default RunModal;
