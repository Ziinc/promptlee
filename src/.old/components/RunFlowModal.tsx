import { Modal, Form, Input, Empty, Divider, Tag, Button } from "antd";
import { PlayIcon } from "lucide-react";
import { ReactNode, FC, useMemo, useState } from "react";
import { FlowVersion } from "../api/flows";
import useFlow from "../hooks/useFlow";
import { extractFlowParams } from "../utils";
import FlowResult from "./FlowResult";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  flowVersion: FlowVersion;
  hook: ReturnType<typeof useFlow>;
  clearOnClose?: boolean;
  open: boolean
}
const RunFlowModal: FC<Props> = ({
  flowVersion,
  hook,
  open,
  clearOnClose = true,
}) => {
  const [paramsForm] = Form.useForm();
  const [show, setShow] = useState(false);
  const [runStep, setRunStep] = useState<"params" | "result">("params");

  const { lastRun, clearLastRun, isLoading, runFlow } = hook;
  // const isLoading = ["running", "started"].includes(lastRun?.status || "");
  const parameters = useMemo(() => {
    if (flowVersion && flowVersion.nodes && flowVersion.nodes.length > 0) {
      return extractFlowParams(flowVersion);
    } else {
      return null;
    }
  }, [flowVersion]);

  const handleRun = async () => {
    setShow(true);
    setRunStep("params");
    paramsForm.resetFields();
  };
  const handleCancelRun = () => {
    setShow(false);
    if (clearOnClose) {
      clearLastRun();
    }
  };
  const handleRunInputsNext = async () => {
    setRunStep("result");
    const params = paramsForm.getFieldsValue() || {};
    runFlow(params);
  };

  const formValues = Form.useWatch([], paramsForm);
  const formattedCommandExample = useMemo(() => {
    if (!formValues) return "";
    const args = Object.entries(formValues)
      .map(([k, v]) => `--${k} "${v}"`)
      .join(" ");
    return `/my-flow-name ${args}`;
  }, [formValues]);

  return (
    <Modal
      // title={`Run ${flowVersion?.name || ""}`}
      title="Run Flow"
      open={open}
      // open
      onCancel={handleCancelRun}
      okText=""
      okButtonProps={{
        hidden: true,
      }}
      // onOk={runStep === "params" ? handleRunInputsNext : undefined}
      cancelText=""
      cancelButtonProps={{ hidden: true }}
      width="900px"
    >
      {runStep === "params" && parameters && (
        <>
          <Form
            size="small"
            onSubmitCapture={(e) => e.preventDefault()}
            onFinish={handleRunInputsNext}
            form={paramsForm}
            autoComplete="off"
            colon={false}
            labelAlign="right"
            labelWrap
            labelCol={{ span: 8 }}
            className="pt-4 w-3/4 mx-auto"
          >
            {parameters &&
              parameters.map((name) => (
                <Form.Item
                  key={name}
                  name={name}
                  label={<span className="font-mono font-bold">{name}</span>}
                  initialValue=""
                >
                  <Input type="text" />
                </Form.Item>
              ))}

            {(!parameters || parameters.length === 0) && (
              <Empty
                imageStyle={{ height: "50px" }}
                description="No starting parameters found for this flow"
              />
            )}
            <Form.Item className="flex justify-end">
              <Button
                htmlType="submit"
                type="primary"
                className="flex justify-center items-center"
                size="middle"
                icon={<PlayIcon size={14} />}
              >
                Run flow
              </Button>
            </Form.Item>
          </Form>
          <Divider className="my-4" />
          <section className="min-h-[100px]">
            <h3>Using Extension Commands</h3>
            <p>
              Flows can be started by writing a slash command (such as{" "}
              <Tag className="font-mono">/my-flow-name</Tag> ) in any browser
              text box and triggering the hotkey.
            </p>

            <Input.TextArea
              value={formattedCommandExample}
              className="font-mono py-4 text-xs"
              autoSize
              contentEditable={false}
            />
          </section>
        </>
      )}

      {runStep === "result" && (
        <>
          {isLoading && <LoadingSpinner />}
          {lastRun && (
            <div>
              <FlowResult flowVersion={flowVersion} run={lastRun} />
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default RunFlowModal;
