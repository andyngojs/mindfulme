import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['alarms', 'notifications', 'storage'],
    name: 'MindfulMe',
    web_accessible_resources: [
      {
        resources: ['wxt.svg'],
        matches: ['<all_urls>'],
      },
    ],
  },
});
