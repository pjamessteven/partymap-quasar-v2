import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Explore',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '/event/:id/:eventDateId?',
        name: 'EventPage',
        component: () => import('src/components/EventPage/EventPage.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: 'artist/:id',
        name: 'ArtistPage',
        component: () => import('src/components/ArtistPage/ArtistPage.vue'),
        props: true,
        meta: {
          mapOverlay: false,
        },
      },

      {
        path: '/login',
        name: 'Login',
        component: () => import('src/components/Auth/Login.vue'),
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: '/register',
        name: 'Register',
        component: () => import('src/components/Auth/Register.vue'),
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: '/forgot',
        name: 'ForgotPassword',
        component: () => import('src/components/Auth/ForgotPassword.vue'),
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: '/reset_password/:identifier/:token',
        name: 'ResetPassword',
        component: () => import('src/components/Auth/ResetPassword.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: '/username',
        name: 'ChooseUsername',
        component: () => import('src/components/Auth/ChooseUsername.vue'),
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: '/add/verified_event/',
        name: 'AddEventHost',
        component: () => import('src/components/AddEventPage/AddEventPage.vue'),
        props: { host: true },
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: '/add/public_event/',
        name: 'AddEventPublic',
        component: () => import('src/components/AddEventPage/AddEventPage.vue'),
        props: { host: false },
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },

      {
        path: '/account',
        name: 'ManageAccount',
        component: () =>
          import('src/components/ManageAccountPage/ManageAccountPage.vue'),
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },

      {
        path: '/user/:id',
        name: 'UserPage',
        component: () => import('src/components/UserPage/UserPage.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: '/activate/:token',
        name: 'Activate',
        component: () => import('src/components/Auth/Activate.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: '/change_email/:token',
        name: 'ConfirmEmail',
        component: () =>
          import('src/components/ManageAccountPage/ConfirmEmail.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: '/admin',
        name: 'AdminPage',
        components: {
          default: () => import('src/components/AdminPage/AdminPage.vue'),
        },
        meta: {
          auth: false,
          mapOverlay: false,
        },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
