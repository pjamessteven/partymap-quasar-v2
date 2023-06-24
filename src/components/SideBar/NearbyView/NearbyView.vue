<template>
  <div class="landing-page flex column no-wrap">
    <div class="main-content flex row justify-center">
      <transition enter-active-class="">
        <div class="flex column grow no-wrap">
          <div
            class="flex column grow no-wrap"
            style="height: 100%; width: 100%; max-width: 100%"
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
                width: '100%',
              }"
              content-active-style="{
                'width': '100%'
              }"
            >
              <div class="scroll-stuff flex column">
                <div
                  class="flex column mobile-location-header text-h4 inter bolder q-pl-md q-mt-lg q-"
                  style="width: 100%"
                  v-if="$q.screen.lt.sm"
                >
                  <div class="ellipsis">
                    <span class="">Near</span>
                  </div>
                  <div
                    class="flex items-center no-wrap justify-between"
                    style="width: 100%; margin-top: "
                  >
                    <span v-if="userLocation" class="ellipsis q-mr-sm">
                      {{ userLocationCity }}
                    </span>
                    <span class="ellipsis" v-else>... </span>
                    <q-btn
                      flat
                      style="margin-left: -8px"
                      class="q-pa-md"
                      @click.stop="() => getFineLocation()"
                    >
                      <template v-slot:default>
                        <div v-if="!userLocationLoading" class="flex">
                          <q-icon
                            name="mdi-crosshairs-gps"
                            class=""
                            v-if="fineLocation"
                          />
                          <q-icon name="mdi-crosshairs" class="" v-else />
                        </div>
                        <div v-else style="position: relative" class="flex">
                          <q-icon style="z-index: 1" name="mdi-crosshairs" />
                          <q-icon
                            style="z-index: 2; left: 0px"
                            class="animated infinite flash slowest absolute"
                            name="mdi-crosshairs-gps"
                          />
                        </div>
                        <q-tooltip
                          class=""
                          :content-class="
                            $q.dark.isActive
                              ? 'bg-black text-white'
                              : 'bg-white text-black'
                          "
                          :offset="[10, 10]"
                        >
                          {{ $t('landing_page.improve_location') }}
                        </q-tooltip>
                      </template>
                    </q-btn>
                  </div>
                </div>
                <div
                  class="flex message"
                  :class="$q.screen.gt.xs ? 'q-mx-lg q-mt-sm  ' : 'q-mx-md  '"
                  @click="showMessage = !showMessage"
                >
                  <div
                    class="flex justify-between grow items-center no-wrap location-header q-py-md"
                  >
                    <span
                      class="inter bold"
                      :class="$q.screen.gt.xs ? ' t1 text-large' : 't3'"
                      >Welcome to PartyMap, the global map of festivals and
                      events!</span
                    >
                    <q-icon
                      class="q-ml-md"
                      size="1.5rem"
                      :name="
                        !showMessage ? 'mdi-chevron-down' : 'mdi-chevron-up'
                      "
                    />
                  </div>
                  <div
                    v-if="showMessage"
                    class="flex column items-start justify-start t2 q-mt-sm"
                  >
                    PartyMap is a community-driven platform for finding parties
                    and festivals around the world! PartyMap is a work in
                    progress... More features coming soon! &#128526;
                    <p />
                    Anyone can submit an event that they know about, as long as
                    the information is already public. Also anyone can suggest
                    changes to an event if the information is out of date. No
                    account needed!

                    <p />

                    Much love to my people around the world - Pete
                    <div class="flex q-gutter-md q-mt-md q-mb-lg">
                      <div
                        @click.stop
                        class="appstore-wrapper flex items-center q-py-sm q-px-md"
                      >
                        <q-icon
                          name="mdi-apple"
                          size="1.5rem"
                          class="q-mr-sm"
                        />
                        PartyMap on the App Store
                      </div>
                      <div
                        @click.stop
                        class="appstore-wrapper flex items-center q-py-sm q-px-md"
                      >
                        <q-icon
                          name="mdi-google-play"
                          size="1.5rem"
                          class="q-mr-sm"
                        />
                        PartyMap on Google Play
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="nav-button-container flex row no-wrap q-px-md t1 q-mt-md"
                  :class="{
                    'q-mb-sm': $q.screen.lt.sm,
                    'q-mb-md text-large inter bold q-px-lg ': $q.screen.gt.xs,
                  }"
                >
                  <div
                    flat
                    @click.stop="showAddEventDialog()"
                    class="nav-button flex items-center justify-between q-mr-sm q-px-md q-py-sm"
                  >
                    <span v-if="$q.screen.lt.sm">Add</span
                    ><span v-else>Add an event</span>
                    <q-icon
                      name="mdi-plus"
                      size="1rem"
                      :class="{ 'q-ml-md': $q.screen.gt.xs }"
                    />
                  </div>

                  <div
                    @click.stop="() => (sidebarPanel = 'explore')"
                    class="nav-button flex items-center justify-between q-mr-sm q-px-md q-py-sm"
                  >
                    Explore the map
                    <q-icon
                      name="mdi-chevron-right"
                      size="1rem"
                      class="q-ml-md"
                      :class="{ 'q-ml-md': $q.screen.gt.xs }"
                    />
                  </div>
                </div>
                <div class="q-px-lg" v-if="$q.screen.gt.xs && false">
                  <q-separator />
                </div>

                <div
                  class="flex row justify-center items-center"
                  :class="$q.screen.gt.xs ? 'q-mt-' : 'q-mt-xl q-py-xl'"
                  :style="
                    $q.screen.gt.xs
                      ? 'height: 100%; width: 100%; position: absolute; top: 0px; pointer-events: none'
                      : 'margin-top: 350px'
                  "
                  v-if="loadingEverything || !computedSidebarPanelReady"
                >
                  <!--
                  <q-spinner-ios
                    color="$a.dark.isActive ? 'white' : 'black'"
                    size="2em"
                  />
                  --><InnerLoading :solid="false" />
                </div>

                <div class="flex column scroll-content q-mt-">
                  <transition appear enter-active-class="animated fadeIn slow">
                    <div
                      class="content"
                      v-if="computedSidebarPanelReady && !loadingEverything"
                    >
                      <!-- your events-->
                      <div
                        class="flex column"
                        v-if="currentUser && userEventDates?.length >= 10"
                      >
                        <div
                          class="q-py-md location-header flex justify-between"
                          :class="
                            $q.screen.gt.xs ? 'q-px-lg text-large' : 'q-px-md'
                          "
                        >
                          <div class="t1 text- inter bold">
                            Your upcoming events:
                          </div>
                          <div
                            class="link-hover t3 inter bold"
                            @click="() => (sidebarPanel = 'favorites')"
                          >
                            View all <q-icon name="mdi-chevron-right" />
                          </div>
                        </div>
                        <div
                          class="q-mb-sm"
                          v-if="userEventDates && userEventDates.length > 0"
                        >
                          <q-scroll-area
                            horizontal
                            class="user-event-scroll-area"
                            style="width: 100%"
                            :thumb-style="
                              $q.screen.gt.xs
                                ? {
                                    bottom: '0px',
                                    height: '8px',
                                    marginLeft: '24px',
                                  }
                                : { bottom: '0px', height: '0px' }
                            "
                          >
                            <div
                              class="flex row no-wrap q-gutter-md"
                              :class="$q.screen.gt.xs ? 'q-px-lg' : 'q-px-md'"
                            >
                              <EventDatePoster
                                v-for="(ed, index) in userEventDates"
                                :key="index"
                                :hideInfo="true"
                                :event="ed[0]"
                              />
                            </div>
                          </q-scroll-area>
                        </div>
                        <div
                          :class="
                            $q.screen.lt.sm
                              ? 'q-px-md q-mt-md'
                              : 'q-px-lg q-mt-sm q-mb-sm'
                          "
                        >
                          <q-separator />
                        </div>
                      </div>
                      <!-- tags -->
                      <div class="flex column" v-if="nearbyTags?.length >= 10">
                        <div
                          class="q-py-md location-header"
                          :class="
                            $q.screen.gt.xs
                              ? 'q-pl-lg q-mt- text-large'
                              : 'q-pl-md'
                          "
                        >
                          <div class="t1 text- inter bold">
                            Top tags in your area:
                          </div>
                        </div>
                        <div
                          class="q-mb-sm"
                          :class="$q.screen.gt.xs ? 'q-pl-lg' : 'q-pl-md'"
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
                                  @click="clickTag(tag)"
                                  class="tag t2 text- inter semibold"
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
                                  @click="clickTag(tag)"
                                  class="tag t2 text- inter semibold"
                                  style="text-transform: capitalize"
                                >
                                  {{ tag.tag }}
                                </div>
                              </div>
                            </div>
                          </q-scroll-area>
                        </div>
                      </div>
                      <!-- Display global tags if there's not many local tags-->
                      <div
                        class="flex column"
                        v-else-if="tagOptions?.length > 0"
                      >
                        <div
                          class="q-py-md header q-mt-sm"
                          :class="$q.screen.gt.xs ? ' text-large' : ''"
                        >
                          <div class="t1 text- inter bold q-pl-md">
                            Top tags around the world:
                          </div>
                        </div>
                        <div class="q-pl-md q-mb-sm">
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
                                  v-for="(tag, index) in tagOptions.filter(
                                    (x, i) => i % 2
                                  )"
                                  :key="index"
                                  @click="clickTag(tag)"
                                  class="tag t2 text- inter semibold"
                                  style="text-transform: capitalize"
                                >
                                  {{ tag.tag }}
                                </div>
                              </div>
                              <div class="flex row no-wrap q-gutter-sm q-pt-sm">
                                <div
                                  v-for="(tag, index) in tagOptions.filter(
                                    (x, i) => i % 2 !== 1
                                  )"
                                  :key="index"
                                  @click="clickTag(tag)"
                                  class="tag t2 text- inter semibold"
                                  style="text-transform: capitalize"
                                >
                                  {{ tag.tag }}
                                </div>
                              </div>
                            </div>
                          </q-scroll-area>
                        </div>
                      </div>

                      <!-- artists -->
                      <div
                        class="flex column"
                        v-if="nearbyArtists?.length > 5"
                        :style="$q.screen.gt.xs ? 'margin-top: -16px' : ''"
                      >
                        <div
                          class="t1 location-header q-py-md inter bold"
                          :class="
                            $q.screen.gt.xs ? 'q-pl-lg text-large' : 'q-pl-md'
                          "
                        >
                          Artists playing nearby:
                        </div>
                        <ArtistsComponent
                          :class="$q.screen.gt.xs ? 'q-pl-sm' : ''"
                          @wheel.stop
                          :artists="nearbyArtists"
                          :hasNext="nearbyArtistsHasNext"
                          :loadMore="loadNearbyArtists"
                        />
                      </div>

                      <!-- Display global artists if there's not many local artists-->

                      <div
                        class="flex column"
                        v-else-if="artistOptions?.length > 0"
                      >
                        <div
                          class="t1 location-header q-py-md inter bold"
                          :class="
                            $q.screen.gt.xs ? 'q-pl-lg text-large' : 'q-pl-md'
                          "
                        >
                          Top artists worldwide:
                        </div>
                        <ArtistsComponent
                          :class="$q.screen.gt.xs ? 'q-pl-sm' : ''"
                          @wheel.stop
                          :artists="artistOptions"
                          :hasNext="artistOptionsHasNext"
                          :loadMore="loadArtistOptions"
                        />
                      </div>
                      <!-- NEARBY EVENTS -->

                      <div
                        class="t1 inter bold location-header q-py-sm flex row items-center justify-between"
                        :class="
                          $q.screen.gt.xs ? 'q-pl-lg text-large' : 'q-pl-md'
                        "
                      >
                        <div class="flex items-center">
                          <div class="">
                            {{ $t('landing_page.events_within') }}
                          </div>
                          <q-select
                            emit-value
                            dense
                            borderless
                            map-options
                            behavior="menu"
                            class="q-mx-xs radius-select inter o-050"
                            v-model="queryRadius"
                            :options="queryRadiusOptions"
                          />
                        </div>
                        <EventDateViewOptions
                          :show-group-by-month="false"
                          v-if="$q.screen.gt.xs"
                        />
                      </div>
                      <transition
                        appear
                        enter-active-class="animated fadeIn slower"
                      >
                        <EventDateList
                          class="q-mx-sm"
                          v-if="nearbyEventDates && compactView"
                          :groupByMonth="false"
                          :eventDates="nearbyEventDates"
                          :hasNext="nearbyEventDatesHasNext"
                          :loading="nearbyEventDatesLoading"
                          :disableEndOfResultsMessage="true"
                        />
                      </transition>
                      <transition
                        appear
                        enter-active-class="animated fadeIn slower"
                      >
                        <EventDatePosterList
                          class="q-mx-sm"
                          v-if="nearbyEventDates && !compactView"
                          :groupByMonth="false"
                          :eventDates="nearbyEventDates"
                          :hasNext="nearbyEventDatesHasNext"
                          :loading="nearbyEventDatesLoading"
                          :disableEndOfResultsMessage="true"
                        />
                      </transition>
                      <div
                        class="flex justify-center items-center q-my-lg"
                        v-if="nearbyEventDatesHasNext"
                      >
                        <q-spinner-ios
                          color="$a.dark.isActive ? 'white' : 'black'"
                          size="2em"
                        />
                      </div>

                      <div
                        v-if="
                          nearbyEventDatesSuccess &&
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
                        class="location-header flex items-center justify-between no-wrap inter bold t1 q-mt- q-py-md"
                        :class="$q.screen.lt.sm ? 'q-py-md' : 'text-large'"
                        v-touch-swipe="
                          () => {
                            sidebarPanel = 'explore';
                          }
                        "
                        v-if="eventDates && eventDates.length > 0"
                      >
                        <!--<div class="separator" /> -->

                        <div
                          class="flex row grow no-wrap ellipsis"
                          :class="$q.screen.gt.xs ? 'q-pl-lg' : 'q-pl-md'"
                        >
                          <div class="ellipsis flex grow items-center">
                            <div class="ellipsis t1" v-if="userLocation">
                              {{ $t('landing_page.all_upcoming_events') }}:
                            </div>
                          </div>
                        </div>
                        <EventDateViewOptions
                          :show-group-by-month="false"
                          v-if="$q.screen.gt.xs"
                        />
                      </div>

                      <transition
                        appear
                        enter-active-class="animated fadeIn slower"
                      >
                        <EventDateList
                          class="q-mx-sm"
                          v-if="eventDates && compactView"
                          :groupByMonth="false"
                          :eventDates="eventDates"
                          :hasNext="eventDatesHasNext"
                        />
                      </transition>
                      <transition
                        appear
                        enter-active-class="animated fadeIn slower"
                      >
                        <EventDatePosterList
                          class="q-mx-sm"
                          v-if="eventDates && !compactView"
                          :groupByMonth="false"
                          :eventDates="eventDates"
                          :hasNext="
                            eventDatesHasNext && !nearbyEventDatesHasNext
                          "
                        />
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
                  </transition>
                </div>
              </div>
            </q-scroll-area>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import ArtistsComponent from './../ArtistsComponent.vue';
import EventDateCard from 'components/EventDateCard.vue';

import { mapActions, mapState, mapWritableState } from 'pinia';
import { useQueryStore } from 'src/stores/query';
import { useMainStore } from 'src/stores/main';
import { useNearbyStore } from 'src/stores/nearby';

import AddEventDialog from 'components/dialogs/AddEventDialog.vue';
import EventDateList from 'src/components/EventDateList.vue';
import EventDatePosterList from 'src/components/EventDatePosterList.vue';
import EventDateViewOptions from 'src/components/EventDateViewOptions.vue';
import InnerLoading from 'src/components/InnerLoading.vue';
import { useAuthStore } from 'src/stores/auth';
import EventDatePoster from 'src/components/EventDatePoster.vue';

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
    ArtistsComponent,
    EventDateList,
    EventDatePosterList,
    EventDateViewOptions,
    InnerLoading,
    EventDatePoster,
  },
  data() {
    return {
      sidebarPanelReady: false,
      showMessage: false,
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

  methods: {
    ...mapActions(useMainStore, ['loadIpInfo', 'getFineLocation']),
    ...mapActions(useQueryStore, ['loadArtistOptions', 'loadTagOptions']),
    ...mapActions(useNearbyStore, [
      'loadEverything',
      'loadNearbyTags',
      'loadNearbyArtists',
      'loadNearbyEventDates',
      'loadEventDates',
    ]),
    showAddEventDialog() {
      this.$q
        .dialog({
          parent: this,
          component: AddEventDialog,
        })
        .onOk((data) => {
          if (!this.currentUser && data.host) {
            this.$router.push({
              path: '/login',
              query: { from: this.$route.path },
            });
          } else if (data.host) {
            this.$router.push({
              name: 'AddEventHost',
            });
          } else {
            this.$router.push({
              name: 'AddEventPublic',
            });
          }
        });
    },
    onScroll(info) {
      this.scrollPosition = info.verticalPosition;
      // prevent swipes
      if (info.verticalPercentage === 0) {
        this.enablePanelSwipeDown = true;
      } else {
        this.enablePanelSwipeDown = false;
      }
      // infinite scrolling

      if (info.verticalPercentage === 1) {
        if (this.nearbyEventDatesHasNext) {
          this.loadNearbyEventDates();
        } else if (this.eventDatesHasNext) {
          this.loadEventDates();
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

    clickTag(tag) {
      let index = this.controlTag?.findIndex((x) => x.tag === tag.tag);
      if (index > -1) {
        // tag already selected, do nothing
      } else {
        this.controlTag.push(tag);
      }
      this.sidebarPanel = 'explore';
    },

    loadEventDatePage(page) {
      // hidden pagination for SEO
      this.addParamsToLocation({ global_page: page });
      this.eventDates = null;
      this.eventDatesPage = page;
      this.loadEventDates;
    },
  },
  watch: {
    $route: {
      handler: function (newval) {
        if (newval.name === 'Explore' && this.sidebarPanel === 'nearby')
          if (!this.userLocation) {
            this.loadIpInfo();
          }
      },
    },
    sidebarPanel: {
      handler: function (newval) {
        if (this.$route.name === 'Explore' && newval === 'nearby') {
          setTimeout(() => {
            this.sidebarPanelReady = true;
          }, 150);
          if (!this.userLocation) {
            this.loadIpInfo();
          }
        }
      },
    },
    userLocation: {
      handler: function (newval, oldval) {
        if (newval && !oldval) {
          this.loadEverything();
          return;
        } else if (newval && oldval) {
          const userLocationHasSignficantlyChanged =
            Math.round(newval.lat) !== Math.round(oldval.lat) ||
            Math.round(newval.lng) !== Math.round(oldval.lng);

          if (userLocationHasSignficantlyChanged) {
            this.loadEverything();
          }
        }
      },
      deep: true,
    },
    queryRadius: {
      handler: function (newval, oldval) {
        console.log('qq qr', newval, oldval);
        if (oldval !== null && oldval != newval) {
          this.loadEverything();
          console.log('qq called', newval, oldval);
        }
      },
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useMainStore, [
      'showPanel',
      'enablePanelSwipeDown',
      'sidebarPanel',
      'menubarOpacity',
      'userLocationLoading',
    ]),
    ...mapState(useMainStore, [
      'userLocationLoading',
      'userLocation',
      'userLocationCity',
      'userLocationCountry',
      'fineLocation',
      'compactView',
    ]),
    ...mapWritableState(useQueryStore, [
      'controlTag',
      'tagOptions',
      'tagOptionsHasNext',
      'artistOptions',
      'artistOptionsHasNext',
      'userEventDates',
      'userEventDatesPage',
      'userEventDatesHasNext',
      'userEventDatesLoading',
    ]),
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
      'nearbyTagsSuccess',
      'nearbyArtists',
      'nearbyArtistsHasNext',
      'nearbyArtistsPage',
      'nearbyArtistsSuccess',
      'nearbyEventDates',
      'nearbyEventDatesLoading',
      'nearbyEventDatesHasNext',
      'nearbyEventDatesPage',
      'nearbyEventDatesSuccess',
      'eventDatesHasNext',
      'eventDatesPages',
    ]),
    computedSidebarPanelReady() {
      if (this.$q.screen.lt.sm) {
        return this.sidebarPanelReady;
      } else return this.sidebarPanelReady;
    },
    computedGridColumns() {
      if (this.$q.screen.gt.lg) {
        return `
        grid-template-columns: repeat(3, minmax(0, 1fr));
        `;
      } else if (this.$q.screen.gt.sm) {
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
    if (this.$q.screen.lt.sm || true) {
      setTimeout(() => {
        this.sidebarPanelReady = true;
      }, 300);
    } else {
      this.sidebarPanelReady = true;
    }

    if (this.$route.name === 'Explore' && this.sidebarPanel === 'nearby')
      if (!this.userLocation) {
        await this.loadIpInfo();
      } else {
        if (this.eventDates.length === 0) this.loadEverything();
      }
    if (this.$route.query.global_page) {
      // used by hidden pagination for SEO
      this.eventDatesPage = Number(this.$route.query.global_page);
      await this.loadEventDates();
      setTimeout(() => {
        window.prerenderReady = true;
      }, 300);
    } else {
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
    .map-gap {
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }
    .location-header {
      background: black;
    }
    .main-content {
      .message {
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        .appstore-wrapper {
          //background: $bi-3;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 9px;
          &:hover {
            background: $bi-2;
          }
        }
      }
      .banner {
        //background: $bi-2;
        .banner-background {
          .banner-video {
            opacity: 0.48;
          }
        }
      }
      .header {
        // background: black;
      }

      .tag-scroll-area {
        .tag {
          opacity: 1;
          transition: all 0.3s ease;
          background: black;
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
    .map-gap {
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }
    .location-header {
      background: white;
    }
    .mobile-location-header {
    }
    .main-content {
      .message {
        // background: rgba(200, 100, 0, 0.2);
        //background: $b-2;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        .appstore-wrapper {
          //background: $b-2;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 9px;
          &:hover {
            background: $b-2;
          }
        }
      }

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
    // background: black;
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

    .scroll-stuff {
      max-width: 100vw;

      .mobile-location-header {
      }
      .location-header {
        position: sticky;
        top: 0px;
        z-index: 100;
        width: 100%;
        // text-transform: lowercase;
      }
    }

    :deep(.q-scrollarea__thumb) {
      z-index: 1000;
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

    .message {
      //border-radius: 9px;
      cursor: pointer;
    }

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
      //text-transform: lowercase;

      //box-shadow: 0px 0px 46px -6px rgb(230,230,230);
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

    .user-event-scroll-area {
      height: 288px;
      margin-bottom: -8px;
      mask-image: linear-gradient(
        to left,
        transparent 0px,
        white 32px,
        white calc(100% - 16px),
        transparent 100%
      );
      width: 100%;
      :deep(.ed-poster) {
        width: 150px;
      }
    }
    .tag-scroll-area {
      height: 96px;
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
    }
  }
}

@media only screen and (min-width: 1921px) {
  .tag-scroll-area {
    margin-bottom: 16px;
    .tag {
      font-size: 1rem;
    }
  }
  .nav-button-container {
    .nav-button {
      // max-height: 64px;
      //dth: 264px;
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
      .message {
        border-radius: 0px;
        border-left: none !important;
        border-right: none !important;
      }
      .nav-button-container {
        .nav-button {
          flex-basis: unset;
          flex-grow: 1;
          width: unset;
        }
      }
      .tag-scroll-area {
        height: 84px;
      }
      .user-event-scroll-area {
        mask-image: unset;
        height: 252px;
        :deep(.ed-poster) {
          width: 128px;
        }
      }

      .header {
        margin-left: unset;
      }
    }
  }
}
</style>
