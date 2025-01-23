<template>
  <div class="navigation-bar justify-between flex row no-wrap items-center">
    <q-tabs
      :class="{
        'light-button': color === 'white',
        ' bolder desktop-tabs': $q.screen.gt.xs,
      }"
      class="tabs"
      @click.stop
      :model-value="sidebarPanel"
      @update:model-value="updateNav"
      no-caps
      :indicator-color="'transparent'"
      :active-class="'active-tab'"
    >
      <q-route-tab
        v-show="false"
        :to="{ name: 'Explore', query: { view: 'explore' } }"
        :class="{
          'q-tab--active': sidebarPanel == 'nearby',
        }"
        key="1"
        name="explore"
        content-class="tab"
        :label="$t('nav.home')"
        :ripple="false"
        :icon="
          $q.screen.lt.sm
            ? sidebarPanel === 'nearby'
              ? 'mdi-home'
              : 'mdi-home-outline'
            : undefined
        "
      />

      <q-route-tab
        :to="{ query: { view: 'nearby' }, name: 'Explore' }"
        @click="() => (showPanel = false)"
        key="2"
        name="nearby"
        :label="$t('nav.explore')"
        :icon="
          $q.screen.lt.sm
            ? sidebarPanel === 'nearby'
              ? 'mdi-earth'
              : 'mdi-earth'
            : undefined
        "
        content-class="tab"
        :class="{
          'q-tab--active q-router-link--active active-tab':
            $route.name === 'Explore',
        }"
        :ripple="false"
      />

      <q-route-tab
        :to="{ name: 'FeaturedEvents' }"
        key="3"
        :label="$t('nav.browse')"
        name="browse"
        :icon="
          $q.screen.lt.sm
            ? $route.name === 'BrowsePage'
              ? 'mdi-calendar-search'
              : 'mdi-calendar-search-outline'
            : undefined
        "
        content-class="tab"
        :ripple="false"
      />
      <q-route-tab
        :to="{ name: 'ActivityPage' }"
        :label="$t('activity.activity')"
        exact
        key="4"
        name="activity"
        :icon="
          $q.screen.lt.sm
            ? $route.name === 'ActivityPage'
              ? 'mdi-bell'
              : 'mdi-bell-outline'
            : undefined
        "
        content-class="tab"
        :ripple="false"
      />

      <q-route-tab
        v-show="false"
        name="search"
        key="5"
        :ripple="false"
        :to="{ query: { view: 'search' }, name: 'Explore' }"
      />

      <q-route-tab
        :label="$t('nav.you')"
        :style="$q.screen.gt.xs ? 'margin-left: -2px' : ''"
        name="profile"
        key="5"
        :icon="
          $q.screen.lt.sm
            ? $route.name === 'UserPage'
              ? 'mdi-emoticon-cool'
              : 'mdi-emoticon-cool-outline'
            : undefined
        "
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

  props: { color: { type: String, default: 'black' } },
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
  watch: {
    sidebarPanel: {
      // update route to match sidebar panel value
      // easier to manage this here than in every instance where we naviate back to explore
      handler: function (newval) {
        if (newval === 'nearby') {
          if (this.$route.query.view) {
            this.$router.push({ name: 'Explore', query: { view: 'nearby' } });
          }
        } else if (newval === 'explore') {
          this.$router.push({ name: 'Explore', query: { view: 'explore' } });
        } else if (newval === 'search') {
          this.$router.push({ name: 'Explore', query: { view: 'search' } });
        }
      },
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
      'currentLocationCity',
      'currentLocation',
      'currentLocationCountry',
    ]),
    ...mapWritableState(useQueryStore, ['controlFavorites']),
    computedPanelName() {
      switch (this.sidebarPanel) {
        case 'nearby':
          if (this.currentLocationCity) {
            if (this.$q.screen.gt.sm) {
              return (
                'Near ' +
                this.currentLocationCity +
                ', ' +
                this.currentLocationCountry
              );
            } else {
              return 'Near ' + this.currentLocationCity;
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
  mounted() {
    if (this.sidebarPanel === '') {
      // no query for home view
      if (!this.$route.query.view) {
        this.sidebarPanel = 'nearby';
      } else {
        this.sidebarPanel = this.$route.query.view;
      }
    }
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

    :deep(.desktop-tabs) {
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
        &.active-tab {
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
    :deep(.desktop-tabs) {
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
        &.active-tab {
          color: $ti-1 !important;
        }
      }
    }
  }
  .nav-separator {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.1), transparent);
  }
}
.navigation-bar {
  font-family: 'Inter';
  &:lang(ru) {
    font-family: 'InterDisplay';
  }
  :deep(.desktop-tabs) {
    .q-tab {
      //padding-top: 4px;
      //padding-bottom: 4px;
      padding: 0px !important;
      margin: 6px;
      //margin: 4px 4px;
      //border-radius: 64px;
      transition: all 0.3s;
      color: white;
      background: none !important;

      opacity: 1 !important;
      border: 1px solid transparent;
      $duration: 0.4s;
      $outDuration: 0.1s;
      $distance: 10px;
      $easeOutBack: cubic-bezier(0.175, 0.885, 0.32, 1.275);

      &:before,
      &:after {
        display: none;
        content: '';
        position: absolute;
        bottom: 4px;
        left: 0;
        right: 0;
        height: 1px;
        //background-color: black;
      }
      &:before {
        opacity: 0;
        transform: translateY(-$distance);
        transition:
          transform 0s $easeOutBack,
          opacity 0s;
      }
      &:after {
        opacity: 0;
        transform: translateY($distance/2);
        transition:
          transform $duration $easeOutBack,
          opacity $duration;
      }

      .q-focus-helper {
        display: none;
      }
      .q-tab__label {
        font-weight: 400 !important;
      }
      &.q-tab--active {
        background: none !important;
        font-weight: 600 !important;

        .q-tab__label {
          font-weight: 600 !important;
        }
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
          transition:
            transform $duration $easeOutBack,
            opacity $duration;
        }
        &:after {
          transition:
            transform 0s $duration $easeOutBack,
            opacity 0s $duration;
        }
      }
    }
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
      background: black;
      //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.8);
      border-top: 1px solid rgba(255, 255, 255, 0.2);

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
    pointer-events: all;
    position: absolute;
    z-index: 1000;
    bottom: 0;
    border-bottom: none !important;
    justify-content: unset;
    @supports (top: var(--safe-area-inset-bottom)) {
      padding-bottom: calc(var(--safe-area-inset-bottom) - 16px);
    }
    :deep(.q-tabs) {
      width: 100%;
      position: relative;
      right: unset;
      //height: 64px;
      border-radius: 0px !important;

      .q-tab {
        flex-grow: 1;
        min-height: 72px;
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
          margin-top: 4px;
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
