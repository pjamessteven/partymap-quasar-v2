import { defineBoot } from '#q-app/wrappers';
import * as Sentry from '@sentry/vue';

export default defineBoot(({ app }) => {
  Sentry.init({
    dsn: 'https://ea3d4bee67a7e6dff7075f44121c60da@o4506625567096832.ingest.sentry.io/4506625569062912',
    integrations: [
      new Sentry.BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/api\.partymap\.com\/api/,
        ],
      }),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
});
