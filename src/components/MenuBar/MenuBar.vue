<template>
  <div class="flex row menubar justify-between items-center">
    <div class="menubar-background" :style="computedStyle" />
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
      <div
        class="back-button-wrapper flex items-center no-wrap"
        v-if="previousRouteName && this.$route.name !== 'Explore'"
      >
        <div class="separator vertical" v-if="$q.screen.gt.xs" />
        <q-btn
          class="back-button"
          flat
          icon="mdi-chevron-left"
          :label="previousRouteName"
          :color="iconColor"
          no-caps
          @click="back()"
        />
      </div>
    </transition>
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <MenuBarButtons :color="iconColor" class="right-buttons" />
    </transition>
  </div>
</template>

<script>
import MenuBarLogo from './MenuBarLogo.vue';
import MenuBarButtons from './MenuBarButtons.vue';
import { useMainStore } from 'stores/main';
import { mapState, mapWritableState } from 'pinia';
export default {
  name: 'MenuBar',
  components: {
    MenuBarLogo,
    MenuBarButtons,
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
          return 'Back home';
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
    ]),
    ...mapWritableState(useMainStore, ['sidebarPanel', 'showPanel']),

    ...mapWritableState(useMainStore, ['routerHistory']),

    previousRouteName() {
      if (this.routerHistory.length == 0) return null;
      const previousRoute = this.routerHistory[this.routerHistory.length - 1];
      if (previousRoute) {
        if (
          previousRoute.meta?.noBackNavigation &&
          this.sidebarPanel !== 'explore'
        ) {
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
            return `opacity: ${opacity}; background: #181818!important; border-bottom: 1px solid rgba(255, 255, 255, 0.1);`;
          } else {
            return `opacity: ${opacity}; background: white!important; border-bottom: 1px solid rgba(0, 0, 0, 0.1);`;
          }
        } else {
          return `opacity: ${opacity}; background: black!important;`;
        }
      } else if (
        !this.$route.meta.mapOverlay ||
        (this.$q.screen.lt.sm && this.$route.name !== 'Explore')
      ) {
        return 'opacity: 1;  border: none!important';
      } else if (this.$route.name === 'Explore' && this.$q.screen.gt.xs) {
        // explore view
        if (this.$q.dark.isActive) {
          return 'background: black';
        } else {
          return 'background: white';
        }
      } else return 'opacity: 0';
    },
    iconColor() {
      if (
        (this.$route.name === 'EventPage' &&
          this.$q.screen.gt.xs &&
          this.menubarOpacity === 1 &&
          !this.$q.dark.isActive) ||
        (this.$route.name === 'Explore' &&
          !this.$q.dark.isActive &&
          this.$q.screen.gt.xs) ||
        (this.$route.name === 'Explore' &&
          !this.$q.dark.isActive &&
          this.$q.screen.lt.sm &&
          this.showPanel)
      ) {
        return 'black';
      } else if (
        this.$q.dark.isActive ||
        this.$route.name === 'EventPage' ||
        this.$route.name === 'Explore' ||
        (this.$route.meta.mapOverlay === true && this.$q.screen.gt.xs)
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

      //
    }
    .tab-wrapper {
      :deep(.q-tabs) {
        .q-tab {
          .q-tab__label {
            // text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
          }
          &.q-tab--active {
            color: white;
          }
          &.q-tab--inactive {
            color: $ti-2;
          }
          &:before,
          &:after {
            background-color: white;
          }
        }
      }
      .separator {
        border-color: $bi-4;
      }
    }
  }
}

.body--light {
  .menubar {
    .menubar-background {
      background: white;
      //border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      //box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    }
    .tab-wrapper {
      :deep(.q-tabs) {
        &.light-button {
          .q-tab {
            .q-tab__label {
              // text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
            }
            &.q-tab--active {
              color: white;
            }
            &.q-tab--inactive {
              color: $ti-2;
            }
            &:before,
            &:after {
              background-color: white;
            }
          }
        }
        .q-tab {
          .q-tab__label {
          }
          &.q-tab--active {
            color: black;
          }
          &:before,
          &:after {
            background-color: black;
          }
        }
      }
      .separator {
        border-color: grey;
      }
    }
  }
}

.menubar {
  //transition: opacity 0.15s;
  height: 72px;
  position: relative;
  transition: height 0.3s ease;

  .menubar-background {
    position: absolute;
    height: 100%;
    width: 100%;
    transition: all 0.3s ease;
  }
  .logo {
    z-index: 1;
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: all;
    min-height: 62px;
  }
  .tab-wrapper {
    pointer-events: all;
    position: absolute;
    left: 155px;
    top: 0px;
    height: 72px;
    display: flex;
    align-items: center;

    :deep(.q-tabs) {
      height: 100%;
      .q-tab {
        //padding-top: 4px;
        padding: 8px;
        padding-bottom: 12px;
        font-size: 28px;
        margin: 4px;
        //margin: 4px 4px;
        //border-radius: 64px;
        transition: all 0.3s;
        color: white;
        background: none !important;
        font-size: 32px;
        opacity: 1 !important;
        border: 1px solid transparent;
        $duration: 0.4s;
        $outDuration: 0.1s;
        $distance: 10px;
        $easeOutBack: cubic-bezier(0.175, 0.885, 0.32, 1.275);

        &:before,
        &:after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 1px;
          //background-color: black;
        }
        &:before {
          opacity: 0;
          transform: translateY(-$distance);
          transition: transform 0s $easeOutBack, opacity 0s;
        }
        &:after {
          opacity: 0;
          transform: translateY($distance/2);
          transition: transform $duration $easeOutBack, opacity $duration;
        }

        .q-tab__icon {
          font-size: 26px;
        }
        .q-focus-helper {
          display: none;
        }
        .q-tab__label {
          font-weight: 500 !important;
        }
        &.q-tab--active {
          background: none !important;
        }
        &.q-tab--inactive {
          color: grey;
          // opacity: 0.3 !important;
        }
        &:hover {
          background: none;
          background: none !important;
        }

        &:hover,
        &.q-tab--active {
          &:before,
          &:after {
            opacity: 1;
            transform: translateY(0);
          }
          &:before {
            transition: transform $duration $easeOutBack, opacity $duration;
          }
          &:after {
            transition: transform 0s $duration $easeOutBack,
              opacity 0s $duration;
          }
        }
      }
    }
  }

  .back-button-wrapper {
    position: absolute;
    left: 0px;
    .separator {
      height: 24px;
    }
    .back-button {
      opacity: 1;
      transition: opacity 0.3s ease;
      pointer-events: all;
      min-height: 62px;
      border-radius: 0px !important;
    }
  }

  .right-buttons {
    position: absolute;
    right: 0px;
    height: 100%;
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
    .back-button-wrapper {
      left: 0px;

      .back-button {
      }
    }
    &.search-expanded {
      .logo {
        opacity: 0;
      }
    }
  }
}
</style>
