# PartyMap (partymap)

The global directory of festivals and events

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

## Icon genie

npm install -g @quasar/icongenie

icongenie generate --icon /Users/peter/development/partymap-git/partymap-quasarv2/src/assets/marker-dark.png --background /Users/peter/development/partymap-git/partymap-quasarv2/src/assets/partymap-logo-light.png --png-color 000000 --splashscreen-color 000000 --svg-color 000000 --theme-color 000000

## Capactior Android font size fix

import android.webkit.WebSettings;
import android.webkit.WebView;

public void onResume() {
super.onResume();
WebSettings settings = bridge.getWebView().getSettings();
settings.setTextZoom(100);
settings.setSupportZoom(false);
}

## Deep linking for Android Info...

This relies on public/.well-known/assetlinks.json to be served at partymap.com/.well-known/assetlinks.json (public folder items are included in build root). Deep linking is used to redirect to the app after oauth, for example.

## Enabling native swipe navigation in iOS

In AppDelegate.swift of the iOS Capacitor project:

func application(\_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
// Override point for customization after application launch.
(window?.rootViewController as? CAPBridgeViewController)?.loadViewIfNeeded()
(window?.rootViewController as? CAPBridgeViewController)?.bridge?.webView?.allowsBackForwardNavigationGestures = true
return true
}
