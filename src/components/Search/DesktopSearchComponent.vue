<template>
  <div class="search-component flex row items-center">
    <div
      class="controls-wrapper flex no-wrap"
      @click="() => (showSearch = !showSearch)"
    >
      <div
        class="controls-wrapper-inner"
        :class="showPanel ? 'show-panel' : ''"
      >
        <q-btn
          no-caps
          @click="
            () => {
              searchbarShowing = true;
            }
          "
          style="padding-left: 8px; width: 100%"
          class="button-control flex grow items-start q-py-sm"
          :class="{
            active: sidebarPanel === 'search',
          }"
        >
          <div class="flex items-center row no-wrap t2">
            <div class="button-label flex row items-center row no-wrap">
              <div class="q-mr-sm q-ml-md">
                <i class="mdi mdi-magnify" />
              </div>
              <div>Search for places, artists or events</div>
            </div>
          </div>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useSearchStore } from 'src/stores/search';

export default {
  components: {},
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
  .search-component {
    .controls-wrapper {
      box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

      .controls-wrapper-inner {
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
  .controls-wrapper-inner {
    //
    background: white !important;
    //background: #f5f5f5;
    color: $t-1;
    //border: 1px solid rgba(0, 0, 0, 0.1);
    //box-shadow: none;
  }
  .search-popup-wrapper {
    background: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
.body--dark {
  .controls-wrapper-inner {
    color: $ti-1;
    background: $bi-1;

    //background: rgba(0, 0, 0, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }
}
.search-component {
  z-index: 104;
  position: absolute;
  top: 72px;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
  //max-width: 33vw;
  .controls-wrapper {
    //z-index: 105;
    justify-content: center;
    position: relative;
    border-radius: 48px;

    overflow: hidden;
    .controls-wrapper-inner {
      pointer-events: all;

      // stupid border radius fix for ios 15
      -webkit-transform: translateZ(0);
      -webkit-mask-image: -webkit-radial-gradient(
        circle,
        white 100%,
        black 100%
      );

      //transition: all 0.3s;
      cursor: pointer;
      width: 510px;
      height: 100%;
      border-radius: 48px;

      position: relative;
      .location-button-wrapper {
        position: absolute;
        left: -80px;
        top: 4px;
        border-radius: 24px;
        background: transparent;
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

@media only screen and (max-width: 1280px) {
  .search-component {
    width: 100%;
    display: flex;
    justify-content: center;
    left: unset;
    padding: 0 16px;
    top: 72px;
    //max-width: 50vw;
  }
}
@media only screen and (max-width: 1681px) {
  .search-component {
    //width: 50vw;
    //max-width: 50vw;
    .sidebar-content {
    }
  }
}

@media only screen and (max-width: 599px) {
  .body--light {
    .controls-wrapper-inner {
      box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 1);
      border: 1px solid rgba(0, 0, 0, 0.05);

      &.show-panel {
        box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);
      }
    }
  }
  .body--dark {
    .controls-wrapper-inner {
      border: 1px solid $bi-3;
      background: $bi-2;
      box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.4);
    }
  }

  .search-component {
    width: 100vw;
    max-width: 100vw;
    // android
    @supports ((top: var(--safe-area-inset-top))) {
      top: calc(68px + var(--safe-area-inset-top));
    }
    // ios specific padding
    @supports (
      (top: env(safe-area-inset-top)) and (font: -apple-system-body) and
        (-webkit-appearance: none)
    ) {
      top: calc(68px + env(safe-area-inset-top));
    }
    .controls-wrapper {
      .controls-wrapper-inner {
      }
    }
  }

  .native-mobile {
    // ios specific padding for capcaitor app
    .search-component {
      @supports (
        (top: env(safe-area-inset-top)) and (font: -apple-system-body) and
          (-webkit-appearance: none)
      ) {
        top: calc(68px + env(safe-area-inset-top) - 8px);
      }
    }
  }
}
</style>
