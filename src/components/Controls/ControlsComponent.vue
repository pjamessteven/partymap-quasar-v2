<template>
  <div
    class="controls-component q-mt-md flex row items-center no-wrap"
    :class="{
      'transport-map': mapStyle !== 'satellite',
      'overlaying-map': overlayingMap,
      'center-absolute': $route.name !== 'Explore' && $q.screen.gt.xs,
      'explore-view': $route.name === 'Explore',
    }"
  >
    <!--
    <div v-if="$q.screen.gt.sm" class="controls-wrapper flex no-wrap q-mr-sm">
      <div class="controls-wrapper-inner">
        <SearchComponent />
      </div>
    </div>
    -->
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
        class="scroll-inner flex row no-wrap items-center q-mr-md q-pl-xs"
        :class="{}"
      >
        <div
          class="flex items-center no-wrap scroll-inner-inner"
          v-show="$q.screen.lt.lg && sidebarPanel === 'search'"
        >
          <q-icon
            @click="() => $router.go(-1)"
            class="q-pr-md q-pl-sm"
            size="sm"
            name="mdi-chevron-left"
            v-if="$q.screen.lt.lg && sidebarPanel === 'search'"
          />
          <div
            class="controls-wrapper flex no-wrap"
            :class="{
              ' mobile-search-wrapper':
                $q.screen.lt.lg && sidebarPanel === 'search',
            }"
          >
            <div class="controls-wrapper-inner">
              <SearchComponent :autofocus="true" />
            </div>
          </div>
        </div>
        <div
          class="flex row items-center no-wrap"
          v-show="sidebarPanel !== 'search'"
        >
          <div
            class="separator vertical"
            v-if="$q.screen.gt.lg && false"
            :class="{ 'q-mx-md': $q.screen.gt.md }"
          />
          <!--<div class="text-white q-ml-md">Filter:</div>-->

          <ControlButton
            @clear="clearDateFilter"
            :isActive="!!controlDateRangeSelectedOption?.value"
            :label="
              controlDateRangeSelectedOption?.label ||
              $t('top_controls.any_dates')
            "
            iconName="las la-calendar"
          >
            <template v-slot="{ showing, hide }">
              <MenuWrapper :showing="showing" @hide="hide">
                <DateControl />
              </MenuWrapper>
            </template>
          </ControlButton>

          <ControlButton
            @clear="
              () => {
                controlTag = [];
              }
            "
            class="q-ml-sm"
            :isActive="controlTag?.length > 0"
            :label="computedTagLabel"
            iconName="mdi-pound"
            iconSize="1.4em"
          >
            <template v-slot="{ showing, hide }">
              <TagControl :showing="showing" @hide="hide" />
            </template>
          </ControlButton>

          <ControlButton
            class="q-ml-sm"
            :isActive="controlArtist.length > 0"
            :label="computedArtistLabel"
            iconName="las la-music"
            iconSize="1.4em"
            @clear="
              () => {
                controlArtist = [];
              }
            "
          >
            <template v-slot="{ showing, hide }">
              <ArtistControl :showing="showing" @hide="hide" />
            </template>
          </ControlButton>
          <!--
          <div
            class="controls-wrapper flex no-wrap q-ml-sm"
            v-if="$q.screen.gt.xs && false"
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
                    <q-item v-if="ipadPortrait">
                      <ArtistControl />
                    </q-item>
                    <q-item>
                      <SizeControl />
                    </q-item>
                    <q-item>
                      <DurationControl />
                    </q-item>
                    <q-item>
                      <q-checkbox
                        v-model="controlDateUnconfirmed"
                        label="Date unconfirmed"
                      />
                    </q-item>
                    <q-item>
                      <q-checkbox
                        v-model="controlEmptyLineup"
                        label="Empty lineup"
                      />
                    </q-item>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </div>
-->
          <ControlButton
            class="q-ml-sm"
            :isActive="controlSize.length > 0"
            :label="$t('top_controls.size')"
            iconName="las la-user-friends"
            iconSize="1.4em"
            @clear="
              () => {
                controlSize = [];
              }
            "
          >
            <template v-slot="{ showing, hide }">
              <SizeControl :showing="showing" @hide="hide" />
            </template>
          </ControlButton>

          <ControlButton
            class="q-ml-sm"
            :isActive="controlDuration.length > 0"
            :label="$t('top_controls.duration')"
            iconName="las la-clock"
            iconSize="1.4em"
            @clear="
              () => {
                controlDuration = [];
              }
            "
          >
            <template v-slot="{ showing, hide }">
              <DurationControl :showing="showing" @hide="hide" />
            </template>
          </ControlButton>
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
import SearchComponent from 'src/components/Search/SearchComponent.vue';
import ControlButton from 'src/components/Controls/ControlButton.vue';
import MenuWrapper from './MenuWrapper.vue';

export default {
  components: {
    MenuWrapper,
    CustomQScroll,
    ArtistControl,
    DateControl,
    DurationControl,
    SizeControl,
    TagControl,
    SearchComponent,
    ControlButton,
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
    ...mapActions(useQueryStore, ['clearDateFilter']),
    goToExplore() {
      //this.sidebarPanel = 'explore';
      if (this.$route.name === 'Explore') {
        this.$router.push({ name: 'Explore', query: { view: 'explore' } });
      } else if (this.$route.name === 'FeaturedEvents') {
        this.$router.push({
          name: 'BrowseEventDateList',
          params: { country: 'all' },
        });
      }
    },

  },
  computed: {
    computedTagLabel() {
      let label = '';
      if (this.controlTag?.length > 0) {
        for (let [index, tag] of this.controlTag.entries()) {
          label += tag.tag_t || tag.tag;
          if (index < this.controlTag.length - 1) {
            label += ' + ';
          }
        }
      } else {
        label = this.$t('top_controls.all_tags');
      }
      return label;
    },
    computedArtistLabel() {
      let label = '';
      if (this.controlArtist?.length > 0) {
        for (let [index, artist] of this.controlArtist.entries()) {
          label += artist.name;
          if (index < this.controlArtist.length - 1) {
            label += ' + ';
          }
        }
      } else {
        label = this.$t('top_controls.all_artists');
      }
      return label;
    },
    ipadPortrait() {
      // special layout case
      return this.$q.screen.gt.sm && this.windowWidth < 1124;
    },
    ...mapState(useMapStore, ['mapStyle']),
    ...mapWritableState(useSearchStore, ['query']),
    ...mapWritableState(useMainStore, [
      'sidebarPanel',
      'showPanel',
      'menubarOpacity',
    ]),
    ...mapState(useMainStore, [
      'windowWidth',
      'fineLocation',
      'userLocationLoading',
      'currentLocationCity',
      'currentLocation',
    ]),
    ...mapState(useQueryStore, ['anyFiltersEnabled']),
    ...mapWritableState(useQueryStore, [
      'controlEmptyLineup',
      'controlDateUnconfirmed',
      'controlDateRange',
      'controlFavorites',
      'controlDuration',
      'controlSize',
      'controlArtist',
      'controlTag',
      'controlCountry',
      'controlRegion',
      'controlLocality',
      'controlDateRangeSelectedOption',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .controls-component {
    .separator {
      color: $t-4;
    }
  }
}
.body--dark {
  .controls-component {
    .separator {
      color: $ti-4;
    }
  }
}

.controls-component {
  z-index: 1000;
  position: absolute;
  top: 0px;
  //margin-left: 64px;
  width: 100%;
  display: flex;
  pointer-events: none;
  pointer-events: none;
  justify-content: start;
  //overflow-x: auto;
  //overflow-y: visible;
  width: calc(100% - 568px);
  padding-right: 114px;
  padding-left: 8px;
  transition: transform 0.3s;
  transform: translate3d(calc(100vw / 2 - calc(633px / 2) + 100px), 0, 0);
  &.explore-view {
    transform: translate3d(568px, 0, 0);
  }
  &.center-absolute {
    // position: absolute;
    // width: 100%;
    // justify-content: center;
  }

  .control-scroll-area {
    height: 48px;
    width: 100%;
    .scroll-inner {
      .separator {
        justify-content: start;
        height: 16px;
        border-left: 1px solid;
        .q-btn {
          pointer-events: all;
        }
      }
    }
  }
}

.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}

@media only screen and (max-width: 1023px) {
  .controls-component {
    padding-left: 0px;
    top: 48px;
    z-index: 501;
    transform: unset;
    width: unset;
    padding-right: unset;
    &.explore-view {
      transform: unset;
    }
    .control-scroll-area {
      pointer-events: all;

      .scroll-inner {
        justify-content: start;
        padding-left: unset;

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

@media only screen and (min-width: 600px) and (max-width: 1023px) {
  .controls-component {
    top: 52px;
  }
}
</style>

<style lang="scss">
.body--light {
  .controls-wrapper {
    //box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.);

    .controls-wrapper-inner {
      background: $b-2;
      color: $t-1;
      border: 1px solid rgba(0, 0, 0, 0);

      .button-control {
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
      .searchbar-wrapper {
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
  .overlaying-map {
    .separator {
      color: $ti-4;
    }
    .controls-wrapper {
      backdrop-filter: blur(40px);
      //   box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

      .controls-wrapper-inner {
        //background: rgba(255, 255, 255, 0.3);
        background: linear-gradient(
          rgba(110, 110, 110, 0.4),
          rgba(120, 120, 120, 0.4)
        );
        color: $ti-1;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        //   border-color: transparent;
        .searchbar-wrapper {
          .searchbar-input {
            .q-field__inner {
              .q-placeholder::placeholder {
                opacity: 0.8;
              }
              input {
                color: white !important;
              }
              .q-field__marginal {
                font-size: unset;
                color: $ti-2 !important;
              }
            }
          }
        }
      }
    }
  }
  .transport-map {
    .controls-wrapper {
      backdrop-filter: none;

      .controls-wrapper-inner {
        //border: 1px solid rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(2px);
        color: $t-1;

        .searchbar-wrapper {
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
    &.overlaying-map {
      .controls-wrapper {
        box-shadow: rgba(0, 0, 0, 0.2) 1.95px 1.95px 2.6px;

        .controls-wrapper-inner {
          //border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 1);
        }
      }
    }
  }
}

.body--dark {
  .controls-wrapper {
    .controls-wrapper-inner {
      color: $ti-2;
      background: $bi-3;

      //background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0);

      .button-control {
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
  .overlaying-map {
    .separator {
      color: $ti-4;
    }
    .controls-wrapper {
      backdrop-filter: blur(40px);
      // box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

      .controls-wrapper-inner {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 1px solid rgba(255, 255, 255, 0.05);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        //    border-color: transparent;
        background: linear-gradient(
          rgba(110, 110, 110, 0.4),
          rgba(120, 120, 120, 0.4)
        );
        color: $ti-1;
        //border: 1px solid rgba(255, 255, 255, 0.15);
      }
    }
  }
}
.controls-wrapper {
  //z-index: 105;
  justify-content: center;
  position: relative;
  border-radius: 48px;
  overflow: hidden;
  font-family: 'Metropolis';
  &:lang(ru) {
    font-family: 'InterDisplay';
  }
  .controls-wrapper-inner {
    pointer-events: all;
    overflow: hidden;
    //transition: all 0.3s;
    cursor: pointer;
    // width: 510px;
    height: 100%;
    border-radius: 48px;

    position: relative;
    height: 44px;
    align-content: center;
    transition: filter 0.3s ease;

    &:hover {
      //filter: brightness(1);
    }
    .searchbar-wrapper {
      padding-left: 18px;
      padding-right: 18px;
      margin-top: 2px;

      .searchbar-input {
        margin-top: -2px;

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
            font-size: 1rem;
            letter-spacing: 0.5px;
            font-family: 'Metropolis';
            &:lang(ru) {
              font-family: 'InterDisplay';
            }
          }
        }
      }
    }

    .q-btn::before {
      box-shadow: none !important;
    }
    .button-control {
      height: 42px;
      display: flex;
      align-items: baseline;
      .button-label {
        //font-size: 1em;
        letter-spacing: 0.5px;
        white-space: nowrap;
        font-weight: 600;
        margin-top: 1px;
        //font-size: 0.9rem;
      }
      .q-btn__content {
        // padding-left: 8px;
        // padding-right: 8px;
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
  &.search-wrapper {
    .controls-wrapper-inner {
      height: 44px;
      align-content: center;
    }
  }
}

@media only screen and (max-width: 599px) {
  .controls-wrapper {
    .controls-wrapper-inner {
      height: 42px;
      .button-control {
        height: 40px;
      }
      .searchbar-input {
        input {
          font-size: unset !important;
        }
      }
    }
    &.search-wrapper {
      .controls-wrapper-inner {
        height: 40px;
        align-content: center;
        .searchbar-input {
          input {
            font-size: 0.5rem !important;
          }
        }
      }
    }
  }
}
</style>
