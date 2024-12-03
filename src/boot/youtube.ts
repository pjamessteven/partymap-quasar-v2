import { defineBoot } from '#q-app/wrappers';
import { createManager } from '@vue-youtube/core';
export default defineBoot(({ app }) => {
  app.use(createManager());
});
