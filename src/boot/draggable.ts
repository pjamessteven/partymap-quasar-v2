import { boot } from 'quasar/wrappers';
import { GesturePlugin } from '@vueuse/gesture';
import { MotionPlugin } from '@vueuse/motion';
export default boot(({ app }) => {
  app.use(GesturePlugin);
  app.use(MotionPlugin);
});
