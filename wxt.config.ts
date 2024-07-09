import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage"],
    host_permissions: [],
    // @ts-ignore
    optional_host_permissions: ["*://*/*"],
  },
});
