import { boot } from 'quasar/wrappers';
import VueAppleLogin from 'vue-apple-login';
import { Platform } from 'quasar';
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

  if (Platform.is.capacitor) {
    SafeAreaController.injectCSSVariables();

    const mainStore = useMainStore(store);

    //const { height } = await SafeArea.getStatusBarHeight();
    mainStore.safeAreaInsets = await SafeArea.getSafeAreaInsets();

    // force portrait orientation for phones
    if (!Platform.is.ipad) {
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
