<template>
  <div
    class="favorites-view shadow-0 main-content"
    style="height: 100%; width: 100%; position: relative"
  >
    <!--
        <div
          class="flex row no-wrap items-center justify-between q-pa-md view-options-absolute"
          v-if="$q.screen.gt.xs"
        >
          <div class="text-h5 inter bolder q-my-sm">Your Calendar</div>
        </div>
        <q-separator />
-->

    <transition appear enter-active-class="animated fadeIn">
      <div
        class="flex column no-wrap scroll-content"
        :class="{
          'q-px-sm': $q.screen.lt.sm,
        }"
      >
        <div
          class="q-pt-sm q-mt-sm flex row no-wrap items-center control-bar"
          :class="{
            'q-pl-lg q-pr-md q-mb-sm': $q.screen.gt.sm,
            'q-pl-sm': $q.screen.sm,
          }"
        >
          <CustomQScroll
            ref="scroll"
            horizontal
            class="scroll-area grow"
            :style="$q.screen.gt.sm ? 'height: 54px' : 'height: 44px'"
            :thumb-style="
              $q.screen.gt.xs
                ? { bottom: '2px', height: '4px' }
                : { bottom: '-8px', height: '0px' }
            "
          >
            <div
              class="flex row items-center scroll-wrapper"
              :class="[
                $q.screen.gt.xs
                  ? $q.screen.lt.xl
                    ? 'q-gutter-sm q-pr-md q-py-xs no-wrap'
                    : 'q-gutter-sm q-pr-md q-py-xs  no-wrap'
                  : 'q-gutter-sm q-px-sm  no-wrap',
              ]"
            >
              <q-btn
                no-caps
                class="button-plain flex items-center"
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
                class="button-plain flex items-center"
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
                  <q-icon name="mdi-check-circle" class="q-pr-md" size="1rem" />
                  <div>{{ $t('user_profile.going') }}</div>
                </div>
              </q-btn>

              <q-btn
                no-caps
                class="button-plain flex items-center"
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
                  <q-icon name="mdi-star-outline" class="q-pr-md" size="1rem" />
                  <div>{{ $t('user_profile.interested') }}</div>
                </div>
              </q-btn>

              <q-btn
                no-caps
                class="button-plain flex items-center"
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
                  <q-icon
                    name="mdi-check-decagram-outline"
                    class="q-pr-md"
                    size="1rem"
                  />
                  <div>{{ $t('user_profile.hosting') }}</div>
                </div>
              </q-btn>

              <q-btn
                no-caps
                class="button-plain flex items-center"
                :class="{
                  active: mode === 'created' || mode === 'reviewed',
                }"
                @click="
                  () => {
                    showingYouMenu = !showingYouMenu;
                  }
                "
              >
                <div class="flex items-center row no-wrap">
                  <q-icon
                    name="mdi-dots-vertical"
                    class="q-pr-md"
                    size="1rem"
                  />
                  <div>{{ $t('user_profile.more') }}</div>
                </div>
                <MenuWrapper
                  :showing="showingYouMenu"
                  @hide="() => (showingYouMenu = false)"
                  @show="() => (showingYouMenu = true)"
                  class="menu-wrapper inter bold"
                >
                  <q-list :class="$q.screen.lt.sm ? 'q-pb-xl' : undefined">
                    <q-item
                      v-close-popup
                      :active="mode === 'created'"
                      clickable
                      @click="
                        () => {
                          mode = 'created';
                        }
                      "
                    >
                      <q-item-section>
                        {{ $t('user_profile.created') }}
                      </q-item-section>
                    </q-item>
                    <q-item
                      v-close-popup
                      :active="mode === 'reviewed'"
                      clickable
                      @click="
                        () => {
                          mode = 'reviewed';
                        }
                      "
                    >
                      <q-item-section>
                        {{ $t('user_profile.reviewed') }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </MenuWrapper>
              </q-btn>

              <div
                class="separator vertical q-ml-md q-mr-sm"
                style="height: 32px"
              />

              <q-btn
                no-caps
                class="button-plain flex items-center"
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
                  <q-icon
                    name="mdi-clock-time-nine-outline"
                    class="q-pr-md"
                    size="1rem"
                  />
                  <div>{{ $t('user_profile.upcoming') }}</div>
                </div>
              </q-btn>

              <q-btn
                no-caps
                class="button-plain flex items-center"
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
                  <q-icon name="mdi-history" class="q-pr-md" size="1rem" />
                  <div>{{ $t('user_profile.past') }}</div>
                </div>
              </q-btn>
            </div>
          </CustomQScroll>
          <EventDateViewOptions
            :showGroupByMonth="false"
            v-if="$q.screen.gt.sm"
            class="q-mb-sm"
          />
        </div>

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
        <transition appear enter-active-class="animated fadeIn slower">
          <EventDateCardList
            v-if="userEventDates && compactView && !isLoadingDatesInitial"
            :groupByMonth="$q.screen.lt.md"
            :eventDatesGroupedByMonth="userEventDatesGroupedByMonth"
            :eventDates="userEventDates"
            :hasNext="userEventDatesHasNext"
            :twoColumnsMd="$q.screen.gt.xs"
          />
        </transition>
        <transition appear enter-active-class="animated fadeIn slower">
          <EventDatePosterList
            v-if="userEventDates && !compactView && !isLoadingDatesInitial"
            :groupByMonth="false"
            :eventDatesGroupedByMonth="userEventDatesGroupedByMonth"
            :eventDates="userEventDates"
            :hasNext="userEventDatesHasNext"
          />
        </transition>
      </div>
    </transition>
    <div
      class="event-date-center flex grow justify-center"
      style="height: 100%; position: absolute; width: 100%; top: 0px"
    >
      <InnerLoading v-if="isLoadingDatesInitial" :solid="false" :fixed="true" />
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import EventDateCardList from 'src/components/EventDateCardList.vue';
import EventDatePosterList from 'src/components/EventDatePosterList.vue';
import EventDateViewOptions from 'src/components/EventDateViewOptions.vue';
import CustomQScroll from 'components/CustomQScroll.vue';

import { useMapStore } from 'src/stores/map';
import { useQueryStore } from 'src/stores/query';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { mapActions, mapWritableState, mapState } from 'pinia';
import MenuWrapper from 'src/components/Controls/MenuWrapper.vue';
import InnerLoading from 'src/components/InnerLoading.vue';

export default {
  components: {
    // ArtistProfile,
    EventDateCardList,
    EventDatePosterList,
    EventDateViewOptions,
    MenuWrapper,
    InnerLoading,
    CustomQScroll,
  },
  props: {
    showControls: { default: false },
    username: {
      default: null,
    },
    scrollPercentage: { default: 0 },
  },
  mounted() {
    this.getInitialList();
  },
  data() {
    return {
      showingYouMenu: false,
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
            this.username || this.currentUser.username,
          );
          this.userEventDatesPage += 1;
          this.isLoadingDatesInitial = false;
        } catch (error) {
          this.isLoadingDatesInitial = false;
        }
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
    computedScrollPercentage(newv) {
      if (newv === 1) {
        this.loadMore();
      }
    },
  },
  computed: {
    computedScrollPercentage() {
      return this.scrollPercentage;
    },
    ...mapState(useMainStore, [
      'sidebarPanel',
      'currentLocation',
      'compactView',
      'groupEventsByMonth',
    ]),
    ...mapWritableState(useMainStore, ['showPanel', 'enablePanelSwipeDown']),
    ...mapState(useAuthStore, ['currentUser']),
    ...mapState(useMapStore, ['mapBounds', 'blockUpdates']),
    ...mapState(useQueryStore, ['userEventDatesLoading']),
    ...mapWritableState(useQueryStore, [
      'userEventDatesGroupedByMonth',
      'userEventDates',
      'userEventDatesPage',
      'userEventDatesHasNext',
    ]),
  },
  created() {
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

.control-bar {
  position: sticky;
  top: 0px;
  z-index: 100;
}

.favorites-view {
  pointer-events: all;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s;

  :deep(.date-header-wrapper) {
    top: 48px !important;
    z-index: 1 !important;
    .date-header {
      padding-top: 16px;
    }
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
  .control-bar {
    background: black;
  }
  .scroll-area {
    background: transparent;
  }

  .favorites-view {
    .controls-component {
      background: black;

      //background: black;
    }
    .favorites-view {
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
  .control-bar {
    background: white;
  }
  .scroll-area {
    background: transparent;
    .search-input {
      background: #fafafa;
    }
  }
  .favorites-view {
    .favorites-view {
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

@media only screen and (max-width: 599px) {
  .event-date-center {
    //margin-top: 74px;
    align-items: start;
  }

  .favorites-view {
    //padding-top: 64px !important;
    padding-bottom: 68px;
    .favorites-view {
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
