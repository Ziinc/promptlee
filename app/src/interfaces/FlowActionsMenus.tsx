import { Button, Dropdown, Tag } from "antd";
import { Book, Trash, Unlink } from "lucide-react";
import AddPromptIcon from "../components/icons/AddPromptIcon";
import { useFlowEditorState } from "./FlowEditorContext";

interface FlowActionsMenuProps {
  disabled: boolean;
}
const FlowActionsMenu = ({ disabled }: FlowActionsMenuProps) => {
  const editor = useFlowEditorState();

  return (
    <>
      <Dropdown
        trigger={["click"]}
        menu={{
          className: "w-48",
          items: [
            {
              key: "new",
              label: "New",
              onClick: editor.handleNewFlow,
            },
            {
              key: "open",
              label: "Open",
              onClick: () => {
                setTimeout(() => {
                  editor.handleOpenSidebar();
                }, 200);
              },
            },
            {
              key: "copy",
              label: "Make a copy",
              onClick: editor.handleCopyFlow,
            },
            { key: "div", type: "divider" },
            {
              key: "versions",
              disabled: true,
              label: <ProLabel text="Version history" />,
            },
            {
              key: "runs",
              disabled: true,
              label: <ProLabel text="Run history" />,
            },
          ],
        }}
        disabled={disabled}
      >
        <Button size="small" type="text" disabled={disabled}>
          File
        </Button>
      </Dropdown>
      <Dropdown
        trigger={["click"]}
        menu={{
          className: "w-48",
          items: [
            {
              key: "unlink",
              label: "Remove connections",
              onClick: editor.handleUnlinkPrompt,
              icon: <Unlink size={16} />,
              disabled: editor.selectedNodeId == null,
            },
            { key: "div", type: "divider" },
            {
              key: "delete",
              label: "Delete",
              icon: <Trash size={14} />,
              disabled: editor.selectedNodeId === null,
              onClick: () => editor.handleDeletePrompt(editor.selectedNodeId!),
            },
          ],
        }}
        disabled={disabled}
      >
        <Button size="small" type="text" disabled={disabled}>
          Edit
        </Button>
      </Dropdown>
      <Dropdown
        trigger={["click"]}
        menu={{
          className: "w-48",
          items: [
            {
              key: "prompt",
              label: "Prompt",
              icon: <AddPromptIcon />,
              className: "flex gap-2 items-center align-center",
              onClick: editor.handleAddPrompt,
            },
          ],
        }}
        disabled={disabled}
      >
        <Button size="small" type="text" disabled={disabled}>
          Insert
        </Button>
      </Dropdown>
      <Dropdown
        trigger={["click"]}
        menu={{
          className: "w-48",
          items: [
            {
              key: "docs",
              label: "Documentation",
              icon: <Book size={14} />,
              className: "flex gap-2 items-center align-center",
              onClick: () => {
                const docsHref = `${import.meta.env.VITE_DOCS_URL}/docs`;
                window.open(docsHref);
              },
            },
          ],
        }}
        disabled={disabled}
      >
        <Button size="small" type="text" disabled={disabled}>
          Help
        </Button>
      </Dropdown>
    </>
  );
};

const ProLabel = ({ text }: { text: string }) => (
  <span className="flex justify-between align-center">
    <span>{text}</span>
    <Tag rootClassName="rounded-full m-0 dark:bg-purple-900 dark:border-purple-700 border-purple-500 text-purple-900 dark:text-purple-100 font-bold border-none bg-purple-200">
      Pro
    </Tag>
  </span>
);
export default FlowActionsMenu;
