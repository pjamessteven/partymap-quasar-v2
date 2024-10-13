<template>
  <div
    class="popup-search-component flex row items-center no-wrap"
    :class="{
      'overlaying-map': overlayingMap,
      'center-absolute': $route.name !== 'Explore' && $q.screen.gt.xs,
    }"
  >
    <div class="controls-wrapper flex no-wrap q-mr-sm">
      <div class="controls-wrapper-inner flex row items-center no-wrap q-pa-xs">
        <q-btn
          no-caps
          @click="() => (sidebarPanel = 'search')"
          class="button-control flex grow items-start q-ml-sm"
          :class="{
            active: sidebarPanel === 'search',
          }"
        >
          <div class="flex items-center row no-wrap">
            <div class="q-mr-x" style="white-space: nowrap">Any Dates</div>
          </div>
        </q-btn>
        <div class="separator vertical q-mx-sm" />

        <q-btn
          no-caps
          @click="() => (sidebarPanel = 'search')"
          class="button-control flex grow items-start"
          :class="{
            active: sidebarPanel === 'search',
          }"
        >
          <div class="flex items-center row no-wrap">
            <div class="q-mr-x" style="white-space: nowrap">All Tags</div>
          </div>
        </q-btn>
        <div class="separator vertical q-mx-sm" />

        <q-btn
          no-caps
          @click="() => (sidebarPanel = 'search')"
          class="button-control flex grow items-start"
          :class="{
            active: sidebarPanel === 'search',
          }"
        >
          <div class="flex items-center row no-wrap">
            <div class="q-mr-x" style="white-space: nowrap">All Artists</div>
          </div>
        </q-btn>
        <div class="separator vertical q-mx-sm" />

        <q-btn
          v-if="$q.screen.gt.xs"
          no-caps
          @click="() => (sidebarPanel = 'search')"
          class="button-control flex grow items-start q-mr-sm"
          :class="{
            active: sidebarPanel === 'search',
          }"
        >
          <div class="flex items-center row no-wrap">
            <div class="q-mr-x" style="white-space: nowrap">Search</div>
          </div>
        </q-btn>

        <div style="background: white; border-radius: 100%">
          <q-icon class="mdi mdi-magnify q-pa-sm" size="1rem" color="black" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useSearchStore } from 'src/stores/search';
import { useQueryStore } from 'src/stores/query';

export default {
  components: {},
  props: ['overlayingMap'],
  data() {
    return {};
  },
  watch: {
    controlArtist: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
        }
      },
      deep: true,
    },
    controlTag: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
        }
      },
      deep: true,
    },
    controlDateRange: {
      handler(newVal) {
        if (newVal && newVal.end) {
          this.goToExplore();
        }
      },
      deep: true,
    },
    controlSize: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
        }
      },
      deep: true,
    },
    controlDuration: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
        }
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions(useMainStore, ['loadIpInfo', 'getFineLocation']),
    goToExplore() {
      this.sidebarPanel = 'explore';
      if (this.$route.name !== 'Explore') {
        this.$router.push({ name: 'Explore', query: { view: 'explore' } });
      }
    },
    clickLocation() {
      this.getFineLocation();
      this.sidebarPanel = 'nearby';
    },
  },
  computed: {
    ...mapWritableState(useSearchStore, ['query', 'searchbarShowing']),
    ...mapWritableState(useMainStore, [
      'sidebarPanel',
      'showPanel',
      'menubarOpacity',
    ]),
    ...mapState(useMainStore, [
      'fineLocation',
      'userLocationLoading',
      'currentLocationCity',
      'currentLocation',
    ]),
    ...mapState(useQueryStore, [
      'controlDateRange',
      'controlFavorites',
      'controlDuration',
      'controlSize',
      'controlArtist',
      'controlTag',
      'controlCountry',
      'controlRegion',
      'controlLocality',
      'anyFiltersEnabled',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .popup-search-component {
    .controls-wrapper {
      // box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

      .controls-wrapper-inner {
        background: $b-2;
        color: $t-1;
        border: 1px solid rgba(0, 0, 0, 0.1);
        .separator {
          border-color: $b-4;
        }

        :deep(.button-control) {
          &.active {
            background: white;
            color: $t-1;
          }
          .q-btn__content {
            .close-icon-wrapper {
              background: $bi-4;
              color: white;
            }
          }
        }
        :deep(.searchbar-wrapper) {
          .searchbar-input {
            .q-field__inner {
              .q-placeholder::placeholder {
                opacity: 1;
              }
              input {
                color: black !important;
              }
            }
          }
        }
      }
    }
    &.overlaying-map {
      .controls-wrapper {
        backdrop-filter: blur(40px);
        //   box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

        .controls-wrapper-inner {
          background: linear-gradient(
            rgba(100, 100, 100, 0.48),
            rgba(100, 100, 100, 0.68)
          );
          color: $ti-1;
          border-top: 2px solid rgba(255, 255, 255, 0.1);
          border-bottom: 2px solid rgba(255, 255, 255, 0.05);
          border-left: 2px solid rgba(255, 255, 255, 0.1);
          border-right: 2px solid rgba(255, 255, 255, 0.1);
          .separator {
            border-color: grey;
          }

          :deep(.searchbar-wrapper) {
            .searchbar-input {
              .q-field__inner {
                .q-placeholder::placeholder {
                  opacity: 1;
                }
                input {
                  color: white !important;
                }
                .q-field__marginal {
                  font-size: unset;
                  color: white !important;
                }
              }
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
  .popup-search-component {
    .separator {
      border-color: $bi-4;
    }
    .controls-wrapper {
      .controls-wrapper-inner {
        .separator {
          border-color: $bi-4;
        }
        color: $ti-2;
        background: $bi-3;

        //background: rgba(0, 0, 0, 0.5);

        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        :deep(.button-control) {
          .q-btn__content {
            .close-icon-wrapper {
              background: $bi-4;
              color: white;
            }
          }
          &.active {
            background: white;
            color: $t-1;
          }
        }
      }
    }
    &.overlaying-map {
      .controls-wrapper {
        backdrop-filter: blur(40px);
        // box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

        .controls-wrapper-inner {
          background: rgba(100, 100, 100, 0.4);
          color: $ti-2;
          //border: 1px solid rgba(255, 255, 255, 0.15);
        }
      }
    }
  }
}

.popup-search-component {
  z-index: 104;
  position: absolute;
  top: 32px;
  margin-right: 196px;
  width: 100%;
  display: flex;
  pointer-events: none;
  //max-width: 33vw;
  justify-content: center;
  //overflow-x: auto;
  //overflow-y: visible;
  &.center-absolute {
    position: absolute;
    width: 100%;
    justify-content: center;
  }

  .controls-wrapper {
    pointer-events: all;
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

      .separator {
        height: 16px;
        border-left: 1px solid;
        margin-left: -1px;
        margin-right: -1px;
      }

      :deep(.searchbar-wrapper) {
        padding-left: 18px;
        padding-right: 18px;
        margin-top: 2px;

        .searchbar-input {
          margin-top: -4px;
          .q-field__inner {
            .q-field__control::before {
              border-color: transparent;
              border: none;
              font-size: larger;
            }
            .q-field__marginal {
              font-size: unset;
              font-size: larger;
            }
            input {
              font-weight: 500;
            }
          }
        }
      }

      :deep(.q-btn::before) {
        box-shadow: none !important;
      }
      :deep(.button-control) {
        font-weight: 600 !important;

        .button-label {
          white-space: nowrap;
        }
        .q-btn__content {
          .close-icon-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 48px;
            padding: 2px;
            margin-right: 8px;
            margin-left: -6px;
          }

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
}

.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}

@media only screen and (max-width: 1576px) {
  .popup-search-component {
    margin-right: 0px;
    .control-scroll-area {
      .scroll-inner {
        justify-content: flex-start;
      }
    }
  }
  .center-absolute {
    .control-scroll-area {
      .scroll-inner {
        justify-content: center !important;
      }
    }
  }
}
@media only screen and (max-width: 1376px) {
  .popup-search-component {
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
@media only screen and (max-width: 1024px) {
  .body--light {
    .popup-search-component {
      .controls-wrapper {
        box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

        .controls-wrapper-inner {
          background: $b-2;
          color: $t-1;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
      }
      &.overlaying-map {
        .controls-wrapper {
          backdrop-filter: blur(10px);

          .controls-wrapper-inner {
          }
        }
      }
    }
  }

  .body--dark {
    .popup-search-component {
      .controls-wrapper {
        box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

        .controls-wrapper-inner {
          color: $ti-2;
          background: $bi-3;

          //background: rgba(0, 0, 0, 0.5);
        }
      }
      &.overlaying-map {
        .controls-wrapper {
          backdrop-filter: blur(10px);

          .controls-wrapper-inner {
          }
        }
      }
    }
  }
  .popup-search-component {
    position: absolute;
    top: 64px;
    .control-scroll-area {
      .scroll-inner {
        padding-left: 16px;
      }
    }
  }
}
@media only screen and (max-width: 1024px) and (min-width: 600px) {
  .popup-search-component {
    .control-scroll-area {
      .scroll-inner {
        padding-left: 24px;
        justify-content: center;
      }
    }
  }
}

@media only screen and (max-width: 600px) {
  .popup-search-component {
    .control-scroll-area {
      .scroll-inner {
        .mobile-search-wrapper {
          width: 100%;
        }
      }
    }
  }
}
</style>
