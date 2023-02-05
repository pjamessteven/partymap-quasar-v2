<template>
  <div class="landing-page flex column no-wrap">
    <div class="main-content flex row justify-center">
      <transition enter-active-class="">
        <div class="flex column grow no-wrap" style="width: 100%">
          <div
            class="flex column grow no-wrap"
            style="height: 100%; width: 100%"
          >
            <q-scroll-area
              @scroll="onScroll"
              vertical
              :thumb-style="{
                right: $q.screen.gt.xs ? '0px' : '0px',
                width: $q.screen.gt.xs ? '4px' : '4px',
              }"
              class="scroll-area flex grow"
              :content-style="{
                'will-change': 'scroll-position',
              }"
            >
              <!--
              <div class="flex column justify-end items-start banner">
                <div
                  class="banner-text q-mt-lg q-mb-sm"
                  :class="{
                    'q-pt-sm': $q.screen.lt.sm,
                    'q-my-xl': sidebarExpanded
                  }"
                  style="text-transform: capitalize; width: 100%"
                >
                  <div class="flex column">
                    <div
                      v-touch-swipe="
                        () => {
                          sidebarPanel = 'explore';
                        }
                      "
                      class="  flex column  no-wrap "
                    >
                      <div class="separator" />-->

              <!--
            <q-icon
              @click="handleSwipe"
              flat
              v-touch-swipe="handleSwipe"
              name="mdi-chevron-up"
              class="mobile-hide-icon "
              :class="{
                'rotate-180': showPanelMobile,
                'q-py-md q-px-lg': $q.screen.lt.sm
              }"
              size="2em"
              v-if="$q.screen.lt.sm"
            />


                    </div>
                  </div>
                </div>
                <div class="banner-background">
                  <video
                    class="banner-video"
                    src="@/assets/pm1small2.mp4"
                    autoplay
                    playsinline
                    loop
                    muted
                    poster="@/assets/pm1small.png"
                  />
                </div>
              </div>
  -->
              <div
                class="flex row justify-center items-center q-py-xl q-mt-xl"
                style="height: 300px; width: 100%"
                v-if="loadingEverything"
              >
                <q-spinner-ios color="primary" size="2em" />
              </div>

              <div class="flex column scroll-content q-mt-" v-else>
                <div
                  class="sidebar-header flex column grow no-wrap items-stretch justify-between ellipsis no-wrap q-pl-md"
                  v-touch-swipe="
                    () => {
                      sidebarPanel = 'explore';
                    }
                  "
                >
                  <div class="q-pr-md ellipsis">
                    <span class="text-h4 chicago">Nearby</span>
                  </div>
                  <div
                    class="flex items-center justify-between no-wrap text-large chicago t1 q-mt- q-pt-md"
                    :class="$q.screen.lt.sm ? 'q-py-md' : ''"
                    style="text-transform: "
                  >
                    <span v-if="userLocationName" class="ellipsis">
                      {{ userLocationName }}
                    </span>
                    <span v-else
                      >class="ellipsis" Finding your location...
                    </span>
                    <q-btn
                      class="q-ml-sm q--r"
                      :class="$q.screen.gt.sm ? 'q-mr-md' : ''"
                      style="cursor: pointer"
                      flat
                      sqaure
                      :loading="userLocationLoading"
                      @click="getLocation"
                    >
                      <template v-slot:default>
                        <div v-if="!userLocationLoading">
                          <q-icon
                            name="mdi-crosshairs-gps"
                            class="q-px-sm"
                            v-if="fineLocation"
                          />
                          <q-icon
                            name="mdi-crosshairs"
                            class="q-px-sm"
                            v-else
                          />
                        </div>
                        <div v-else style="position: relative">
                          <q-icon
                            class="q-pa-sm"
                            style="z-index: 1"
                            name="mdi-crosshairs"
                          />
                          <q-icon
                            style="z-index: 2; left: 0px"
                            class="q-pa-sm animated infinite flash slowest absolute"
                            name="mdi-crosshairs-gps"
                          />
                        </div>
                        <q-tooltip
                          :content-class="
                            $q.dark.isActive
                              ? 'bg-black text-white'
                              : 'bg-white text-black'
                          "
                          :offset="[10, 10]"
                          content-style="font-size: 16px"
                        >
                          {{ $t('landing_page.improve_location') }}
                        </q-tooltip>
                      </template>
                    </q-btn>
                  </div>
                </div>
                <div class="content">
                  <!-- tags -->

                  <div class="q-py-md header q-mt-sm">
                    <div
                      v-if="nearbyTags && nearbyTags.length > 0"
                      class="t1 text- chicago q-pl-md"
                    >
                      Top tags:
                    </div>
                  </div>
                  <div
                    class="q-pl-md"
                    v-if="nearbyTags && nearbyTags.length > 0"
                  >
                    <q-scroll-area
                      horizontal
                      class="tag-scroll-area"
                      style="width: 100%"
                      :thumb-style="
                        $q.screen.gt.xs
                          ? { bottom: '0px', height: '8px' }
                          : { bottom: '0px', height: '0px' }
                      "
                    >
                      <div class="flex column">
                        <div class="flex row no-wrap q-gutter-sm">
                          <div
                            v-for="(tag, index) in nearbyTags.filter(
                              (x, i) => i % 2
                            )"
                            :key="index"
                            @selected="clickTag(tag)"
                            class="tag t2 text- chicago"
                            style="text-transform: capitalize"
                          >
                            {{ tag.tag }}
                          </div>
                        </div>
                        <div class="flex row no-wrap q-gutter-sm q-pt-sm">
                          <div
                            v-for="(tag, index) in nearbyTags.filter(
                              (x, i) => i % 2 !== 1
                            )"
                            :key="index"
                            @selected="clickTag(tag)"
                            class="tag t2 text- chicago"
                            style="text-transform: capitalize"
                          >
                            {{ tag.tag }}
                          </div>
                        </div>
                      </div>
                      <!--

                    <div
                      class="flex row no-wrap q-gutter-xs  t2 "
                      :class="{
                        'q-pr-lg': $q.screen.gt.xs,
                        'q-pr-md': $q.screen.lt.sm
                      }"
                      v-if="nearbyTags"
                    >
                      <Tag
                        v-for="(tag, index) in nearbyTags"
                        :key="index"
                        :value="tag.tag"
                        :label="tag.label"
                        @selected="clickTag(tag)"
                        :selected="
                          selectedTags.findIndex(x => x.tag == tag.tag) > -1
                        "
                      ></Tag>
                      <Tag
                        v-if="nearbyTagsHasNext"
                        :key="-2"
                        :value="'...show more'"
                        v-on:selected="loadMoreNearbyTags()"
                      />
                    </div>
                                          -->
                    </q-scroll-area>
                  </div>
                  <!--
              <div
                v-else
                class="t4 q-mt-sm"
                :class="{
                  'q-pl-lg': $q.screen.gt.xs,
                  'q-pl-md': $q.screen.lt.sm
                }"
              >
                {{ $t('landing_page.no_tags_in_area') }}
              </div>
            -->
                  <!-- artists -->

                  <div
                    class="t1 header q-py-md chicago q-pl-md"
                    v-if="nearbyArtists && nearbyArtists.length > 0"
                  >
                    {{ $t('landing_page.top_artists_in_area') }}:
                  </div>
                  <ArtistsComponent
                    v-if="nearbyArtists && nearbyArtists.length > 0"
                    :artists="nearbyArtists"
                    :hasNext="nearbyArtistsHasNext"
                    :loadMore="loadMoreNearbyArtists"
                  />

                  <!--
              <div
                v-else
                class="t4 q-mt-sm"
                :class="{
                  'q-pl-lg': $q.screen.gt.xs,
                  'q-pl-md': $q.screen.lt.sm
                }"
              >
                {{ $t('landing_page.no_artists_in_area') }}
              </div>
            -->
                  <!--
              <div class="q-px-md q-mb-sm q-mt-sm">
                <div class="separator" />
              </div>
            -->
                  <!-- NEARBY EVENTS -->

                  <div
                    class="t1 chicago header q-py-sm flex row items-baseline q-pl-md"
                  >
                    <div class="">
                      {{ $t('landing_page.events_within') }}
                    </div>
                    <q-select
                      emit-value
                      dense
                      borderless
                      map-options
                      behavior="menu"
                      class="q-ml-xs radius-select chicago o-050"
                      v-model="queryRadius"
                      :options="queryRadiusOptions"
                    />
                  </div>
                  <transition
                    appear
                    enter-active-class="animated fadeIn faster"
                    v-if="nearbyEventDates && nearbyEventDates.length > 0"
                  >
                    <div
                      class="ed-card-grid q-px-md"
                      :style="computedGridColumns"
                    >
                      <EventDateCard
                        v-for="(ed, index) in nearbyEventDates"
                        :key="index"
                        :event="ed[0]"
                        class="ed-card"
                      />
                    </div>
                  </transition>
                  <div
                    v-if="
                      !nearbyEventDatesLoading &&
                      nearbyEventDates &&
                      nearbyEventDates.length === 0
                    "
                    class="t4"
                    :class="{
                      'q-pl-lg': $q.screen.gt.xs,
                      'q-pl-md': $q.screen.lt.sm,
                    }"
                  >
                    {{ $t('landing_page.no_events_in_area') }}
                  </div>
                  <!-- ALL EVENTS -->

                  <div
                    class="location-header flex items-center justify-between no-wrap text-large chicago t1 q-mt- q-py-md q-pl-md"
                    :class="$q.screen.lt.sm ? 'q-py-md' : ''"
                    v-touch-swipe="
                      () => {
                        sidebarPanel = 'explore';
                      }
                    "
                  >
                    <!--<div class="separator" /> -->

                    <div class="flex row grow no-wrap ellipsis">
                      <div class="ellipsis flex grow items-center">
                        <div
                          class="ellipsis t1 text-large chicago"
                          v-if="userLocationName"
                        >
                          {{ $t('landing_page.all_upcoming_events') }}:
                        </div>
                      </div>
                    </div>
                  </div>

                  <transition
                    appear
                    enter-active-class="animated fadeIn faster"
                    v-if="eventDates && eventDates.length > 0"
                  >
                    <div
                      class="ed-card-grid q-px-md"
                      :style="computedGridColumns"
                    >
                      <EventDateCard
                        v-for="(ed, index) in eventDates"
                        :key="index"
                        :event="ed[0]"
                        class="ed-card"
                      />
                    </div>
                  </transition>
                  <div
                    class="flex row justify-center q-mt-md"
                    style="opacity: 0"
                  >
                    <a
                      v-for="i in eventDatesPageNumbers"
                      :key="i"
                      class="link-hover q-mr-xs t3"
                      @click="loadEventDatePage(i)"
                      :class="i === eventDatesPage ? 'text-primary' : ''"
                    >
                      [{{ i }}]
                    </a>
                  </div>
                </div>

                <!--
                <div
                  class="flex row justify-center q-mt-lg t3"
                  v-if="!eventDatesHasNext && eventDates != null"
                >
                  <div>End of results</div>
                </div>
              --></div>
            </q-scroll-area>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { getFineLocation } from 'assets/common.js';

import ArtistsComponent from './../ArtistsComponent.vue';
import EventDateCard from 'components/EventDateCard.vue';
import { useQueryStore } from 'src/stores/query';
import { useMainStore } from 'src/stores/main';

export default {
  name: 'LandingPage',
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: 'PartyMap | The Global Map of Festivals and Events',
      meta: {
        description: {
          name: 'description',
          content:
            'PartyMap is a community-driven platform for discovering festivals and events near you and around the world.',
        },
        keywords: {
          name: 'keywords',
          content:
            'Festival, Festivals, Map, Events, Party, Fiesta, Music, Music Festival, Music Festivals, Best Music Festivals, All Music Festivals, Top Music Festivals, List of music festivals, list',
        },
      },
    };
  },

  components: {
    EventDateCard,
    ArtistsComponent,
  },
  data() {
    return {
      scrollPosition: 0,
      queryRadiusOptions: [
        {
          label: '10km',
          value: 10000,
        },
        {
          label: '20km',
          value: 20000,
        },
        {
          label: '50km',
          value: 50000,
        },
        {
          label: '100km',
          value: 100000,
        },
        {
          label: '200km',
          value: 200000,
        },
        {
          label: '500km',
          value: 500000,
        },
        {
          label: '1000km',
          value: 1000000,
        },
        {
          label: '2000km',
          value: 2000000,
        },
        {
          label: '5000km',
          value: 5000000,
        },
        {
          label: '10,000km',
          value: 10000000,
        },
        {
          label: '20,000km',
          value: 20000000,
        },
      ],
    };
  },
  created() {
    this.getFineLocation = getFineLocation;
  },
  methods: {
    ...mapActions(useMainStore, ['loadIpInfo']),
    ...mapActions(useNearbyStore, [
      'loadEverything',
      'loadMoreNearbyTags',
      'loadMoreNearbyArtists',
      'loadMoreNearbyEventDates',
      'loadMoreEventDates',
    ]),
    onScroll(info) {
      // infinite scrolling
      this.scrollPosition = info.verticalPosition;
      if (info.verticalPercentage === 1) {
        if (this.nearbyEventDatesHasNext) {
          this.loadMoreNearbyEventDates();
        } else if (this.eventDatesHasNext) {
          this.loadMoreEventDates();
        }
      }
    },
    addParamsToLocation(params) {
      history.pushState(
        {},
        null,
        this.$route.path +
          '?' +
          Object.keys(params)
            .map((key) => {
              return (
                encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
              );
            })
            .join('&')
      );
    },
    getLocation() {
      this.getFineLocation();
    },
    clickTag(tag) {
      // mutation toggles tag
      this.controlTag = [tag];
    },

    loadEventDatePage(page) {
      // hidden pagination for SEO
      this.addParamsToLocation({ global_page: page });
      this.eventDates = null;
      this.eventDatesPage = page;
      this.loadEventDates;
    },

    handleSwipe({ evt, ...info }) {
      this.showPanelMobile = !this.showPanelMobile;
    },
  },
  watch: {
    userLocation: {
      handler: function (newval, oldval) {
        if (oldval != null) {
          this.queryRadius = null;
          this.loadEverything();
        }
      },
    },
    queryRadius: {
      handler: function (newval, oldval) {
        if (oldval != null) {
          this.loadEverything();
        }
      },
    },
  },
  computed: {
    ...mapWritableState(useMainStore, [
      'sidebarExpanded',
      'showPanelMobile',
      'sidebarPanel',
      'menubarOpacity',
      'userLocationLoading',
    ]),
    ...mapState(useMainStore, [
      'userLocationLoading',
      'userLocation',
      'userLocationName',
    ]),
    ...mapWritableState(useQueryStore, ['controlTag']),
    ...mapWritableState(useNearbyStore, [
      'queryRadius',
      'eventDates',
      'eventDatesPage',
    ]),
    ...mapState(useNearbyStore, [
      'loadingEverything',
      'nearbyTags',
      'nearbyTagsHasNext',
      'nearbyTagsPage',
      'nearbyArtists',
      'nearbyArtistsHasNext',
      'nearbyArtistsPage',
      'nearbyEventDates',
      'nearbyEventDatesHasNext',
      'nearbyEventDatesPage',
      'eventDatesHasNext',
      'eventDatesPages',
    ]),

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

    // make array of page numbers for SEO
    eventDatesPageNumbers() {
      var ans = [];
      for (let i = 1; i <= this.eventDatesPages; i++) {
        ans.push(i);
      }
      return ans;
    },
  },
  beforeMount() {
    window.prerenderReady = false;
  },

  unmounted() {
    this.menuBarOpacity = 1;
  },

  async mounted() {
    if (!this.userLocation) {
      await this.loadIpInfo();
    }
    if (this.$route.query.global_page) {
      // used by hidden pagination for SEO
      this.eventDatesPage = Number(this.$route.query.global_page);
      await this.loadEventDates();
      setTimeout(() => {
        window.prerenderReady = true;
      }, 300);
    } else {
      await this.loadEverything();
      setTimeout(() => {
        window.prerenderReady = true;
      }, 300);
    }
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .landing-page {
    .landing-page-background {
      //  background: linear-gradient(180deg, rgba(0, 0, 0, 0.48), black);
    }
    .map-gap {
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }
    .location-header {
      background: $bi-2;
    }
    .main-content {
      .banner {
        //background: $bi-2;
        .banner-background {
          .banner-video {
            opacity: 0.48;
          }
        }
      }
      .header {
        background: black;
      }
      .separator {
        background: linear-gradient(
          to right,
          rgba(255, 255, 255, 0.05),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.05)
        ) !important;
        height: 1px;
        border: none;
      }
      .tag-scroll-area {
        .tag {
          opacity: 1;
          transition: all 0.3s ease;
          background: $bi-1;
          border: 1px solid rgba(255, 255, 255, 0.2);

          &:hover {
            opacity: 1;
            background: rgba(36, 36, 36, 1);
          }
          &.selected {
            background: rgba(24, 24, 24, 1);
          }
        }
      }
    }
  }
}
.body--light {
  .landing-page {
    .landing-page-background {
      //background: linear-gradient(180deg, rgba(0, 0, 0, 0), black);
    }
    .map-gap {
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }
    .location-header {
      background: $b-2;
    }
    .main-content {
      .banner {
        //background: white;

        .tile-background {
          filter: invert(1);
          opacity: 0.2;
        }
        .banner-background {
          .banner-video {
            opacity: 0.68;
          }
        }
      }
      .header {
        background: white;
        //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.2);

        //background: linear-gradient($b-3, $b-2);
        //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.1);
      }
      .separator {
        background: linear-gradient(
          to right,
          transparent,
          rgba(0, 0, 0, 0.1),
          transparent
        ) !important;
        height: 1px;
        border: none;
      }
      .tag-scroll-area {
        .tag {
          // opacity: 1;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0);
          border: 1px solid rgba(0, 0, 0, 0.1);
          &:hover {
            background: rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
  }
}
.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}
.landing-page {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  .lights-wrapper {
    width: 100%;
    height: 50px;
    position: absolute;
    pointer-events: none;
    top: 154px;
    opacity: 0.48;
    z-index: 5000;
    display: none;
    .lights-image {
      max-width: 400px;
      height: auto;
      width: 100%;
      position: relative;
      right: 0px;
    }
  }
  .banner {
    position: relative;
    overflow: hidden;
    height: 200px;
    background: black;
    color: white;
    font-family: chicagoflf;
    .banner-text {
      z-index: 2;
    }
    .banner-background {
      position: absolute;
      height: 100%;
      width: 100%;
      .banner-video {
        position: absolute;
        width: 100%;
      }
    }
  }

  .scroll-area {
    height: 100%;
    overflow: hidden;
    border-radius: 18px;
    .scroll-content {
      // padding-top: 32px;
      .location-header {
        position: sticky;
        top: 54px;
        z-index: 100;
        width: 100%;
      }
    }
    :deep(.q-scrollarea__thumb) {
      z-index: 10;
    }
  }
  .map-gap {
    position: relative;

    width: 100%;
    min-height: calc(33vh - 64px);
    &:hover {
      .text-wrapper {
        .explore {
          transform: scale(1.05);
          filter: contrast(150%);
        }
        .anim-text-flow {
        }
      }
    }
    .text-wrapper {
      //width: 500px;
      //overflow: hidden;
      .explore {
        transition: all 0.3s ease;
      }
      .anim-text-flow {
        $animationSteps: 20;
        $animationDuration: 50;
        $animationElement: span;
        $animationElementsCount: 50;
        $delayBetweenLetters: 0.1;

        // Elements settings
        #{$animationElement} {
          animation-name: anim-text-flow-keys;
          animation-duration: #{$animationDuration}s;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          animation-fill-mode: forwards;
        }

        // Keyframe loop
        @keyframes anim-text-flow-keys {
          @for $i from 0 through $animationSteps {
            #{percentage($i * (1 / $animationSteps))} {
              color: hsla(random(80) + 20, random(30) + 10, 60, 1);
            }
          }
        }

        // Element animation delay loop
        $totalDelayTime: $animationElementsCount * $delayBetweenLetters;

        @for $i from 1 through $animationElementsCount {
          #{$animationElement}:nth-of-type(#{$i}) {
            animation-delay: #{($i * $delayBetweenLetters) - $totalDelayTime}s;
          }
        }
      }
    }
  }
  .main-content {
    width: 100%;
    height: 100%;

    .mobile-hide-wrapper {
      position: sticky;
      top: 0px;
      right: 0px;
      z-index: 50;
    }
    .mobile-hide-icon {
      position: absolute;
      top: 0px;
      right: 0px;
      z-index: 100;
    }
    .banner {
    }
    .header {
      width: 100%;
      //height: 56px;
      position: relative;
      //max-height: 72px;
      z-index: 5;
      //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.1);
      .location-input {
        input {
          font-size: 18px;
          font-weight: 600;
          line-height: 1.8rem;
          letter-spacing: 0.0125em;
        }
      }
    }
    .q-field {
      .q-field__inner {
        .q-field__control {
          font-size: 16px;
          .q-field__append {
            padding-left: 0px !important;
          }
        }
      }
    }
    .artist-scroll-area {
      height: 164px;
      width: 100%;
      mask-image: linear-gradient(to left, transparent 0px, white 64px);
    }

    .tag-scroll-area {
      height: 88px;
      mask-image: linear-gradient(to left, transparent 0px, white 64px);
      width: 100%;
      .tag {
        opacity: 1;
        transition: all 0.3s ease;
        white-space: nowrap;
        cursor: pointer;
        border-radius: 9px;
        padding: 6px 12px;
        //font-size: small;
        &:hover {
          // opacity: 0.48;
        }
        &.selected {
          text-decoration: underline;
        }
      }
    }
    .radius-select {
      margin-left: 6px;
      font-size: 0.91rem !important;
      .q-field__inner {
        .q-field__control {
          font-size: unset !important;
          font-weight: 700 !important;
          .q-field__append {
            padding-left: 0px !important;
          }
        }
      }
    }
    .ed-card-grid {
      display: grid;
      grid-gap: 1rem;
      .ed-card {
        max-height: 280px;
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

@media (max-width: 600px) {
  .landing-page {
    .map-gap {
      height: 150px;
      //font-size: 8pt;
      background: none;
      min-height: unset;
      //background: radial-gradient(rgba(0, 0, 0, 0.48), transparent);
      background: radial-gradient(
        ellipse at center 88px,
        rgba(0, 0, 0, 0.9),
        transparent 50%
      );
      //margin-top: 8px;
      .explore {
      }
      .text-wrapper {
        position: relative;
        overflow: hidden;
        width: 220px;
        .anim-text-flow {
          $animationDuration: 30 !important;
          $delayBetweenLetters: 0.8 !important;
          width: 360px;
        }
      }
    }
    .main-content {
      .tag-scroll-area {
        height: 84px;
      }
      .banner {
        //margin-top: -60px;
      }
      .header {
        // height: 68px !important;
        //min-height: 68px !important;
        margin-left: unset;
      }
      .artist-scroll-area {
        // height: 128px;
      }
      .separator {
        width: 100vw;
        margin-left: -16px;
      }
      .ed-card-grid {
      }
      .scroll-content {
        //padding-top: 64px;
      }
    }
  }
}
</style>
