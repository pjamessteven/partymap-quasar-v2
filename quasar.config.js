import { defineConfig } from '#q-app/wrappers';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

export default defineConfig(function (/* ctx */) {
  return {
    supportTS: true,
    eslint: {
      // fix: true,
      // include = [],
      // exclude = [],
      // rawOptions = {},
      warnings: true,
      errors: true,
    },

    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [
      'i18n',
      'axios',
      'dayjs',
      { path: 'addressbar-color', server: false },
      { path: 'appleLoginDesktop', server: false },
      { path: 'safeAreaAndroid', server: false },
      { path: 'youtube', server: false },
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'ionicons-v4',
      'mdi-v7',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      //'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      // env: require('dotenv').config().parsed,
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16',
      },

      vueRouterMode: 'history', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf(viteConf) {},
      // viteVuePluginOptions: {},

      vitePlugins: [
        VueI18nPlugin({
          /* options */
        })
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true
      open: true, // opens browser window automatically
      proxy: {
        '/api': {
          // target: 'https://api.partymap.com/', // Replace with your production server's URL
          //          target: 'http://192.168.30.56:5000',
          //target: 'http://localhost:5000',
          target: 'http://172.20.10.2:5000',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '', // Rewrites the URL prefix if needed
          },
        },
      },
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: { notify: { position: 'top' } },

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ['Notify', 'Dialog', 'AddressbarColor', 'Meta'],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [
      /*
      'bounceOutLeft',
      'bounceOutRight',
      'bounceInLeft',
      'bounceInRight',
      'bounceInUp',
      'bounceInDown',
      'bounceOutDown',
      'bounceOutUp',
      'boundOut',
            'fadeOutLeft',
      'fadeOutRight',
            'slideInLeft',
      'slideInRight',
            'slideOutLeft',
      'slideOutRight',
            'fadeInLeft',
      'fadeInRight',
      */
      'fadeIn',
      'fadeInUp',
      'fadeInDown',
      'fadeOut',
      'fadeOutUp',
      'fadeOutDown',
      'slideInDown',
      'slideInUp',
      'slideOutDown',
      'slideOutUp',
      'fadeOutRight',
      'slideInLeft',
      'slideInRight',
      'slideOutLeft',
      'slideOutRight',
      'fadeInLeft',
      'fadeInRight',
      'fadeOutLeft',
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   registerServiceWorker: 'src-pwa/register-service-worker',
    //   serviceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'proxy',
        'render', // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
      version: '1.1.0',
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'partymap',
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      extraScripts: [],
      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },

    typescript: {
      strict: false, // (recommended) enables strict settings for TypeScript
      vueShim: true, // required when using ESLint with type-checked rules, will generate a shim file for `*.vue` files
      extendTsConfig(tsConfig) {
        // You can use this hook to extend tsConfig dynamically
        // For basic use cases, you can still update the usual tsconfig.json file to override some settings
      },
    },
  };
});

/*
async function generateCriticalCSS(ctx) {
  const baseUrl = ctx.dev ? 'http://localhost:9100' : 'https://partymap.com';
  const routes = ['/', '/artist', '/event']; // Add all your important routes

  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];

  for (const route of routes) {
    for (const viewport of viewports) {
      await critical.generate({
        base: 'dist/ssr/',
        src: `${baseUrl}${route}`,
        target: `dist/ssr/critical-${route.replace('/', '')}-${
          viewport.name
        }.css`,
        width: viewport.width,
        height: viewport.height,
        inline: false,
        ignore: {
          atrule: ['@font-face'], // Ignore font-face rules to reduce CSS size
        },
        penthouse: {
          timeout: 120000, // Increase timeout for larger pages
        },
      });

      // Minify the generated CSS
      const css = await fs.readFile(
        `dist/ssr/critical-${route.replace('/', '')}-${viewport.name}.css`,
        'utf8'
      );
      const minifiedCss = css.replace(/\s+/g, ' ').trim();
      await fs.writeFile(
        `dist/ssr/critical-${route.replace('/', '')}-${viewport.name}.css`,
        minifiedCss
      );
    }
  }
}
*/
