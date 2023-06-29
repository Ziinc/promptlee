import { Drawer, Button } from "antd";
import { SidebarClose, SidebarOpen } from "lucide-react";
import { useAppState } from "../App";
import FlowsList from "./FlowsList";
import FreeTierLimit from "./FreeTierLimit";
export interface FlowSidebarProps {
  show?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}
const FlowSidebar = ({ show, onClose, onOpen }: FlowSidebarProps) => {
  const app = useAppState();

  return (
    <>
      <Drawer
        keyboard={true}
        title={
          <img
            src={`/branding/branding-horizontal-${
              app.darkMode ? "light" : "dark"
            }.png`}
            className="object-contain h-5"
          />
        }
        closeIcon={<SidebarClose className="mt-1" size={20} strokeWidth={2} />}
        placement="left"
        onClose={onClose}
        open={show}
      >
        <div className="flex flex-col justify-between h-full">
          <FlowsList close={onClose} />
          <FreeTierLimit />
        </div>
      </Drawer>

      <Button
        type="text"
        className="p-2 h-10 gap-1 flex flex-row justify-center items-center"
        onClick={onOpen}
        title="Open editor sidebar"
        icon={<SidebarOpen size={18} />}
      >
        <img
          src={`/branding/icon-bg-${app.darkMode ? "light" : "dark"}.png`}
          className="object-contain h-6"
        />
      </Button>
    </>
  );
};

export default FlowSidebar;
