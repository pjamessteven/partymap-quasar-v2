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
  ],
});
