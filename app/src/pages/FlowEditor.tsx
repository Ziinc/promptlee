import { Button, Form, notification, Input } from "antd";
import { useLocation } from "wouter";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppState } from "../App";
import { PlayIcon } from "lucide-react";
import FlowsLayout from "../layouts/FlowsLayout";
import {
  createFlow,
  createFlowVersion,
  FlowVersion,
  getLatestFlowVersion,
  updateFlow,
} from "../api/flows";
import FlowDagEditor from "../components/FlowDagEditor";
import debounce from "lodash/debounce";
import FlowSidebar from "../interfaces/FlowSidebar";
import {
  DEFAULT_FLOW_EDITOR_STATE,
  FlowEditorContext,
  FlowEditorContextValue,
  FlowEditorState,
} from "../interfaces/FlowEditorContext";
import DarkModeSwitch from "../components/DarkModeSwitch";
import FlowActionsMenu from "../interfaces/FlowActionsMenus";
import FlowToolbar from "../interfaces/FlowToolbar";
import WelcomeMessage from "../interfaces/WelcomeMessage";

const FlowEditor = ({ params }: { params: { id: string } }) => {
  const [versionForm] = Form.useForm();
  const [flowForm] = Form.useForm();
  const [editorState, setEditorState] = useState<FlowEditorState>(
    DEFAULT_FLOW_EDITOR_STATE
  );
  const [showSidebar, setShowSidebar] = useState(false);
  const app = useAppState();

  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState<"hide" | "saving" | "saved">("hide");

  const flow = (app.flows || [])?.find((flow) => flow.id == params?.id);

  useEffect(() => {
    // on mount, load latest version
    if (params.id) {
      fetchVersion();
    }
  }, []);
  const fetchVersion = async () => {
    setIsLoading(true);
    const res = await getLatestFlowVersion(params.id);
    const { data, error } = res;
    if (error) {
      console.error("Unable to fetch latest version", error);
    }
    if (data) {
      // no version fetched, return
      versionForm.setFieldsValue(data);
    }
    setIsLoading(false);
  };

  const mergeState: FlowEditorContextValue["mergeState"] = (partial) => {
    setEditorState((prev) => ({ ...prev, ...partial }));
  };

  const handleNewFlow = async () => {
    const { data, error } = await createFlow();
    if (error) return;
    window.open(`/flows/${data!.id}`);
  };
  const handleCopyFlow = async () => {
    if (!flow) {
      console.error("No flow selected!");
      return;
    }
    const { data, error } = await createFlow({
      name: `${flow.name} copy`,
    });
    if (!data) return;
    await createFlowVersion(data?.id, {
      edges: formValues.edges,
      nodes: formValues.nodes,
    });
    window.open(`/flows/${data!.id}`);
  };
  const handleSave = useCallback(async () => {
    if (!flow) return;
    setSaving("saving");
    const attrs = versionForm.getFieldValue([]);
    await createFlowVersion(flow.id, attrs);
    setTimeout(() => {
      setSaving("saved");
      debouncedHideSave();
    }, 500);
  }, [versionForm, flow]);
  const hideSavedIndicator = () => setSaving("hide");
  const debouncedHideSave = useMemo(
    () => debounce(hideSavedIndicator, 5000),
    [hideSavedIndicator]
  );
  const debouncedHandleSave = useMemo(
    () => debounce(handleSave, 600),
    [handleSave]
  );

  const handleAddPrompt = () => {
    const formNodes = versionForm.getFieldValue("nodes") || [];
    const nodeId = crypto.randomUUID();
    versionForm.setFieldValue("nodes", [
      ...formNodes,
      {
        id: nodeId,
        prompt_text: "As a ____, do ____ with the following text:\n@text",
      } as FlowVersion["nodes"][number],
    ]);
    mergeState({ selectedNodeId: nodeId });
  };

  const handleDeletePrompt = async (nodeId: string) => {
    const nodes: FlowVersion["nodes"] =
      versionForm.getFieldValue("nodes") || [];
    const edges: FlowVersion["edges"] =
      versionForm.getFieldValue("edges") || [];
    const newNodes = nodes.filter((node) => node.id !== nodeId);
    const newEdges = edges.filter(
      (edge) => edge.from_node_id !== nodeId && edge.to_node_id !== nodeId
    );

    versionForm.setFieldsValue({
      nodes: newNodes,
      edges: newEdges,
    });
    debouncedHandleSave();
    notification.success({ message: "Deleted!", placement: "bottomRight" });
  };

  const handleUnlinkPrompt = async () => {
    if (!editorState.selectedNodeId) return;
    const nodeId = editorState.selectedNodeId;
    const edges: FlowVersion["edges"] =
      versionForm.getFieldValue("edges") || [];
    const newEdges = edges.filter(
      (edge) => edge.from_node_id !== nodeId && edge.to_node_id !== nodeId
    );
    versionForm.setFieldValue("edges", newEdges);
    debouncedHandleSave();
  };

  const formValues = Form.useWatch([], versionForm);

  useEffect(() => {
    debouncedHandleSave();
  }, [JSON.stringify(formValues)]);

  const handleNameChange = useCallback(
    async (name: string) => {
      if (!flow) return;
      const { data: updatedFlow } = await updateFlow(flow.id, { name });
      if (!updatedFlow) {
        console.error("Error updating flow");
      }
      // update flow list
      const filtered = (app.flows || []).filter((f) => f.id !== flow.id);
      app.mergeAppState({ flows: filtered.concat([updatedFlow!]) });
    },
    [app.flows]
  );

  const debouncedNameChange = useMemo(
    () => debounce(handleNameChange, 1000),
    [handleNameChange]
  );

  const flowName = Form.useWatch("name", flowForm) || "";

  const isToolbarDisabled = !flow;

  return (
    <FlowEditorContext.Provider
      value={{
        ...editorState,
        form: versionForm,
        mergeState,
        handleAddPrompt,
        handleUnlinkPrompt,
        handleCloseSidebar: () => setShowSidebar(false),
        handleOpenSidebar: () => setShowSidebar(true),
        handleCopyFlow,
        handleDeletePrompt,
        handleNewFlow,
      }}
    >
      <Form
        className=""
        form={versionForm}
        initialValues={{ nodes: [], edges: [] }}
        onFieldsChange={() => {
          // trigger save
          debouncedHandleSave.cancel();
          debouncedHandleSave();
        }}
      >
        <Form.Item hidden name="nodes" />
        <Form.Item hidden name="edges" />
        <FlowsLayout
          sidebar={
            <FlowSidebar
              show={showSidebar}
              onClose={() => setShowSidebar(false)}
              onOpen={() => setShowSidebar(true)}
            />
          }
          flowNameInput={
            <Form
              initialValues={flow}
              onFinish={() => {}}
              form={flowForm}
              disabled={isToolbarDisabled}
            >
              <Form.Item name="name" noStyle validateFirst>
                <Input
                  bordered={false}
                  className="focus:ring border-gray-500 transition !duration-500 !max-w-[300px]"
                  placeholder={flow?.name ? undefined : "Untitled Flow"}
                  onChange={(e) => debouncedNameChange(e.target.value)}
                  style={{
                    width: !flowName
                      ? 120
                      : Math.min(Math.max(flowName.length * 12, 120), 300),
                  }}
                />
              </Form.Item>
            </Form>
          }
          savingIndicator={
            saving !== "hide" && (
              <span className="text-xs  font-semibold opacity-75">
                {saving === "saving" ? "Saving..." : "Saved"}
              </span>
            )
          }
          navActions={[
            <Button
              type="primary"
              className="flex gap-1 items-center"
              shape="round"
            >
              <PlayIcon size={16} />
              Run
            </Button>,
            <DarkModeSwitch />,
          ]}
          actionsMenu={<FlowActionsMenu disabled={isToolbarDisabled} />}
          toolbarActions={<FlowToolbar disabled={isToolbarDisabled} />}
        >
          {!flow && <WelcomeMessage />}
          {!isLoading && formValues && (
            <FlowDagEditor
              // run={useWorkflowHook.lastRun || undefined}
              onPromptRemove={handleDeletePrompt}
              onMove={() => {
                if (editorState.selectedNodeId) {
                  mergeState({ selectedNodeId: null });
                }
              }}
              onChange={(values) => {
                versionForm.setFieldsValue(values);
                debouncedHandleSave();
              }}
              className="h-[80vh] z-10"
              flowVersion={formValues}
            />
          )}
        </FlowsLayout>
      </Form>
    </FlowEditorContext.Provider>
  );
};

export default FlowEditor;
