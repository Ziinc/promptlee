/// <reference types="vite/client" />
/// <reference types="@samrum/vite-plugin-web-extension/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_DOCS_URL: string;
  readonly VITE_APP_URL: string;
  // more env variables...
}
