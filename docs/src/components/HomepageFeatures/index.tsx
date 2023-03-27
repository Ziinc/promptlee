import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Prompt Input Templating",
    description: (
      <>
        Develop flexible prompts with input templating, re-using prompts for
        various automation scenarios.
      </>
    ),
  },
  {
    title: "Iteration Focused",
    description: (
      <>
        Cut down the trial and error iteration with input testing, response
        history, and more.
      </>
    ),
  },
  {
    title: "Privacy Focused and Secure",
    description: <>Open sourced, Apache licensed, Bring-Your-Own-API-Keys</>,
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className={styles.content}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
