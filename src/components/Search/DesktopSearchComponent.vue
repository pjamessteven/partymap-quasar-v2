<template>
  <div
    class="desktop-search-component flex row items-center no-wrap"
    :class="{
      'overlaying-map': overlayingMap,
      'center-absolute': $route.name !== 'Explore',
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
      <div class="scroll-inner flex row no-wrap items-center">
        <div
          v-if="$q.screen.gt.md"
          class="controls-wrapper flex no-wrap"
          @click="() => (showSearch = !showSearch)"
        >
          <div class="controls-wrapper-inner">
            <div class="searchbar-wrapper">
              <q-input
                @keydown.esc="
                  () => {
                    $refs.search.blur();

                    clearSearch();
                  }
                "
                ref="search"
                borderless
                style="width: 260px"
                dense
                autofocus
                @focus="onSearchbarFocus()"
                @clear="clearSearch()"
                class="searchbar-input inter bold"
                v-model="query"
                @keyup.enter="() => $refs.search.blur()"
                placeholder="Search places, artists and events"
              >
                <template v-slot:prepend>
                  <div class="q-mr-xs q-ml-">
                    <i class="mdi mdi-magnify" />
                  </div>
                </template>
                <template v-slot:append>
                  <div
                    class="search-button"
                    v-if="query?.length"
                    @click="clearSearch()"
                  >
                    <q-icon
                      name="mdi-close"
                      style="cursor: pointer"
                      size="large"
                    ></q-icon>
                  </div>
                </template>
              </q-input>
            </div>
            <!--
            <q-btn
              v-else
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
            -->
          </div>
        </div>
        <div
          class="flex row items-center no-wrap q-mr-md"
          v-if="$route.name === 'Explore'"
        >
          <!--<div class="text-white q-ml-md">Filter:</div>-->
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
          <div
            class="controls-wrapper flex no-wrap q-ml-sm"
            v-if="$q.screen.gt.xs"
          >
            <div
              class="controls-wrapper-inner q-pa-sm"
              style="width: 42px; text-align: center"
            >
              ...
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
import { useSearchStore } from 'src/stores/search';
import ArtistControl from 'src/components/Controls/ArtistControl.vue';
import DateControl from 'src/components/Controls/DateControl.vue';
import DurationControl from 'src/components/Controls/DurationControl.vue';
import SizeControl from 'src/components/Controls/SizeControl.vue';
import TagControl from 'src/components/Controls/TagControl.vue';
import CustomQScroll from 'components/CustomQScroll.vue';

export default {
  components: {
    CustomQScroll,
    ArtistControl,
    DateControl,
    DurationControl,
    SizeControl,
    TagControl,
  },
  props: ['overlayingMap'],
  data() {
    return {
      showSearch: false,
      previousSidebarPanel: '',
      previousShowPanel: '',
    };
  },
  watch: {
    sidebarPanel(newv, oldv) {
      // so we can return to previous sidebar panel after triggering search
      this.previousSidebarPanel = oldv;
    },
    query(newv) {
      if (newv?.length > 0) {
        this.showPanel = true;
        this.sidebarPanel = 'search';
        if (this.$route.name !== 'Explore') {
          this.$router.push({ name: 'Explore' });
        }
      } else {
        this.hideResultsAndPreviousPanel();
      }
    },
  },
  methods: {
    ...mapActions(useMainStore, ['loadIpInfo', 'getFineLocation']),

    clickLocation() {
      this.getFineLocation();
      this.sidebarPanel = 'nearby';
    },
    hideResultsAndPreviousPanel() {
      if (this.sidebarPanel === 'search') {
        // hide results and restore previous sidebar state
        this.sidebarPanel = this.previousSidebarPanel;
        if (this.sidebarPanel === 'explore') {
          this.showPanel = false;
        }
      }
    },
    clearSearch() {
      this.query = null;
      this.searchbarShowing = false;
      this.hideResultsAndPreviousPanel();
    },
    onSearchbarFocus() {
      if (this.query?.length > 0) {
        this.sidebarPanel = 'search';
        this.showPanel = true;
      }
    },
    onSearchbarBlur() {
      if (!this.query || this.query.length === 0) {
        this.searchbarShowing = false;
        this.hideResultsAndPreviousPanel();
      }
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
      // box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

      .controls-wrapper-inner {
        background: $b-3;
        color: $t-1;
        border: 1px solid rgba(0, 0, 0, 0.05);
        .searchbar-wrapper {
          .searchbar-input {
            :deep(.q-field__inner) {
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
        box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

        .controls-wrapper-inner {
          background: rgba(255, 255, 255, 0.3);
          color: $ti-1;
          border: 1px solid rgba(255, 255, 255, 0.1);

          .searchbar-wrapper {
            .searchbar-input {
              :deep(.q-field__inner) {
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
  .desktop-search-component {
    .controls-wrapper {
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
    &.overlaying-map {
      .controls-wrapper {
        backdrop-filter: blur(40px);
        box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

        .controls-wrapper-inner {
          background: rgba(100, 100, 100, 0.4);
          color: $ti-2;
          border: 1px solid rgba(255, 255, 255, 0.15);
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

          .searchbar-wrapper {
            padding-left: 18px;
            padding-right: 18px;
            margin-top: 2px;

            .searchbar-input {
              margin-top: -4px;
              :deep(.q-field__inner) {
                .q-field__control::before {
                  border-color: transparent;
                  border: none;
                  font-size: larger;
                }
                .q-field__marginal {
                  font-size: unset;
                }
              }
            }
          }

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

      .search-dialog {
        z-index: 1000;
      }
    }
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
@media only screen and (max-width: 600px) {
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
          backdrop-filter: none;

          .controls-wrapper-inner {
            background: $b-1;
            color: $t-1;
            border: 1px solid rgba(0, 0, 0, 0.05);
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
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
      }
      &.overlaying-map {
        .controls-wrapper {
          backdrop-filter: none;

          .controls-wrapper-inner {
            background: $bi-3;
          }
        }
      }
    }
  }
  .desktop-search-component {
    .control-scroll-area {
      .scroll-inner {
        padding-left: 8px;
      }
    }
  }
}
</style>
