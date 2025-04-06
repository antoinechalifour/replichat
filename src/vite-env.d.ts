/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUSHER_APP_KEY: string;
  readonly VITE_REPLICACHE_LICENSE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
