<template>
  <router-view :key="forceUpdate" />
  <transition leave-active-class="animated fadeOut">
    <SplashScreen v-if="!true || loggingInWithToken" />
  </transition>
</template>

<script>
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useMainStore } from './stores/main';
import { useAuthStore } from './stores/auth';
import SplashScreen from './components/SplashScreen.vue';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { CapacitorCookies } from '@capacitor/core'; // leave this, even though unused, the import is needed for cookies to work on iOS
import { createMetaMixin } from 'quasar';
import { i18n } from 'src/boot/i18n.ts';
import dayjs from 'dayjs';
export default {
  components: { SplashScreen },
  name: 'App',
  data() {
    return {
      assetsLoaded: false,
      loggingInWithToken: false,
    };
  },
  mixins: [
    createMetaMixin(function () {
      const year = dayjs().year();
      return {
        title: this.$t('meta.main_title', { year: year }),
        meta: {
          /*
          viewport: {
            name: 'viewport',
            content:
              'width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0,user-scalable=no;user-scalable=0;',
          }, // THIS META TAG ENABLES 'FAST TAPPING' ON IOS DEVICES
          */
          description: {
            name: 'description',
            content: this.$t('meta.main_description', { year }),
          },
          keywords: {
            name: 'keywords',
            content: this.$t('meta.main_tags'),
          },
        },
      };
    }),
  ],

  methods: {
    ...mapActions(useAuthStore, ['checkAuthCookie', 'login']),
    ...mapActions(useMainStore, ['setDarkMode']),
  },
  computed: {
    ...mapWritableState(useMainStore, [
      'compactView',
      'groupEventsByMonth',
      'languagePref',
      'darkModePref',
      'forceUpdate',
    ]),

    screen() {
      return this.$q.screen;
    },
    currentLanguage() {
      return i18n.global.locale.value;
    },
  },
  watch: {
    screen: {
      handler: function (screen) {
        if (screen.gt.md) {
          //this.compactView = false;
        } else {
          //this.compactView = true;
        }
      },
      deep: true,
    },
    currentLanguage(newLang) {
      document.documentElement.lang = newLang;
    },
  },
  watch: {
    languagePref() {
      this.forceUpdate += 1;
    },
  },
  mounted() {
    document.documentElement.lang = this.currentLanguage;

    this.setDarkMode(this.darkModePref); // restore user dark mode pref
    // dark mode setting
    this.$q.dark.set(
      this.darkModePref === 'true'
        ? true
        : this.darkModePref === 'false'
          ? false
          : this.darkModePref,
    );

    // performance is like molassys on old versions of webview
    if (this.$q.platform.is.android && this.$q.platform.is.capacitor) {
      let androidWebviewVersion = navigator.userAgent
        .split('Chrome/')[1]
        .split(' ')[0]
        .split('.')[0];

      if (androidWebviewVersion < 120) {
        this.$q
          .dialog({
            cancel: { label: 'Ignore', flat: true },
            ok: { label: 'Update on Play Store', flat: true },
            title: 'System WebView out of date!',
            message: `Your Android System WebView is at version v${androidWebviewVersion}. PartyMap works best with at least v120.`,
            color: 'primary',
          })
          .onOk(() => {
            window
              .open(
                'https://play.google.com/store/apps/details?id=com.google.android.webview',
                '_blank',
              )
              .focus();
          });
      }
    }

    if (this.$q.platform.is.capacitor) {
      // handle deep links in native app

      App.addListener('appUrlOpen', async (event) => {
        Browser.close();
        console.log('appUrlOpen', event.url);
        if (event.url.indexOf('?token=') > -1) {
          this.loggingInWithToken = true;

          let token = event.url.split('?token=').pop();
          // facebook login causes this shit to be appended to the next_url query param
          if (token.endsWith('#_=_')) {
            token = session.replace('#_=_', '');
          }

          // login with one off token
          const currentUser = await this.login({ token: token });

          this.loggingInWithToken = false;

          if (!currentUser.username) {
            this.$router.replace('/username');
            return;
          }
        }

        let slug;
        if (event.url.indexOf('partymap://') > -1) {
          // app link
          slug = event.url.split('partymap://').pop();
        } else {
          console.log('');
          slug = event.url.split('.com').pop();
        }
        if (slug) {
          // We only push to the route if there is a slug present
          this.$router.push(slug);
        }
      });
    }
  },
  created() {
    /* this doesn't work reliably across browsers and sometimes
     leaves the user hanging too long
    if (document.readyState === 'complete') {
      this.assetsLoaded = true;
    } else {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState == 'complete') {
          this.assetsLoaded = true;
        }
      });
    }
    */

    // setTimeout(() => (this.assetsLoaded = true), 1000);

    this.$q.dark.set('auto');
    this.$q.addressbarColor.set('#181818');
    this.checkAuthCookie();
  },
};
</script>

<style lang="scss">
html {
  height: 100%;
  max-height: 100%;
}
body {
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  font-family:
    Inter,
    BlinkMacSystemFont,
    -apple-system,
    Segoe UI,
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    Fira Sans,
    Droid Sans,
    Helvetica Neue,
    Helvetica,
    Arial,
    sans-serif !important;
  //letter-spacing: unset !important;
  touch-action: none;
  overscroll-behavior: none;
  overscroll-behavior-x: none;
  -webkit-text-size-adjust: none;
  -moz-text-size-adjust: none;
  -ms-text-size-adjust: none;
  text-size-adjust: none;
  #q-app {
    height: 100%;
  }
}
</style>
