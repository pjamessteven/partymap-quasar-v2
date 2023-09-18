<template>
  <div class="event-page">
    <div class="flex row no-wrap event-page-content">
      <div
        class="flex history-container col-4 col-xs-12 col-sm-6 col-md-5 col-lg-4 col-xl-4"
        v-if="showingHistory"
      >
        <!--
        <HistoryComponent @close="showingHistory = false" />
        -->
      </div>
      <div class="scroll-area flex grow" @scroll="onScrollMainContent">
        <div class="row flex grow main-row no-wrap justify-center">
          <div
            v-if="scrollPercentage === 0"
            class="clickable-background"
            @click="
              routerHistory.length > 0
                ? $router.go(-1)
                : $router.push({ query: { view: 'explore' }, name: 'Explore' })
            "
          />
          <div
            ref="contentcard"
            class="content-card flex column no-wrap"
            :class="{
              'col-12 no-margin-top': showingHistory,
              'col-8 col-sm-12 col-md-10 col-lg-10 col-xl-8 col-xs-12':
                !showingHistory,
              shadow: this.overlayOpacity === 0,
            }"
          >
            <MobileSwipeHandle
              v-if="$q.screen.lt.sm && false"
              @swipe="handleSwipe($event)"
              class="mobile-swipe-handle"
            />
            <div
              class="content flex column"
              v-touch-swipe.down="scrollPercentage === 0 ? handleSwipe : null"
            >
              <div class="flex column grow">
                <div class="header flex column">
                  <InnerLoading v-if="loading" :solid="false" />

                  <FeaturedMediaBackground
                    v-if="
                      event && event.media_items && event.media_items.length > 0
                    "
                    class="featured-media"
                    :editing="editing"
                  />
                  <div class="header-content grow row">
                    <div
                      class="flex column justify-start items-stretch col-6 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6"
                      :class="{
                        'q-pa-xl': $q.screen.gt.xs,
                        'q-pa-lg': $q.screen.lt.md && $q.screen.gt.xs,
                        'q-pl-md q-pb-md': $q.screen.lt.sm,
                      }"
                    >
                      <div
                        class="flex row justify-between items-start no-wrap"
                        style="position: relative"
                      >
                        <div
                          class="o-090 text-h4 flex items-baseline flex inter bolder no-wrap"
                          :class="{
                            'q-pt-lg q-pr-xl q-mr-xl': $q.screen.lt.sm,
                          }"
                          style="text-transform: "
                          :style="
                            $q.screen.lt.sm
                              ? 'font-size: x-large; line-height: unset;'
                              : ''
                          "
                        >
                          <div>{{ computedName }}</div>
                          <!--
                        <q-icon
                          class="q-ml-md"
                          name="mdi-check-outline"
                          v-if="event && event.host"
                        >
                          <q-tooltip
                            :content-class="
                              $q.dark.isActive
                                ? 'bg-black text-white'
                                : 'bg-white text-black'
                            "
                            :offset="[10, 10]"
                            content-style="font-size: 16px"
                          >
                            {{ $t('event.official_page') }}
                          </q-tooltip></q-icon
                        >
                      -->
                        </div>
                        <!--
                      <q-icon
                        v-touch-swipe="handleSwipe"
                        v-if="$q.screen.lt.sm"
                        @click="handleSwipe"
                        flat
                        name="mdi-chevron-down"
                        class="mobile-hide-icon absolute"
                        :class="{
                          'q-pt-lg q-pb-xl q-px-lg': $q.screen.lt.sm,
                        }"
                        size="2em"
                      />
                      --></div>

                      <div
                        class="flex row justify-between items-center"
                        :class="{
                          'q-mt-md': $q.screen.gt.xs,
                          'q-mt-sm': $q.screen.lt.sm,
                        }"
                      >
                        <NextEventDateSummary
                          :class="{
                            'o-050': editing,
                          }"
                          class=""
                          v-if="event && selectedEventDate"
                          :key="selectedEventDate.id"
                          :ed="selectedEventDate"
                        />
                      </div>

                      <FeaturedMediaComponent
                        v-if="$q.screen.lt.md"
                        :editing="editing"
                        class="q-mt-lg"
                        :item="event?.media_items?.[0]"
                      />

                      <div
                        class="flex grow justify-start items-start"
                        v-if="!!event"
                      >
                        <SummaryComponent
                          :editing="editing"
                          :class="
                            $q.screen.gt.sm ? 'q-mt-md' : 'q-mt-lg q-mr-lg'
                          "
                        />
                      </div>

                      <div
                        v-if="
                          (computedTicketUrl || computedExternalUrl) && event
                        "
                        class="event-buttons flex row justify-start items-center wrap o-080"
                        :class="$q.screen.gt.sm ? 'q-mt-md' : 'q-mt-md'"
                      >
                        <a
                          :href="computedExternalUrl"
                          target="_blank"
                          v-if="computedExternalUrl && !editing"
                          class="q-mr-sm q-mt-sm"
                        >
                          <q-btn
                            no-caps
                            color="grey-3"
                            text-color="black"
                            label="Visit website"
                            size="md"
                            class="border-radius"
                            icon="las la-external-link-alt"
                          />
                        </a>
                        <a
                          :href="computedTicketUrl"
                          target="_blank"
                          v-if="computedTicketUrl && event?.host && !editing"
                          class="q-mr-sm q-mt-sm"
                        >
                          <q-btn
                            :disable="editing"
                            color="grey-3"
                            text-color="black"
                            :label="$t('event.get_tickets')"
                            size="md"
                            class="border-radius"
                            icon="las la-ticket-alt"
                          />
                        </a>
                      </div>

                      <!--
                      <q-rating
                        v-if="!!event"
                        :model-value="event.rating"
                        size="2em"
                        :max="5"
                        readonly
                        color="primary"
                        class="q-mt-md"
                      />
                      -->

                      <div
                        class="flex row justify-between items-end no-wrap tags-wrapper"
                        :class="$q.screen.gt.sm ? 'q-pt-lg' : 'q-pt-md'"
                        v-if="event?.event_tags"
                      >
                        <TagsComponent :editing="editing" />
                      </div>
                    </div>
                    <div
                      class="flex column no-wrap justify-center q-py-xl q-pr-xl col-6 col-xs-12 col-sm-6 col-md-6 col-lg-6 col-xl-6"
                      v-if="$q.screen.gt.sm"
                    >
                      <FeaturedMediaComponent
                        v-if="!!event"
                        :editing="editing"
                        :item="event?.media_items?.[0]"
                      />
                    </div>
                  </div>
                </div>
                <div
                  class="main-content"
                  :class="$q.screen.gt.sm ? ' q-pa-xl' : ''"
                  v-if="!!event"
                >
                  <div
                    v-if="
                      event &&
                      (!event.event_dates || event.event_dates.length === 0)
                    "
                    class="q-px-xl q-pt-xl q-pb-xl flex row items-center justify-center"
                  >
                    <div class="t3">
                      {{
                        $t('event_dates.this_event_doesnt_have_upcoming_dates')
                      }}
                    </div>
                  </div>
                  <div v-else class="flex row no-wrap">
                    <EventDateSidebarDesktop
                      v-if="$q.screen.gt.sm"
                      class="q-mr-lg"
                    />
                    <div
                      class="flex column grow"
                      :class="{ 'q-pl-lg': $q.screen.gt.sm }"
                    >
                      <div
                        class="flex items-stretch justify-between no-wrap action-buttons-wrapper"
                        :class="{
                          'q-py-md q-px-md ': $q.screen.lt.sm,
                          'q-px-xl q-my-lg': $q.screen.gt.xs && $q.screen.lt.md,
                          'q-mb-lg': $q.screen.gt.sm,
                        }"
                      >
                        <div
                          class="action-buttons no-wrap flex items-stretch q-gutter-sm"
                        >
                          <InterestedComponent />

                          <q-btn
                            class="button-light"
                            :color="$q.dark.isActive ? 'grey-10' : 'grey-1'"
                            :text-color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
                            flat
                            :size="$q.screen.gt.xs ? '1em' : 'sm'"
                            :label="
                              $q.screen.gt.xs ? 'Save to device' : undefined
                            "
                            icon="mdi-calendar-export-outline"
                            no-caps
                            @click="getIcalFile"
                          ></q-btn>
                          <!-- show share button -->
                          <q-btn
                            class="button-light"
                            :color="$q.dark.isActive ? 'grey-10' : 'grey-1'"
                            :text-color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
                            :label="
                              $q.screen.gt.xs ? $t('event.share') : undefined
                            "
                            no-caps
                            :size="$q.screen.gt.xs ? '1em' : 'sm'"
                            flat
                            icon="mdi-share"
                            @click="share"
                            v-if="!editing"
                          />

                          <!-- show EDIT BUTTON if user is host or user is staff and public event -->
                          <q-btn
                            flat
                            class="button-light"
                            :color="$q.dark.isActive ? 'grey-10' : 'grey-1'"
                            :text-color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
                            :label="$t('event.edit_event')"
                            no-caps
                            :icon="
                              $q.screen.gt.xs
                                ? 'mdi-square-edit-outline'
                                : undefined
                            "
                            style="padding-left: 4px"
                            :size="$q.screen.gt.xs ? '1em' : 'md'"
                            @click="editing = !editing"
                            v-if="currentUserIsHost && !editing"
                          />
                        </div>
                        <div class="q-gutter-sm">
                          <q-btn
                            flat
                            :color="$q.dark.isActive ? 'grey-10' : 'grey-1'"
                            :text-color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
                            icon="mdi-dots-vertical"
                            class="q-px-sm"
                            :size="$q.screen.gt.xs ? '1em' : 'md'"
                          >
                            <q-tooltip
                              :content-class="
                                $q.dark.isActive
                                  ? 'bg-black text-white'
                                  : 'bg-white text-black'
                              "
                              :offset="[10, 10]"
                              content-style="font-size: 16px"
                            >
                              {{ $t('sidebar.more') }}
                            </q-tooltip>
                            <q-menu
                              transition-show="jump-down"
                              transition-hide="jump-up"
                              anchor="bottom right"
                              self="top right"
                            >
                              <!-- SHOW REPORT if not host -->
                              <q-item
                                v-close-popup
                                v-ripple
                                v-if="!currentUserIsHost"
                                v-on:click="showingReportDialog = true"
                                clickable
                              >
                                <q-item-section avatar>
                                  <q-icon name="mdi-alert-circle-outline" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{
                                    $t('report.report_event')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>
                              <!-- SHOW CLAIM if there is no event host -->
                              <q-item
                                v-close-popup
                                v-ripple
                                v-if="!currentUserIsHost && !event.host"
                                @click="
                                  currentUser
                                    ? (showingClaimDialog = true)
                                    : $router.push({
                                        path: '/login',
                                        query: { from: $route.path },
                                      })
                                "
                                clickable
                              >
                                <q-item-section avatar>
                                  <q-icon name="mdi-check-decagram-outline" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{
                                    $t('report.are_you_host')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>

                              <!-- SHOW SUGGESTIONS if there is no event host -->
                              <q-item
                                v-close-popup
                                v-ripple
                                v-if="!currentUserIsHost && event.host == null"
                                @click="editing = true"
                                clickable
                              >
                                <q-item-section avatar>
                                  <q-icon name="las la-hand-peace" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>{{
                                    $t('suggestions.improve_this_page')
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>
                              <!-- SHOW EDIT if currentUserIsStaff -->
                              <q-item
                                v-if="currentUserIsStaff"
                                v-ripple
                                v-close-popup
                                v-on:click="editing = !editing"
                                clickable
                              >
                                <q-item-section avatar>
                                  <q-icon name="las la-edit" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label
                                    >{{
                                      $t('event.edit_event')
                                    }}
                                    &nbsp;(admin)</q-item-label
                                  >
                                </q-item-section>
                              </q-item>
                              <q-item
                                v-if="currentUserIsHost || currentUserIsStaff"
                                v-ripple
                                v-close-popup
                                v-on:click="deleteEvent()"
                                clickable
                              >
                                <q-item-section avatar>
                                  <q-icon name="las la-trash" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label
                                    >{{ $t('event.delete_event') }}
                                    <span
                                      v-if="
                                        currentUserIsStaff && !currentUserIsHost
                                      "
                                      >(admin)</span
                                    ></q-item-label
                                  >
                                </q-item-section>
                              </q-item>
                              <q-item
                                v-if="currentUserIsStaff"
                                v-ripple
                                v-close-popup
                                v-on:click="showingHistory = true"
                                clickable
                              >
                                <q-item-section avatar>
                                  <q-icon name="las la-history" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>
                                    Suggestions and Activity
                                  </q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-menu>
                          </q-btn>
                        </div>
                      </div>
                      <div
                        v-if="$q.screen.lt.sm"
                        class="separator"
                        :class="$q.screen.lt.sm ? 'q-mb-sm' : 'q-mb-md'"
                      />
                      <div
                        class="flex column"
                        :class="{
                          'q-px-md ': $q.screen.lt.sm,
                          'q-px-xl': $q.screen.gt.xs && $q.screen.lt.md,
                        }"
                      >
                        <EventDates />
                        <DescriptionComponent :editing="editing" />
                        <ReviewsComponent class="q-mt-xl q-mb-xl" />
                      </div>
                    </div>
                  </div>
                </div>

                <!--
            <div class="">
              <q-btn
                no-caps
                color="orange"
                class="add-event-button q-ma-xl"
                @click="$router.push({ name: 'AddEvent' })"
              >
                <div class="flex row items-center">
                  <div class="o-080 ">Something not quite right?&nbsp;</div>
                  <div class="q-mr-sm">
                    Improve this page!
                  </div>
                  <q-icon name="mdi-hand-heart" size="1rem" />
                </div>
              </q-btn>
            </div>
            -->
              </div>
              <div
                v-if="!!event"
                class="bottom-section flex"
                :class="{
                  'column reverse no-wrap q-pa-md q-py-lg ': $q.screen.lt.sm,
                  'row justify-between items-center': $q.screen.gt.xs,
                  'q-pa-xl': $q.screen.gt.sm,
                  'q-px-xl q-py-xl': $q.screen.gt.xs && $q.screen.lt.md,
                }"
              >
                <div
                  class="flex column"
                  :class="$q.screen.gt.xs ? 'items-start' : ''"
                >
                  <div class="t4">{{ event.page_views }} page views</div>
                  <div class="t4 flex column items-start no-wrap q-mt-xs">
                    <div v-if="event?.last_transaction?.user?.username">
                      <span
                        class="link-hover underline"
                        @click="showingHistory = showingHistory"
                        >{{ $t('event.last_updated') }}</span
                      ><span>
                        &nbsp;{{
                          timeAgo(event.last_transaction.issued_at + 'Z')
                        }}
                      </span>
                      <!--
                    <router-link
                      class="link-hover underline"
                      :to="{
                        name: 'UserPage',
                        params: { id: event.last_transaction.user.username }
                      }"
                      >{{ event.last_transaction.user.username }}</router-link
                    >
                  -->
                    </div>

                    <div v-else-if="event?.transaction?.user?.username">
                      <!-- shown when displaying EventVersion -->
                      <span
                        class="link-hover underline"
                        @click="showingHistory = !showingHistory"
                        >{{ $t('event.last_updated') }}</span
                      >
                      {{ timeAgo(event.transaction.issued_at + 'Z') }}
                      {{ $t('event.by') }}
                      <router-link
                        class="link-hover underline"
                        :to="{
                          name: 'UserPage',
                          params: { username: event.transaction.user.username },
                        }"
                      >
                        {{ event.transaction.user.username }}
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="sticky-editing-footer flex row justify-center" v-if="editing">
        <div
          class="sticky-editing-footer-inner col-8 col-sm-12 col-md-10 col-lg-10 col-xl-8 col-xs-12"
        >
          <div class="flex justify-end q-pa-md">
            <q-btn
              color="primary"
              text-color="white"
              label="Finished editing"
              no-caps
              :icon="$q.screen.gt.xs ? 'mdi-check' : undefined"
              :style="
                $q.dark.isActive
                  ? 'border-right: 1px solid rgba(255,255,255,0.05)'
                  : 'border-right: 1px solid rgba(0,0,0,0.05)'
              "
              :size="$q.screen.gt.xs ? 'md' : 'md'"
              @click="editing = !editing"
            />
          </div>
        </div>
      </div>
      <!-- hidden element for copying url -->
      <input :value="computedUrl" ref="copyUrlInput" style="display: none" />
      <q-dialog v-model="showingReportDialog">
        <ReportDialog @closeDialog="showingReportDialog = false" />
      </q-dialog>
      <q-dialog v-model="showingClaimDialog">
        <ReportDialog
          @closeDialog="showingClaimDialog = false"
          :mode="'claim'"
        />
      </q-dialog>

      <q-dialog v-model="showingSuggestionsDialog">
        <SuggestionsDialog @closeDialog="showingSuggestionsDialog = false" />
      </q-dialog>
    </div>
  </div>
</template>

<script>
import { deleteEventRequest, API_URL } from 'src/api';

import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { useMapStore } from 'src/stores/map';
import { useEventStore } from 'src/stores/event';

import { mapActions, mapState, mapWritableState } from 'pinia';

import _ from 'lodash';
import common from 'assets/common';
import DescriptionComponent from 'components/EventPage/DescriptionComponent.vue';
import SummaryComponent from 'components/EventPage/SummaryComponent.vue';
import EventDates from 'components/EventPage/EventDates/EventDates.vue';
import EventDateSidebarDesktop from 'components/EventPage/EventDates/EventDateSidebarDesktop.vue';
import FeaturedMediaBackground from 'components/EventPage/Gallery/FeaturedMediaBackground.vue';
import FeaturedMediaComponent from 'components/EventPage/Gallery/FeaturedMediaComponent.vue';
// import HistoryComponent from 'components/EventPage/Activity/HistoryComponent.vue';
import NextEventDateSummary from 'components/EventPage/EventDates/NextEventDateSummary.vue';
import ReportDialog from './ReportDialog.vue';
import TagsComponent from 'components/EventPage/Tags/TagsComponent.vue';
import ReviewsComponent from './Reviews/ReviewsComponent.vue';
import MobileSwipeHandle from '../MobileSwipeHandle.vue';
import InterestedComponent from './InterestedComponent.vue';
import SuggestionsDialog from './Suggestions/SuggestionsDialog.vue';
import InnerLoading from 'components/InnerLoading.vue';
import WheelIndicator from 'wheel-indicator';

export default {
  name: 'EventPage',
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: this.computedName + ' | PartyMap',
      meta: {
        description: {
          name: 'description',
          content:
            'Find out about ' +
            this.computedName +
            'and other similar events on PartyMap. ' +
            this.description,
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
    TagsComponent,
    FeaturedMediaComponent,
    FeaturedMediaBackground,
    SummaryComponent,
    NextEventDateSummary,
    ReviewsComponent,
    ReportDialog,
    //HistoryComponent,
    EventDates,
    EventDateSidebarDesktop,
    MobileSwipeHandle,
    InterestedComponent,
    SuggestionsDialog,
    InnerLoading,
    DescriptionComponent,
  },
  props: {
    id: {
      default: null,
    },
    eventDateId: {
      default: null,
    },
    name: {
      default: null,
    },
  },
  data() {
    return {
      enableSwipeDown: true,
      wheelIndicator: null,
      bottomImagePadding: 0,
      scrollPercentage: 0,
      showingReportDialog: false,
      showingClaimDialog: false,
      loading: false,
      windowHeight: window.innerHeight,
      epSectionTopPosition: {
        top: null,
        bottom: null,
      },
      epSectionMiddlePosition: {
        top: 0,
        bottom: null,
      },
      showingHistory: false,
      showingSuggestionsDialog: false,
    };
  },
  methods: {
    ...mapActions(useEventStore, [
      'loadEvent',
      'toggleFavorite',
      'loadEventDate',
    ]),
    toggleFavorite() {
      if (this.currentUser) {
        this.toggleFavorite();
      } else {
        this.$router.push({
          path: '/login',
          query: { from: this.$route.path },
        });
      }
    },
    deleteEvent() {
      this.$q
        .dialog({
          title: this.$t('event_dates.delete_event'),
          message: this.$t('event_dates.delete_event_confirm'),
          cancel: true,
          persistent: false,
        })
        .onOk(() => {
          deleteEventRequest(this.event.id).then(() => {
            this.$router.push({ name: 'Explore' });
          });
        });
    },
    handleSwipe() {
      this.$router.go(-1);
    },
    onMouseWheel(e) {
      const up = e.direction === 'up';
      if (this.enableSwipeDown && up && !this.$q.screen.lt.sm) {
        this.preventMapZoom = true;

        this.$router.go(-1);

        setTimeout(() => {
          // wait for animation - stop map from zooming uncontrolably

          this.preventMapZoom = false;
        }, 1000);

        /* disabled this behavior because it's too confusing
        if (
          this.sidebarPanel !== 'explore'
        ) {
          this.sidebarPanel = 'explore';
        } */
        return false;
      }
    },
    onScrollMainContent(info) {
      var height = window.innerHeight / 3 - 120; // this is the height of the gap between menu bar and top of event card
      this.scrollPercentage = info.target.scrollTop / height;
      // menubar should always show on large screens (when sidebar is open)c
      if (this.$q.screen.lt.sm) {
        //this.menubarOpacity = ((info.target.scrollTop * 1.5) / 100) * -1 + 1;
        //this.menubarOpacity = ((info.target.scrollTop * 1.5) / 100) * 1;
        console.log(info.target.scrollTop);
        if (info.target.scrollTop > 64) {
          this.menubarOpacity = 1;
        } else {
          this.menubarOpacity = 0;
        }
        //this.overlayOpacity = ((info.target.scrollTop * 1.5) / 100) * 1;
      } else {
        if (
          info.target.scrollTop >
          window.innerHeight - window.innerHeight * 0.66 - 196
        ) {
          this.overlayOpacity = 1;
          this.menubarOpacity = 1;
        } else {
          this.overlayOpacity = 0;
          this.menubarOpacity = 0;
        }
        //this.overlayOpacity = ((info.target.scrollTop * 0.5) / 100) * 1;
      }

      if (this.scrollPercentage === 0) {
        setTimeout(() => {
          // behavior fix for desktop scroll
          this.enableSwipeDown = true;
        }, 250);
      } else {
        this.enableSwipeDown = false;
      }
    },
    getIcalFile() {
      window.location.assign(
        `${API_URL}/date/${this.selectedEventDate.id}/ics`
      );
    },
    share() {
      if (navigator.share) {
        navigator.share({
          title: this.event.name,
          text: 'Check out ' + this.event.name + ' on PartyMap',
          url: this.computedUrl,
        });
      } else {
        // copy url to clipboard
        var copyText = this.$refs.copyUrlInput;
        /* Select the text field */
        copyText.select();
        copyText.setSelectionRange(0, 99999); /* For mobile devices */

        /* Copy the text inside the text field */
        document.execCommand('copy');

        /* Alert the copied text */
        this.$q.notify('Copied link to clipboard');
      }
    },
    async load() {
      if (this.event && this.event.id !== this.id) {
        this.event = null;
      }
      this.loading = true;

      try {
        const response = await this.loadEvent(this.id);

        this.editing = this.$route.params.editing;
        this.loading = false;
        // add name to url if not already there
        var queryString = '?name=' + response.data.name.replace(/ /g, '_');
        if (
          window.location.pathname.indexOf(queryString) === -1 &&
          this.$route.name === 'EventPage'
        ) {
          this.$router.resolve({
            path: this.$route.path,
            query: { name: response.data.name.replace(/ /g, '_') },
          });
        }

        // are we navigating to a specific event date?
        var eventDateId;
        if (this.$route.params.eventDateId) {
          eventDateId = this.$route.params.eventDateId;
        } else if (this.$route.query.eventDateId) {
          eventDateId = this.$route.query.eventDateId;
        } else {
          eventDateId = null;
        }
        if (
          (response.data.next_date && !eventDateId) ||
          (response.data.next_date &&
            response.data.next_date.id === eventDateId)
        ) {
          console.log(1);
          console.log(this.focusMarker);
          if (!this.focusMarker && this.$route.name === 'EventPage') {
            console.log(2);

            // // weird but necessary
            // only do this if focusedlatlng not already set before mounting this component
            // (by eventdatecard)
            this.focusMarker = {
              lat: response.data.next_date.location.lat,
              lng: response.data.next_date.location.lng,
            };
          }
        } else if (
          eventDateId &&
          (!response.data.next_date ||
            response.data.next_date.id !== eventDateId)
        ) {
          console.log(3);

          // if navigating to specific date, load it

          const eventDateResponse = await this.loadEventDate(eventDateId);

          if (!this.focusMarker && this.$route.name === 'EventPage') {
            // weird but necessary
            console.log(4);
            // only do this if focusedlatlng not already set before mounting this component
            // (by eventdatecard)
            this.focusMarker = {
              lat: eventDateResponse.data.location.lat,
              lng: eventDateResponse.data.location.lng,
            };
          }
        }
      } catch (error) {
        console.log(error);
      }

      // for prerender.io
      setTimeout(() => {
        window.prerenderReady = true;
      }, 300);
    },
  },
  watch: {
    id: function () {
      this.loadEvent();
    },
  },
  computed: {
    ...mapWritableState(useMainStore, ['menubarOpacity', 'overlayOpacity']),
    ...mapState(useMainStore, ['routerHistory']),
    ...mapWritableState(useMapStore, ['focusMarker', 'preventMapZoom']),
    ...mapState(useAuthStore, ['currentUser', 'currentUserIsStaff']),
    ...mapState(useEventStore, ['loadingEvent', 'selectedEventDate']),
    ...mapWritableState(useEventStore, ['event', 'editing']),

    pageViewChars() {
      if (this.event.page_views) {
        var chars = this.event.page_views.toString().split('');
        return chars;
      } else {
        return [];
      }
    },
    description() {
      if (this.event) {
        return this.event.description;
      } else {
        return '';
      }
    },
    computedUrl() {
      if (this.event) {
        return (
          'https://partymap.com/event/' +
          this.event.id +
          '?' +
          this.$route.query.name
        );
      } else {
        return '';
      }
    },
    /* this funciton will fade as you scroll
    getReverseOpacity () {

    box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.2)
    box-shadow: 0 1px 5px rgba(0, 0, 0, ${0.2 *
      opacity}), 0 2px 2px rgba(0, 0, 0,${0.14 *
      opacity}), 0 3px 1px -2px rgba(0, 0, 0, ${0.12 * opacity});

      var scroll
      if (this.mainContentScrollPosition < 200) {
        scroll = 0
      } else {
        scroll = this.mainContentScrollPosition - 200
      }
      return `
      opacity: ${opacity}`
    },
    */

    currentUserIsHost() {
      if (
        this.event?.host?.username &&
        this.currentUser?.username === this.event.host.username
      ) {
        return true;
      } else {
        return false;
      }
    },
    computedName() {
      if (this.event?.name) {
        return this.event.name;
      } else if (this.$route.query.name) {
        return this.$route.query.name.replace(/_/g, ' ');
      } else {
        return null;
      }
    },
    computedExternalUrl() {
      if (this.selectedEventDate?.url) {
        // ensure that there is a protocol prefix
        if (
          this.selectedEventDate.url.indexOf('http://') < 0 &&
          this.selectedEventDate.url.indexOf('https://') < 0
        ) {
          return '//' + this.selectedEventDate.url;
        } else return this.selectedEventDate.url;
      } else {
        return null;
      }
    },
    computedTicketUrl() {
      const ticketUrl = this.event?.event_dates?.[0]?.ticket_url;
      if (ticketUrl) {
        // ensure that there is a protocol prefix
        if (
          ticketUrl.indexOf('http://') < 0 &&
          ticketUrl.indexOf('https://') < 0
        ) {
          return '//' + ticketUrl;
        } else return ticketUrl;
      } else {
        return null;
      }
    },
  },
  beforeMount() {
    window.prerenderReady = false;
  },
  mounted() {
    this.menubarOpacity = 0;
    this.editing = this.$route.params.editing;
    // clear previous event
    this.load();
    /* disabling this for now
    this.wheelIndicator = new WheelIndicator({
      elem: this.$refs.contentcard,
      callback: this.onMouseWheel,
      preventMouse: false,
    });
    */
  },
  created() {
    this.timeAgo = common.timeAgo;
    this.throttledOnScrollMainContent = _.throttle(
      this.onScrollMainContent,
      50,
      {
        leading: false,
        trailing: true,
      }
    );
  },
  beforeUnmount() {
    this.mapOverlay = false;
    this.menubarOpacity = 0;
    this.overlayOpacity = 0;
    this.focusMarker = null;
  },
  unmounted() {
    if (this.wheelIndicator) {
      this.wheelIndicator.destroy();
    }
  },
};
</script>

<style lang="scss">
.q-dialog {
  @media only screen and (max-width: 600px) {
    min-width: unset;
  }
}
</style>
<style lang="scss" scoped>
a {
  color: unset;
  text-decoration: none;
}

.body--dark {
  .event-page {
    .history-container {
      background: black;
    }
    .sticky-editing-footer {
      .sticky-editing-footer-inner {
        background: $bi-3;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
    }
    .edit-bar {
      background: $bi-2;
    }

    .scroll-area {
      .content-card {
        .main-content {
          .action-buttons {
            :deep(.q-btn) {
            }
          }
        }
        .content {
          background: $bi-2;

          :deep(.event-page-header) {
            background: $bi-2;
          }
          .main-content {
            border: 1px solid #181818 !important;
          }
          .bottom-section {
            background: $bi-1;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            border-bottom: none;

            .page-views {
              border-radius: 4px;
              .page-view-char {
                border-color: $bi-4 !important;
                background: linear-gradient($bi-1, $bi-4, $bi-1) !important;
                color: $ti-2 !important;
              }
            }
          }
        }
      }
    }
  }

  .title-section {
    border-color: $bi-3;
  }
  .community-icon {
    color: white;
  }

  .event-title {
    color: rgba(255, 255, 255, 0.87);
  }

  .event-page {
    .scroll-area {
      .edit-event-dates {
        background: $bi-2;
      }
      .content-card {
        .header {
          background: $bi-2 !important;

          .featured-media {
            opacity: 0.48;
          }

          :deep(.tag) {
            border-color: rgba(255, 255, 255, 0.1) !important;
          }
        }
      }
    }
  }
}

.body--light {
  .event-page {
    background: transparent;
    .event-page-content {
      :deep(.editing-outline) {
        border-color: grey !important;
      }
    }
    .history-container {
      background: $b-1;
    }
    .sticky-editing-footer {
      .sticky-editing-footer-inner {
        background: white;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }
    }
    .scroll-area {
      .main-row {
        .content-card {
          .main-content {
            border: 1px solid $b-4 !important;

            .action-buttons {
              /*
              .q-btn {
                border-radius: 9px !important;
                box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
                  rgba(0, 0, 0, 0.06) 0px 1px 2px 0px !important;
              }
              */
            }
          }
          .content {
            background: white;

            :deep(.event-page-header) {
              background: white;
            }

            .bottom-section {
              background: $b-2;
              border-top: 1px solid rgba(0, 0, 0, 0.03);

              .page-views {
                .page-view-char {
                  background: linear-gradient(black, grey, black);
                  border-color: grey !important;
                  color: white;
                }
              }
            }

            .event-dates-component {
              //border: 1px solid rgb(230,230,230);
            }
            .header {
              background: $bi-4 !important;
              border-bottom: 1px solid rgba(0, 0, 0, 0.1);
              color: white;

              .featured-media {
                opacity: 0.68;
              }

              .header-content {
                color: white;

                :deep(.tag) {
                  border-color: rgba(255, 255, 255, 0.1) !important;
                }
              }
            }
          }
        }
      }
    }
    .title-section {
      border-color: $b-3;
    }

    .t2 {
      color: $t-2;
    }
  }
}

.event-page {
  pointer-events: all;
  .event-page-overlay {
    background: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
  }
  .event-page-content {
    width: 100%;
    .sticky-editing-footer {
      position: fixed;
      bottom: 0px;
      left: 0px;
      width: 100%;
      z-index: 1000;
    }
    :deep(.editing-outline) {
      border-color: white !important;
    }
    .history-container {
      z-index: 1;
      position: sticky;
      top: 0px;
      left: 0px;
      max-height: calc(100vh - 64px);
      height: 100vh;
      overflow-y: scroll;
      box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.4);
    }
    .scroll-area {
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;

      .main-row {
        position: relative;

        .content-card {
          margin-top: Max(calc((100vh - 66vh) - 64px), 0px);
          max-width: 1024px;
          //border: none !important;
          min-height: 100vh;

          pointer-events: all;
          padding-bottom: 0px;
          border-top-left-radius: 18px !important;
          border-top-right-radius: 18px !important;
          &.shadow {
            box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 46px -6px,
              rgba(0, 0, 0, 0.2) 10px -10px 46px -6px,
              rgba(0, 0, 0, 0.2) -10px -10px 40px -6px !important;
          }
          .content {
            height: 100%;
            border-top-left-radius: 18px !important;
            border-top-right-radius: 18px !important;
            //box-shadow: 0px 0px 64px 32px rgba(0, 0, 0, 0.2) !important;

            overflow: hidden;
            position: relative;
            &.no-margin-top {
              margin-top: 0px;
            }

            .header {
              position: relative;
              width: 100%;
              display: flex;
              transition: flex-grow 1s;
              max-height: min-content;
              background: #fafafa;
              border-bottom: 1px solid #1a1a1a;
              min-height: Min(66vh, 440px);
              .q-inner-loading {
                background: none;
              }

              .header-content {
                position: relative;
                width: 100%;
                height: 100%;
                // color: white;
                z-index: 2;
                .mobile-hide-icon {
                  position: absolute;
                  right: 0px;
                }
                .tags-wrapper {
                }
              }
              .featured-media {
                position: absolute;
                top: 0px;
                left: 0px;
                z-index: 0;
                width: 100%;
                height: 100%;
              }
              :deep(.tag) {
                background: transparent !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;

                .tag-inner-wrapper {
                  background: transparent;
                  //border-color: rgba(0, 0, 0, 0.8) !important;
                }
              }
            }

            :deep(.event-page-header) {
              position: sticky;
              top: 0px;
              padding-bottom: 16px;
              padding-top: 16px;
              z-index: 1;
            }
            .bottom-section {
              position: relative;
              .page-views {
                .page-view-char {
                  display: inline-block;
                  padding: 4px;
                  font-weight: bold;
                  border: 1px solid grey;
                  &:not(:first-child) {
                    border-left: none;
                  }
                }
              }
              .event-buttons {
                position: relative;

                .q-btn-group {
                  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
                    rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
                }
              }
            }
          }
        }
        .clickable-background {
          position: absolute;
          height: 100%;
          width: 100vw;
          top: 0;
          cursor: pointer;
        }
      }
    }
  }
}

.mobile-dismiss-list {
  position: absolute;
  height: 34px;
  width: 100%;
  z-index: 4000;
  pointer-events: auto;
  .swipe-nav-bar {
    background: rgba(255, 255, 255, 0.2) !important;
  }
}

.title-section {
  position: absolute;
  margin-top: 150px;
}

.event-page {
  height: 100%;
  display: flex;
}

@media only screen and (min-width: 599px) {
  .content-card {
    max-width: 960px !important;
  }
  .sticky-editing-footer-inner {
    max-width: 960px;
  }
}
@media only screen and (min-width: 1023px) {
  .content-card {
    max-width: 1024px !important;
  }
  .sticky-editing-footer-inner {
    max-width: 1024px;
  }
}

@media only screen and (max-width: 1024px) {
  .content-card {
    max-width: 96vw !important;
  }
  .sticky-editing-footer-inner {
    max-width: 96vw;
  }
}
@media only screen and (max-width: 600px) {
  .body--light {
    .action-buttons-wrapper {
      //background: $b-2;
      //box-shadow: rgba(100, 100, 111, 0.25) 0px 7px 29px 0px;
    }
  }
  .body--dark {
    .event-page {
      .scroll-area {
        .content-card {
          border-top: 1px solid $bi-4 !important;
        }
      }
    }
    .action-buttons-wrapper {
      background: $bi-1;
    }
  }
  .event-page {
    .event-page-content {
      .sticky-editing-footer-inner {
        max-width: 100vw;
      }
      .scroll-area {
        //height: 100%;
        .featured-media {
          overflow: hidden;
        }
        .main-row {
          //z-index: 0;
          //height: 100%;
          .content-card {
            //max-height: calc(100% - 66vh);
            min-height: 100%;
            margin-top: Max(calc(100% - 66%), 0px);
            border: none;
            max-width: 100vw !important;

            //overflow: hidden;
            .content {
              //overflow-y: hidden;
              &.mobile-scroll-enable {
                //overflow-y: scroll;
              }
              .main-content {
                border: none !important;
              }
            }
            .mobile-swipe-handle {
              position: sticky;
              top: 0;
            }
            .event-dates-component {
              border: none;
            }
            .header {
              min-height: 550px;
            }
          }
        }
      }
    }
  }
}
</style>
