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

    <div class="event-list-inner">
      <div
        class="q-mb-md metropolis bold"
        style="position: absolute; left: 24px; top: 16px; font-weight: 600"
        v-if="
          (isLoadingInitial || (mapMoving && !blockUpdates)) &&
          sidebarMinimized &&
          $q.screen.lt.sm
        "
      >
        {{ $t('explore_view.finding_whats_good') }}
      </div>
      <div
        class="inter q-mb-md"
        style="position: absolute; left: 24px; top: 16px; font-weight: 700"
        v-else-if="
          !isLoadingInitial &&
          (eventDatesTotal === 0 || !eventDates || eventDates?.length === 0) &&
          sidebarMinimized &&
          $q.screen.lt.sm
        "
      >
        {{ $t('explore_view.nothing_coming_up') }}
      </div>

      <div
        class="flex column grow no-wrap"
        :class="$q.screen.gt.sm ? 'q-pt-sm' : ''"
      >
        <CustomQScroll
          vertical
          @scroll="onScrollMainContent"
          @scrollend="onScrollEnd"
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
          :disableScroll="
            $q.screen.lt.md && (!showPanelBackground || preventMapZoom)
          "
        >
          <div class="flex column no-wrap scroll-content">
            <div class="flex column top-section">
              <div
                class="flex row items-end q-mb-sm no-wrap"
                :class="{
                  'q-px-lg q-mb-lg q-pb-': $q.screen.gt.sm,
                  'q-px-sm ': $q.screen.lt.md,
                }"
                v-if="$q.screen.gt.sm"
              >
                <div
                  v-if="false"
                  class="flex row items-center no-wrap"
                  :class="$q.screen.gt.sm ? 'q-mx-sm' : 'q-ml-xs'"
                  :style="
                    $q.screen.gt.sm
                      ? 'margin-left: -16px; '
                      : 'margin-left: 0px; '
                  "
                >
                  <q-icon
                    name="las la-calendar"
                    :class="$q.screen.gt.sm ? 'q-pa-md' : 'q-pa-sm'"
                    size="sm"
                    :style="
                      $q.screen.gt.sm
                        ? 'margin-right: -4px; '
                        : 'margin-left: 0px; '
                    "
                  />
                  <DesktopDateSelect />
                </div>
                <div class="flex row grow no-wrap items-start">
                  <router-link
                    :to="{ name: 'Explore', query: { view: 'nearby' } }"
                    style="text-decoration: none; color: inherit"
                  >
                    <q-btn
                      :style="
                        $q.screen.gt.sm
                          ? 'margin-right: -0px; margin-left: -8px '
                          : 'margin-left: 0px; '
                      "
                      flat
                      :class="$q.screen.gt.sm ? 'q-pa-md' : 'q-pa-sm'"
                      style="border-radius: 100px !important"
                    >
                      <template v-slot:default>
                        <q-icon size="sm" name="mdi-crosshairs-gps" />
                      </template>
                    </q-btn>
                  </router-link>
                  <div class="flex row items-center q-ml-xs">
                    <div
                      class="ellipsis text-h5 q-mr-sm"
                      v-if="$q.screen.gt.sm"
                    >
                      <span class="metropolis bolder">
                        {{ $t('nearby_view.upcoming_in') }}
                      </span>
                    </div>
                    <NearbyCountrySelect class="q-mr-sm" />
                  </div>
                </div>
              </div>
              <DesktopSearchComponent
                style="position: relative"
                v-if="$q.screen.gt.sm && false"
                :fullWidth="true"
                :class="{
                  ' q-mb-lg q-px-lg': $q.screen.gt.sm,
                  'q-px-md  q-mb-sm q-mt-md ': $q.screen.lt.md,
                }"
              />
              <transition appear enter-active-class="animated fadeIn slow">
                <div class="flex column" v-if="!isLoadingInitial">
                  <!-- cities-->
                  <div
                    :style="$q.screen.gt.sm ? 'margin-top: 0px' : ''"
                    class="flex column q-mb-lg"
                    v-if="
                      topRegionsInArea?.length > 2 &&
                      mapZoomLevel < 7 &&
                      $q.screen.gt.sm &&
                      false
                    "
                  >
                    <div
                      class="q-pb-md q-mt-sm t1 header"
                      v-if="false"
                      :class="$q.screen.gt.sm ? 'q-px-lg  ' : ' '"
                    >
                      <div class="inter bolder text-large">Busy places:</div>
                    </div>

                    <div>
                      <CustomQScroll
                        horizontal
                        class="tag-scroll-area"
                        :style="
                          topRegionsInArea.length > 14
                            ? 'height: 72px'
                            : 'height: 36px'
                        "
                        style="width: 100%"
                        :thumb-style="
                          $q.screen.gt.xs
                            ? {
                                borderRadius: '0px',
                                bottom: '0px',
                                height: '4px',
                                marginLeft: '24px',
                                paddingLeft: '16px',
                              }
                            : { bottom: '0px', height: '0px' }
                        "
                      >
                        <div
                          class="flex column inter bolder text-h6 q-pl-lg"
                          style="word-break: keep-all; white-space: nowrap"
                          :class="{
                            t3: $q.dark.isActive,
                            t4: !$q.dark.isActive,
                          }"
                        >
                          <div class="flex row no-wrap q-gutter-sm q-pr-xl">
                            <div
                              v-for="(region, index) in computedRegions1"
                              :key="index"
                              @click="clickRegion(region)"
                            >
                              <span
                                class="city"
                                style="text-transform: capitalize"
                                :class="$q.platform.is.ios ? 'no-hover' : ''"
                              >
                                {{ region.long_name }}
                              </span>
                              <span
                                class="q-ml-sm"
                                v-if="index < computedRegions1.length - 1"
                                >·
                              </span>
                            </div>
                          </div>

                          <div
                            class="flex row no-wrap q-gutter-sm q-pt-sm"
                            v-if="computedRegions2.length > 0"
                          >
                            <div
                              v-for="(region, index) in computedRegions2"
                              :key="index"
                              @click="clickRegion(region)"
                            >
                              <span
                                style="text-transform: capitalize"
                                :class="$q.platform.is.ios ? 'no-hover' : ''"
                                class="city"
                              >
                                {{ region.long_name }}
                              </span>
                              <span
                                class="q-ml-sm"
                                v-if="index < computedRegions1.length - 1"
                                >·
                              </span>
                            </div>
                          </div>
                        </div>
                      </CustomQScroll>
                    </div>
                  </div>

                  <!-- selected artist (desktop only) -->
                  <div
                    class="flex column q-mb-lg q-pt-sm"
                    v-if="controlArtist?.length > 0 && $q.screen.gt.sm"
                  >
                    <div
                      class="q-pb-md t1 header"
                      :class="
                        $q.screen.gt.sm ? 'q-px-lg  t1' : ' t1 inter semibold'
                      "
                    >
                      <div v-if="controlArtist.length === 1">
                        {{ $t('explore_view.selected_artist') }}
                      </div>
                      <div v-else>
                        {{ $t('explore_view.selected_artists') }}
                      </div>
                    </div>
                    <div class="tag-scroll-area q-px-lg t1 flex justify-start">
                      <div
                        v-for="(artist, index) in controlArtist"
                        :key="-index"
                        @click="clearArtists"
                        class="tag tag-selected flex items-center no-wrap text- inter semibold"
                        style="text-transform: capitalize"
                        :class="$q.platform.is.ios ? 'no-hover' : ''"
                      >
                        <q-icon
                          style="margin-left: -4px; font-size: 18px"
                          name="mdi-close-circle q-mr-xs"
                        />
                        {{ artist.name }}
                      </div>
                    </div>
                  </div>
                  <!-- tags -->
                  <div
                    class="flex column"
                    :class="{
                      'q-mb-lg': $q.screen.gt.sm,
                      'q-mb-md': $q.screen.lt.md,
                    }"
                    v-if="
                      (topTagsInArea?.length > 0 || controlTag.length > 0) &&
                      $q.screen.gt.sm
                    "
                  >
                    <div
                      class="q-pb-md header t1 header-select flex row no-wrap items-center justify-between"
                      :class="{
                        'q-px-lg': $q.screen.gt.sm,
                        'q-px-md': $q.screen.lt.md,
                      }"
                    >
                      <span class="">
                        <span
                          class=""
                          v-if="topTagsInArea?.length && controlTag.length == 0"
                        >
                          {{ $t('explore_view.hot_tags') }}
                        </span>
                        <span v-else-if="controlTag.length === 1">
                          {{ $t('explore_view.selected_tag') }}
                        </span>
                        <span v-else>
                          {{ $t('explore_view.selected_tags') }}</span
                        >:
                      </span>
                    </div>
                    <TagExplorer
                      mode="explore"
                      :class="{
                        'q-px-lg q-mb-sm': $q.screen.gt.sm,
                        'q-px-md': $q.screen.lt.md,
                      }"
                    />
                  </div>
                  <div
                    class="flex column"
                    :style="
                      $q.screen.gt.sm
                        ? 'margin-top: 8px; margin-bottom: -8px'
                        : ''
                    "
                    v-if="
                      topArtistsInArea?.length > 5 &&
                      $q.screen.gt.sm &&
                      controlArtist.length === 0
                    "
                  >
                    <div
                      class="header header-select t1 justify-between flex no-wrap items-center"
                      :class="$q.screen.gt.sm ? 'q-px-lg' : 'q-px-md '"
                    >
                      <span>
                        {{ $t('explore_view.high_profile_artists') }}:</span
                      >
                      <ControlSelect
                        v-if="false"
                        @clear="
                          () => {
                            controlTag = [];
                          }
                        "
                        class="t2"
                        :size="$q.screen.gt.sm ? 'sm' : 'xs'"
                        :label="'All Artists'"
                      >
                        <template v-slot="{ showing, hide }">
                          <ArtistControl :showing="showing" @hide="hide" />
                        </template>
                      </ControlSelect>
                    </div>
                    <ArtistsComponent
                      :class="$q.screen.gt.sm ? 'q-pl- q-mb-md ' : ''"
                      :artists="topArtistsInArea"
                      :size="$q.screen.gt.sm ? 'lg' : 'md'"
                    />
                  </div>
                </div>
              </transition>
            </div>

            <transition appear enter-active-class="animated fadeIn slow">
              <div
                class="flex column bottom-section"
                v-if="!isLoadingInitial"
                :class="{
                  'q-px-sm ': $q.screen.lt.md,
                }"
              >
                <EventDateList
                  v-if="compactView"
                  :groupByMonth="groupEventsByMonth"
                  :eventDatesGroupedByMonth="eventDatesGroupedByMonth"
                  :eventDates="eventDates"
                  :hasNext="eventDatesHasNext"
                  :twoColumnsMd="$q.screen.sm"
                  :loading="eventDatesLoading"
                  :eventDatesTotal="eventDatesTotal"
                />

                <EventDatePosterList
                  v-if="!compactView"
                  :groupByMonth="groupEventsByMonth"
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

      <div
        class="event-date-center flex column grow no-wrap justify-center items-center"
        :style="
          $q.screen.lt.sm
            ? 'height: 144px; position: absolute; width: 100%; z-index: 500'
            : 'height: 100%; padding-top: 96px; position: absolute; width: 100%; z-index: 500'
        "
      >
        <div class="flex column items-center no-wrap">
          <div
            class="metropolis bold q-mb-md"
            :class="$q.screen.gt.xs && 'q-mt-xl'"
            v-if="isLoadingInitial && (!sidebarMinimized || $q.screen.gt.xs)"
          >
            {{ $t('explore_view.finding_whats_good') }}
          </div>
          <div
            class="metropolis bold q-mb-md"
            :class="$q.screen.gt.xs && 'q-mt-xl q-pb-xs'"
            v-else-if="
              !isLoadingInitial &&
              noResults &&
              (!sidebarMinimized || $q.screen.gt.xs)
            "
          >
            {{ $t('explore_view.nothing_coming_up') }}
          </div>
          <div style="height: 20px; width: 200px" class="flex justify-center">
            <q-linear-progress
              v-if="isLoadingInitial"
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
              v-else-if="noResults && !isLoadingInitial"
            >
              <div class="flex row no-wrap">
                <q-btn
                  no-caps
                  style="border-radius: 48px !important; height: 40px"
                  v-if="anyFiltersEnabled"
                  class="button-plain flex items-center"
                  @click="
                    () => {
                      clearAllFilters();
                    }
                  "
                >
                  <div class="flex items-center row no-wrap q-px-xs">
                    <q-icon name="mdi-close" size="1rem" class="q-pr-md" />
                    <div>{{ $t('explore_view.clear_filters') }}</div>
                  </div>
                </q-btn>
                <q-btn
                  no-caps
                  style="border-radius: 48px !important; height: 40px"
                  v-if="mapZoomLevel > 2"
                  class="button-plain flex items-center q-ml-sm"
                  @click="zoomOut()"
                >
                  <div class="flex items-center row no-wrap q-px-xs">
                    <q-icon
                      name="mdi-magnify-minus-outline"
                      size="1rem"
                      class="q-pr-md"
                    />
                    <div>{{ $t('explore_view.zoom_out') }}</div>
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
import NearbyCountrySelect from '../NearbyView/NearbyCountrySelect.vue';
import DesktopDateSelect from '../NearbyView/DesktopDateSelect.vue';
import ControlSelect from 'src/components/Controls/ControlSelect.vue';
import TagControl from 'src/components/Controls/TagControl.vue';
import ArtistControl from 'src/components/Controls/ArtistControl.vue';
import DesktopSearchComponent from '../../Controls/DesktopSearchComponent.vue';
import TagExplorer from '../../TagExplorer.vue';

export default {
  components: {
    //ControlsComponent,
    //ArtistProfile,
    ArtistsComponent,
    EventDateList,
    EventDatePosterList,
    CustomQScroll,
    NearbyCountrySelect,
    DesktopDateSelect,
    ControlSelect,
    TagControl,
    ArtistControl,
    DesktopSearchComponent,
    TagExplorer,
  },

  async mounted() {
    setTimeout(() => {
      this.hasLoaded = true;
      // the event listener in q-scroll-area causees a bug in ios that makes you have to click twice on links within
    }, 500);
    if (this.eventDates?.length === 0) {
      this.blockUpdates = false;
      if (!this.currentLocation) {
        this.blockUpdates = true;

        /// await this.loadIpInfo();
        this.blockUpdates = false;
        this.getInitialList();
      } else {
        this.getInitialList();
      }
    }
    if (!this.currentLocation) {
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
    };
  },
  methods: {
    ...mapActions(useQueryStore, [
      'loadEventDates',
      'loadArtists',
      'loadMoreArtists',
      'clearAllFilters',
    ]),
    ...mapActions(useMainStore, ['loadIpInfo', 'persistTipsToLocalStorage']),
    clearArtists() {
      // force loading state after clicking to prevent glitchy feeling ui
      this.eventDates = [];
      this.eventDatesGroupedByMonth = {};
      this.eventDatesLoading = true;

      this.controlArtist = [];
    },
    clickRegion(region) {
      this.currentLocationCity = region.long_name;
      this.currentLocationFromSearch = true;
      console.log(region);
      toRaw(this.map).flyTo({
        center: { lat: region.lat, lng: region.lng },
        zoom: 7,
      });
    },

    zoomOut() {
      toRaw(this.map).flyTo({ zoom: 1 });
      this.showPanel = false;
    },
    async getInitialList() {
      // event date stuff
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
          await this.loadEventDates(true);
          //  await this.loadArtists();
        } catch (error) {}
      }
    },
    handleSwipe() {
      this.showPanel = !this.showPanel;
    },

    onScrollMainContent(info) {
      this.mainContentScrollPosition = info.verticalPosition;
      if (info.verticalPosition > 0) {
        this.enablePanelSwipeDown = false;
      }
      if (info.verticalPercentage > 0.99) {
        // reached bottom
        this.debouncedLoadMore();
      }
    },
    onScrollEnd() {
      if (this.mainContentScrollPosition == 0) {
        this.enablePanelSwipeDown = true;
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
      } /*else {
          if (this.$refs) this.$refs.scroll.setScrollPercentage('vertical', 0);
        }*/
    },
    sidebarPanel(newv) {
      this.$refs.scroll.setScrollPercentage('vertical', 0);
      /*
      if (newv === 'explore') {
        if (this.tips.hidePanelTip)
          setTimeout(() => {
            this.$q.notify({
              message: 'Tap the map or drag to hide/show the bottom panel!',
            });
            this.tips.hidePanelTip = false;
            this.persistTipsToLocalStorage();
          }, 1000);

        if (this.tips.oldAndroid && this.$q.platform.is.android) {
          setTimeout(() => {
            this.$q.notify({
              message:
                'Got an older phone? Improve app performance by switching to the transport map.',
            });
            this.tips.oldAndroid = false;
            this.persistTipsToLocalStorage();
          }, 15000);
        }
      }*/
    },
    mapMoving(newv) {
      if (newv) this.eventDatesHasNext = false;
    },
    route: {
      handler: async function (to) {
        if (to.name === 'Explore') {
          if (this.eventDates?.length === 0) {
            this.blockUpdates = false;
            this.getInitialList();
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
    controlEmptyLineup: {
      handler() {
        this.delayedGetInitial();
      },
    },
    controlDateUnconfirmed: {
      handler() {
        this.delayedGetInitial();
      },
    },
  },
  computed: {
    ...mapState(useMainStore, [
      'sidebarPanel',
      'currentLocation',
      'compactView',
      'groupEventsByMonth',
      'sidebarMinimized',
      'tips',
    ]),
    ...mapWritableState(useMainStore, [
      'showPanel',
      'showPanelBackground',
      'enablePanelSwipeDown',
      'currentLocationCity',
      'currentLocationFromSearch',
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
      'artistsHasNext',
      'anyFiltersEnabled',
      'topTagsInArea',
      'topArtistsInArea',
      'topRegionsInArea',
      'controlDateUnconfirmed',
      'controlEmptyLineup',
    ]),
    ...mapWritableState(useQueryStore, [
      'controlTag',
      'controlArtist',
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

    computedRegions1() {
      if (this.topRegionsInArea.length > 14) {
        return this.topRegionsInArea.filter((x, i) => i % 2);
      } else {
        return this.topRegionsInArea;
      }
    },
    computedRegions2() {
      if (this.topRegionsInArea.length > 14) {
        return this.topRegionsInArea.filter((x, i) => i % 2 !== 1);
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
    noResults() {
      return (
        (this.groupEventsByMonth &&
          Object.keys(this.eventDatesGroupedByMonth).length === 0) ||
        (!this.groupEventsByMonth && this.eventDates?.length === 0)
      );
    },
    // depends on results being mapped to stop loading indicator
    isLoadingInitial() {
      return (
        (this.eventDatesLoading && this.noResults) ||
        (this.mapMoving && !this.blockUpdates)
      );
    },
    isLoading() {
      return this.isLoadingInitial || this.eventDatesLoading;
    },
    route() {
      return this.$route;
    },
  },
  created() {
    this.debouncedOnScrollMainContent = _.debounce(
      this.onScrollMainContent,
      10,
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
  z-index: 1000;
  width: 100%;
  font-size: 1rem;
  //  font-family: 'Chicago';
  //  font-style: italic;
  font-family: 'Metropolis';
  font-weight: 800;

  &:lang(ru) {
    font-family: 'InterDisplay';
  }
  //font-style: italic;
  &.header-select {
    :deep(.q-field) {
      .q-field__control::before {
        border-bottom: none;
      }
    }
  }
}

.event-list-vertical {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: background 0.3s;
  //z-index: 3000;
  position: absolute;
  pointer-events: none;

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
      .top-section {
        //position: sticky;
        top: 0;
      }
      .bottom-section {
        position: sticky;
        top: 0;
      }
      .tag-scroll-area {
        mask-image: linear-gradient(to left, transparent 0px, white 64px);
        width: 100%;
        .city {
          transition: all 0.3s;
          cursor: pointer;
        }
      }
    }
    :deep(.q-scrollarea__thumb) {
      z-index: 5000;
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
      .city {
        &:hover {
          color: white;
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
    background: black;
  }
  .date-header {
    background: black;
  }
}

.body--light {
  .scroll-area {
    background: transparent;

    .tag-scroll-area {
      .city {
        &:hover {
          color: black;
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

      .scroll-content {
        position: relative;

        .bottom-section {
          background: white;
        }
      }
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

@media only screen and (min-width: 600px) and (max-width: 1023px) {
  .header {
    font-size: unset;
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
