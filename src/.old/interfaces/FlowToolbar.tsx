import { Tooltip, Button } from "antd";
import { Unlink } from "lucide-react";
import AddPromptIcon from "../components/icons/AddPromptIcon";
import { useFlowEditorState } from "./FlowEditorContext";
export interface FlowToolbarProps {
  showSidebar?: boolean;
  actions?: React.ReactNode;
  disabled: boolean;
}
const FlowToolbar = ({ disabled }: FlowToolbarProps) => {
  const editor = useFlowEditorState();

  return (
    <div className="flex gap-1 items-center justify-start">
      <ToolbarActionButton
        label="Add prompt"
        icon={<AddPromptIcon />}
        disabled={disabled}
        onClick={editor.handleAddPrompt}
      />
      <span className="h-full w-px  min-h-[24px] dark:bg-slate-700 bg-neutral-300"></span>
      <ToolbarActionButton
        label="Unlink connections"
        icon={<Unlink size={18} />}
        onClick={editor.handleUnlinkPrompt}
        disabled={disabled || editor.selectedNodeId === null}
      />
    </div>
  );
};

const ToolbarActionButton = ({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <Tooltip title={label} placement="bottom">
    <Button
      onClick={onClick}
      type="text"
      disabled={disabled}
      rootClassName="w-10 h-10 p-0"
      className="flex flex-row items-center justify-center "
      icon={icon}
    >
      <span className="sr-only">Add prompt</span>
    </Button>
  </Tooltip>
);

export default FlowToolbar;
