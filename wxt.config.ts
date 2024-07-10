import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["favicon", "storage", "topSites", "sidePanel"],
    host_permissions: [],
    optional_permissions: ["history", "bookmarks"],
    // @ts-ignore
    optional_host_permissions: ["*://*/*"],
  },
});
