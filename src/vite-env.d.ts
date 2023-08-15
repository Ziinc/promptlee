/// <reference types="vite/client" />
/// <reference types="@samrum/vite-plugin-web-extension/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_DOCS_URL: string;
  // more env variables...
}
