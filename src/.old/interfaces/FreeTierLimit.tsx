import { Button, Progress, Card } from "antd";
import { AlertTriangle, Zap } from "lucide-react";
import { useState } from "react";
import { useAppState } from "../App";
import UpgradePromptModal from "../components/UpgradePromptModal";

const FreeTierLimit = () => {
  const app = useAppState();
  const flows = app.flows || [];
  const runs = app.lifetimePromptRuns;
  const [showPlans, setShowPlans] = useState(false);

  return (
    <Card
      className="dark:bg-slate-900 bg-amber-50 border-amber-300 px-5 py-3 flex flex-col gap-2"
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex flex-col gap-2">
        <h4 className="m-0 !text-sm font-bold flex flex-row gap-2 items-center dark:text-amber-300 text-amber-900">
          <AlertTriangle size={16} /> <span>Free Plan</span>
        </h4>
        <p className="m-0 text-xs opacity-75">
          Free users are limited to 5 flows and 100 prompt runs.
        </p>

        <div className="flex flex-col  gap-1 items-end">
          <div className="w-full flex flex-col items-end">
            <div className="flex justify-between w-full">
              <span className="font-bold opacity-75 text-xs">Flows</span>
              <span className="font-bold opacity-75 text-xs">
                {flows.length} / 5
              </span>
            </div>
            <Progress
              percent={(flows.length === 0 ? 0 : flows.length / 5) * 100}
              size="small"
              strokeColor="orange"
              className="m-0 -mt-2"
              showInfo={false}
            />
          </div>
          <div className="w-full flex flex-col items-end">
            <div className="flex justify-between w-full">
              <span className="font-bold opacity-75 text-xs">Prompt Runs</span>
              <span className="font-bold opacity-75 text-xs">{runs} / 100</span>
            </div>
            <Progress
              percent={runs ? 0 : runs / 100}
              strokeColor="orange"
              //   status={app.isExceedingPromptRuns ? "exception" : "normal"}
              size="small"
              className="m-0 -mt-2"
              showInfo={false}
            />
          </div>
        </div>

        <UpgradePromptModal
          open={showPlans}
          onClose={() => setShowPlans(false)}
        />
        <Button
          block
          icon={<Zap size={18} />}
          onClick={() => setShowPlans(true)}
          type="primary"
          className="flex flex-row justify-center gap-1  items-center  font-bold dark:bg-purple-700 dark:focus:bg-purple-200 bg-purple-800 hover:bg-purple-600 focus:bg-purple-600"
        >
          Upgrade
        </Button>
      </div>
    </Card>
  );
};

export default FreeTierLimit;
