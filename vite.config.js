import { defineConfig } from 'vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
  build: {
    sourcemap: true, // Source map generation must be turned on
  },
  plugins: [
    // Put the Sentry vite plugin after all other plugins
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'partymap',
      project: 'javascript-vue',
    }),
    dynamicImport({
      // used for conditionally importing locales
      filter(id) {
        // `node_modules` is exclude by default, so we need to include it explicitly
        // https://github.com/vite-plugin/vite-plugin-dynamic-import/blob/v1.3.0/src/index.ts#L133-L135
        if (id.includes('dayjs')) {
          return true;
        }
      },
    }),
  ],
});
