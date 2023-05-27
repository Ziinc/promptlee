import React from "react";
import { Divider } from "antd";
type Props = React.PropsWithChildren<{
  contentClassName?: string;
  toolbarActions?: React.ReactNode;
  savingIndicator?: React.ReactNode;
  navActions?: React.ReactNode[] | React.ReactNode;
  sidebar?: React.ReactNode;
  flowNameInput?: React.ReactNode;
  actionsMenu?: React.ReactNode;
}>;
const FlowsLayout: React.FC<Props> = ({
  children,
  contentClassName = "",
  toolbarActions,
  savingIndicator,
  navActions,
  sidebar,
  flowNameInput,
  actionsMenu,
}) => (
  <div className="flex flex-row h-full min-h-screen">
    <div className="w-full">
      <div className="w-full dark:bg-blue-900 bg-blue-100 flex-col justify-between items-center">
        <div className=" flex justify-between items-center py-1 px-2">
          <div className="flex items-center gap-2">
            {sidebar}
            {flowNameInput}
            {savingIndicator}
          </div>
          <div className="flex gap-2 items-center">
            {Array.isArray(navActions)
              ? navActions.map((fragment: React.ReactNode, index) => (
                  <React.Fragment key={index}>{fragment}</React.Fragment>
                ))
              : navActions}
          </div>
        </div>
        <div className="px-2 py-1 flex flex-row gap-1">{actionsMenu}</div>
        <Divider type="horizontal" className="w-full my-1" />
        <div className="w-full">{toolbarActions}</div>
      </div>
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
