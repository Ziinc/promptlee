// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const common = require("common");
const EXPLORE = require("common/dist/explore");
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: common.SEO.title,
  tagline: common.SEO.tagline,
  favicon: "/favicon.ico",

  // Set the production url of your site here
  url: "https://promptpro.tznc.net",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "Ziinc", // Usually your GitHub org/user name.
  projectName: "promptpro", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  staticDirectories: ["common/static", "../common/static"],

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        gtag: {
          trackingID: "G-VENWS46WZH",
          anonymizeIP: true,
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          ignorePatterns: ["/tags/**"],
          filename: "sitemap.xml",
        },
      }),
    ],
  ],

  plugins: [
    async function postCssPlugin(context, options) {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer.
          postcssOptions.plugins.push(require("tailwindcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },

    async function pagesGenPlugin(context, options) {
      // ...
      return {
        name: "pages-gen",
        async loadContent() {
          return EXPLORE.prompts;
          // ...
        },
        async contentLoaded({ content, actions }) {
          const prompts = content;
          await Promise.all(
            // @ts-ignore
            prompts.map(async (prompt) => {
              // await actions.createData(
              //   // Note that this created data path must be in sync with
              //   // metadataPath provided to mdx-loader.
              //   `${docuHash(prompt.name)}.json`,
              //   JSON.stringify(prompt, null, 2)
              // );

              return actions.addRoute({
                path:
                  "/explore/" + prompt.name.toLowerCase().replaceAll(" ", "-"),
                component: require.resolve(
                  "./src/components/ExplorePromptPage.tsx"
                ),
                
                exact: true,
                modules: {
                  config: `@generated/docusaurus.config`,
                },
                prompt,
              });
            })
          );

          // ...
        },
        /* other lifecycle API */
      };
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "branding/social-banner.png",
      navbar: {
        title: "PromptPro",
        logo: {
          alt: "PromptPro",
          src: "branding/icon-only.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Docs",
          },
          { to: "/blog", label: "Blog", position: "left" },
          { to: "/explore", label: "Explore", position: "left" },
          {
            href: "https://app.promptpro.tznc.net",
            label: "App",
            position: "right",
          },
          {
            href: "https://github.com/facebook/docusaurus",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Tutorial",
                to: "/docs/intro",
              },
              // {
              //   label: "Getting Started",
              //   to: "/docs/getting-started",
              // },
              // {
              //   label: "Changelog",
              //   to: "/changelog",
              // },
            ],
          },
          // {
          //   title: "Community",
          //   items: [
          //     {
          //       label: "Bug Reports",
          //       href: "https://stackoverflow.com/questions/tagged/docusaurus",
          //     },
          //     {
          //       label: "Discord",
          //       href: "https://discordapp.com/invite/docusaurus",
          //     },
          //     {
          //       label: "Twitter",
          //       href: "https://twitter.com/docusaurus",
          //     },
          //   ],
          // },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "Explore",
                to: "/explore",
              },
              {
                label: "GitHub",
                href: "https://github.com/Ziinc/promptpro",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} PromptPro`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
