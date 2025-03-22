<template>
  <div class="main-layout">
    <q-no-ssr>
      <MainMap :key="currentMapStyleUrl" v-if="isMainMapLoaded" />
    </q-no-ssr>
    <div
      class="overlay"
      :class="overlayOpacityTransition ? 'overlay-transition' : ''"
      :style="computedOverlayStyle"
      @click="clickOverlay()"
    />
    <div class="main-inner-layout">
      <MenuBar class="menubar" />

      <Transition
        appear
        :enter-active-class="'animated fadeIn'"
        :leave-active-class="'animated fadeOut'"
      >
        <DesktopSearchComponent
          class="controls-component"
          v-if="$route.meta.showControls"
          :overlayingMap="!showPanelBackground && $route.name === 'Explore'"
          :class="{
            'explore-view': $route.name === 'Explore',
          }"
        />
      </Transition>

      <div
        class="sidebar-component-wrapper"
        :style="$q.screen.lt.md && computedSidebarOpacity"
      >
        <Transition
          appear
          :enter-active-class="
            $q.screen.gt.xs ? 'animated  fadeIn' : 'animated fadeIn'
          "
          :leave-active-class="
            $q.screen.gt.xs ? 'animated slideOutDown' : undefined
          "
        >
          <MobileSideBar
            class="sidebar-component"
            v-if="$q.screen.lt.md"
            :class="{ hide: $q.screen.lt.md && $route.name === 'EventPage' }"
          />
        </Transition>
        <Transition
          appear
          :enter-active-class="'animated slideInLeft'"
          :leave-active-class="'animated slideOutLeft'"
          v-if="$q.screen.gt.sm"
        >
          <SideBar
            class="sidebar-component"
            v-show="
              $route.name === 'Explore' ||
              ($q.screen.gt.lg && desktopSidebarShowing)
            "
          />
        </Transition>
        <div
          v-show="
            $q.screen.lt.sm || ($q.screen.gt.xs && $route.name == 'Explore')
          "
          class="sidebar-overlay"
          :style="computedSidebarOverlayStyle"
        />
      </div>

      <!-- There's two router views beca   we want different transitions for different pages
  and we're lazy... -->

      <router-view
        key="1"
        name="event"
        v-slot="{ Component }"
        class="main-layout-router event-router"
        v-bind:class="{
          'mobile-map-view-router': $q.screen.lt.sm,
          'event-router-ios': $q.platform.is.ios,
          'peek-map': peekMap,
        }"
      >
        <Transition
          :name="eventPageTransition && !disableAnimations ? 'event-page' : ''"
          :mode="
            eventPageTransition && !disableAnimations ? 'out-in' : undefined
          "
          :enter-active-class="
            eventPageTransition ? undefined : 'animated fadeIn'
          "
          :leave-active-class="
            eventPageTransition ? undefined : 'animated fadeOut'
          "
        >
          <component :is="Component" />
        </Transition>
      </router-view>
      <router-view
        key="2"
        v-slot="{ Component }"
        class="main-layout-router"
        v-bind:class="{
          'mobile-map-view-router': $q.screen.lt.sm,
        }"
      >
        <Transition
          :enter-active-class="
            $q.screen.gt.xs ? 'animated  fadeIn' : 'animated fadeIn'
          "
          :leave-active-class="
            $q.screen.gt.xs ? 'animated fadeOut' : 'animated fadeOut'
          "
          mode="in-out"
        >
          <keep-alive
            :include="[
              'BrowsePage',
              'FeaturedEvents',
              'BrowseEventDateList',
              'CountryRegionList',
              'UserPage',
            ]"
          >
            <component :is="Component" />
          </keep-alive>
        </Transition>
      </router-view>
      <NavigationBar
        class="nav-bar mobile"
        v-if="$q.screen.lt.sm"
        :style="
          (sidebarOpacity && $route.name === 'EventPage') ||
          $route.name === 'Explore' ||
          $route.name === 'UserPage' ||
          $route.name === 'ActivityPage' ||
          $route.name === 'BrowsePage' ||
          $route.name === 'FeaturedEvents' ||
          $route.name === 'BrowseEventDateList' ||
          $route.name === 'CountryRegionList'
            ? ''
            : 'display: none'
        "
      />
    </div>
  </div>
</template>

<script lang="ts">
//import MainMap from 'src/components/MainMap/MainMap.vue';
import SideBar from 'components/SideBar/SideBar.vue';
import MenuBar from 'components/MenuBar/MenuBar.vue';
import MenuBarLogo from 'src/components/MenuBar/MenuBarLogo.vue';
import NavigationBar from 'src/components/NavigationBar.vue';
import MobileSideBar from 'src/components/SideBar/MobileSideBar.vue';
import { mapWritableState, mapActions } from 'pinia';
import { useMapStore } from 'src/stores/map';
import { useMainStore } from 'src/stores/main';
import { useEventStore } from 'src/stores/event';
import { i18n, setI18nLanguage, loadLocaleMessages } from 'src/boot/i18n.ts';
import { defineAsyncComponent } from 'vue';
import DesktopSearchComponent from '../components/Controls/DesktopSearchComponent.vue';
export default {
  components: {
    SideBar,
    MobileSideBar,
    MenuBar,
    MenuBarLogo,
    NavigationBar,
    DesktopSearchComponent,
    MainMap: defineAsyncComponent(
      () => import('/src/components/MainMap/MainMap.vue'),
    ),
  },
  data() {
    return {
      overlayOpacityTransition: true,
      eventPageTransition: false,
      isMainMapLoaded: false,
    };
  },
  methods: {
    ...mapActions(useMainStore, ['setLocale', 'forceUpdate']),
    clickOverlay() {
      this.showPanel = false;
      this.sidebarPanel = 'explore';
    },
  },
  beforeRouteUpdate(to, from, next) {
    if (to.name === 'EventPage' || to.name === 'Explore') {
      this.isMainMapLoaded = true;
    }

    if (
      (from.name === 'Explore' && to.name !== 'Explore') ||
      (from.name === 'BrowseEventDateList' && to.name !== 'BrowseEventDateList')
    ) {
      this.blockUpdates = true;
      // blockUpdates is re-enabled in Map.vue at map.
    }
    if (to.name === 'Explore') {
      this.sidebarOpacity = 1;
      setTimeout(() => {
        this.overlayOpacityTransition = true;
      }, 500);
    }

    if (to.name === 'EventPage') {
      this.sidebarOpacity = 0;
      this.overlayOpacityTransition = false;
      if (from.name === 'Explore') {
        // dont transition to eventpage from explore/artist pages on desktop
        this.eventPageTransition = true;
      } else {
        this.eventPageTransition = false;
      }
    }
    if (from.name === 'EventPage') {
      this.sidebarOpacity = 1;
      // focusMarker is set null here so we can transition out the event page in EventPage.vue onBeforeRouteLeave
      // before the map starts to move
      this.focusMarker = null;
      if (to.name === 'Explore') {
        // dont transition to eventpage from explore/artist pages on desktop
        this.eventPageTransition = true;
      } else {
        this.eventPageTransition = false;
      }
    }

    this.$nextTick(() => {
      next();
    });
  },
  async beforeRouteEnter(to, from, next) {
    const routeLocale = to.params.lang;

    let userLangPref;
    if (process.env.CLIENT) {
      userLangPref = localStorage.getItem('languagePref');
    }

    const locale = routeLocale || userLangPref;
    // set i18n language
    if (locale) {
      await loadLocaleMessages(i18n, locale);
      setI18nLanguage(i18n, locale);
    }
    if (userLangPref) {
      next((vm) => {
        vm.$router.replace({
          ...to,
          params: { ...to.params, lang: userLangPref },
        });
      });
    } else {
      next();
    }
  },
  beforeMount() {
    // set date locale (best locale is chosen in i18n.ts boot file)
    this.setLocale(i18n.global.locale.value);
  },
  mounted() {
    if (this.$route.name === 'EventPage' || this.$route.name === 'Explore') {
      this.isMainMapLoaded = true;
    }
  },

  computed: {
    ...mapWritableState(useMapStore, [
      'blockUpdates',
      'focusMarker',
      'currentMapStyleUrl',
      'peekMap',
    ]),
    ...mapWritableState(useMainStore, [
      'showSidebar',
      'overlayOpacity',
      'showPanel',
      'showPanelBackground', //mobile only
      'sidebarPanel',
      'sidebarOpacity',
      'disableAnimations',
      'sidebarMinimized',
      'desktopSidebarShowing',
    ]),
    ...mapWritableState(useEventStore, ['event']),
    showSearchForRoute() {
      return this.$route.name === 'Explore';
    },
    computedSidebarOpacity() {
      return `opacity: ${this.sidebarOpacity}`;
    },
    computedSidebarOverlayStyle() {
      if (!this.showPanelBackground) {
        return 'opacity: 0; pointer-events: none!important; ';
      } else {
        return 'opacity: 1';
      }
    },
    computedOverlayStyle() {
      if (this.$route.name === 'EventPage') {
        if (this.$q.screen.lt.sm) {
          if (this.$q.dark.isActive) {
            return `opacity: ${this.overlayOpacity}; background: linear-gradient(black, black 50%, #060606 50%, #060606 100%)!important`;
          } else {
            return `opacity: ${this.overlayOpacity}; background: linear-gradient(black, black 50%, #f5f5f5 50%, #f5f5f5 100%)!important`;
          }
        } else {
          if (this.$q.dark.isActive) {
            return `opacity: ${this.overlayOpacity}; background: black!important`;
          } else {
            return `opacity: ${this.overlayOpacity}; background: #f5f5f5!important`;
          }
        }
      } else {
        if (
          this.$route.name !== 'Explore' &&
          this.$route.meta.mapOverlay === false &&
          this.$q.screen.gt.xs
        )
          return 'opacity: 1; pointer-events: all';
        else return 'opacity: 0';
      }
    },
  },
};
</script>
<style lang="scss">
.body--dark {
  .main-layout {
    .sidebar-component-wrapper {
      .sidebar-overlay {
        background: black;
      }
    }

    .overlay {
      //background: linear-gradient($bi-2, $bi-2 62px, black 62px, black);
      background: black;
      //background: linear-gradient(transparent 5%, white 15%);
      /*
      background: linear-gradient(
        rgba(0, 0, 0, 0.78) 0px,
        rgba(0, 0, 0, 0.78) 64px,
        rgba(0, 0, 0, 0.58) 128px,
        rgba(0, 0, 0, 0) calc(100% - 256px),
        rgba(0, 0, 0, 0.78) 100%
      );
      */
    }
  }
}
.body--light {
  .main-layout {
    .overlay {
      //background: linear-gradient(#fafafa, #fafafa 64px, white 64px, white);
      background: white;
      //backdrop-filter: blur(2px);
      //background: linear-gradient(transparent 5%, white 15%);
      /*
      background: linear-gradient(
        rgba(0, 0, 0, 0.48) 0px,
        rgba(0, 0, 0, 0.48) 64px,
        rgba(0, 0, 0, 0.3) 128px,
        rgba(0, 0, 0, 0) calc(100% - 256px),
        rgba(0, 0, 0, 0.48) 100%
      );*/
    }
    .sidebar-component-wrapper {
      .sidebar-overlay {
        background: white;
      }
    }
  }
}

.main-layout {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;

  .overlay {
    z-index: 103;
    position: absolute;
    height: 100%;
    width: 100%;
    opacity: 0;
    pointer-events: none;
    //will-change: auto;
    cursor: grab;
    transition: all 0.35s ease-in;
    &.overlay-transition {
      transition: opacity 0.4s;
    }
    @supports (font: -apple-system-body) and (-webkit-appearance: none) {
      -webkit-backface-visibility: hidden;
      -webkit-transform: translate3d(0, 0, 0);
      // translate3d is a hack for safari to force gpu rendering of blur()
    }
  }
  .main-inner-layout {
    height: 100%;
    pointer-events: none;
    width: 100%;
    // android
    @supports ((top: var(--safe-area-inset-top))) {
      @media only screen and (max-width: 599px) {
        padding-top: var(--safe-area-inset-top);
      }
    }
    // ios specific top padding
    @supports (
      (top: var(--safe-area-inset-top)) and (font: -apple-system-body) and
        (-webkit-appearance: none)
    ) {
      @media only screen and (max-width: 599px) {
        padding-top: calc(var(--safe-area-inset-top) - 8px);
      }
    }

    @supports (top: var(--safe-area-inset-bottom)) {
      // we only really care about bottom padding when it's overlaying the nav bar
      //padding-bottom: calc(var(--safe-area-inset-bottom) - 16px);
    }
    .sidebar-overlay {
      opacity: 1;
      transition: opacity 0.3s ease;
      z-index: 103;
      position: absolute;
      height: 100%;
      width: 100%;
      pointer-events: none;
      margin-top: calc(0px - var(--safe-area-inset-top)) !important;
    }

    .menubar {
      width: 100%;
      min-height: 62px !important;
      position: absolute;

      pointer-events: none;
      z-index: 4500;
    }
    .menubar-logo {
      position: absolute;
      z-index: 1000;
    }
    .controls-mobile {
      position: absolute;
      z-index: 103;
      top: 64px;
      width: 100%;
    }
    .controls-component {
      z-index: 5000;
      transition: transform 0.3s;
      transform: translate3d(-150px, 0, 0);
      padding-left: min(50vw, 584px);
      padding-right: 36px;
      position: absolute;
      top: calc(8px + var(--safe-area-inset-top));
      // transform: translate3d(calc(100vw / 2 - calc(633px / 2) + 100px), 0, 0);
      &.explore-view {
        transform: translate3d(-0px, 0, 0);
      }
    }
    .nav-bar {
      &.mobile {
        display: none;
      }
    }
    .sidebar-component-wrapper {
      position: relative;
      height: 100%;
      .sidebar-component {
        z-index: 104;
        opacity: 1;
        // transition: opacity 0.3s ease;

        &.hide {
          pointer-events: none;
          display: none;
        }
      }
    }
    .main-layout-router {
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 106;
      top: 0px;
      pointer-events: all;
    }
    .event-router {
      z-index: 4000 !important;
      pointer-events: none;
      &.event-router-ios {
        //pointer-events;
        touch-action: all;
        pointer-events: all;
        &.peek-map {
          pointer-events: none;
        }
      }
    }

    .mobile-map-view-router {
      z-index: 106;
    }
    .nav-bar {
      z-index: 3000 !important;
      opacity: 1;
      transition: opacity 4s;
    }
  }
}

@media only screen and (min-width: 600px) {
  // basic CSS transitions for desktop EventPage
  // mobile uses fancy useMotion/useGesture packages

  .event-page-enter-active {
    transform: translate3d(0, 0, 0) !important;
    transition: transform 0.3s ease-in-out;
    z-index: 5000;
    //opacity: 1;
  }

  .event-page-enter-from {
    transform: translate3d(0, 100vh, 0) !important;
  }

  .event-page-leave-to {
    z-index: 5000;

    transform: translate3d(
      0,
      calc(100vh - Max(calc((100vh - 66vh) - 64px), 0px)),
      0
    ) !important;
    transition: transform 0.2s ease-in-out !important;

    //opacity: 0;
  }
}
@media only screen and (max-width: 1023px) {
  .body--dark {
    .main-layout {
      .overlay {
        background: black;
      }
    }
  }
  .body--light {
    .main-layout {
      .overlay {
        background: white;
      }
    }
  }

  .main-layout {
    .main-layout-router {
      padding-top: calc(62px + var(--safe-area-inset-top));
      // ios specific top padding
      @supports (
        (top: var(--safe-area-inset-top)) and (font: -apple-system-body) and
          (-webkit-appearance: none)
      ) {
        padding-top: calc(62px + var(--safe-area-inset-top) - 8px);
      }

      @supports (top: var(--safe-area-inset-bottom)) {
        // we only really care about bottom padding when it's overlaying the nav bar
        // padding-bottom: calc(var(--safe-area-inset-bottom) - 16px);
      }
    }

    .main-inner-layout {
      .nav-bar {
        &.mobile {
          display: unset;
        }
      }
      .controls-component {
        position: absolute;
        padding-left: 16px;
        padding-right: 16px;

        width: 100vw;
        max-width: 100vw;
        transform: unset;
        &.explore-view {
          transform: unset;
        }
        // android
        @supports ((top: var(--safe-area-inset-top))) {
          top: calc(48px + var(--safe-area-inset-top));
        }
        // ios specific padding
        @supports (
          (top: var(--safe-area-inset-top)) and (font: -apple-system-body) and
            (-webkit-appearance: none)
        ) {
          top: calc(48px + var(--safe-area-inset-top));
        }
      }
      .sidebar-component-wrapper {
        position: unset;
        height: unset;
        transition: opacity 0.3s ease;
        // will-change: opacity; breaks blur on controls
        //transform: translate3d(0, 0, 0);
      }
    }
  }
  .native-mobile {
    .main-inner-layout {
      // ios specific padding for capcaitor app
      .controls-component {
        @supports (
          (top: var(--safe-area-inset-top)) and (font: -apple-system-body) and
            (-webkit-appearance: none)
        ) {
          top: calc(48px + var(--safe-area-inset-top) - 8px);
        }
      }
    }
  }
}
@media only screen and (min-width: 600px) and (max-width: 1023px) {
  .native-mobile {
    .main-inner-layout {
      // ios specific padding for capcaitor app
      .controls-component {
        @supports (
          (top: var(--safe-area-inset-top)) and (font: -apple-system-body) and
            (-webkit-appearance: none)
        ) {
          top: calc(48px - 8px);
        }
      }
    }
  }
}
</style>
