import { boot } from 'quasar/wrappers';
import VueAppleLogin from 'vue-apple-login';

export default boot(({ app }) => {
  app.use(VueAppleLogin, {
    clientId: 'com.partymap.web',
    scope: 'name email',
    redirectURI:
      process.env.NODE_ENV === 'development'
        ? 'https://partymap.com'
        : 'test.partymap.com:9000',
    state: Date.now().toString(),
    usePopup: true,
  });
});
