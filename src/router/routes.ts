import { RouteRecordRaw } from 'vue-router';
import EventPage from 'src/components/EventPage/EventPage.vue';
import Login from 'src/components/Auth/Login.vue';
const routes: RouteRecordRaw[] = [
  {
    path: '/scraper',
    name: 'ScraperPage',
    component: () => import('src/components/ScraperPage/ScraperPage.vue'),
    meta: {
      auth: true,
      mapOverlay: false,
    },
  },
  {
    path: '/:lang?',
    name: 'Explore',
    props: true,
    component: () => import('src/layouts/MainLayout.vue'),
    meta: {
      auth: false,
      mapOverlay: true,
      friendlyName: 'Explore',
      backNavigation: false,
    },
    children: [
      {
        path: 'event/:id/:eventDateId?',
        name: 'EventPage',
        components: {
          event: EventPage,
        },
        props: true,
        meta: {
          auth: false,
          mapOverlay: true,
          backNavigation: true,
        },
      },

      {
        path: 'browse',
        name: 'BrowsePage',
        component: () => import('src/components/BrowsePage/BrowsePage.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: false,
          friendlyName: 'Browse',
        },
      },
      {
        path: 'activity',
        name: 'ActivityPage',
        component: () => import('src/components/ActivityPage/ActivityPage.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: false,
          friendlyName: 'Activity',
        },
      },
      {
        path: 'privacy_policy',
        name: 'PrivacyPage',
        component: () =>
          import('src/components/dialogs/AboutDialog/PrivacyPolicyDialog.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: false,
          friendlyName: 'Privacy',
        },
      },
      {
        path: 'support',
        name: 'SupportPage',
        component: () =>
          import('src/components/dialogs/AboutDialog/AboutDialog.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: false,
          friendlyName: 'Support',
        },
      },
      {
        path: 'terms_and_conditions',
        name: 'TermsAndConditionsPage',
        component: () =>
          import(
            'src/components/dialogs/AboutDialog/TermsAndConditionsDialog.vue'
          ),
        props: true,
        meta: {
          auth: false,
          mapOverlay: false,
          friendlyName: 'Privacy',
        },
      },
      {
        path: 'artist/:id',
        name: 'ArtistPage',
        component: () => import('src/components/ArtistPage/ArtistPage.vue'),
        props: true,
        meta: {
          mapOverlay: false,
          backNavigation: true,
        },
      },
      {
        path: 'login',
        name: 'Login',
        component: Login,

        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('src/components/Auth/Register.vue'),
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: 'forgot',
        name: 'ForgotPassword',
        component: () => import('src/components/Auth/ForgotPassword.vue'),
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: 'reset_password/:identifier/:token',
        name: 'ResetPassword',
        component: () => import('src/components/Auth/ResetPassword.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: 'username',
        name: 'ChooseUsername',
        component: () => import('src/components/Auth/ChooseUsername.vue'),
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: 'add/verified_event/',
        name: 'AddEventHost',
        component: () => import('src/components/AddEventPage/AddEventPage.vue'),
        props: { host: true },
        meta: {
          auth: false,
          mapOverlay: false,
        },
      },
      {
        path: 'add/public_event/',
        name: 'AddEventPublic',
        component: () => import('src/components/AddEventPage/AddEventPage.vue'),
        props: { host: false },
        meta: {
          auth: false,
          mapOverlay: false,
        },
      },

      {
        path: 'account',
        name: 'ManageAccount',
        component: () =>
          import('src/components/ManageAccountPage/ManageAccountPage.vue'),
        meta: {
          auth: false,
          mapOverlay: false,
          friendlyName: 'Manage account',
        },
      },

      {
        path: 'user/:username?',
        name: 'UserPage',
        component: () => import('src/components/UserPage/UserPage.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: false,
          friendlyName: 'User page',
        },
      },
      {
        path: 'activate/:token',
        name: 'Activate',
        component: () => import('src/components/Auth/Activate.vue'),
        props: true,
        meta: {
          auth: false,
          mapOverlay: true,
        },
      },
      {
        path: 'change_email/:token',
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
        path: 'admin',
        name: 'AdminPage',
        components: {
          default: () => import('src/components/AdminPage/AdminPage.vue'),
        },
        meta: {
          auth: false,
          mapOverlay: false,
          friendlyName: 'Admin',
        },
      },
      {
        path: 'todo',
        name: 'WorkQueuePage',
        components: {
          default: () =>
            import('src/components/WorkQueuePage/WorkQueuePage.vue'),
        },
        meta: {
          auth: false,
          mapOverlay: false,
          friendlyName: 'Work Queue',
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
