import { boot } from 'quasar/wrappers';
import VueAppleLogin from 'vue-apple-login';
import { Platform } from 'quasar';
import { platform } from 'os';

export default boot(({ app }) => {
  // this is used for non-ios devices
  // on android it's not possible to use a popup,
  // so we have a custom flow, similar to the flows for facebook/google on ios.
  app.use(VueAppleLogin, {
    clientId: 'com.partymap.web',
    scope: 'name email',
    redirectURI: Platform.is.android
      ? 'https://api.partymap.com/api/auth/login/apple/?android_capacitor=true'
      : 'https://partymap.com',
    state: Date.now().toString(),
    usePopup: Platform.is.android ? false : true,
  });
});
