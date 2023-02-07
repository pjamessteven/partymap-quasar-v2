import VCalendar from 'v-calendar';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  app.use(VCalendar, {});
});
