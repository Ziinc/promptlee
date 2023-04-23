import { Modal } from "antd";
import React, { useState } from "react";
import { Prompt } from "../App";
import ShowPrompt from "./ShowPrompt";

interface Props {
  prompt: Prompt;
  triggerClassName?: string;
  children: React.ReactNode;
}
const PreviewPromptModal: React.FC<Props> = ({ prompt, triggerClassName, children }) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Modal
        title={`Preview: ${prompt?.name || ""}`}
        open={show}
        onCancel={() => setShow(false)}
        okButtonProps={{
          hidden: true,
        }}
        cancelText="Close"
      >
        {prompt && <ShowPrompt prompt={prompt} />}
      </Modal>

      <div className={triggerClassName} onClick={() => setShow(true)}>
        {children}
      </div>
    </>
  );
};

export default PreviewPromptModal;
