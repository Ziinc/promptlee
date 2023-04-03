import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import common from "common";

import Link from "@docusaurus/Link";
export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Explore | ${siteConfig.title}`}
      description="Explore curated PromptPro prompts"
    >
      <main className="mx-auto container max-w-3xl pb-24">
        <h1>Explore</h1>
        <p>
          Browse curated promps that leverage PromptPro's input templating
          features.
        </p>

        <div className="flex flex-col gap-4">
          {common.EXPLORE.prompts.map((prompt) => (
            <div className="flex flex-col gap-2">
              <Link
                to={`/explore/${prompt.name
                  .toLowerCase()
                  .replaceAll(" ", "-")}`}
              >
                <h3 className="mb-0">{prompt.name}</h3>
              </Link>
              <p>{prompt.description}</p>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
