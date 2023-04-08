import MainLayout from "../layouts/MainLayout";
import common from "common";
import { Button, Collapse, Tag, Tooltip } from "antd";
import RunModal from "../components/RunModal";
import { useLocation } from "wouter";
const Explore = () => {
  const [_location, navigate] = useLocation();
  const handleCustomize = (explorePrompt: typeof common.EXPLORE.prompts[0]) => {
    const attrs = {
      name: explorePrompt.name,
      description: explorePrompt.description,
      messages: [{ role: "user", content: explorePrompt.content }],
    };
    const qp = new URLSearchParams({
      attrs: encodeURIComponent(JSON.stringify(attrs)),
    }).toString();
    navigate(`/prompts/new?${qp}`);
  };
  return (
    <MainLayout>
      <h2>Explore</h2>
      <p>
        Browse curated prompts and discover the power of templated prompt
        engineering.
      </p>
      <div>
        <Collapse expandIconPosition="end">
          {common.EXPLORE.prompts.map(
            (prompt: {
              name: string;
              content: string;
              tags: string[];
              description: string;
            }) => (
              <Collapse.Panel
                header={
                  <div className="flex-col gap-2 flex">
                    <span className="font-bold">{prompt.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {prompt.description}
                    </span>
                  </div>
                }
                key={prompt.name}
              >
                <p className="whitespace-pre-wrap">{prompt.content}</p>
                <div className="flex flex-row justify-between">
                  <div>
                    {prompt.tags.map((tag: string) => (
                      <Tag>{tag}</Tag>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <RunModal
                      prompt={{
                        id: crypto.randomUUID(),
                        name: prompt.name,
                        messages: [{ role: "user", content: prompt.content }],
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                      }}
                    >
                      <Tooltip className="Try this prompt">
                        <Button type="default">Try</Button>
                      </Tooltip>
                    </RunModal>
                    <Tooltip className="Customize this prompt">
                      <Button
                        type="primary"
                        onClick={() => handleCustomize(prompt)}
                      >
                        Customize
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </Collapse.Panel>
            )
          )}
        </Collapse>
      </div>
    </MainLayout>
  );
};
export default Explore;
