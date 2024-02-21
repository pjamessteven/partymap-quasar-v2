import { boot } from 'quasar/wrappers';
import VueAppleLogin from 'vue-apple-login';
import { Platform, Screen } from 'quasar';
import {
  SafeArea,
  SafeAreaController,
} from '@aashu-dubey/capacitor-statusbar-safe-area';
import { Platform, Dark } from 'quasar';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useMainStore } from 'src/stores/main';

export default boot(async ({ app, store }) => {
  // this is used for non-ios devices
  // on android it's not possible to use a popup,
  // so we have a custom flow, similar to the flows for facebook/google on ios.
  SafeAreaController.injectCSSVariables();
  const mainStore = useMainStore(store);
  mainStore.safeAreaInsets = await SafeArea.getSafeAreaInsets();

  if (Platform.is.capacitor) {
    //const { height } = await SafeArea.getStatusBarHeight();

    // force portrait orientation for phones
    if (Platform.is.capacitor && Screen.lt.sm) {
      window.screen.orientation.lock('portrait');
    }
    // Display content under transparent status bar (Android only)
    StatusBar.setOverlaysWebView({ overlay: true });
    if (Dark.isActive) {
      StatusBar.setStyle({ style: Style.Dark });
    } else {
      StatusBar.setStyle({ style: Style.Light });
    }
  }
});
