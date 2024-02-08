import { boot } from 'quasar/wrappers';
import VueAppleLogin from 'vue-apple-login';
import { Platform } from 'quasar';
import { SafeAreaController } from '@aashu-dubey/capacitor-statusbar-safe-area';
import { Platform, Dark } from 'quasar';
import { StatusBar, Style } from '@capacitor/status-bar';

export default boot(({ app }) => {
  // this is used for non-ios devices
  // on android it's not possible to use a popup,
  // so we have a custom flow, similar to the flows for facebook/google on ios.
  SafeAreaController.injectCSSVariables();
  if (Platform.is.capacitor) {
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
