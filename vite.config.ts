/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
// @ts-expect-error
import CONSTANTS from "common/src/constants";
import path from "node:path";
// https://vitejs.dev/config/

process.env = {
  ...process.env,
  VITE_TITLE: CONSTANTS.title,
  VITE_DESCRIPTION: CONSTANTS.description,
};
export default defineConfig({
  build: {
    outDir: "./dist",
  },
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss, autoprefixer] } },
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
