import { defineSsrMiddleware } from '#q-app/wrappers';
import { createProxyMiddleware } from 'http-proxy-middleware';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli-vite/developing-ssr/ssr-middleware
export default defineSsrMiddleware(
  async ({ app /*, resolveUrlPath, publicPath, render */ }) => {
    if (process.env.NODE_ENV === 'development') {
      app.use(
        '/api',
        createProxyMiddleware({
          target: 'https://api.partymap.com/api', // Replace with your backend server URL
          changeOrigin: true, // Needed for virtual hosted sites
          pathRewrite: { '^/api': '' }, // Optional: Remove '/api' prefix
        }),
      );
      console.log('Proxy middleware registered for /api');
    }
  },
);
