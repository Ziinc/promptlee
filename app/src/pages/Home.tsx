import {
  Button,
  Card,
  Dropdown,
  notification,
  Popover,
  Tooltip,
  Alert,
  Divider,
} from "antd";
import "antd/dist/reset.css";
import { Copy, Edit2, File, MoreVertical, Play, Trash2 } from "lucide-react";
import React from "react";
import { Link, useLocation } from "wouter";
import { createFlow, Flow } from "../api/flows";
import { useAppState } from "../App";
import RunModal from "../components/RunModal";
import FlowsLayout from "../layouts/FlowsLayout";
import FlowsList from "../layouts/FlowsList";
import MainLayout from "../layouts/MainLayout";
const Home: React.FC = () => {
  const [_location, navigate] = useLocation();
  const app = useAppState();

  return (
    <FlowsLayout>
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
            <h4 className="font-bold opacity-75 text-center">Create a Flow</h4>
            <Button
              className="flex justify-start items-center gap-1"
              block
              size="large"
              icon={<File size={18} />}
              onClick={async () => {
                const { data, error } = await createFlow();
                if (error) return;
                app.mergeAppState({ flows: app.flows?.concat([data as Flow]) });
                navigate(`/flows/${data!.id}`);
              }}
            >
              New blank flow
            </Button>
          </div>
          {app.flows && app.flows.length > 0 && (
            <div className="w-1/2 px-2">
              <div>
                <h4 className="font-bold opacity-75 text-center">
                  Open a Flow
                </h4>
                <FlowsList />
              </div>
            </div>
          )}
        </div>
      </Card>
    </FlowsLayout>
  );
};

export default Home;
