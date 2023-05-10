<template>
  <div
    class="navigation-bar flex row no-wrap"
    :class="$q.screen.gt.sm ? 'justify-between' : ''"
  >
    <div
      class="q-pa-lg chicago text-h5"
      style="text-transform: capitalize"
      v-if="$q.screen.gt.xs"
    >
      {{ sidebarPanel }}
    </div>
    <q-tabs
      @click.stop
      :content-class="$q.screen.gt.lg ? '' : ''"
      v-model="sidebarPanel"
      no-caps
      :indicator-color="
        $q.screen.lt.sm
          ? $route.name === 'Explore'
            ? undefined
            : 'transparent'
          : 'transparent'
      "
      :active-class="
        $q.screen.lt.sm
          ? $route.name === 'Explore'
            ? undefined
            : 'inactive-tab'
          : 'active-tab'
      "
    >
      <q-tab
        key="1"
        name="nearby"
        content-class="tab"
        :ripple="false"
        @click="
          () => {
            getFineLocation();
            backToExplore();
          }
        "
      >
        <template v-slot>
          <div class="flex column justify-center items-center">
            <div v-if="!userLocationLoading" class="q-tab__icon flex">
              <q-icon name="mdi-crosshairs-gps" class="" v-if="fineLocation" />
              <q-icon name="mdi-crosshairs" class="" v-else />
            </div>
            <div v-else style="position: relative" class="q-tab__icon flex">
              <q-icon style="z-index: 1" name="mdi-crosshairs" />
              <q-icon
                style="z-index: 2; left: 0px"
                class="animated infinite flash slowest absolute"
                name="mdi-crosshairs-gps"
              />
            </div>
            <div v-if="$q.screen.lt.sm" class="q-tab__label">Nearby</div>
          </div>
        </template>
      </q-tab>
      <q-tab
        key="2"
        name="explore"
        icon="mdi-map-search"
        :label="$q.screen.gt.xs ? undefined : 'Explore'"
        content-class="tab"
        :ripple="false"
        @click="backToExplore"
      />
      <q-tab
        key="3"
        name="favorites"
        :icon="
          sidebarPanel === 'favorites'
            ? 'mdi-account-circle'
            : 'mdi-account-circle-outline'
        "
        :label="$q.screen.gt.xs ? undefined : 'You'"
        content-class="tab"
        :ripple="false"
        @click="backToExplore"
      />
      <q-tab
        key="4"
        name="search"
        icon="mdi-magnify"
        :label="$q.screen.gt.xs ? undefined : 'Search'"
        content-class="tab"
        :ripple="false"
        @click="backToExplore"
      />
    </q-tabs>
  </div>
</template>
<script>
import { mapState, mapActions, mapWritableState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { useMainStore } from 'src/stores/main';
import { useQueryStore } from 'src/stores/query';

export default {
  name: 'NavigationBar',

  components: {},
  props: {},

  data() {
    return {};
  },
  methods: {
    ...mapActions(useMainStore, ['loadIpInfo', 'getFineLocation']),

    // go back to explore
    // if the user is on an event or artist page
    backToExplore() {
      if (this.$route.name !== 'explore') {
        this.$router.push({ name: 'Explore' });
      }
    },
  },
  watch: {
    sidebarPanel(to, from) {
      if (to === 'explore') {
        this.showPanel = false;
      }
      if (to === 'search') {
        this.showPanel = true;
      }
      if (to === 'nearby') {
        this.showPanel = true;
      }
      if (to === 'favorites') {
        if (this.currentUser) {
          this.controlFavorites = true;
          this.showPanel = true;
        } else {
          this.sidebarPanel = from;

          this.$router.push({ name: 'Login' });
        }
      } else if (from === 'favorites') {
        this.controlFavorites = false;
      }
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useMainStore, ['sidebarPanel', 'showPanel']),
    ...mapState(useMainStore, ['fineLocation', 'userLocationLoading']),
    ...mapWritableState(useQueryStore, ['controlFavorites']),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .nav-separator {
    background: linear-gradient(
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }
  .navigation-bar {
    //border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    :deep(.q-tabs) {
      .q-tab {
        &.q-tab--active {
          background: $bi-3;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
}
.body--light {
  .navigation-bar {
    box-shadow: rgba(100, 100, 111, 0.15) 0px 7px 29px 0px;
    background: white;
    :deep(.q-tabs) {
      .q-tab {
        &.q-tab--active {
          background: #fafafa;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
  .nav-separator {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.1), transparent);
  }
}
.navigation-bar {
  width: 216px;
  padding-right: 8px;
  pointer-events: all;
  overflow: none;
  width: 100%;
  z-index: 2000;
  //height: 62px;
  position: relative;
  :deep(.q-tabs) {
    position: absolute;
    right: 12px;
    height: 100%;
    font-family: chicagoflf;

    .q-tab {
      padding-top: 4px;
      //padding-bottom: 4px;
      padding: 8px;
      margin: 16px 4px;
      border-radius: 18px;
      transition: all 0.3s;
      &.q-tab--active {
        opacity: 1 !important;
      }
      &.q-tab--inactive {
        opacity: 0.3 !important;
      }
    }
  }
  :deep(.q-tab__icon) {
    //padding: 0px 0px;
  }
}
.nav-separator {
  width: 1px;
  height: 100%;
}
.inactive-tab {
  opacity: 0.3 !important;
}
.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}
@media only screen and (max-width: 600px) {
  .body--dark {
    .navigation-bar {
      background: black;
      //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.8);
      border-top: 1px solid rgba(255, 255, 255, 0.1);

      //box-shadow: 0px 0px 46px -6px rgb(230,230,230);
    }
  }
  .body--light {
    .navigation-bar {
      background: white;
      //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.1);;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      :deep(.q-tabs) {
        .q-tab {
          color: black;
        }
      }
    }
  }

  .nav-separator {
    display: none;
  }
  .navigation-bar {
    width: 100%;
    position: absolute;
    z-index: 1000;
    bottom: 0;
    border-bottom: none !important;
    justify-content: unset;
    :deep(.q-tabs) {
      width: 100%;
      position: relative;
      right: unset;
      .q-tab {
        padding-top: 12px;
        opacity: 0.3 !important;
        margin: 0px 0px;
        border-radius: 0px !important;
        transition: all 0.3s;

        &.q-tab--active {
          opacity: 1 !important;
          background: unset !important;
          border: unset !important;
        }
      }

      :deep(.q-tab__icon) {
        padding: 6px 4px;
      }
    }
  }
}
</style>
