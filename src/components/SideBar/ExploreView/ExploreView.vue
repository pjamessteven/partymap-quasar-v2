<template>
  <div
    class="event-list-vertical shadow-0 main-content"
    style="height: 100%; width: 100%; position: relative; overflow: hidden"
  >
    <div class="touch-overlay" v-touch-swipe="handleSwipe" />
    <div
      class="event-list-inner"
      v-bind:class="{
        'event-list-expanded': $q.screen.lt.sm && showPanelMobile,
      }"
    >
      <div
        class="flex column grow no-wrap"
        :class="{ 'q-mx-sm': $q.screen.lt.sm }"
      >
        <!--
        <q-icon
          v-if="$q.screen.lt.sm"
          @click="handleSwipe"
          flat
          v-touch-swipe="handleSwipe"
          name="mdi-chevron-up"
          class="mobile-hide-icon t1"
          :class="{
            'rotate-180 slower': showPanelMobile,
            'q-py-sm q-px-md q-py-sm': $q.screen.lt.sm
          }"
          size="1.5rem"
        />
        <div class="date-header-bg" />
-->
        <div class="flex q-px-md" v-if="controlFavorites">
          <q-select label="All my events" outlined square />
        </div>
        <q-scroll-area
          vertical
          @scroll="onScrollMainContent"
          ref="scroll"
          :thumb-style="{
            right: $q.screen.gt.xs ? '0px' : '-16px',
            width: $q.screen.gt.xs ? '4px' : '4px',
          }"
          class="scroll-area flex grow"
          :content-style="{
            height: '100%',
            'will-change': 'scroll-position',
            'touch-action': showPanelMobile ? 'auto' : 'auto',
          }"
        >
          <!--
          <q-input
            ref="search"
            debounce="300"
            clearable
            outlined
            dense
            class="search-input grow chicago q-mx-md q-mb-sm q-mt-sm"
            :placeholder="$t('search.search_box_text')"
            v-model="query"
            @keyup.enter="search"
          >
            <template v-slot:prepend>
              <i style="font-size: 0.7em!important" class="mdi mdi-magnify" />
            </template>
          </q-input>
          <div
            class="chicago text-h4  q-pt-lg"
            :class="$q.screen.lt.sm ? 'q-pl-sm q-mb-sm ' : 'q-pl-md q-mb-lg'"
          >
            <span v-if="sidebarPanel === 'favorites'">My favorites:</span>
            <span v-else>
              Explore
            </span>
          </div>
-->

          <transition enter-active-class="animated fadeIn">
            <div class="flex column no-wrap scroll-content">
              <div
                class="sidebar-header flex column no-wrap items-stretch justify-between ellipsis no-wrap"
                v-touch-swipe="
                  () => {
                    sidebarPanel = 'explore';
                  }
                "
              >
                <div
                  class="q-pl-md q-pt-md q-pb- q-pr-md ellipsis"
                  style="width: 100%"
                >
                  <span class="text-h4 chicago">Explore</span>
                </div>
              </div>
              <div class="flex column no-wrap content">
                <ControlsComponent
                  v-if="$q.screen.gt.xs"
                  class="controls-component"
                  :class="$q.screen.lt.sm ? 'q-pt-sm' : 'q-mt-md'"
                />
                <div
                  class="artist-profile-wrapper"
                  v-if="controlArtist.length > 0 && $q.screen.gt.xs"
                >
                  <ArtistProfile
                    :key="controlArtist[0].id"
                    :id="controlArtist[0].id"
                  />
                </div>
                <ControlsComponent
                  class="controls-component"
                  :class="$q.screen.lt.sm ? 'q-pt-sm' : 'q-mb-sm '"
                  :showSelectedValue="true"
                  :showOnlySelected="true"
                />

                <div
                  class="flex column"
                  v-if="
                    !isLoadingInitial &&
                    !computedMapMoving &&
                    Object.keys(componentGroup).length > 0
                  "
                >
                  <div
                    class="flex column artists-wrapper"
                    v-if="noFiltersSelected && artists?.length > 0"
                  >
                    <div
                      class="chicago header q-py-md t1"
                      :class="
                        $q.screen.lt.sm ? 'q-pl-sm q-mt-sm' : 'q-pl-md  q-py-md'
                      "
                    >
                      Top artists in this area:
                    </div>
                    <ArtistsComponent
                      class="artists-component"
                      :artists="artists"
                      :hasNext="artistsHasNext"
                      :loadMore="loadMoreArtists"
                    />
                  </div>

                  <transition appear enter-active-class="animated fadeIn">
                    <div class="flex column">
                      <div
                        v-for="yearMonth in Object.keys(componentGroup)"
                        :key="yearMonth"
                      >
                        <component
                          v-if="componentGroup[yearMonth].header"
                          :key="yearMonth + '-header'"
                          class="header q-mt-"
                          :class="$q.screen.lt.sm ? '' : ''"
                          :is="componentGroup[yearMonth].header.type"
                          v-bind="componentGroup[yearMonth].header.propsData"
                        >
                        </component>

                        <div
                          class="ed-card-grid q-pb-sm"
                          :style="computedGridColumns"
                          :class="{
                            'q-px-md ': $q.screen.gt.xs,
                            'q-px-sm  q-mt-': $q.screen.lt.sm,
                          }"
                        >
                          <component
                            v-for="(component, index) in componentGroup[
                              yearMonth
                            ].dates"
                            :key="index"
                            :is="component.type"
                            v-bind="component.propsData"
                          >
                          </component>
                        </div>
                      </div>
                    </div>
                  </transition>

                  <div
                    class="row justify-center q-my-lg q-mb-xl"
                    v-if="
                      eventDatesHasNext &&
                      eventDatesLoading &&
                      !isLoadingInitial &&
                      Object.keys(componentGroup).length !== 0
                    "
                  >
                    <q-spinner-ios
                      :color="$q.dark.isActive ? 'white' : 'black'"
                      size="2em"
                    />
                  </div>
                  <div
                    class="flex row justify-center q-mb-lg q-mt-lg t4"
                    v-if="
                      !eventDatesHasNext &&
                      componentGroup &&
                      Object.keys(componentGroup).length !== 0 &&
                      !eventDatesLoading &&
                      !isLoadingDatesInitial
                    "
                  >
                    <div>End of results</div>
                  </div>
                </div>
                <transition appear enter-active-class="animated fadeIn">
                  <div
                    class="no-parties-text chicago t4 flex grow q-mt-md"
                    v-if="
                      componentGroup &&
                      Object.keys(componentGroup).length == 0 &&
                      !eventDatesLoading &&
                      !isLoadingDatesInitial
                    "
                  >
                    No parties in this area :'(
                  </div>
                </transition>
              </div>
            </div>
          </transition>
        </q-scroll-area>
      </div>
      <div
        v-touch-swipe="handleSwipe"
        class="event-date-center flex grow justify-center q-pt-lg"
        style="height: 100%; position: absolute; width: 100%"
      >
        <q-spinner-ios
          :thickness="1"
          :color="$q.dark.isActive ? 'white' : 'black'"
          size="2em"
          v-if="
            isLoadingInitial &&
            componentGroup &&
            Object.keys(componentGroup).length == 0
          "
          v-touch-swipe="handleSwipe"
        />
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import moment from 'moment-timezone';
import EventDateCard from 'components/EventDateCard.vue';
import DateHeader from './DateHeader.vue';
import ArtistProfile from 'components/ArtistProfile.vue';
import ArtistsComponent from './../ArtistsComponent.vue';
import ControlsComponent from 'src/components/Controls/ControlsComponent.vue';
import { useMapStore } from 'src/stores/map';
import { useQueryStore } from 'src/stores/query';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { mapActions, mapWritableState, mapState } from 'pinia';

export default {
  components: {
    EventDateCard,
    ControlsComponent,
    DateHeader,
    ArtistProfile,
    ArtistsComponent,
  },
  props: { showControls: { default: false } },
  mounted() {
    if (!this.blockUpdates) {
      //this.getInitialList();
      // watcher on map bounds triggers inital load i think
    }
    setTimeout(() => {
      this.hasLoaded = true;
    }, 500);
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
    ]),
    ...mapActions(useMainStore, ['loadIpInfo']),
    // insert date header components and event dates into list
    generateComponentGroup(eventDates) {
      for (let ed of eventDates) {
        // assumes eventDates are sorted by time
        const start = moment(ed[0].start_naive);
        let yearMonth = start.month() + '' + start.year();
        if (!this.componentGroup[yearMonth]) {
          this.componentGroup[yearMonth] = {
            header: {
              type: 'DateHeader',
              propsData: {
                date: ed[0].start_naive,
              },
            },
            dates: [],
          };
        }
        if (
          !this.componentGroup[yearMonth].dates.find(
            (x) => x.propsData.event.id === ed[0].id
          )
        )
          this.componentGroup[yearMonth].dates.push({
            type: 'EventDateCard',
            propsData: {
              editing: this.editing,
              event: ed[0],
              class: 'ed-card',
              shortDate: true,
            },
          });
      }
      this.componentGroup = { ...this.componentGroup }; // needed to trigger re-render
      this.isLoadingDatesInitial = false;
    },

    async getInitialList() {
      this.$nextTick(async () => {
        if (this.$route.name === 'Explore' && !this.blockUpdates) {
          // event date stuff
          this.componentGroup = {};

          if (this.$refs) this.$refs.scroll.setScrollPercentage('vertical', 0);
          this.eventDatesHasNext = true;
          this.eventDatesPage = 1;
          this.isLoadingDatesInitial = true;
          if (!this.userLocation) {
            await this.loadIpInfo();
            this.loadMore();
          } else {
            this.loadMore();
          }
          // Artist stuff
          this.artistsPage = 1;
          this.artistsHasNext = true;
          this.isLoadingArtistsInitial = true;
          await this.loadArtists();
          this.isLoadingArtistsInitial = false;
        }
      });
    },
    async loadMore() {
      if (
        this.$route.name === 'Explore' &&
        this.eventDatesHasNext &&
        !this.blockUpdates
      ) {
        try {
          const dates = await this.loadEventDates();
          this.generateComponentGroup(dates);
          this.eventDatesPage += 1;
        } catch (error) {
          this.isLoadingDatesInitial = false;
        }
      }
    },
    handleSwipe() {
      this.showPanelMobile = !this.showPanelMobile;
    },
    onScrollMainContent(info) {
      if (
        this.hasLoaded &&
        this.eventDates != null &&
        !this.eventDatesLoading
      ) {
        // this.mainContentScrollPosition = info.verticalPosition
        // this.headerYOffset = info.verticalPosition
        /*
        if (info.verticalPercentage > 0) {
          // slide up mobile bottom panel when user tries to scroll
          // and to top to stop scroll action
          if (this.showPanelMobile === false) {
            this.showPanelMobile = true
            let interval = setInterval(() => {
              this.$refs.scroll.setScrollPercentage(0)
            }, 10)
            setTimeout(() => {
              clearInterval(interval)
            }, 400)
          }
        }
        */
      }
      this.mainContentScrollPosition = info.verticalPosition;

      if (info.verticalPercentage === 1) {
        // reached bottom
        this.loadMore();
      }
    },
  },
  watch: {
    route: {
      handler: async function (to) {
        if (to.name === 'Explore') {
          if (!this.eventDates) {
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

    sidebarPanel(newVal) {
      if (newVal === 'favorites' || newVal === 'explore') {
        //this.getInitialList();
      }
    },
    currentUser() {
      // load favorites after user logs in
      if (this.sidebarPanel === 'favorites') {
        this.getInitialList();
      }
    },
    controlTags: {
      handler() {
        this.getInitialList();
      },
      deep: true,
    },
    controlDateRange: {
      handler() {
        this.getInitialList();
      },
      deep: true,
    },
    controlDuration: {
      handler() {
        this.getInitialList();
      },
      deep: true,
    },
    controlSize: {
      handler() {
        this.getInitialList();
      },
      deep: true,
    },
    controlArtist: {
      handler() {
        this.getInitialList();
      },
      deep: true,
    },
    controlTag: {
      handler() {
        this.getInitialList();
      },
      deep: true,
    },
    controlFavorites() {
      this.getInitialList();
    },
  },
  computed: {
    ...mapState(useMainStore, [
      'sidebarExpanded',
      'sidebarPanel',
      'userLocation',
    ]),
    ...mapWritableState(useMainStore, ['showPanelMobile']),
    ...mapState(useAuthStore, ['currentUser']),
    ...mapState(useMapStore, ['mapBounds', 'mapMoving', 'blockUpdates']),
    ...mapState(useQueryStore, [
      'controlTag',
      'controlDateRange',
      'controlSize',
      'controlDuration',
      'controlArtist',
      'controlFavorites',
      'artists',
      'artistsHasNext',
      'eventDates',
      'eventDatesPage',
      'eventDatesHasNext',
      'eventDatesLoading',
    ]),
    ...mapWritableState(useQueryStore, [
      'eventDatesPage',
      'eventDatesHasNext',
      'artistsPage',
      'artistsHasNext',
    ]),
    noFiltersSelected() {
      return (
        this.controlDateRange.end === null &&
        this.controlArtist.length === 0 &&
        this.controlDuration.length === 0 &&
        this.controlSize.length === 0 &&
        this.controlFavorites === false &&
        this.controlTag.length === 0
      );
    },
    isLoadingInitial() {
      return this.isLoadingDatesInitial || this.isLoadingArtistsInitial;
    },
    computedMapMoving() {
      return this.mapMoving && !this.blockUpdates;
    },
    computedGridColumns() {
      if (this.sidebarExpanded) {
        return `
        grid-template-columns: repeat(2, minmax(0, 1fr));
        `;
      } else {
        return `
        grid-template-columns: repeat(1, minmax(0, 1fr));
        `;
      }
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
  z-index: 100;
  //transition: all 0.3s ease;
  // width: 100%;
  width: 100%;
  //height: 56px;
  position: sticky;
  top: 0px;
  //max-height: 48px;
  z-index: 10;
}

.event-list-vertical {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: background 0.3s;
  //z-index: 3000;
  position: absolute;
  pointer-events: none;
  .controls-component {
  }
  .event-list-inner {
    pointer-events: all;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: all 0.3s;

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
  //margin-top: 54px;
  .sort-control-wrapper {
    position: relative;
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
      padding: 16px;
      width: 100%;

      .artist-profile {
        width: 500px;
        max-width: 100%;
        //height: 200px;
        border-radius: 9px !important;
      }
    }
    .scroll-content {
      position: relative;
      width: 100%;
      min-height: 100%;
      .ed-card-grid {
        display: grid;
        grid-gap: 1rem;
        .ed-card {
          //max-height: 280px;
          .card {
            height: 100%;
            .card-content {
              height: 100%;
              justify-content: space-between;
            }
          }
        }
      }
    }
  }

  // pointer-events: none;
  .sort-control-wrapper {
    //border-bottom: 1px solid transparent;
    //border-top: 1px solid transparent;
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
}

.body--dark {
  .scroll-area {
    background: transparent;
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
    .search-input {
      background: #fafafa;
    }
  }
  .event-list-vertical {
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

@media only screen and (max-width: 600px) {
  .event-date-center {
    margin-top: 74px;
    align-items: start;
  }

  .event-list-vertical {
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
