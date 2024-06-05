<template>
  <div
    class="event-list-vertical shadow-0 main-content"
    style="height: 100%; width: 100%; position: relative; overflow: hidden"
  >
    <div
      :class="{ 'q-px-md': showPanel || true }"
      v-if="$q.screen.gt.xs && false"
    >
      <q-separator />
    </div>

    <div class="mobile-panel-button">
      <q-icon
        @click="showPanel ? $emit('hidePanel') : $emit('showPanel')"
        flat
        :size="$q.screen.gt.sm ? '1.7rem' : '1.5rem'"
        class="q-pa-md q-mr-sm t1"
        :class="{ 'rotate-180': showPanelBackground }"
        name="mdi-chevron-up"
        style="pointer-events: all"
      />
    </div>
    <div class="touch-overlay" v-touch-swipe.vertical="handleSwipe" />
    <div class="event-list-inner">
      <div
        class="inter q-mb-md"
        style="position: absolute; left: 24px; top: 16px; font-weight: 600"
        v-if="
          (isLoadingInitial || (mapMoving && !blockUpdates)) && sidebarMinimized
        "
      >
        Finding what's good...
      </div>
      <div
        class="inter q-mb-md"
        style="position: absolute; left: 24px; top: 16px; font-weight: 700"
        v-else-if="
          !isLoadingInitial &&
          (eventDatesTotal === 0 || !eventDates || eventDates.length === 0) &&
          sidebarMinimized
        "
      >
        Nothing coming up in this area
      </div>
      <div
        class="flex row no-wrap items-center justify-between q-px-md q-pt-md q-pb-sm view-options-absolute"
        v-if="$q.screen.gt.xs"
      >
        <div class="flex row items-center no-wrap">
          <!--
          <EventDateViewOptions class="q-m-md" />
-->
          <q-icon
            @click="() => (showPanel = !showPanel)"
            v-if="$q.screen.gt.sm && false"
            flat
            size="2.5rem"
            class="q-mx-md t1"
            name="mdi-chevron-up"
            :class="{ 'rotate-180': showPanelBackground }"
            style="cursor: pointer"
          />
        </div>
      </div>

      <div
        class="flex column grow no-wrap"
        :class="$q.screen.gt.sm ? 'q-pt-md' : ''"
      >
        <CustomQScroll
          vertical
          @scroll="onScrollMainContent"
          ref="scroll"
          :thumb-style="
            $q.screen.gt.sm
              ? {
                  bottom: '0px',
                  height: '8px',
                  right: '0px',
                  borderRadius: '0px',
                  width: '12px',
                }
              : {
                  marginTop: '52px',
                  height: '0px',
                  borderRadius: '0px',
                  width: '4px',
                }
          "
          class="scroll-area flex grow"
          :disableScroll="!showPanelBackground || preventMapZoom"
        >
          <div class="flex column no-wrap scroll-content q-px-sm">
            <!-- tags -->
            <div
              class="flex column q-mb-lg q-mt-xs"
              v-if="
                topTagsInArea?.length >= 1 &&
                !eventDatesLoading &&
                !mapMoving &&
                $q.screen.gt.xs &&
                false
              "
            >
              <div
                class="q-pb-md location-header"
                :class="
                  $q.screen.gt.sm
                    ? 'q-px-md  t1 inter semibold'
                    : ' t1 inter semibold'
                "
              >
                <div class="text-">Narrow down your search...</div>
              </div>

              <div
                :style="$q.screen.gt.sm ? 'margin-bottom: -8px' : ''"
                :class="$q.screen.gt.sm ? 'q-pl-md ' : 'q-pl-md'"
                v-if="topTagsInArea && topTagsInArea.length > 0"
              >
                <CustomQScroll
                  horizontal
                  class="tag-scroll-area"
                  :style="
                    topTagsInArea.length > 14 ? 'height: 90px' : 'height: 45px'
                  "
                  style="width: 100%"
                  :thumb-style="
                    $q.screen.gt.sm
                      ? { bottom: '0px', height: '0px' }
                      : { bottom: '0px', height: '0px' }
                  "
                >
                  <div class="flex column">
                    <div class="flex row no-wrap q-gutter-sm q-pr-xl">
                      <div
                        v-for="(tag, index) in computedTags1"
                        :key="index"
                        @click="clickTag(tag)"
                        class="tag t2 text- inter semibold"
                        style="text-transform: capitalize"
                        :class="$q.platform.is.ios ? 'no-hover' : ''"
                      >
                        {{ tag.tag }}
                      </div>
                    </div>
                    <div
                      class="flex row no-wrap q-gutter-sm q-pt-sm"
                      v-if="computedTags2.length > 0"
                    >
                      <div
                        v-for="(tag, index) in computedTags2"
                        :key="index"
                        @click="clickTag(tag)"
                        class="tag t2 text- inter semibold"
                        style="text-transform: capitalize"
                        :class="$q.platform.is.ios ? 'no-hover' : ''"
                      >
                        {{ tag.tag }}
                      </div>
                    </div>
                  </div>
                </CustomQScroll>
              </div>
            </div>
            <div
              class="flex column"
              v-if="
                topArtistsInArea?.length > 5 &&
                !eventDatesLoading &&
                !mapMoving &&
                false
              "
            >
              <div
                class="location-header q-pb-md inter"
                :class="
                  $q.screen.gt.sm
                    ? 'q-px-md t1 inter semibold'
                    : 'q-pl-md t1 semibold'
                "
              >
                Top artists in this area:
              </div>
              <ArtistsComponent
                :class="$q.screen.gt.sm ? 'q-pl- q-mb-' : ''"
                :artists="topArtistsInArea"
              />
            </div>
            <!-- theres no point in this 
            <ArtistsComponent
              v-if="
                $q.screen.gt.xs &&
                artists.length > 0 &&
                ((groupByMonth &&
                  Object.keys(eventDatesGroupedByMonth)?.length > 0) ||
                  (!groupByMonth && eventDates?.length > 0))
              "
              :artists="artists"
              :hasNext="artistsHasNext"
              :loadMore="loadArtists"
            />
            -->
            <transition appear enter-active-class="animated fadeIn slow">
              <div
                class="flex column"
                :style="mapMoving && !blockUpdates ? 'opacity: 0' : ''"
              >
                <EventDateList
                  v-if="compactView"
                  :groupByMonth="groupEventsByMonth && $q.screen.lt.sm"
                  :eventDatesGroupedByMonth="eventDatesGroupedByMonth"
                  :eventDates="eventDates"
                  :hasNext="eventDatesHasNext"
                  :loading="eventDatesLoading"
                  :eventDatesTotal="eventDatesTotal"
                />

                <EventDatePosterList
                  v-if="!compactView"
                  :groupByMonth="groupEventsByMonth && $q.screen.lt.sm"
                  :eventDatesGroupedByMonth="eventDatesGroupedByMonth"
                  :eventDates="eventDates"
                  :hasNext="eventDatesHasNext"
                  :loading="eventDatesLoading"
                  :eventDatesTotal="eventDatesTotal"
                />
              </div>
            </transition>
          </div>
        </CustomQScroll>
      </div>
      <!--
      <div
        v-if="
          $q.screen.gt.xs && (isLoadingInitial || (mapMoving && !blockUpdates))
        "
        style="height: 100%; position: absolute; width: 100%; z-index: 500"
        class="t4 inter semibold q-mt-md event-date-center flex grow justify-center"
      >
        Loading...
      </div>
      -->
      <div
        class="event-date-center t1 flex column grow no-wrap justify-center items-center"
        :style="
          $q.screen.lt.sm
            ? 'height: 144px; position: absolute; width: 100%; z-index: 500'
            : $q.screen.lt.xl
            ? 'height: 348px; position: absolute; width: 100%; z-index: 500'
            : 'height: 450px; position: absolute; width: 100%; z-index: 500'
        "
      >
        <div class="flex column items-center no-wrap">
          <div
            class="inter q-mb-md"
            style="font-weight: 600"
            v-if="
              (isLoadingInitial || (mapMoving && !blockUpdates)) &&
              !sidebarMinimized
            "
          >
            Finding what's good...
          </div>
          <div
            class="inter semibold q-mb-md"
            v-else-if="
              !isLoadingInitial &&
              (eventDatesTotal === 0 ||
                !eventDates ||
                eventDates.length === 0) &&
              !sidebarMinimized
            "
            style="font-weight: 600"
          >
            Nothing coming up in this area
          </div>
          <div style="height: 20px; width: 200px" class="flex justify-center">
            <q-linear-progress
              v-if="isLoadingInitial || (mapMoving && !blockUpdates)"
              class="linear-progress q-mt-md"
              indeterminate
              size="2px"
              :color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
              rounded
              :style="$q.screen.gt.xs ? 'max-width: 200px' : 'max-width: 120px'"
            />
            <div
              class="flex column no-wrap"
              style="pointer-events: all"
              v-else-if="
                ((groupEventsByMonth &&
                  Object.keys(eventDatesGroupedByMonth)?.length == 0) ||
                  (!groupEventsByMonth &&
                    eventDates &&
                    eventDates.length === 0)) &&
                !(isLoadingInitial || (mapMoving && !blockUpdates))
              "
            >
              <div class="flex row no-wrap">
                <q-btn
                  no-caps
                  style="border-radius: 48px !important"
                  v-if="anyFiltersEnabled"
                  class="button-plain flex items-center"
                  @click="
                    () => {
                      clearAllFilters();
                    }
                  "
                >
                  <div class="flex items-center row no-wrap">
                    <q-icon name="mdi-close" size="1rem" class="q-pr-md" />
                    <div>Clear filters</div>
                  </div>
                </q-btn>
                <q-btn
                  no-caps
                  style="border-radius: 48px !important"
                  v-if="mapZoomLevel > 2"
                  class="button-plain flex items-center q-ml-sm"
                  @click="zoomOut()"
                >
                  <div class="flex items-center row no-wrap">
                    <q-icon
                      name="mdi-magnify-minus-outline"
                      size="1rem"
                      class="q-pr-md"
                    />
                    <div>Zoom out</div>
                  </div>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { toRaw } from 'vue';

import _ from 'lodash';
//import ArtistProfile from 'components/ArtistProfile.vue';

import EventDateList from 'src/components/EventDateList.vue';
import EventDatePosterList from 'src/components/EventDatePosterList.vue';
//import EventDateViewOptions from 'src/components/EventDateViewOptions.vue';
import ArtistsComponent from 'src/components/SideBar/ArtistsComponent.vue';
import { useMapStore } from 'src/stores/map';
import { useQueryStore } from 'src/stores/query';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { mapActions, mapWritableState, mapState } from 'pinia';
import CustomQScroll from 'components/CustomQScroll.vue';

export default {
  components: {
    //ControlsComponent,
    //ArtistProfile,
    ArtistsComponent,
    EventDateList,
    EventDatePosterList,
    CustomQScroll,
  },

  async mounted() {
    setTimeout(() => {
      this.hasLoaded = true;
      // the event listener in q-scroll-area causees a bug in ios that makes you have to click twice on links within
    }, 500);
    if (this.eventDates?.length === 0) {
      this.blockUpdates = false;
      if (!this.userLocation) {
        this.blockUpdates = true;

        /// await this.loadIpInfo();
        this.blockUpdates = false;
        this.getInitialList();
      } else {
        this.getInitialList();
      }
    }
    if (!this.userLocation) {
      // this.loadIpInfo(); happens in route watcher
    }
  },
  data() {
    return {
      mainContentScrollPosition: 0,
      scrollingUp: false,
      hasLoaded: false,
      headerYPosition: 0,
      year: 0,
      componentGroup: {},
      isLoadingDatesInitial: false,
      isLoadingArtistsInitial: false,
    };
  },
  methods: {
    ...mapActions(useQueryStore, [
      'loadEventDates',
      'loadArtists',
      'loadMoreArtists',
      'clearAllFilters',
    ]),
    ...mapActions(useMainStore, ['loadIpInfo']),
    clickTag(tag) {
      let index = this.controlTag?.findIndex((x) => x.tag === tag.tag);
      if (index > -1) {
        // tag already selected, do nothing
      } else {
        this.controlTag.push(tag);
      }
    },
    zoomOut() {
      toRaw(this.map).setZoom(1);
      this.showPanel = false;
    },
    async getInitialList() {
      // event date stuff
      // this.isLoadingDatesInitial = true;
      if (this.$refs) this.$refs.scroll.setScrollPercentage('vertical', 0);
      this.eventDatesHasNext = true;
      this.eventDatesPage = 1;
      this.eventDatesTotal = null;
      this.eventDates = []; // this is actually quite important
      this.artists = [];
      this.eventDatesGroupedByMonth = {};

      this.loadMore();
    },
    async loadMore() {
      if (
        this.$route.name === 'Explore' &&
        this.eventDatesHasNext &&
        !this.blockUpdates
      ) {
        try {
          await this.loadEventDates();
          //  await this.loadArtists();
        } catch (error) {}
      }
    },
    handleSwipe() {
      this.showPanel = !this.showPanel;
    },

    onScrollMainContent(info) {
      this.mainContentScrollPosition = info.verticalPosition;
      if (info.verticalPosition <= 0) {
        if (!this.$q.platform.has.touch) {
          setTimeout(() => {
            // behavior fix for desktop scroll
            this.enablePanelSwipeDown = true;
          }, 250);
        } else {
          this.enablePanelSwipeDown = true;
        }
      } else {
        this.enablePanelSwipeDown = false;
      }
      if (info.verticalPercentage > 0.99) {
        // reached bottom
        this.debouncedLoadMore();
      }
    },
    delayedGetInitial() {
      setTimeout(() => {
        this.blockUpdates = false;
        this.getInitialList();
      }, 200);
    },
  },
  watch: {
    showPanel(newv) {
      if (newv) {
        this.enablePanelSwipeDown = true;
      } else {
        if (this.$refs) this.$refs.scroll.setScrollPercentage('vertical', 0);
      }
    },
    sidebarPanel(newv) {
      this.$refs.scroll.setScrollPercentage('vertical', 0);
    },
    mapMoving(newv) {
      if (newv) this.eventDatesHasNext = false;
    },
    route: {
      handler: async function (to) {
        if (to.name === 'Explore') {
          if (this.eventDates?.length === 0) {
            this.blockUpdates = false;
            if (!this.userLocation) {
              await this.loadIpInfo();
              this.getInitialList();
            } else {
              this.getInitialList();
            }
          }
        }
      },
    },
    mapBounds() {
      if (!this.blockUpdates) {
        // map moved
        // if updates are not blocked, update event dates
        this.getInitialList();
      }
    },

    controlDateRange: {
      handler() {
        this.delayedGetInitial();
      },
      deep: true,
    },
    controlDuration: {
      handler() {
        this.delayedGetInitial();
      },
      deep: true,
    },
    controlSize: {
      handler() {
        this.delayedGetInitial();
      },
      deep: true,
    },
    controlArtist: {
      handler() {
        this.delayedGetInitial();
      },
      deep: true,
    },
    controlTag: {
      handler() {
        this.delayedGetInitial();
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useMainStore, [
      'sidebarPanel',
      'userLocation',
      'compactView',
      'groupEventsByMonth',
      'sidebarMinimized',
    ]),
    ...mapWritableState(useMainStore, [
      'showPanel',
      'showPanelBackground',
      'enablePanelSwipeDown',
    ]),
    ...mapWritableState(useMapStore, ['map', 'blockUpdates', 'preventMapZoom']),
    ...mapState(useAuthStore, ['currentUser']),
    ...mapState(useMapStore, [
      'mapBounds',
      'mapMoving',
      'showResults',
      'mapZoomLevel',
    ]),
    ...mapState(useQueryStore, [
      'controlDateRange',
      'controlSize',
      'controlDuration',
      'controlArtist',
      'artistsHasNext',
      'anyFiltersEnabled',
      'topTagsInArea',
      'topArtistsInArea',
    ]),
    ...mapWritableState(useQueryStore, [
      'controlTag',

      'eventDates',
      'eventDatesTotal',
      'eventDatesPage',
      'eventDatesHasNext',
      'artists',
      'artistsPage',
      'artistsHasNext',
      'eventDatesLoading',
      'eventDatesGroupedByMonth',
    ]),
    topTagsWithoutSelected() {
      return this.topTagsInArea.filter(
        (x) => this.controlTag.findIndex((y) => y.tag === x.tag) === -1
      );
    },
    computedTags1() {
      if (this.topTagsWithoutSelected.length > 14) {
        return this.topTagsWithoutSelected.filter((x, i) => i % 2);
      } else {
        return this.topTagsWithoutSelected;
      }
    },
    computedTags2() {
      if (this.topTagsWithoutSelected.length > 14) {
        return this.topTagsWithoutSelected.filter((x, i) => i % 2 !== 1);
      } else {
        return [];
      }
    },
    noFiltersSelected() {
      return (
        this.controlDateRange.end === null &&
        this.controlArtist.length === 0 &&
        this.controlDuration.length === 0 &&
        this.controlSize.length === 0 &&
        this.controlTag.length === 0
      );
    },
    isLoadingInitial() {
      // return this.isLoadingDatesInitial || this.isLoadingArtistsInitial;
      return this.eventDatesLoading && this.eventDatesTotal <= 1;
    },

    route() {
      return this.$route;
    },
    getTitleOpactity() {
      let opacity = 1 - this.mainContentScrollPosition / 0;
      let op1;
      if (opacity < 0) {
        op1 = 0;
      } else {
        op1 = opacity;
      }
      return `opacity: ${op1}`;
    },
    getBottomDivider() {
      var opacity = 0 + this.mainContentScrollPosition / 150;
      var op1, op2;
      if (opacity > 0.09) {
        op1 = 0.09;
      } else {
        op1 = opacity;
      }
      if (opacity > 0.065) {
        op2 = 0.065;
      } else {
        op2 = opacity;
      }
      return `
      box-shadow: 0 3px 6px 0 rgba(40, 40, 90, ${op1}), 0 1px 1px 0 rgba(0, 0, 0, ${op2});`;
    },
    getBottomDividerDark() {
      var opacity = 0 + this.mainContentScrollPosition / 150;
      var op;
      if (opacity > 0.09) {
        op = 0.09;
      } else {
        op = opacity;
      }
      return `
      border-bottom: 1px solid rgba(255,255,255,${op});`;
    },
  },
  created() {
    this.debouncedOnScrollMainContent = _.debounce(
      this.onScrollMainContent,
      10
    );
    this.debouncedGetInitalList = _.debounce(this.getInitialList, 150, {
      leading: false,
      trailing: true,
    });
    this.debouncedLoadMore = _.debounce(this.loadMore, 150, {
      leading: true,
      trailing: false,
    });
  },
};
</script>

<style lang="scss" scoped>
@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
}

.card:first-child {
  margin-top: 0px !important;
}
.event-list-transparent-bg {
  background: rgba(0, 0, 0, 0) !important;
  border: none;
}

.header {
  //position: absolute;
  //transition: all 0.3s ease;
  // width: 100%;
  width: 100%;
  //height: 56px;
  position: sticky;
  top: 0px;
  //max-height: 48px;
  z-index: 10;
  // font-size: 1rem;
}

.event-list-vertical {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: background 0.3s;
  //z-index: 3000;
  position: absolute;
  pointer-events: none;
  .mobile-panel-button {
    position: absolute;
    right: 0px;
    top: -4px;
    z-index: 5000;
    @supports (font: -apple-system-body) and (-webkit-appearance: none) {
      -webkit-transform: translate3d(0, 0, 0);
    }
  }
  .event-list-inner {
    pointer-events: all;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: all 0.3s;
    position: relative;
    .view-options {
      position: absolute;
      right: 64px;
      top: 20px;
      z-index: 100;
    }

    .view-options-absolute {
      position: absolute;
      right: 0px;
      z-index: 1000;
    }

    .date-header-bg {
      // only useful for light theme
      position: absolute;
      top: 0;
      left: 0;
      height: 48px;
      width: 100%;
      z-index: 10;
    }
  }

  .no-parties-text {
    margin-left: 16px;
  }
  .scroll-area {
    height: 100%;
    .search-input {
      :deep(.q-field__control) {
        &:before {
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 9px;
        }
      }
    }
    .artists-wrapper {
      border-radius: 0px;
      .artists-component {
        z-index: 2;
      }
      //background: whitesmoke;
    }
    .artist-profile-wrapper {
      width: 100%;
      .artist-profile {
        max-width: 100%;
        //height: 200px;
        border-radius: 9px !important;
      }
    }
    .scroll-content {
      position: relative;
      width: 100%;
      min-height: 100%;
      -webkit-overflow-scrolling: auto;

      .tag-scroll-area {
        mask-image: linear-gradient(to left, transparent 0px, white 64px);
        width: 100%;
        .tag {
          opacity: 1;
          transition: all 0.3s ease;
          white-space: nowrap;
          cursor: pointer;
          border-radius: 18px;
          padding: 6px 12px;
          border-radius: 18px;

          &.selected {
            text-decoration: underline;
          }
        }
      }
    }
    :deep(.q-scrollarea__thumb) {
      z-index: 1000;
    }
  }

  .touch-overlay {
    position: absolute;
    height: 100%;
    width: calc(100% + 10px);
    margin-left: -5px;
    z-index: -1;
    pointer-events: all;
  }
}

.event-date-center {
  z-index: 1;
  align-items: center;
  pointer-events: none;
  margin-top: -48px;
}

.body--dark {
  .scroll-area {
    background: transparent;

    .tag-scroll-area {
      .tag {
        opacity: 1;
        transition: all 0.3s ease;
        background: black;
        border: 1px solid rgba(255, 255, 255, 0.25);
        &:not(.no-hover) {
          &:hover {
            opacity: 1;
            background: rgba(36, 36, 36, 1);
          }
        }
        &.selected {
          background: rgba(24, 24, 24, 1);
        }
      }
    }
  }
  .event-list-vertical {
    pointer-events: none;

    .controls-component {
      background: black;

      //background: black;
    }
    .event-list-inner {
      //background: $bi-2;

      //background: black;
    }
  }

  .header {
    background: $bi-1;
  }
  .date-header {
    background: $bi-1;
  }
}

.body--light {
  .scroll-area {
    background: transparent;
    .tag-scroll-area {
      .tag {
        // opacity: 1;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0);
        border: 1px solid rgba(0, 0, 0, 0.1);
        //box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;

        //box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 4px 0px;
        &:not(.no-hover) {
          &:hover {
            background: rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
    .search-input {
      background: #fafafa;
    }
  }
  .event-list-vertical {
    background: white;

    .event-list-inner {
      //background: white;
    }
  }
  .header {
    background: white;

    //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.2);
  }
  .controls-component {
    background: white;
  }
  .date-header-bg {
    background: white;
  }
}

@media only screen and (min-width: 1921px) {
  .linear-progress {
    // margin-top: 32px;
  }
}

@media only screen and (max-width: 599px) {
  .body--dark {
    .header {
      background: black !important;
    }
  }
  .event-date-center {
    margin-top: 0px;
  }

  .event-list-vertical {
    margin-top: 4px;

    .event-list-inner {
      .artists-component {
        height: 178px;
      }
      .controls-component {
        z-index: 101;
        top: 0px;
      }
      .scroll-area {
        .no-parties-text {
          margin-left: 8px;
        }
        .scroll-content {
          //margin-top: -24px;
          position: relative;

          .header {
            display: sticky;
            top: 0px;
            z-index: 100;
          }
        }
      }
    }
  }
}
</style>
