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
            'will-change': 'scroll-position',
            'touch-action': showPanelMobile ? 'auto' : 'auto',
          }"
        >
          <transition enter-active-class="animated fadeIn">
            <div class="flex column no-wrap scroll-content">
              <div
                v-if="$q.screen.gt.xs"
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
                  <span class="text-h4 chicago">Your events</span>
                </div>
              </div>

              <div class="flex column no-wrap content">
                <div
                  class="q-mt-md flex column"
                  :class="$q.screen.gt.xs ? 'q-pl-md' : ''"
                >
                  <q-scroll-area
                    ref="scroll"
                    horizontal
                    class="scroll-area"
                    :class="$q.screen.lt.sm ? 'q-mb-sm' : ''"
                    :style="$q.screen.gt.xs ? 'height: 54px' : 'height: 44px'"
                    :thumb-style="
                      $q.screen.gt.xs
                        ? { bottom: '2px', height: '4px' }
                        : { bottom: '-8px', height: '0px' }
                    "
                    v-touch-swipe.vertical="handleSwipe"
                  >
                    <div
                      class="flex row scroll-wrapper"
                      :class="[
                        $q.screen.gt.xs
                          ? $q.screen.lt.xl && !this.sidebarExpanded
                            ? 'q-gutter-sm q-pr-md q-py-xs no-wrap'
                            : 'q-gutter-sm q-pr-md q-py-xs  no-wrap'
                          : 'q-gutter-sm q-px-sm  no-wrap',
                      ]"
                    >
                      <q-btn
                        no-caps
                        class="button-control flex items-center"
                        :class="{
                          active: mode === 'all',
                        }"
                        @click="
                          () => {
                            mode = 'all';
                          }
                        "
                      >
                        <div class="flex items-center row no-wrap">
                          <div>All</div>
                        </div>
                      </q-btn>

                      <q-btn
                        no-caps
                        class="button-control flex items-center"
                        :class="{
                          active: mode === 'going',
                        }"
                        @click="
                          () => {
                            mode = 'going';
                          }
                        "
                      >
                        <div class="flex items-center row no-wrap">
                          <div>Going</div>
                        </div>
                      </q-btn>

                      <q-btn
                        no-caps
                        class="button-control flex items-center"
                        :class="{
                          active: mode === 'interested',
                        }"
                        @click="
                          () => {
                            mode = 'interested';
                          }
                        "
                      >
                        <div class="flex items-center row no-wrap">
                          <div>Interested</div>
                        </div>
                      </q-btn>

                      <q-btn
                        no-caps
                        class="button-control flex items-center"
                        :class="{
                          active: mode === 'hosting',
                        }"
                        @click="
                          () => {
                            mode = 'hosting';
                          }
                        "
                      >
                        <div class="flex items-center row no-wrap">
                          <div>Hosting</div>
                        </div>
                      </q-btn>

                      <q-btn
                        no-caps
                        class="button-control flex items-center"
                        :class="{
                          active: mode === 'created',
                        }"
                        @click="
                          () => {
                            mode = 'created';
                          }
                        "
                      >
                        <div class="flex items-center row no-wrap">
                          <div>Created</div>
                        </div>
                      </q-btn>

                      <q-btn
                        no-caps
                        class="button-control flex items-center"
                        :class="{
                          active: mode === 'following',
                        }"
                        @click="
                          () => {
                            mode = 'following';
                          }
                        "
                      >
                        <div class="flex items-center row no-wrap">
                          <div>Contributed</div>
                        </div>
                      </q-btn>
                    </div>
                  </q-scroll-area>
                  <q-scroll-area
                    ref="scroll"
                    horizontal
                    class="scroll-area q-mb-xs"
                    :style="
                      $q.screen.gt.xs && $q.screen.lt.xl
                        ? 'height: 54px'
                        : 'height: 44px'
                    "
                    :thumb-style="
                      $q.screen.gt.xs
                        ? { bottom: '0px', height: '4px' }
                        : { bottom: '-8px', height: '0px' }
                    "
                    v-touch-swipe.vertical="handleSwipe"
                  >
                    <div
                      class="flex row scroll-wrapper"
                      :class="[
                        $q.screen.gt.xs
                          ? $q.screen.lt.xl && !this.sidebarExpanded
                            ? 'q-gutter-sm q-pr-md q-py-xs no-wrap'
                            : 'q-gutter-sm q-pr-md q-py-xs  no-wrap'
                          : 'q-gutter-sm q-px-sm  no-wrap',
                      ]"
                    >
                      <q-btn
                        no-caps
                        class="button-control flex items-center"
                        :class="{
                          active: tense === 'future',
                        }"
                        @click="
                          () => {
                            tense = 'future';
                          }
                        "
                      >
                        <div class="flex items-center row no-wrap">
                          <div>Upcoming</div>
                        </div>
                      </q-btn>

                      <q-btn
                        no-caps
                        class="button-control flex items-center"
                        :class="{
                          active: tense === 'past',
                        }"
                        @click="
                          () => {
                            tense = 'past';
                          }
                        "
                      >
                        <div class="flex items-center row no-wrap">
                          <div>Past</div>
                        </div>
                      </q-btn>
                    </div>
                  </q-scroll-area>
                </div>

                <UserProfile :user="user" />
                <!--
                  TODO: ADD USER ARTIST PROFILE
                <div
                  class="artist-profile-wrapper"
                  v-if="controlArtist.length > 0 && $q.screen.gt.xs"
                >
                  <ArtistProfile
                    :key="controlArtist[0].id"
                    :id="controlArtist[0].id"
                  />
                </div>
                -->

                <transition appear enter-active-class="animated fadeIn">
                  <div class="flex column" v-show="!isLoadingDatesInitial">
                    <EventDateList
                      :eventDates="userEventDates"
                      :hasNext="userEventDatesHasNext"
                      @loaded="
                        () => {
                          isLoadingDatesInitial = false;
                        }
                      "
                    />
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
          v-if="isLoadingDatesInitial"
          v-touch-swipe="handleSwipe"
        />
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import ArtistProfile from 'components/ArtistProfile.vue';
//import UserListItem from 'components/UserListItem.vue';

import EventDateList from 'src/components/EventDateList.vue';
import { useMapStore } from 'src/stores/map';
import { useQueryStore } from 'src/stores/query';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { mapActions, mapWritableState, mapState } from 'pinia';

export default {
  components: {
    // ArtistProfile,
    EventDateList,
  },
  props: { showControls: { default: false } },
  mounted() {
    this.getInitialList();
  },
  data() {
    return {
      tense: 'future',
      mode: 'all',
      mainContentScrollPosition: 0,
      scrollingUp: false,
      headerYPosition: 0,
      year: 0,
      componentGroup: {},
      isLoadingDatesInitial: false,
    };
  },
  methods: {
    ...mapActions(useQueryStore, ['loadUserEventDates']),

    async getInitialList() {
      // event date stuff
      this.userEventDates = [];
      this.isLoadingDatesInitial = true;
      if (this.$refs) this.$refs.scroll.setScrollPercentage('vertical', 0);
      this.userEventDatesHasNext = true;
      this.userEventDatesPage = 1;

      this.loadMore();
    },
    async loadMore() {
      if (this.userEventDatesHasNext) {
        try {
          await this.loadUserEventDates(
            this.mode,
            this.tense,
            this.currentUser.username
          );
          this.userEventDatesPage += 1;
        } catch (error) {
          this.isLoadingDatesInitial = false;
        }
      }
    },
    handleSwipe() {
      this.showPanelMobile = !this.showPanelMobile;
    },
    onScrollMainContent(info) {
      this.mainContentScrollPosition = info.verticalPosition;

      if (info.verticalPercentage === 1) {
        // reached bottom
        this.loadMore();
      }
    },
  },
  watch: {
    mode() {
      this.getInitialList();
    },
    tense() {
      this.getInitialList();
    },
    currentUser() {
      // load favorites after user logs in
      if (this.sidebarPanel === 'favorites') {
        this.getInitialList();
      }
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
    ...mapState(useMapStore, ['mapBounds', 'blockUpdates']),
    ...mapState(useQueryStore, ['userEventDatesLoading']),
    ...mapWritableState(useQueryStore, [
      'userEventDates',
      'userEventDatesPage',
      'userEventDatesHasNext',
    ]),

    route() {
      return this.$route;
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

  .no-parties-text {
    margin-left: 16px;
  }
  .scroll-area {
    height: 100%;
    :deep(.q-scrollarea__thumb) {
      z-index: 1000;
    }
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
