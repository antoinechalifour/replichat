/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUSHER_APP_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
