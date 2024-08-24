# PartyMap Frontend (partymap-quasar-v2)

The global directory of festivals and events. This is a hybrid web app built with the wonderful Quasar Framework and Vue 3. It can be built for the Web, iOS and Android.

## Setup

### Install the dependencies

Make sure you have node 18 installed.

```bash
yarn install
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Run the app in dev mode with hot-reloading

Android Studio is required for the Android app.
XCode and Mac OS is required for the iOS app.

```bash
quasar dev -m capacitor -T [android|ios] --ide
```

### Build the app for production

```bash
quasar build
```

### Build the mobile apps for production

Android Studio is required for the Android app.
XCode and Mac OS is required for the iOS app.

```bash
quasar build -m capacitor -T [android|ios] --ide
```

## Icon genie

npm install -g @quasar/icongenie

icongenie generate --icon /Users/peter/development/partymap-git/partymap-quasarv2/src/assets/marker-dark.png --skip-trim --padding 30,30 --background /Users/peter/development/partymap-git/partymap-quasarv2/src/assets/partymap-logo-light.png --png-color 242424 --splashscreen-color 242424 --svg-color 242424 --theme-color 242424 --mode capacitor

icongenie generate --icon /Users/peter/development/partymap-git/partymap-quasarv2/src/assets/marker-dark.png --png-color 242424 --splashscreen-color 242424 --svg-color 242424 --theme-color 242424 --mode capacitor

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

## Android release notes

upload key was generated with following command:

> keytool -genkey -v -keystore my-release-key.keystore -alias partymap -keyalg RSA -keysize 2048 -validity 20000

key is located at
/Users/peter/development/partymap-git/partymap-quasarv2/my-release-key.keystore

Generate an .aab file as well as an .apk file to upload to google play

> quasar build -m capacitor -T android -- bundleRelease

Then sign it before uploading it to Google Play

> jarsigner -keystore ~/development/partymap-git/partymap-quasarv2/my-release-key.keystore /Users/peter/development/partymap-git/partymap-quasarv2/dist/capacitor/android/bundle/release/app-release.aab partymap
