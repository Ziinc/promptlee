import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
// @ts-ignore
import appHome from "../assets/app.png"
// @ts-ignore
import appEditor from "../assets/app-editor.png"

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary" to="/docs/intro">
            Documentation
          </Link>
          <Link
            className="button button--primary"
            href="https://app.promptpro.tznc.net"
          >
            App
          </Link>
        </div>

        <div className="flex flex-row justify-between gap-4">
        <img src={appHome} className="w-1/2 object-contain"/>
        <img src={appEditor} className="w-1/2 object-contain"/>

        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Home`} description="The Prompt Engineering Toolkit">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
