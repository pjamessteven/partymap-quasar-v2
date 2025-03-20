import { RouteRecordRaw } from 'vue-router';
import EventPage from 'src/components/EventPage/EventPage.vue';
import Login from 'src/components/Auth/Login.vue';
import MainLayout from 'src/layouts/MainLayout.vue';
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
    component: MainLayout,
    meta: {
      auth: false,
      mapOverlay: true,
      friendlyName: 'Explore',
      showControls: true,
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
          showControls: false,
          auth: false,
          mapOverlay: true,
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
        children: [
          {
            path: '',
            name: 'FeaturedEvents',
            component: () =>
              import('src/components/BrowsePage/FeaturedEvents.vue'),
            meta: {
              auth: false,
              mapOverlay: false,
              showControls: true,
              friendlyName: 'Featured',
              noBackButton: true,
            },
          },
          {
            path: ':country/:region?',
            name: 'BrowseEventDateList',
            component: () =>
              import('src/components/BrowsePage/BrowseEventDateList.vue'),
            props: true,
            meta: {
              auth: false,
              mapOverlay: false,
              showControls: true,
              noBackButton: true,
              friendlyName: 'Browse',
            },
          },
          {
            path: 'countries',
            name: 'CountryRegionList',
            component: () =>
              import('src/components/BrowsePage/CountryRegionList.vue'),
            props: true,
            meta: {
              auth: false,
              mapOverlay: false,
              showControls: true,
              friendlyName: 'Browse',
              noBackButton: true,
            },
          },
        ],
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
          showControls: false,
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
          showControls: false,
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
          showControls: false,
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
          showControls: false,

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
          showControls: false,
        },
      },
      {
        path: 'login',
        name: 'Login',
        component: Login,

        meta: {
          auth: false,
          mapOverlay: true,
          showControls: false,
        },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('src/components/Auth/Register.vue'),
        meta: {
          auth: false,
          mapOverlay: true,
          showControls: false,
        },
      },
      {
        path: 'forgot',
        name: 'ForgotPassword',
        component: () => import('src/components/Auth/ForgotPassword.vue'),
        meta: {
          auth: false,
          mapOverlay: true,
          showControls: false,
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
          showControls: false,
        },
      },
      {
        path: 'username',
        name: 'ChooseUsername',
        component: () => import('src/components/Auth/ChooseUsername.vue'),
        meta: {
          auth: false,
          mapOverlay: true,
          showControls: false,
        },
      },
      {
        path: 'add/verified_event/',
        name: 'AddEventHost',
        component: () => import('src/components/AddEventPage/AddEventPage.vue'),
        props: { host: true },
        meta: {
          auth: false,
          showControls: false,

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
          showControls: false,
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
          showControls: false,
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
          showControls: false,
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
          showControls: false,
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
          showControls: false,
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
          showControls: false,
        },
        children: [
          {
            path: '',
            redirect: { name: 'AdminEvents' }
          },
          {
            path: 'activity',
            name: 'AdminActivity',
            component: () => import('src/components/Activities/ActivityView.vue'),
            meta: {
              auth: false,
              mapOverlay: false,
              friendlyName: 'Admin Activity',
              showControls: false,
            }
          },
          {
            path: 'events',
            name: 'AdminEvents',
            component: () => import('src/components/AdminPage/PendingEventsComponent.vue'),
            meta: {
              auth: false,
              mapOverlay: false,
              friendlyName: 'Admin Events',
              showControls: false,
            }
          },
          {
            path: 'artists',
            name: 'AdminArtists',
            component: () => import('src/components/AdminPage/ManageArtistsComponent.vue'),
            meta: {
              auth: false,
              mapOverlay: false,
              friendlyName: 'Admin Artists',
              showControls: false,
            }
          },
          {
            path: 'suggestions',
            name: 'AdminSuggestions',
            component: () => import('src/components/AdminPage/PendingSuggestionsComponent.vue'),
            meta: {
              auth: false,
              mapOverlay: false,
              friendlyName: 'Admin Suggestions',
              showControls: false,
            }
          },
          {
            path: 'reports',
            name: 'AdminReports',
            component: () => import('src/components/AdminPage/PendingReportsComponent.vue'),
            meta: {
              auth: false,
              mapOverlay: false,
              friendlyName: 'Admin Reports',
              showControls: false,
            }
          },
          {
            path: 'event-dates',
            name: 'AdminEventDates',
            component: () => import('src/components/AdminPage/PendingEventDatesComponent.vue'),
            meta: {
              auth: false,
              mapOverlay: false,
              friendlyName: 'Admin Event Dates',
              showControls: false,
            }
          }
        ]
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
          showControls: false,

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
