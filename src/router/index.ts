import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';
import { useMainStore } from 'stores/main';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const createHistory = process.env.SERVER
  ? createMemoryHistory
  : process.env.VUE_ROUTER_MODE === 'history'
  ? createWebHistory
  : createWebHashHistory;

const Router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    const main = useMainStore();
    const fromHistory = Boolean(savedPosition);
    if (fromHistory && main.routerHistory.length > 0) {
      main.routerHistory.splice(-1, 1);
    } else {
      main.routerHistory.push(from);
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (savedPosition) {
          return resolve(savedPosition);
        }
      }, 1200);
    });

    return savedPosition || { left: 0, top: 0 };
  },
  routes,

  // Leave this as is and make changes in quasar.conf.js instead!
  // quasar.conf.js -> build -> vueRouterMode
  // quasar.conf.js -> build -> publicPath
  history: createHistory(process.env.VUE_ROUTER_BASE),
});

export default Router;
