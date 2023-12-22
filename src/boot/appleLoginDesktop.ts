import { boot } from 'quasar/wrappers';
import VueAppleLogin from 'vue-apple-login';

export default boot(({ app }) => {
  app.use(VueAppleLogin, {
    clientId: 'com.partymap.web',
    scope: 'name email',
    redirectURI: 'https://partymap.com',
    state: Date.now().toString(),
    usePopup: true,
  });
});
