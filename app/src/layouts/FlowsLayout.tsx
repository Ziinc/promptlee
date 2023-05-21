import FlowsToolbar, { FlowsToolbarProps } from "./FlowsToolbar";
import Navbar from "./Navbar";
import Sidebar from "./FlowsList";
import { Drawer } from "antd";
import React from "react";
type Props = React.PropsWithChildren<{
  variant?: "centered" | "wide";
  contentClassName?: string;
  showSidebar?: boolean;
  toolbarActions?: React.ReactNode
  savingIndicator: FlowsToolbarProps["savingIndicator"]
}>;
const FlowsLayout: React.FC<Props> = ({
  children,
  showSidebar,
  // variant = "centered",
  contentClassName = "",
  toolbarActions,savingIndicator
}) => (
  <div className="flex flex-row h-full min-h-screen">
    <div className="w-full">
      <FlowsToolbar savingIndicator={savingIndicator} showSidebar={showSidebar} actions={toolbarActions} />
      <div
        className={[
          "flex-grow",
          // variant === "centered" ? "py-3 container mx-auto max-w-[900px]" : "",
          contentClassName,
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  </div>
);
export default FlowsLayout;
