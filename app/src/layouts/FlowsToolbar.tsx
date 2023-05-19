import {
  App,
  Drawer,
  Menu,
  Switch,
  Input,
  Tooltip,
  Button,
  Dropdown,
  Form,
  Divider,
} from "antd";
import {
  MessageSquare,
  Moon,
  Settings,
  SidebarClose,
  SidebarOpen,
  AlignLeft,
  TextCursor,
  Sun,
  Plus,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import {
  createFlow,
  createFlowVersion,
  Flow,
  listFlows,
  updateFlow,
} from "../api/flows";
import { Prompt, useAppState } from "../App";
import { isSystemDarkMode } from "../utils";
import FlowsList from "./FlowsList";
import debounce from "lodash/debounce";
import FreeTierLimit from "./FreeTierLimit";
import { version } from "os";
interface Props {
  showSidebar?: boolean;
  actions?: React.ReactNode
}
const FlowsToolbar = ({ showSidebar,actions }: Props) => {
  const [match, params] = useRoute<{ id: string }>("/flows/:id");

  const [openSidebar, setOpenSidebar] = useState(false);
  const [location, navigate] = useLocation();

  const app = useAppState();
  const flow = (app.flows || [])?.find((flow) => flow.id == params?.id);

  const handleNameChange = async (name: string) => {
    if (!flow) return;
    const { data: updatedFlow } = await updateFlow(flow.id, { name });
    if (!updatedFlow) {
      console.error("Error updating flow");
    }
    // update flow list
    const filtered = (app.flows || []).filter((f) => f.id !== flow.id);
    app.mergeAppState({ flows: filtered.concat([updatedFlow!]) });
  };

  const debouncedNameChange = debounce(handleNameChange, 500);
  const [form] = Form.useForm();

  // watch for params change
  useEffect(() => {
    if (!flow) return;
    form.setFieldsValue(flow);
  }, [flow?.id]);

  const isToolbarDisabled = !flow;
  return (
    <div className="w-full dark:bg-blue-900 bg-blue-100">
      <Drawer
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
        onClose={() => setOpenSidebar(false)}
        open={showSidebar || openSidebar}
      >
        <div className="flex flex-col justify-between h-full">
          <FlowsList close={() => setOpenSidebar(false)} />
          <FreeTierLimit />
        </div>
      </Drawer>

      <div className="flex flex-row justfy-between w-full">
        <div className="flex flex-grow gap-2 py-2 px-4 items-center w-full ">
          <div>
            <Button
              type="text"
              className="p-2 h-10 gap-1 flex flex-row justify-center items-center"
              onClick={() => setOpenSidebar(true)}
              title="Open editor sidebar"
              icon={<SidebarOpen size={18} />}
            >
              <img
                src={`/branding/icon-bg-${app.darkMode ? "light" : "dark"}.png`}
                className="object-contain h-6"
              />
            </Button>
          </div>
          <Form
            initialValues={flow}
            onFinish={() => {}}
            form={form}
            className="w-72"
            disabled={isToolbarDisabled}
          >
            <Form.Item name="name" noStyle validateFirst>
              <Input.TextArea
                autoSize={{ minRows: 1 }}
                bordered={false}
                className="focus:ring w-full"
                placeholder={flow ? undefined : "Untitled Flow"}
                onChange={(e) => debouncedNameChange(e.target.value)}
              />
            </Form.Item>
          </Form>
        </div>
        <Menu
          disabledOverflow
          mode="horizontal"
          className=" !border-b-0 min-w-96 w-96 flex flex-row justify-end  text-blue-100  dark:bg-blue-900 bg-blue-100"
          items={[
            {
              label: (
                <Switch
                  checked={app.darkMode}
                  className="!border-slate-500 !border dark:!border-blue-500 !border-solid dark:!bg-blue-600 !bg-gray-200 hover:!bg-gray-400 "
                  checkedChildren={
                    <Moon
                      size={12}
                      strokeWidth={3}
                      className="mt-1 text-white"
                    />
                  }
                  unCheckedChildren={
                    <Sun
                      size={12}
                      strokeWidth={3}
                      className=" mt-1 text-black"
                    />
                  }
                  onChange={app.toggleDarkMode}
                />
              ),
              key: "darkMode",
            },
          ]}
        />
      </div>
      {actions}
    </div>
  );
};


export default FlowsToolbar;
