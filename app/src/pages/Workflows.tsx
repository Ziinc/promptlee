import MainLayout from "../layouts/MainLayout";
import { List, Button, Descriptions } from "antd";
import { useLocation } from "wouter";
import { useAppState } from "../App";
import { Play } from "lucide-react";
import { Link } from "wouter";
import { countWorkflowOutputs, countWorkflowParameters } from "../utils";
import RunWorkflowModal from "../components/RunWorkflowModal";
const Workflows = () => {
  const [_location, navigate] = useLocation();
  const app = useAppState();
  const handleNewWorkflow = () => {
    navigate("/workflows/new");
  };

  return (
    <MainLayout>
      <h2>Workflows</h2>
      <p className="opacity-85">
        Workflows allows chaining different prompts together, leveraging prompts
        to make decisions, perform extraction or generative work, and more.
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-end">
          <Button onClick={handleNewWorkflow} type="primary">
            New Workflow
          </Button>
        </div>

        <List
          itemLayout="vertical"
          bordered
          rowKey="id"
          dataSource={app.workflows}
          renderItem={(item, index) => (
            <List.Item
              extra={
                <div className="flex flex-col w-24 justify-start ">
                  <RunWorkflowModal workflow={item}>
                    <Button
                      className="flex items-center gap-1 justify-center"
                      icon={<Play size={14} />}
                    >
                      Run
                    </Button>
                  </RunWorkflowModal>
                </div>
              }
            >
              <List.Item.Meta
                title={
                  <Link to={`/workflows/${item.id}/edit`}>{item.name}</Link>
                }
                className="!mb-0"
                description={
                  <div>
                    {item.description && (
                      <p className="whitespace-pre-wrap mb-0">
                        {item.description}
                      </p>
                    )}

                    <Descriptions className="p-0" rootClassName="p-0">
                      <Descriptions.Item
                        label="Prompts"
                        className="!pb-0 !text-xs"
                        contentStyle={{ padding: 0 }}
                      >
                        {item.nodes.length}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label="Inputs"
                        className="!pb-0 !text-xs"
                        contentStyle={{ padding: 0 }}
                      >
                        {countWorkflowParameters(app, item)}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label="Outputs"
                        className="!pb-0 !text-xs"
                        contentStyle={{ padding: 0 }}
                      >
                        {countWorkflowOutputs(item)}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </MainLayout>
  );
};
export default Workflows;
