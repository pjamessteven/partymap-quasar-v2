import { defineBoot } from '#q-app/wrappers';
import { GesturePlugin } from '@vueuse/gesture';
import { MotionPlugin } from '@vueuse/motion';
export default defineBoot(({ app }) => {
  app.use(GesturePlugin);
  app.use(MotionPlugin);
});
