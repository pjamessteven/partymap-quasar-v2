<template>
  <router-view />
</template>

<script>
import axios from 'axios';
import { mapActions, mapState } from 'pinia';
import { useMainStore } from './stores/main';
import { useAuthStore } from './stores/auth';

export default {
  name: 'App',
  components: {},
  meta: {
    // meta tags
    title: 'PartyMap | The Global Map of Festivals and Events',
    meta: {
      viewport: {
        name: 'viewport',
        content:
          'width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0,user-scalable=no;user-scalable=0;',
      }, // THIS META TAG ENABLES 'FAST TAPPING' ON IOS DEVICES
      description: {
        name: 'description',
        content:
          'PartyMap is a community-driven platform for discovering festivals and events near you and around the world.',
      },
      keywords: {
        name: 'keywords',
        content:
          'Festival, Festivals, Map, Events, Party, Fiesta, Music, Music Festival, Music Festivals, Best Music Festivals, All Music Festivals, Top Music Festivals, List of music festivals, list',
      },
    },
  },
  methods: {
    ...mapActions(useMainStore, ['darkModeToggle']),
    ...mapActions(useAuthStore, ['checkAuthCookie']),
  },
  computed: {
    ...mapState(useMainStore, ['darkMode']),
  },
  watch: {
    darkMode: function (newval) {
      if (newval) {
        this.$q.dark.set(true);
      } else {
        this.$q.dark.set(false);
      }
    },
  },
  created() {
    this.$q.dark.set('auto');
    if (this.$q.dark.isActive) {
      this.darkModeToggle();
    }
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
  font-family: BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, Arial,
    sans-serif;
  // /font-family: chicagoflf;
  //letter-spacing: unset !important;
  max-height: -webkit-fill-available;
  touch-action: none;
  overscroll-behavior-x: none;
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

.sticky-card-header {
  position: sticky;
  top: 0px;
  z-index: 100;
  padding: 18px 18px;
}

.body--light {
  /* ... */
  .sticky-card-header {
    background: $b-2;
    //color: rgba(0, 0, 0, 0.67);

    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    //box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
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
    height: 1px;
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
    border: 1px solid rgba(0, 0, 0, 0.1);
    /*box-shadow: 0 0.5em 1em -0.125em rgba(0, 0, 0, 0.1),
      0 0px 0 1px rgba(0, 0, 0, 0.02); */
    //box-shadow: none;

    background: white;
  }
  .q-field__control::before {
    // border-color: rgba(0, 0, 0, 0.1) !important;
  }
  .q-field__control {
    // background: $b-1;
  }

  .button-control {
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
    .q-btn__wrapper {
      &:before {
        box-shadow: none;
      }
    }
    &.active {
      background: $b-3 !important;
      // font-weight: bold;
      border: 1px solid rgba(0, 0, 0, 0.1);
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
  .solid-page {
    background: white;
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

  .sticky-card-header {
    //color: rgba(255, 255, 255, 0.67);

    background: $bi-2;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
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

  .q-list--bordered {
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .q-separator--dark {
    background: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .vc-container {
    border-color: rgba(255, 255, 255, 0.1) !important;
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

  .button-control {
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
    .q-btn__wrapper {
      &:before {
        box-shadow: none;
      }
    }
    &.active {
      background: $ti-1 !important;
      color: $t-1 !important;
      // font-weight: bold;
      border: 1px solid rgba(255, 255, 255, 0);
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
    border-color: rgba(255, 255, 255, 0.1);
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
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: $bi-1;
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
    border-color: rgba(255, 255, 255, 0.1);
  }
  .q-field--dark .q-field__control::before {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .q-field__control {
    //background: $bi-3;
  }

  .separator {
    border-color: rgba(255, 255, 255, 0.1);
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
  .solid-page {
    background: $bi-1;
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
  border-radius: 4px !important;
  .q-btn__content {
    flex-wrap: nowrap;
  }
}

.soft-button-shadow {
  .q-btn__wrapper::before {
    // this would be a nice shadow if it worked
    //box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  }
}

.button-control {
  padding: 6px 12px;
  font-weight: 400;
  font-family: chicagoflf;
  text-transform: capitalize;
  font-size: normal;
  border-radius: 9px !important;
  &.active {
    font-weight: 500;
  }

  .q-btn__wrapper {
    padding: 0;
  }
  .q-btn__content {
    white-space: nowrap;
    .q-icon {
      margin-right: -6px;
    }
  }
}

.q-menu {
  border-radius: 0px;
  //max-height: 100vh !important;
  /*
  max-width: unset !important;
  max-height: unset !important;
  overflow-x: auto;
  overflow-y: auto;
  */
  font-family: chicagoflf;
  //font-weight: 100;
  font-size: small;
  color: $t-1;
  border-radius: 0px;
  //font-family: chicagoflf;
  //text-transform: lowercase;
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
  border-radius: 0px !important;
}
.q-dialog__inner--minimized > div {
  max-height: 90vh;
}
.q-dialog__inner--minimized {
  padding: 0px;
}
.dialog-card {
  max-width: 1056px !important;
}
.q-card {
  border-radius: 0px !important;
}
.q-item__section--avatar {
  min-width: unset !important;
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

.solid-page-wrapper {
  width: 100%;
  height: 100%;
  .solid-page {
    position: relative;
    pointer-events: auto;
    z-index: 4000;
    overflow: auto;
    padding-top: 60px;
    .solid-page-inner {
      max-width: 1000px;
    }
  }
}

.dialog-page {
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
  font-family: chicagoflf !important;

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
@media only screen and (max-width: 1023px) {
  body {
    //font-size: 16px;
  }
  input,
  select,
  textarea {
    font-size: 16px !important; // stop zooming into text fields on mobile
  }
  .text-h6 {
    //font-size: 16px !important;
  }
  .auth-card {
  }
  .solid-page {
    overflow-x: hidden;
    padding-left: 16px;
    padding-right: 16px;

    .solid-page-inner {
    }
  }
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
  .q-menu {
    max-width: unset;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
      rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
    border-radius: 0px;
  }
}
@media only screen and (max-width: 1023px) {
}
// sm
@media only screen and (max-width: 600px) {
  .body--dark {
    .q-dialog {
      .menu {
        color: $bi-2;
      }
    }
  }
  .body--light {
    .q-dialog {
      .menu {
        color: $b-2;
      }
    }
  }
  .q-dialog {
    .menu {
      font-family: chicagoflf;
    }
  }
  .dialog-page {
    .auth-card {
      border: none !important;
      box-shadow: none !important;
      padding-top: 62px;
      margin-top: unset;
      margin-bottom: unset;
      width: 100%;
      height: 100%;
      border-radius: 0px;
      .sticky-card-header {
        flex-grow: 1;
        width: 100%;
        align-items: center;
        display: flex;
        text-align: center;
      }
    }
  }

  .solid-page {
    //padding-top: 16px !important;
    .solid-page-inner {
      margin-bottom: 120px !important;
    }
  }
}
</style>
