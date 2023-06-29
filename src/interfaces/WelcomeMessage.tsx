import { Button, Card } from "antd";
import { File } from "lucide-react";
import { useAppState } from "../App";
import { useFlowEditorState } from "./FlowEditorContext";
import FlowsList from "./FlowsList";

const WelcomeMessage = () => {
  const editor = useFlowEditorState();
  const app = useAppState();
  return (
    <Card
      className="w-fit mx-auto mt-[10vh] min-h-[40vh]"
      title={
        <div className="p-5">
          <h3 className="text-base text-center">
            PromptPro is a ChatGPT prompt manager for creating powerful
            automation flows
          </h3>
        </div>
      }
      bordered
    >
      <div className="flex">
        <div className="w-1/2 mx-auto">
          <h4 className="font-bold opacity-75 text-center">Create a flow</h4>
          <Button
            className="flex justify-start items-center gap-1"
            block
            size="large"
            icon={<File size={18} />}
            onClick={editor.handleNewFlow}
          >
            New blank flow
          </Button>
        </div>
        {app.flows && app.flows.length > 0 && (
          <div className="w-1/2 px-2">
            <div>
              <h4 className="font-bold opacity-75 text-center">Open a Flow</h4>
              <FlowsList />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
export default WelcomeMessage;
