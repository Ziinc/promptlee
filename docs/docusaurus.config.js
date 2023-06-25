// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const common = require("common");
const EXPLORE = require("common/dist/explore");
const isProd = process.env.NODE_ENV === "production";
const appUrl = isProd ? "https://promptpro.tznc.net" : "http://localhost:5173";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: common.SEO.title,
  tagline: common.SEO.tagline,
  favicon: "/favicon.ico",

  // Set the production url of your site here
  url: "https://promptpro.tznc.net",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/docs",

  customFields: {
    appUrl,
  },

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
          path: "docs",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: {
          showReadingTime: true,
          path: "blog",
          routeBasePath: "blog",
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
          {
            to: appUrl,
            label: "Back to App",
            position: "right",
          },
          {
            href: "https://github.com/Ziinc/promptpro",
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
                label: "Documentation",
                to: "/",
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
