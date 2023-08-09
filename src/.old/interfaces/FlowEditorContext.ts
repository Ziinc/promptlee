import { FormInstance } from "antd";
import { createContext, useContext } from "react";

export interface FlowEditorState {
  selectedNodeId: string | null;
}

export interface FlowEditorContextValue extends FlowEditorState {
  form: FormInstance | null;
  mergeState: (partial: Partial<FlowEditorState>) => void;
  handleAddPrompt: () => void;
  handleNewFlow: () => void;
  handleUnlinkPrompt: () => void;
  handleCopyFlow: () => void;
  handleCloseSidebar: () => void;
  handleOpenSidebar: () => void;
  handleRunFlow: () => void;
  handleDeletePrompt: (id: string) => void;
}
export const DEFAULT_FLOW_EDITOR_STATE = {
  selectedNodeId: null,
};

export const FlowEditorContext = createContext<FlowEditorContextValue>({
  ...DEFAULT_FLOW_EDITOR_STATE,
  form: null,
  mergeState: () => null,
  handleAddPrompt: () => null,
  handleNewFlow: () => null,
  handleUnlinkPrompt: () => null,
  handleCopyFlow: () => null,
  handleCloseSidebar: () => null,
  handleOpenSidebar: () => null,
  handleDeletePrompt: () => null,
  handleRunFlow: () => null,
});

export const useFlowEditorState = () => useContext(FlowEditorContext);
