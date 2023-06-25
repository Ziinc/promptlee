import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import common from "common";
import path from "node:path";
// https://vitejs.dev/config/

process.env = {
  ...process.env,
  VITE_TITLE: common.SEO.title,
  VITE_DESCRIPTION: common.SEO.description,
};
export default defineConfig({
  build: {
    outDir: "../dist"
  },
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss, autoprefixer] } },
  resolve: {
    alias: {
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
    },
    preserveSymlinks: true,
  },
  publicDir: path.resolve("../node_modules/common/static"),
});
