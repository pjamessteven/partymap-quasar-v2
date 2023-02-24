import { boot } from 'quasar/wrappers';
import Photoswipe from 'vue-pswipe';

const options = {
  clickToCloseNonZoomable: true,
  shareEl: false,
  zoomEl: false,
};

export default boot(({ app }) => {
  app.use(Photoswipe);
});
