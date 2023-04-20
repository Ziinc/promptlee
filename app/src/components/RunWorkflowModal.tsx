import { Modal, Form, Input } from "antd";
import { Play } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useAppState, Workflow } from "../App";
import useWorkflow from "../hooks/useWorkflow";
import { extractWorkflowParams } from "../utils";
import LoadingSpinner from "./LoadingSpinner";
import WorkflowResult from "./WorkflowResult";

interface RenderProps {
  onRun: () => Promise<void>;
  isOpen: boolean;
}
interface Props {
  workflow: Workflow;
  hook?: ReturnType<typeof useWorkflow>;
  triggerClassName?: string;
  children: React.ReactNode | ((args: RenderProps) => React.ReactNode);
}
const RunWorkflowModal: React.FC<Props> = ({
  workflow,
  hook,
  triggerClassName,
  children,
}) => {
  const app = useAppState();
  const [paramsForm] = Form.useForm();
  const [show, setShow] = useState(false);
  const [runStep, setRunStep] = useState<"params" | "result">("params");

  const { lastRun, clearLastRun, runWorkflow } = hook || useWorkflow();
  const isLoading = ["running", "started"].includes(lastRun?.status || "");
  const parameters = useMemo(() => {
    if (!workflow) {
      return [];
    } else {
      return extractWorkflowParams(app, workflow);
    }
  }, [workflow]);

  const handleRun = async () => {
    setShow(true);
    if (parameters.length === 0) {
      handleRunInputsNext();
    } else {
      setRunStep("params");
      paramsForm.resetFields();
    }
  };
  const handleCancelRun = () => {
    setShow(false);
    clearLastRun();
  };
  const handleRunInputsNext = async () => {
    setRunStep("result");
    const params = paramsForm.getFieldsValue() || {};
    runWorkflow(workflow, params);
  };

  return (
    <>
      <Modal
        title={`Run ${workflow?.name || ""}`}
        open={show}
        onCancel={handleCancelRun}
        okText={runStep === "params" ? "Go" : null}
        okButtonProps={{
          hidden: runStep === "result",
          icon: <Play size={14} className="mr-1" />,
        }}
        onOk={runStep === "params" ? handleRunInputsNext : undefined}
        cancelText="Close"
      >
        {runStep === "params" && (
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
            {parameters.map((name) => (
              <Form.Item key={name} name={name} label={name} initialValue="">
                <Input type="text" />
              </Form.Item>
            ))}
          </Form>
        )}

        {runStep === "result" && (
          <>
            {isLoading && <LoadingSpinner />}
            {lastRun && (
              <div>
                <WorkflowResult workflow={workflow} run={lastRun} />
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

export default RunWorkflowModal;
