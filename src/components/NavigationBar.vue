<template>
  <div class="navigation-bar justify-between flex row no-wrap items-center">
    <q-tabs
      @click.stop
      :model-value="sidebarPanel"
      @update:model-value="updateNav"
      no-caps
      :indicator-color="
        $q.screen.lt.sm
          ? $route.name === 'Explore' ||
            $route.name === 'UserPage' ||
            $route.name === 'BrowsePage'
            ? undefined
            : 'transparent'
          : 'transparent'
      "
      :active-class="
        $q.screen.lt.sm
          ? $route.name === 'Explore' ||
            $route.name === 'UserPage' ||
            $route.name === 'BrowsePage'
            ? undefined
            : 'inactive-tab'
          : 'active-tab'
      "
    >
      <q-route-tab
        :to="{ name: 'Explore' }"
        exact
        replace
        key="1"
        name="nearby"
        content-class="tab"
        :label="$q.screen.gt.xs ? undefined : 'Home'"
        :ripple="false"
        :icon="sidebarPanel === 'nearby' ? 'mdi-home' : 'mdi-home-outline'"
      />

      <q-route-tab
        :to="{ query: { view: 'explore' }, name: 'Explore' }"
        exact
        replace
        key="2"
        name="explore"
        :icon="
          sidebarPanel === 'explore'
            ? 'mdi-map-search'
            : 'mdi-map-search-outline'
        "
        :label="$q.screen.gt.xs ? undefined : 'Explore'"
        content-class="tab"
        :ripple="false"
      />

      <q-route-tab
        :to="{ name: 'BrowsePage' }"
        exact
        key="3"
        name="browse"
        :label="$q.screen.gt.xs ? undefined : 'Browse'"
        :icon="
          $route.name === 'BrowsePage'
            ? 'mdi-feature-search'
            : 'mdi-feature-search-outline'
        "
        content-class="tab"
        :ripple="false"
      />

      <q-route-tab
        name="profile"
        key="4"
        :icon="
          $route.name === 'UserPage'
            ? 'mdi-calendar-star'
            : 'mdi-calendar-star-outline'
        "
        :label="$q.screen.gt.xs ? undefined : 'Calendar'"
        content-class="tab"
        :ripple="false"
        :to="
          currentUser
            ? {
                name: 'UserPage',
                params: { username: currentUser.username },
              }
            : { path: '/login', query: { from: $route.path } }
        "
        exact
      />

      <!--
      <q-tab
        key="4"
        name="profile"
        :icon="
          sidebarPanel === 'profile'
            ? 'mdi-account-circle'
            : 'mdi-account-circle-outline'
        "
        :label="$q.screen.gt.xs ? undefined : 'You'"
        content-class="tab"
        :ripple="false"
      />-->
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
    clickLocation() {
      this.getFineLocation();
      this.sidebarPanel = 'nearby';
      this.showPanel = true;
    },
    updateNav(val) {
      // sidebarpanel should always be set to something
      // if using vmodel it will change to null when route changes
      if (val) {
        this.sidebarPanel = val;
      }
    },
  },

  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useMainStore, [
      'sidebarPanel',
      'showPanel',
      'fineLocation',
    ]),
    ...mapState(useMainStore, [
      'fineLocation',
      'userLocationLoading',
      'userLocationCity',
      'userLocation',
      'userLocationCountry',
    ]),
    ...mapWritableState(useQueryStore, ['controlFavorites']),
    computedPanelName() {
      switch (this.sidebarPanel) {
        case 'nearby':
          if (this.userLocationCity) {
            if (this.$q.screen.gt.sm) {
              return (
                'Near ' +
                this.userLocationCity +
                ', ' +
                this.userLocationCountry
              );
            } else {
              return 'Near ' + this.userLocationCity;
            }
          } else {
            return 'Finding your location...';
          }
        case 'explore':
          return 'Explore Events';
        case 'favorites':
          return 'Your calendar';

        case 'profile':
          return 'Your profile';
        case 'search':
          return 'Search results';
      }
      return '';
    },
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
    //border-top: 1px solid rgba(255, 255, 255, 0.2);
    :deep(.q-tabs) {
      .q-tab {
        color: $ti-4 !important;

        &.q-tab--active {
          background: $bi-4;
          //border: 1px solid rgba(255, 255, 255, 0.3);
          color: white !important;
        }
      }
    }
  }
}
.body--light {
  .navigation-bar {
    //box-shadow: rgba(100, 100, 111, 0.15) 0px 7px 29px 0px;
    //background: white;
    :deep(.q-tabs) {
      .q-tab {
        color: $t-4 !important;

        &.q-tab--active {
          background: $b-3;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: black !important;
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
    right: 12px;

    .q-tab {
      padding-top: 4px;
      //padding-bottom: 4px;
      padding: 8px;
      margin: 16px 4px;
      border-radius: 18px;
      transition: all 0.3s;

      opacity: 1 !important;
      border: 1px solid transparent;
      &.q-tab--active {
      }
      &.q-tab--inactive {
        color: grey;
        // opacity: 0.3 !important;
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
      //background: black;
      background: $bi-2;
      //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.8);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      :deep(.q-tabs) {
        color: $ti-2 !important;

        .q-tab {
          color: white !important;
          &.q-tab--active {
            // background: $bi-4;
            color: white !important;

            border: 1px solid rgba(255, 255, 255, 0.3);
          }
        }
      }
      //box-shadow: 0px 0px 46px -6px rgb(230,230,230);
    }
  }
  .body--light {
    .navigation-bar {
      background: white;
      //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.1);
      border-top: 1px solid $b-4;
      box-shadow: rgba(100, 100, 111, 0.25) 0px 7px 29px 0px;

      :deep(.q-tabs) {
        .q-tab {
          color: black;
          color: $t-1 !important;
          &.q-tab--active {
            // background: $bi-4;
            color: black !important;
          }
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
      //height: 64px;
      .q-tab {
        min-height: 68px;
        padding: 0px !important;
        opacity: 0.3 !important;
        margin: 0px 0px;
        border-radius: 0px !important;
        transition: all 0.3s;
        border: none !important;
        &.q-tab--active {
          opacity: 1 !important;
          background: unset !important;
          font-weight: 600 !important;

          .q-tab__label {
            font-weight: 600 !important;
          }
        }
        &.inactive-tab {
          opacity: 0.3 !important;
          .q-tab__label {
            font-weight: 600 !important;
          }
        }
        .q-tab__label {
          // font-weight: 600;
          font-size: 0.9em !important;
        }
      }

      :deep(.q-tab__icon) {
        padding: 6px 4px;
      }
    }
  }
}
</style>
