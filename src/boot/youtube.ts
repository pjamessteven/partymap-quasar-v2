import { boot } from 'quasar/wrappers';
import { createManager } from '@vue-youtube/core';
export default boot(({ app }) => {
  app.use(createManager());
});
