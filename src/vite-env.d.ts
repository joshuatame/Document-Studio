/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TAME_API_URL: string;
  readonly VITE_APP_BASE_PATH: string;
  readonly VITE_APP_SLUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
