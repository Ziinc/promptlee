import { File } from "lucide-react";
import { useAppState } from "../App";
import { useFlowEditorState } from "./FlowEditorContext";
import FlowsList from "./FlowsList";

import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";

const WelcomeMessage = () => {
  const editor = useFlowEditorState();
  const app = useAppState();
  return (
    <Card
      className="w-fit mx-auto mt-[10vh] flex flex-col justify-between"
      variant="outlined"
    >
      <CardHeader
        title={
          <h3 className="text-base font-bold text-center">
            PromptPro is a ChatGPT prompt manager for creating powerful
            automation flows
          </h3>
        }
      />
      <Divider flexItem />
      <CardContent className="flex flex-col gap-3 justify-start">
        {app.flows && app.flows.length > 0 && (
          <div className="flex-grow h-full ">
            <h4 className="font-bold opacity-75  text-sm">Open a Flow</h4>
            <FlowsList />
          </div>
        )}
      </CardContent>
      <Divider flexItem />
      <CardActions className="flex flex-row justify-end">
        <Button
          className="flex justify-start items-center gap-2"
          variant="text"
          color="secondary"
          onClick={editor.handleNewFlow}
        >
          <File size={14} />
          New blank flow
        </Button>
      </CardActions>
    </Card>
  );
};
export default WelcomeMessage;
