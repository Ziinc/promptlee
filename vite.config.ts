/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
// import CONSTANTS from "common/src/constants";
import path from "node:path";
// https://vitejs.dev/config/
import webExtension from "@samrum/vite-plugin-web-extension";
export default defineConfig({
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
  plugins: [
    react(),
    ...(process.env.TARGET_BROWSER
      ? [
          webExtension({
            manifest: {
              name: "Promptlee",
              description: "Your Browser AI Assistant",
              version: "1.0.0",
              author: "ziinc",
              manifest_version: 3,
              action: {
                // default_icon: {
                //   16: "icons/16.png",
                //   19: "icons/19.png",
                //   32: "icons/32.png",
                //   38: "icons/38.png",
                // },
                default_popup: "src/extension/popup/popup.html",
              },
              background:
                process.env.TARGET_BROWSER === "firefox"
                  ? //@ts-expect-error
                    { scripts: ["src/extension/worker.ts"] }
                  : {
                      service_worker: "src/extension/worker.ts",
                    },
              host_permissions: ["*://*/*"],
              content_scripts: [
                {
                  js: ["src/extension/content.tsx"],
                  matches: ["*://*/*"],
                },
              ],
              externally_connectable: {
                matches: ["*://*/*"],
              },

              // icons: {
              //   16: "icons/16.png",
              //   19: "icons/19.png",
              //   32: "icons/32.png",
              //   38: "icons/38.png",
              //   48: "icons/48.png",
              //   64: "icons/64.png",
              //   96: "icons/96.png",
              //   128: "icons/128.png",
              //   256: "icons/256.png",
              //   512: "icons/512.png",
              // },
              options_ui: {
                page: "src/extension/options.html",
                open_in_tab: true,
              },
              permissions: ["contextMenus", "activeTab", "storage", "tabs"],
            },
          }),
        ]
      : []),
  ],
  // css: { postcss: { plugins: [tailwindcss, autoprefixer] } },
  // resolve: {
  //   alias: {
  //     react: path.resolve("./node_modules/react"),
  //     "react-dom": path.resolve("./node_modules/react-dom"),
  //   },
  //   preserveSymlinks: true,
  // },
  publicDir: path.resolve("common/static"),
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
  },
});
