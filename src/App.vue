<template>
  <router-view />
  <transition leave-active-class="animated fadeOut">
    <SplashScreen v-if="!assetsLoaded || loggingInWithToken" />
  </transition>
</template>

<script>
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useMainStore } from './stores/main';
import { useAuthStore } from './stores/auth';
import SplashScreen from './components/SplashScreen.vue';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
export default {
  components: { SplashScreen },
  name: 'App',
  data() {
    return {
      assetsLoaded: false,
      loggingInWithToken: false,
    };
  },
  meta: {
    // meta tags
    title: 'PartyMap',
    meta: {
      viewport: {
        name: 'viewport',
        content:
          'width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0,user-scalable=no;user-scalable=0;',
      }, // THIS META TAG ENABLES 'FAST TAPPING' ON IOS DEVICES
      description: {
        name: 'description',
        content:
          'PartyMap is a community-driven and crowd-sourced platform for discovering festivals and events around the world and near you.',
      },
      keywords: {
        name: 'keywords',
        content:
          'Festival, Festivals, Map, Events, Party, Fiesta, Music, Music Festival, Music Festivals, Best Music Festivals, All Music Festivals, Top Music Festivals, List of music festivals, list',
      },
    },
  },
  methods: {
    ...mapActions(useMainStore, ['getFineLocation']),
    ...mapActions(useAuthStore, ['checkAuthCookie', 'login']),
  },
  computed: {
    ...mapWritableState(useMainStore, ['compactView', 'groupEventsByMonth']),

    screen() {
      return this.$q.screen;
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
  },
  mounted() {
    // check and get location permission
    this.getFineLocation();
    if (this.$q.platform.is.capacitor) {
      // handle deep links in native app

      App.addListener('appUrlOpen', async (event) => {
        Browser.close();

        console.log('APP URL OPEN', event.url);
        if (event.url.indexOf('?token=')) {
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

    setTimeout(() => (this.assetsLoaded = true), 1000);

    this.$q.dark.set('auto');

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
  font-family: Inter, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,
    Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica,
    Arial, sans-serif !important;
  font-family: chicagoflf;
  //letter-spacing: unset !important;
  touch-action: none;
  overscroll-behavior-x: none;
  -webkit-text-size-adjust: none;
  -moz-text-size-adjust: none;
  -ms-text-size-adjust: none;
  text-size-adjust: none;
  #q-app {
    height: 100%;
  }
}

.menubar {
  z-index: 4500;
}
.pswp {
  z-index: 5000 !important;
}

.disabled-opacity {
  opacity: 0.5;
}

.text-h2 {
  font-weight: 700;
}
.text-h6 {
  //font-size: 18px;
  font-weight: 500;
  line-height: 1.8rem;
  //letter-spacing: 0.0125em;
  letter-spacing: unset !important;
}
.text-large {
  font-size: 1rem;
}

.dialog-card {
  display: flex;
  flex-direction: column;
  .dialog-card-header {
    position: relative;
    top: 0px;
    z-index: 100;
    padding: 16px 16px;
    font-weight: 800 !important;
    .text-h6 {
      font-weight: 800 !important;
    }
  }
  .dialog-card-content {
    overflow-y: auto;
  }
}

.sticky-header {
  position: sticky;
  top: 0px;
  z-index: 1000;
}

.body--light {
  /* ... */
  .dialog-card {
    .dialog-card-header {
      background: $b-2;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
  }

  .sticky-header {
    background: white;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .t1 {
    color: $t-1;
  }
  .t2 {
    color: $t-2;
  }
  .t3 {
    color: $t-3;
  }
  .t4 {
    color: $t-4;
  }

  .b1 {
    background-color: $b-1;
  }
  .b2 {
    background-color: $b-2;
  }
  .b3 {
    background-color: $b-3;
  }
  .b4 {
    background-color: $b-4;
  }

  .q-list--bordered {
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  .q-separator {
    height: 0px;
    background: none;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .vc-container {
    border-color: rgba(0, 0, 0, 0.1);
    background: #fafafa;
  }

  .q-card__actions {
    background: $b-1;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }
  .search-result {
    background: $b-1;
    color: $t-2;
  }

  .search-result:hover {
    background: $b-2;
    color: $t-1;
  }

  .search-results-header {
    color: $t-3;
  }

  .solid-card {
    background: $b-2 !important;
  }

  .header {
    background: white;
  }

  .auth-card {
    background: rgba(255, 255, 255, 1) !important;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .map-overlay {
    //background: linear-gradient(180deg, white, rgba(255,255,255,0.8));
  }

  .event-list-vertical {
    //background-color: #f5f5f5;
    //background: linear-gradient(to top, rgba(240,240,240,0.8) 0%, rgba(240,240,240,1) 100%);
    //background-color: rgba(220,220,220,0.8);
  }

  .button {
    border: 1px solid rgba(0, 0, 0, 0.24);
    border-radius: 5px;
    // background-color: rgba(0, 0, 0, 0.05);
    min-height: 40px;
    //  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
    color: rgba(0, 0, 0, 0.54);
  }

  .map-header {
    //  background-color: $grey-10
    color: $t-2;
  }

  .q-field--filled .q-field__control {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .date-footer {
    background-color: whitesmoke;
    color: $t-1;
  }

  h5 {
    color: $t-3 !important;
  }

  .title {
    color: $t-1 !important;
  }

  .q-date__header {
    color: black !important;
  }

  .q-date {
    background: rgba(0, 0, 0, 0.05);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(0, 0, 0, 0.14),
      0 2px 1px -1px rgba(0, 0, 0, 0.12) !important;
  }

  .animated-shimmer {
    background: linear-gradient(to right, white 4%, whitesmoke 50%, white 100%);
  }

  .q-card {
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.1);
    /*box-shadow: 0 0.5em 1em -0.125em rgb(230,230,230),
      0 0px 0 1px rgba(0, 0, 0, 0.02); */
    //box-shadow: none;

    background: white;
  }
  .q-field__control::before {
    // border-color: rgb(230,230,230) !important;
  }
  .q-field__control {
    // background: $b-1;
  }

  .button-light {
    color: $t-1;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 1);
    border: 1px solid rgba(0, 0, 0, 0.1);
    .q-btn__wrapper {
      &:before {
        box-shadow: none;
      }
    }
  }

  .button-plain {
    color: $t-1;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 1);
    /*
      box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.2);
      */
    //background: $b-2;
    transition: none;
    border: 1px solid rgba(0, 0, 0, 0.1);
    //box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
    //box-shadow: none !important;
    &::before {
      box-shadow: none !important;
    }
    .q-btn__content {
      .close-icon-wrapper {
        background: $b-4;
        color: black;
      }
    }
    .q-btn__wrapper {
      &:before {
        box-shadow: none;
      }
    }
    &.active {
      border: 1px solid rgba(0, 0, 0, 0.1);

      background: $b-3 !important;
      // font-weight: bold;
      //border: 1px solid rgba(0, 0, 0, 0.48);
    }
  }

  .nav-button {
    background: $b-3;
    &:hover {
      background: $b-4;
    }
  }

  .separator {
    border-color: rgba(0, 0, 0, 0.1);
  }

  .editing {
    &.editing-outline {
      border: 1px dashed rgba(0, 0, 0, 0.4) !important;
      border-radius: 9px !important;
      cursor: pointer;
    }
    .editing-outline {
      border: 1px dashed rgba(0, 0, 0, 0.4) !important;
      border-radius: 9px !important;
      cursor: pointer;
    }
  }
  .overlay-page {
    background: linear-gradient(0deg, white, rgba(255, 255, 255, 0.8));
  }

  .swipe-nav-bar {
    width: 40px;
    height: 2px;
    margin-bottom: 1px;
    background-color: rgba(200, 200, 200, 1);
    position: absolute;
  }
}

.body--dark {
  /* ... */
  background: black !important;
  //background: #1a202c!important;
  .dialog-card {
    background: $bi-2;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    .dialog-card-header {
      //color: rgba(255, 255, 255, 0.67);

      background: $bi-2;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    }
  }
  .sticky-header {
    background: black;
    border-bottom: 1px solid rgb(30, 30, 30);
  }
  .t1 {
    color: $ti-1;
  }
  .t2 {
    color: $ti-2;
  }
  .t3 {
    color: $ti-3;
  }
  .t4 {
    color: $ti-4;
  }
  .b1 {
    background-color: $bi-1;
  }
  .b2 {
    background-color: $bi-2;
  }
  .b3 {
    background-color: $bi-3;
  }
  .b4 {
    background-color: $bi-4;
  }

  .header {
    background: black;
  }

  .q-list--bordered {
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .q-separator--dark {
    background: none;
    border-top: 1px solid rgb(26, 26, 26) !important;
  }

  .vc-container {
    border-color: rgb(26, 26, 26) !important;
    background: $bi-3 !important;
    :deep(.vc-day-content.is-disabled) {
      color: rgba(255, 255, 255, 0.2) !important;
    }
    :deep(.vc-highlights) {
      .vc-highlight {
        background-color: rgba(255, 255, 255, 0.2) !important;
      }
    }
    .vc-day {
      .is-disabled {
        color: rgba(255, 255, 255, 0.2) !important;
      }
    }
  }

  .button-light {
    color: $ti-1;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: rgba(0, 0, 0, 0.4) 0px 1px 2px 0px;
    .q-btn__wrapper {
      &:before {
        box-shadow: none;
      }
    }
  }

  .button-plain {
    background: black;
    color: $ti-1;
    //text-shadow: 1px 1px 2px rgba(255, 255, 255, 1);
    /*
      box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.2);
      */
    // background: rgba(255, 255, 255, 0.68);
    transition: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: rgba(0, 0, 0, 0.4) 0px 1px 2px 0px;

    .q-btn__content {
      .close-icon-wrapper {
        background: $bi-4;
        color: white;
      }
    }

    .q-btn__wrapper {
      &:before {
        box-shadow: none;
      }
    }
    &.active {
      border: 1px solid rgba(255, 255, 255, 0.1);

      background: $bi-3 !important;
      //color: $t-1 !important;
      // font-weight: bold;
      //border: 1px solid rgba(255, 255, 255, 0.8);
    }
  }

  .nav-button {
    background: $bi-3;
    &:hover {
      background: $bi-4;
    }
  }

  .leaflet-control-zoom-in {
    background: black !important;
    color: darkgrey;
    border-bottom: none !important;
    &:hover {
      color: white;
    }
  }
  .leaflet-control-zoom-out {
    background: black !important;
    color: darkgrey;
    &:hover {
      color: white;
    }
  }
  .leaflet-touch .leaflet-control-layers,
  .leaflet-touch .leaflet-bar {
    border-color: rgb(26, 26, 26);
  }

  .search-result {
    background: $bi-2;
    color: $ti-2;
  }

  .search-result:hover {
    background: $bi-3;
    color: $ti-1;
  }

  .search-results-header {
    color: $ti-3;
  }

  .solid-card {
    background: $bi-2 !important;
  }

  .dialog-card {
    background: $bi-2;
    .dialog-card-header {
      background: $bi-3;
    }
  }

  .auth-card {
    background: rgba(0, 0, 0, 1) !important;
  }

  .button {
    border: 1px solid $ti-3 !important;
    border-radius: 5px;
    // background-color: rgba(255, 255, 255, 0.07);
    min-height: 40px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.14),
      0 2px 1px -1px rgba(0, 0, 0, 0.12);
    color: rgba(255, 255, 255, 0.7);
  }

  .swipe-nav-bar {
    width: 40px;
    height: 2px;
    background-color: rgb(36, 36, 36);
    position: absolute;
  }
  .map-header {
    //  background-color: $grey-10
    color: $ti-2;
  }

  .q-field--filled.q-field--dark .q-field__control,
  .body--dark .q-field--filled.q-field--dark .q-field__control::before {
    //background-color: rgb(72, 72, 72);
  }

  .date-footer {
    background-color: black;
    color: $ti-1;
  }

  h5 {
    color: $ti-2 !important;
  }

  .title {
    color: $ti-1 !important;
  }

  .q-date {
    background: rgba(255, 255, 255, 0.05);
  }

  .animated-shimmer {
    background: linear-gradient(to right, $bi-2 4%, #181818 25%, $bi-2 36%);
  }
  :deep(.leaflet-bar a) {
    z-index: 3;
    background-color: black;
    color: rgba(255, 255, 255, 0.48);
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
  }

  .q-card {
    box-shadow: none;
    border: 1px solid rgb(26, 26, 26);
    //background: $bi-1;
  }

  .event-page-card {
    background: $bi-2;
  }

  :deep(.leaflet-container .leaflet-control-attribution) {
    background: transparent !important;
    a {
      color: grey !important;
    }
  }
  .vc-container {
    background-color: $bi-3;
    border-color: rgb(26, 26, 26);
  }
  .q-field--dark .q-field__control::before {
    border-color: rgb(64, 64, 64);
  }

  .q-field__control {
    //background: $bi-3;
  }

  .separator {
    border-color: rgb(26, 26, 26);
  }

  .editing {
    &.editing-outline {
      border: 1px dashed rgba(255, 255, 255, 0.3) !important;
      background: $bi-2;
      border-radius: 9px;
      cursor: pointer;
      .tag-inner-wrapper {
        border-color: rgba(255, 255, 255, 0.5) !important;
      }
    }
    .editing-outline {
      border: 1px dashed rgba(0, 0, 0, 0.3) !important;
      border-radius: 9px !important;
      cursor: pointer;
      .tag-inner-wrapper {
        border-color: rgba(255, 255, 255, 0.5) !important;
      }
    }
  }

  .overlay-page {
    background: linear-gradient(0deg, black, rgba(0, 0, 0, 0.8));
  }
}

.link-hover {
  color: unset;
  cursor: pointer;
  text-decoration: none !important;
  &:hover {
    color: $primary !important;
  }
  &.underline {
    text-decoration: underline !important;
  }
}

.disabled {
  pointer-events: none;
}
.q-btn {
  font-size: 14px;
  border-radius: 9px !important;
  font-weight: 500;
  .q-btn__content {
    flex-wrap: nowrap;
  }
  &.q-btn--square {
    border-radius: 0px !important;
  }
}

.soft-button-shadow {
  &::before {
    box-shadow: rgba(0, 0, 0, 0.15) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.1) 0px 1px 2px 0px !important;
  }
  .q-btn__wrapper::before {
    // this would be a nice shadow if it worked
    //box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  }
}
.soft-shadow {
  box-shadow: rgba(0, 0, 0, 0.15) 0px 1px 3px 0px,
    rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
}

.nav-button {
  font-weight: 500;
  cursor: pointer;
  border-radius: 9px;
  flex-grow: 0;
  flex-basis: 1;
  max-height: 56px;
  transition: all 0.3s;
  &.primary {
    background: $primary !important;
    color: white;
  }
  //dth: 264px;
}

.button-light {
  font-weight: 500;
  font-family: Inter;
  text-transform: capitalize;
  border-radius: 9px !important;
  font-size: normal;
  padding: 4px 12px !important;
  white-space: nowrap;
}

.button-plain {
  padding: 0px 12px;
  font-weight: 500;
  font-family: Inter;
  text-transform: capitalize;
  font-size: normal;
  border-radius: 9px !important;
  overflow: hidden;
  &.active {
    // font-weight: 600;
  }

  .q-btn__wrapper {
    padding: 0;
  }
  .q-btn__content {
    .button-label {
      padding: 0px 12px;
    }
    white-space: nowrap;
    .q-icon {
      margin-right: -6px;
    }
  }
}

.q-menu {
  border-radius: 9px !important;
  //max-height: 100vh !important;
  /*
  max-width: unset !important;
  max-height: unset !important;
  overflow-x: auto;
  overflow-y: auto;
  */
  //font-family: chicagoflf;
  //font-weight: 100;
  font-size: small;
  color: $t-1;
  border-radius: 0px;
  //font-family: chicagoflf;
  //text-transform: lowercase;
}
.menu-wrapper {
  max-height: 500px;
}

.q-menu--dark {
  box-shadow: none;
  border: 1px solid $bi-4;
  color: $ti-1;
}
.q-input {
  border-radius: 9px !important;
}
.q-field__control {
  //border-radius: 9px !important;
  overflow: hidden;
}
.q-field--filled .q-field__control {
  border-radius: 4px !important;
}
.q-dialog__inner > div {
  // border-radius: 0px !important;
}
.q-dialog__inner--minimized > div {
  max-height: 90vh;
}
.q-dialog__inner--minimized {
  padding: 0px;
}

.q-dialog {
  @supports ((top: var(--safe-area-inset-top))) {
    padding-top: calc(var(--safe-area-inset-top));
  }
  @supports ((bottom: var(--safe-area-inset-bottom))) {
    padding-bottom: calc(var(--safe-area-inset-bottom));
  }
  .q-dialog__inner {
    @supports ((top: var(--safe-area-inset-top))) {
      padding-top: calc(var(--safe-area-inset-top));
    }
    @supports ((bottom: var(--safe-area-inset-bottom))) {
      padding-bottom: calc(var(--safe-area-inset-bottom));
    }
  }
}

.q-card {
  border-radius: 9px !important;
}
.q-item__section--avatar {
  min-width: unset !important;
}

.edit-card {
  min-width: 400px;
  max-width: 460px;
}

.separator {
  width: 100%;
  border-top-style: solid;
  border-top-width: 1px;
  &.vertical {
    border-top-style: none;
    border-top-width: none;
    border-left-style: solid;
    border-left-width: 1px;
    height: 100%;
    width: unset;
  }
}
.border-radius {
  border-radius: 9px !important;
}
.overlay-page {
  width: 100%;
  height: 100%;
  position: relative;
  pointer-events: auto;
  z-index: 4000;
  overflow: auto;
}

.dialog-page {
  background: rgba(0, 0, 0, 0.48);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .auth-card {
    margin-top: 48px;
    width: 400px;
    margin-bottom: 48px;
    overflow: auto;
    .header {
    }
  }
}

.vc-container {
  //font-family: chicagoflf !important;
  font-family: Inter;
  .on-right {
    // override quasar variable that causes ui artifacts
    margin-left: unset !important;
  }
  .on-left {
    // override quasar variable that causes ui artifacts

    margin-right: unset !important;
  }
}

// TAILWIND CSS SHADOWS
.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

// sm
@media only screen and (max-width: 600px) {
  html {
    // font-size: 0.9rem !important;
  }

  .body--dark {
    .q-dialog {
      .menu {
        color: $bi-2;
      }
    }
    .dialog-page {
      background: black;
    }
  }
  .body--light {
    .q-dialog {
      .menu {
        color: $b-2;
      }
    }
    .dialog-page {
      background: white;
    }
  }
  :deep(.q-dialog) {
    .q-card {
      max-width: 100vw;
    }
  }

  .q-card {
    &.fullscreen-mobile-card {
      border: none !important;
      box-shadow: none !important;
      margin-top: unset;
      margin-bottom: unset;
      width: 100%;
      height: 100%;
      max-height: unset !important;
      border-radius: 0px !important;
    }
  }

  .edit-card {
    min-width: 100%;
    max-width: 100%;
    min-height: 100%;
    border-radius: 0px !important;
    border: none !important;
  }

  .dialog-page {
    .auth-card {
      border: none !important;
      box-shadow: none !important;
      margin-top: unset;
      margin-bottom: unset;
      width: 100%;
      height: 100%;
      //padding-top: calc(var(--safe-area-inset-top));

      border-radius: 0px !important;
      .dialog-card-header {
        flex-grow: 1;
        width: 100%;
        align-items: center;
        display: flex;
        text-align: center;
      }
    }
  }

  .tag {
    font-size: 0.9em;
  }
}
</style>
