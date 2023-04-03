import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import React from "react";
import Link from "@docusaurus/Link";

const ExplorePromptPage = (props) => {
  const { siteConfig } = useDocusaurusContext();
  const prompt = props.route.prompt;

  return (
    <Layout
      title={`Explore - ${prompt.name} | ${siteConfig.title}`}
      description="The Prompt Engineering Toolkit"
    >
      <main className="mx-auto container max-w-3xl p-4 min-h-[88vh]">
        <div className="py-2">
          <Link to="/explore">Back to Explore</Link>
        </div>
        <h1>{prompt.name}</h1>
        <div className="py-5">
          <p>{prompt.description}</p>
          <div className="flex flex-row gap-2">
            {prompt.tags.map((tag) => (
              <span className="rounded border dark:bg-gray-700 bg-gray-100 p-1 text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="border-2 border-l-4 border-solid border-gray-500 dark:bg-gray-800 bg-gray-200 p-4 rounded-lg">
          <p className="whitespace-pre-wrap  ">{prompt.content}</p>
        </div>
      </main>
    </Layout>
  );
};

export default ExplorePromptPage;
