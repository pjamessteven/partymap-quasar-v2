<template>
  <div
    class="desktop-search-component flex row items-center no-wrap"
    :class="{
      'overlaying-map': overlayingMap,
      'center-absolute': $route.name !== 'Explore',
    }"
  >
    <div
      class="controls-wrapper flex no-wrap"
      @click="() => (showSearch = !showSearch)"
    >
      <div class="controls-wrapper-inner">
        <q-btn
          no-caps
          @click="
            () => {
              searchbarShowing = true;
            }
          "
          style="padding-left: 8px; width: 100%"
          class="button-control flex grow items-start"
          :class="{
            active: sidebarPanel === 'search',
          }"
        >
          <div class="flex items-center row no-wrap">
            <div class="flex row items-center row no-wrap">
              <div class="q-mr-sm q-ml-sm">
                <i class="mdi mdi-magnify" />
              </div>
              <div
                class="q-mr-sm"
                v-if="$q.screen.gt.sm"
                style="white-space: nowrap"
              >
                Search for places, artists or events
              </div>
              <div class="q-mr-sm" style="white-space: nowrap" v-else>
                Search everything
              </div>
            </div>
          </div>
        </q-btn>
      </div>
    </div>
    <div class="flex row items-center no-wrap" v-if="$route.name === 'Explore'">
      <div class="controls-wrapper flex no-wrap q-ml-sm">
        <div class="controls-wrapper-inner">
          <DateControl />
        </div>
      </div>
      <div class="controls-wrapper flex no-wrap q-ml-sm">
        <div class="controls-wrapper-inner">
          <TagControl />
        </div>
      </div>
      <div class="controls-wrapper flex no-wrap q-ml-sm">
        <div class="controls-wrapper-inner">
          <ArtistControl />
        </div>
      </div>
      <div class="controls-wrapper flex no-wrap q-ml-sm" v-if="$q.screen.lt.xl">
        <div class="controls-wrapper-inner q-pa-sm q-ma-xs q-px-md">...</div>
      </div>
      <div class="controls-wrapper flex no-wrap q-ml-sm" v-if="$q.screen.gt.lg">
        <div class="controls-wrapper-inner">
          <SizeControl />
        </div>
      </div>
      <div class="controls-wrapper flex no-wrap q-ml-sm" v-if="$q.screen.gt.lg">
        <div class="controls-wrapper-inner">
          <DurationControl />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useSearchStore } from 'src/stores/search';
import ArtistControl from 'src/components/Controls/ArtistControl.vue';
import DateControl from 'src/components/Controls/DateControl.vue';
import DurationControl from 'src/components/Controls/DurationControl.vue';
import SizeControl from 'src/components/Controls/SizeControl.vue';
import TagControl from 'src/components/Controls/TagControl.vue';
export default {
  components: {
    ArtistControl,
    DateControl,
    DurationControl,
    SizeControl,
    TagControl,
  },
  props: ['overlayingMap'],
  data() {
    return { showSearch: false };
  },
  methods: {
    ...mapActions(useMainStore, ['loadIpInfo', 'getFineLocation']),

    clickLocation() {
      this.getFineLocation();
      this.sidebarPanel = 'nearby';
    },
  },
  computed: {
    ...mapWritableState(useSearchStore, ['query']),
    ...mapWritableState(useMainStore, [
      'sidebarPanel',
      'showPanel',
      'menubarOpacity',
    ]),
    ...mapState(useMainStore, [
      'fineLocation',
      'userLocationLoading',
      'userLocationCity',
      'userLocation',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .desktop-search-component {
    .controls-wrapper {
      //box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

      .controls-wrapper-inner {
        background: $b-3;
        color: $t-1;

        .location-button-wrapper {
          //background: white;
          color: $ti-1;
          .q-btn {
            color: $ti-1;
          }
          &.show-panel {
            .q-btn {
              color: $t-1;
            }
          }
        }
      }
    }
  }

  .search-popup-wrapper {
    background: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
.body--dark {
  .controls-wrapper-inner {
    color: $ti-2;
    background: $bi-3;

    //background: rgba(0, 0, 0, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }
}
.desktop-search-component {
  z-index: 104;
  //position: absolute;
  //top: 16px;
  margin-right: 228px;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
  //max-width: 33vw;
  &.center-absolute {
    position: absolute;
    width: 100%;
    justify-content: center;
  }
  .controls-wrapper {
    //z-index: 105;
    justify-content: center;
    position: relative;
    border-radius: 48px;

    overflow: hidden;
    .controls-wrapper-inner {
      pointer-events: all;
      overflow: hidden;
      //transition: all 0.3s;
      cursor: pointer;
      // width: 510px;
      height: 100%;
      border-radius: 48px;

      position: relative;
      :deep(.q-btn::before) {
        box-shadow: none !important;
      }
      :deep(.q-btn) {
        .button-label {
          white-space: nowrap;
        }
      }

      .location-button-wrapper {
        position: absolute;
        left: -80px;
        top: 4px;
        border-radius: 24px;
        background: transparent;
      }
    }
  }
  &.overlaying-map {
    .controls-wrapper {
      backdrop-filter: blur(40px);
      box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

      .controls-wrapper-inner {
        background: rgba(255, 255, 255, 0.3) !important;
        color: $ti-2 !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
    }
  }
  .search-dialog {
    z-index: 1000;
  }
}

.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}

@media only screen and (min-width: 1921px) {
  .search-component {
  }
}
@media only screen and (max-width: 1576px) {
  .desktop-search-component {
    margin-right: 0px;
  }
}
@media only screen and (max-width: 1376px) {
  .desktop-search-component {
    //top: 72px;
    //max-width: 50vw;
    margin-right: 0px;
    .controls-wrapper {
      .controls-wrapper-inner {
        :deep(.q-btn) {
          .button-label {
            // display: none;
          }
        }
      }
    }
  }
}
</style>
