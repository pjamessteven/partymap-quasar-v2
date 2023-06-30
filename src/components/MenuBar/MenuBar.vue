<template>
  <div class="flex row menubar justify-between">
    <div
      class="menubar-background"
      :style="computedStyle"
      v-if="!$route.meta.mapOverlay || this.$route.name !== 'Explore'"
    />
    <MenuBarLogo
      class="logo"
      :color="iconColor"
      v-if="!previousRouteName || this.$route.name === 'Explore'"
    />
    <transition
      appear
      enter-active-class="animated fadeIn slow"
      leave-active-class="animated fadeOut"
    >
      <q-btn
        class="back-button inter bold"
        :style="$q.screen.gt.xs ? 'font-size: 1rem !important' : ''"
        flat
        icon="mdi-chevron-left"
        :label="previousRouteName"
        :color="iconColor"
        no-caps
        @click="back()"
        v-if="previousRouteName && this.$route.name !== 'Explore'"
      />
    </transition>
    <SearchComponent />
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <MenuBarButtons :color="iconColor" />
    </transition>
  </div>
</template>

<script>
import MenuBarLogo from './MenuBarLogo.vue';
import MenuBarButtons from './MenuBarButtons.vue';
import SearchComponent from 'src/components/SearchComponent.vue';
import { useMainStore } from 'stores/main';
import { mapState, mapWritableState } from 'pinia';
export default {
  name: 'MenuBar',
  components: {
    MenuBarLogo,
    MenuBarButtons,
    SearchComponent,
  },

  data() {
    return {};
  },
  methods: {
    back() {
      this.$router.go(-1);
    },
    getPreviousRouteName(previousRoute) {
      if (previousRoute.name === 'Explore') {
        if (this.sidebarPanel === 'explore' || this.sidebarPanel === 'search') {
          return 'Back to results';
        } else if (this.sidebarPanel === 'nearby') {
          return 'Back to home';
        } else if (this.sidebarPanel === 'favorites') {
          return 'Back to your events';
        } else return null;
      } else if (
        previousRoute.name === 'EventPage' ||
        previousRoute.name === 'ArtistPage'
      ) {
        return 'Back to ' + previousRoute.query.name.replace(/_/g, ' ');
      } else return previousRoute.meta['friendlyName'];
    },
  },
  computed: {
    ...mapState(useMainStore, [
      'showSidebar',
      'menubarOpacity',
      'routerHistory',
      'sidebarPanel',
    ]),
    ...mapWritableState(useMainStore, ['routerHistory']),

    previousRouteName() {
      if (this.routerHistory.length == 0) return null;
      const previousRoute = this.routerHistory[this.routerHistory.length - 1];
      if (previousRoute) {
        if (previousRoute.meta?.noBackNavigation) {
          return null;
        } else return this.getPreviousRouteName(previousRoute);
      } else return null;
    },
    transparentMenuBar() {
      return (
        this.$route.name === 'EventPage' ||
        this.$route.name === 'Explore' ||
        (this.$route.meta.fullscreenLayout === true && this.$q.screen.gt.xs)
      );
    },

    computedStyle() {
      if (this.$route.name === 'EventPage') {
        var opacity = this.menubarOpacity;
        if (this.$q.screen.gt.xs) {
          if (this.$q.dark.isActive) {
            return `opacity: ${opacity}; background: black!important`;
          } else {
            return `opacity: ${opacity}; background: white!important`;
          }
        } else {
          return `opacity: ${opacity}; background: black!important;`;
        }
      } else if (
        !this.$route.meta.mapOverlay ||
        (this.$q.screen.lt.sm && this.$route.name !== 'Explore')
      ) {
        return 'opacity: 1;  border: none!important';
      } else return 'opacity: 0;';
    },
    iconColor() {
      if (
        this.$route.name === 'EventPage' &&
        this.$q.screen.gt.xs &&
        this.menubarOpacity === 1 &&
        !this.$q.dark.isActive
      ) {
        return 'black';
      } else if (
        this.$q.dark.isActive ||
        this.$route.name === 'EventPage' ||
        this.$route.name === 'Explore' ||
        (this.$route.meta.fullscreenLayout === true && this.$q.screen.gt.xs)
      ) {
        return 'white';
      } else {
        return 'black';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .menubar {
    .menubar-background {
      background: black;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}

.body--light {
  .menubar {
    .menubar-background {
      background: white;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
  }
}

.menubar {
  //transition: opacity 0.15s;
  height: 62px;
  position: relative;

  .menubar-background {
    will-change: opacity;

    position: absolute;
    height: 100%;
    width: 100%;
    transition: opacity 0.3s ease;
  }
  .logo {
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: all;
    min-height: 62px;
  }
  .back-button {
    position: absolute;
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: all;
    min-height: 62px;
    border-radius: 0px !important;
  }
}
// sm
@media only screen and (max-width: 1023px) {
}
// xs
@media only screen and (max-width: 600px) {
  .body--dark {
    .menubar {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      .menubar-background {
        border-bottom: none;
      }
    }
  }
  .body--light {
    .menubar {
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      //border-top: none;
      //border-bottom: none;
      box-shadow: none;
      .menubar-background {
        border-bottom: none;
      }
    }
  }
  .menubar {
    z-index: 1;

    &.search-expanded {
      .logo {
        opacity: 0;
      }
    }
  }
}
</style>
