<template>
  <div
    class="desktop-search-component flex row items-center no-wrap"
    :class="{
      'transport-map': mapStyle === 'transport',
      'overlaying-map': overlayingMap,
      'center-absolute': $route.name !== 'Explore' && $q.screen.gt.xs,
    }"
  >
    <CustomQScroll
      ref="scroll"
      horizontal
      class="control-scroll-area"
      :thumb-style="
        $q.screen.gt.xs
          ? { bottom: '0px', height: '4px' }
          : { bottom: '0px', marginLeft: '16px', height: '0px' }
      "
    >
      <div
        class="scroll-inner flex row no-wrap items-center q-mr-md"
        v-if="$route.name === 'Explore' || $q.screen.lt.sm"
      >
        <div
          class="flex items-center no-wrap scroll-inner-inner"
          v-show="
            $q.screen.gt.md || ($q.screen.lt.lg && sidebarPanel === 'search')
          "
        >
          <q-icon
            @click="() => $router.go(-1)"
            class="q-pr-md q-pl-sm"
            size="sm"
            name="mdi-chevron-left"
            v-if="$q.screen.lt.lg && sidebarPanel === 'search'"
          />
          <div
            class="controls-wrapper flex no-wrap q-mr-sm"
            :class="{
              'mobile-search-wrapper':
                $q.screen.lt.lg && sidebarPanel === 'search',
            }"
          >
            <div class="controls-wrapper-inner">
              <SearchComponent />
            </div>
          </div>
        </div>
        <div
          class="flex row items-center no-wrap"
          v-show="$q.screen.gt.md || sidebarPanel !== 'search'"
        >
          <div
            class="controls-wrapper flex no-wrap q-mr-sm"
            v-if="$q.screen.gt.xs && $q.screen.lt.lg"
          >
            <div class="controls-wrapper-inner">
              <q-btn
                no-caps
                @click="() => (sidebarPanel = 'search')"
                style="padding-left: 8px"
                class="button-control flex grow items-start"
                :class="{
                  active: sidebarPanel === 'search',
                }"
              >
                <div class="flex items-center row no-wrap">
                  <div class="flex row items-center row no-wrap">
                    <div class="q-mr-sm q-ml-sm">
                      <q-icon
                        size="1.5em"
                        name="mdi-magnify"
                        v-if="!controlDateRangeSelectedOption?.value"
                      />
                    </div>
                    <div class="q-mr-sm" style="white-space: nowrap">
                      Search
                    </div>
                  </div>
                </div>
              </q-btn>
            </div>
          </div>
          <div
            class="separator vertical"
            v-if="$q.screen.gt.lg && false"
            :class="{ 'q-mx-md': $q.screen.gt.md }"
          />
          <!--<div class="text-white q-ml-md">Filter:</div>-->
          <div class="controls-wrapper flex no-wrap">
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

          <div
            class="controls-wrapper flex no-wrap q-ml-sm"
            v-if="$q.screen.gt.xs"
          >
            <div class="controls-wrapper-inner">
              <div style="height: 100%">
                <q-btn
                  class="button-control"
                  :class="{
                    active:
                      (controlSize && controlSize.length > 0) ||
                      (controlDuration && controlDuration.length > 0),
                  }"
                  >...
                  <q-menu
                    transition-show="jump-down"
                    transition-hide="jump-up"
                    anchor="bottom right"
                    self="top right"
                    class="more-menu"
                    max-height="100vh"
                  >
                    <q-item>
                      <SizeControl />
                    </q-item>
                    <q-item>
                      <DurationControl />
                    </q-item>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </div>

          <div
            class="controls-wrapper flex no-wrap q-ml-sm"
            v-if="$q.screen.lt.sm"
          >
            <div class="controls-wrapper-inner">
              <SizeControl />
            </div>
          </div>
          <div
            class="controls-wrapper flex no-wrap q-ml-sm"
            v-if="$q.screen.lt.sm"
          >
            <div class="controls-wrapper-inner">
              <DurationControl />
            </div>
          </div>
        </div>
      </div>
    </CustomQScroll>
  </div>
</template>

<script>
import { mapState, mapActions, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useMapStore } from 'src/stores/map';
import { useSearchStore } from 'src/stores/search';
import { useQueryStore } from 'src/stores/query';
import ArtistControl from 'src/components/Controls/ArtistControl.vue';
import DateControl from 'src/components/Controls/DateControl.vue';
import DurationControl from 'src/components/Controls/DurationControl.vue';
import SizeControl from 'src/components/Controls/SizeControl.vue';
import TagControl from 'src/components/Controls/TagControl.vue';
import CustomQScroll from 'components/CustomQScroll.vue';
import SearchComponent from './SearchComponent.vue';
export default {
  components: {
    CustomQScroll,
    ArtistControl,
    DateControl,
    DurationControl,
    SizeControl,
    TagControl,
    SearchComponent,
  },
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
    ...mapState(useMapStore, ['mapStyle']),
    ...mapWritableState(useSearchStore, ['query', 'searchbarShowing']),
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
  .desktop-search-component {
    .separator {
      color: $t-4;
    }
    .controls-wrapper {
      //box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.);

      .controls-wrapper-inner {
        background: $b-2;
        color: $t-1;
        border: 1px solid rgba(0, 0, 0, 0.1);

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
              .q-field__marginal {
                font-size: unset !important;
              }
            }
          }
        }
      }
    }
    &.overlaying-map {
      .separator {
        color: $ti-4;
      }
      .controls-wrapper {
        backdrop-filter: blur(40px);
        //   box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

        .controls-wrapper-inner {
          //background: rgba(255, 255, 255, 0.3);
          background: linear-gradient(
            rgba(100, 100, 100, 0.68),
            rgba(100, 100, 100, 0.68)
          );
          color: $ti-1;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);

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
      &.transport-map {
        .controls-wrapper {
          backdrop-filter: none;

          .controls-wrapper-inner {
            border: 1px solid rgba(0, 0, 0, 0.2);
            background: white;
            color: $t-1;

            :deep(.searchbar-wrapper) {
              .searchbar-input {
                .q-field__inner {
                  .q-placeholder::placeholder {
                    opacity: 1;
                  }
                  input {
                    color: $t-1 !important;
                  }
                  .q-field__marginal {
                    font-size: unset;
                    color: $t-1 !important;
                  }
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
  .desktop-search-component {
    .separator {
      color: $ti-4;
    }
    .controls-wrapper {
      .controls-wrapper-inner {
        color: $ti-2;
        background: $bi-3;

        //background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);

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
      .separator {
        color: $ti-4;
      }
      .controls-wrapper {
        backdrop-filter: blur(40px);
        // box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

        .controls-wrapper-inner {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);

          background: linear-gradient(
            rgba(80, 80, 80, 0.6),
            rgba(80, 80, 80, 0.6)
          );
          color: $ti-2;
          //border: 1px solid rgba(255, 255, 255, 0.15);
        }
      }
    }
  }
}

.desktop-search-component {
  z-index: 104;
  //position: absolute;
  //top: 16px;
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

  .control-scroll-area {
    height: 40px;
    width: 100%;
    .scroll-inner {
      justify-content: center;
      pointer-events: all;
      .separator {
        height: 16px;
        border-left: 1px solid;
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
            height: 38px;
            .button-label {
              white-space: nowrap;
              font-weight: 500;
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
  }
}

.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}

@media only screen and (max-width: 1576px) {
  .desktop-search-component {
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
@media only screen and (max-width: 1024px) {
  .body--light {
    .desktop-search-component {
      .controls-wrapper {
        //box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

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
    .desktop-search-component {
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
            //    background: rgba(60, 60, 60, 0.68);
          }
        }
      }
    }
  }
  .desktop-search-component {
    .control-scroll-area {
      .scroll-inner {
        padding-left: 16px;
      }
    }
  }
}
@media only screen and (max-width: 1024px) and (min-width: 600px) {
  .desktop-search-component {
    .control-scroll-area {
      .scroll-inner {
        padding-left: 24px;
        justify-content: center;
      }
    }
  }
}

@media only screen and (max-width: 600px) {
  .desktop-search-component {
    .control-scroll-area {
      pointer-events: all;

      .scroll-inner {
        .scroll-inner-inner {
          width: 100%;
          .mobile-search-wrapper {
            width: 100%;
            .controls-wrapper-inner {
              width: 100%;
              :deep(.searchbar-wrapper) {
                .searchbar-input {
                  width: 100% !important;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
