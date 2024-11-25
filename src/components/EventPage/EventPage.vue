<template>
  <div
    ref="eventPage"
    class="event-page"
    :class="{
      'desktop-sidebar-padding': mainStore.desktopSidebarShowing,
    }"
    :key="id"
  >
    <transition appear enter-active-class="animated fadeIn slow">
      <div
        class="peek-address-wrapper flex row justify-center"
        v-if="mapStore.peekMap && selectedEventDate"
      >
        <div
          class="peek-address inter flex column justify-start items-stretch col-8 col-sm-12 col-md-10 col-lg-10 col-xl-8 col-xs-12"
          :class="$q.screen.gt.xs ? 'text-h5' : 'text-h6'"
        >
          <div class="o-070">
            {{ selectedEventDate?.location.description }}
          </div>
        </div>
      </div>
    </transition>
    <div class="event-page-content">
      <div
        class="flex history-container col-4 col-xs-12 col-sm-6 col-md-5 col-lg-4 col-xl-4"
        v-if="showingHistory"
      >
        <!--
        <HistoryComponent @close="showingHistory = false" />
        -->
      </div>
      <CustomQScroll
        vertical
        ref="scrollArea"
        @scroll="onScrollMainContent"
        @scrollend="onScrollEnd"
        class="scroll-area flex grow"
        :class="disableScroll ? 'disable-scroll' : ''"
        :thumb-style="
          $q.screen.gt.xs
            ? {
                bottom: '0px',
                height: '8px',
                marginLeft: '16px',
                borderRadius: '0px',
              }
            : {
                bottom: '0px',
                height: '0px',
                borderRadius: '0px',
                width: '4px',
              }
        "
      >
        <div class="row flex grow main-row no-wrap justify-center">
          <div
            ref="contentCard"
            class="content-card flex column no-wrap"
            :class="{
              'col-12 no-margin-top': showingHistory,
              'col-8 col-sm-12 col-md-10 col-lg-10 col-xl-8 col-xs-12':
                !showingHistory,
              shadow: mainStore.overlayOpacity === 0 || $q.screen.lt.sm,
              'peek-map': mapStore.peekMap,
            }"
          >
            <div
              class="peek-map-overlay"
              @click="swipeUp"
              v-if="mapStore.peekMap"
              v-touch-swipe="swipe"
            />

            <MobileSwipeHandle
              v-if="$q.screen.lt.sm && false"
              @swipe="handleSwipe"
              class="mobile-swipe-handle"
            />

            <div class="content flex column">
              <div class="flex column grow no-wrap">
                <div class="header flex column">
                  <FeaturedMediaBackground
                    :thumbXsUrl="route.query?.thumbXsUrl as any as string"
                    class="featured-media"
                    :editing="editing"
                  />
                  <InnerLoading
                    :solid="false"
                    v-if="
                      loading &&
                      !route.query?.thumbXsUrl &&
                      !route.query.description
                    "
                  />

                  <div class="header-content grow row">
                    <div
                      class="flex column justify-start col-6 col-xs-12 col-sm-7 col-md-6 col-lg-6 col-xl-6"
                      :class="{
                        'q-px-xl q-pt-xl q-pb-lg items-stretch ':
                          $q.screen.gt.sm,
                        'q-pa-lg q-pt-xl': $q.screen.lt.md && $q.screen.gt.xs,
                        'q-px-md q-pb-md items-start': $q.screen.lt.sm,
                      }"
                    >
                      <div
                        class="flex row justify-between items-start no-wrap"
                        style="position: relative"
                      >
                        <div
                          class="o-090 text-h4 flex grow items-baseline flex inter bolder no-wrap"
                          :class="{
                            'q-pt-lg q-pr-xl q-mr-xl': $q.screen.lt.sm,
                          }"
                          :style="
                            $q.screen.lt.sm
                              ? 'font-size: x-large; line-height: unset;'
                              : ''
                          "
                        >
                          <span>
                            {{ computedName }}
                            <q-icon
                              class="o-070 q-mb-xs"
                              name="mdi-check-decagram-outline"
                              size="sm"
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
                                {{ t('event.official_page') }}
                              </q-tooltip></q-icon
                            >
                          </span>
                        </div>
                      </div>

                      <div
                        v-if="event?.description || route.query.description"
                        class="flex row justify-between items-center"
                        style="width: 100%"
                        :class="{
                          'q-mt-md': $q.screen.gt.xs,
                          'q-mt-sm': $q.screen.lt.sm,
                        }"
                      >
                        <transition
                          appear
                          enter-active-class="animated fadeIn "
                        >
                          <NextEventDateSummary
                            :class="{
                              'o-050': editing,
                            }"
                            class=""
                            :ed="selectedEventDate"
                          />
                        </transition>
                      </div>
                      <FeaturedMediaComponent
                        @loaded="mediaLoaded"
                        v-if="
                          (!!event || route.query?.thumbXsUrl) &&
                          $q.screen.lt.sm
                        "
                        :editing="editing"
                        class="q-mt-lg"
                        :item="event?.media_items?.[0]"
                        :thumbXsUrl="route.query?.thumbXsUrl"
                      />

                      <div
                        class="flex column justify-start grow no-wrap"
                        v-if="event?.description || route.query.description"
                      >
                        <div
                          class="flex grow justify-start items-start"
                          v-if="!!event || !!route.query?.description"
                        >
                          <SummaryComponent
                            :editing="editing"
                            :class="
                              $q.screen.gt.sm ? 'q-mt-md q-mb-md' : 'q-mt-lg'
                            "
                          />
                        </div>
                        <div class="q-mt-md">
                          <div
                            class="flex row metropolis"
                            :class="{ 'o-000': !computedExternalUrlSubtitle }"
                            style="transition: opacity 0.3s ease"
                          >
                            <div class="flex col" v-if="!editing">
                              <a
                                class="flex grow ellipsis"
                                :href="computedExternalUrl"
                                target="_blank"
                              >
                                <q-btn
                                  no-caps
                                  class="ellipsis"
                                  :class="$q.screen.gt.sm ? 'grow' : ' grow'"
                                >
                                  <div
                                    class="flex row grow no-wrap justify-start ellipsis items-center"
                                  >
                                    <q-icon
                                      name="las la-external-link-alt"
                                      class=""
                                    />
                                    <div
                                      class="flex column ellipsis items-start q-ml-sm q-pl-xs"
                                    >
                                      <div class="">
                                        {{ computedExternalUrlTitle }}
                                      </div>
                                      <div
                                        class="o-050 ellipsis text- q-mb-xs"
                                        style="
                                          font-size: small;
                                          line-height: normal;
                                          width: 100%;
                                        "
                                      >
                                        {{
                                          computedExternalUrlSubtitle || '...'
                                        }}
                                      </div>
                                    </div>
                                  </div>
                                </q-btn>
                              </a>
                            </div>
                            <div
                              class="flex col q-ml-sm"
                              v-if="!!event && computedTicketName && !editing"
                            >
                              <q-btn
                                @click="showingTicketDialog = true"
                                no-caps
                                class="ellipsis tickets"
                                :class="$q.screen.gt.sm ? 'grow' : ' grow'"
                              >
                                <div
                                  class="flex row grow no-wrap justify-start ellipsis items-center"
                                >
                                  <q-icon name="las la-ticket-alt" class="" />
                                  <div
                                    class="flex column ellipsis items-start q-ml-sm q-pl-xs"
                                  >
                                    <div class="">
                                      {{ t('event.get_tickets') }}
                                    </div>
                                    <div
                                      class="o-050 ellipsis text- q-mb-xs"
                                      style="
                                        font-size: small;
                                        line-height: normal;
                                        width: 100%;
                                      "
                                    >
                                      {{ computedTicketName }}
                                    </div>
                                  </div>
                                </div>
                              </q-btn>
                            </div>
                          </div>
                        </div>
                        <div
                          class="flex row justify-between items-end no-wrap tags-wrapper o-080"
                          :class="$q.screen.gt.sm ? 'q-pt-lg ' : 'q-mt-md'"
                        >
                          <TagsComponent :small="false" :editing="editing" />
                        </div>
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
                    </div>
                    <div
                      class="flex column no-wrap justify-center col-6 col-xs-12 col-sm-5 col-md-6 col-lg-6 col-xl-6"
                      v-if="$q.screen.gt.xs"
                      :class="{
                        'q-py-xl q-pr-xl': $q.screen.gt.sm,
                        'q-py-lg q-pr-lg': $q.screen.lt.md,
                      }"
                    >
                      <FeaturedMediaComponent
                        :editing="editing"
                        :item="event?.media_items?.[0]"
                        @loaded="mediaLoaded"
                        :thumbXsUrl="route.query?.thumbXsUrl"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="main-content"
                  :class="{
                    ' q-px-xl q-pb-xl q-pt-lg': $q.screen.gt.sm,
                    loading: !event,
                  }"
                >
                  <div
                    v-if="
                      !!event &&
                      (!event.event_dates || event.event_dates.length === 0)
                    "
                    class="q-px-xl q-pt-xl q-pb-xl flex row items-center justify-center"
                  >
                    <div class="t3">
                      {{
                        t('event_dates.this_event_doesnt_have_upcoming_dates')
                      }}
                    </div>
                  </div>
                  <div v-else-if="!!event" class="flex row no-wrap">
                    <EventDateSidebarDesktop
                      v-if="$q.screen.gt.sm"
                      class="q-mr-lg q-mt-md"
                    />
                    <div
                      class="flex column grow"
                      :class="{ 'q-pl-lg': $q.screen.gt.sm }"
                    >
                      <div
                        v-if="
                          (computedTicketName || computedExternalUrl) && event
                        "
                        class="event-buttons flex row items-center wrap o-100"
                        :class="
                          $q.screen.gt.sm ? ' q-py-md' : 'q-py-md q-pl-md'
                        "
                      >
                        <CustomQScroll
                          horizontal
                          class="event-buttons-scroll"
                          style="
                            width: 100%;
                            height: 44px;
                            margin-bottom: -16px;
                          "
                          :thumb-style="
                            $q.screen.gt.xs
                              ? {
                                  bottom: '0px',
                                  height: '4px',
                                }
                              : { bottom: '0px', height: '0px' }
                          "
                        >
                          <div
                            class="flex justify-between items-center no-wrap"
                          >
                            <div
                              class="flex row q-gutter-sm items-center no-wrap"
                            >
                              <!--
                                <a
                                  style="text-decoration: none; color: unset"
                                  :href="computedExternalUrl"
                                  target="_blank"
                                  v-if="computedExternalUrl && !editing"
                                >
                                  <q-btn
                                    no-caps
                                    class="nav-button primary"
                                    flat
                                    style="width: 160px"
                                    label="Visit Website"
                                    icon="las la-external-link-alt"
                                    :class="$q.screen.gt.sm ? '' : 'flex grow'"
                                  />
                                </a>
                                -->
                              <div v-if="$q.screen.gt.xs && false">
                                <div
                                  class="separator vertical q-mx-sm"
                                  style="height: 36px"
                                />
                              </div>

                              <InterestedComponent />

                              <!-- show share button -->
                              <q-btn
                                class="button-light"
                                :label="t('event.share')"
                                no-caps
                                flat
                                icon="mdi-share"
                                @click="share"
                                v-if="!editing"
                              />

                              <q-btn
                                class="button-light"
                                flat
                                no-caps
                                @click="getIcalFile"
                                ><q-icon
                                  name="mdi-calendar-export-outline"
                                  size="22px"
                                  :class="
                                    $q.screen.gt.xs ? 'q-mr-sm' : 'q-mr-sm'
                                  "
                                ></q-icon>
                                {{ t('event.save_to_device') }}
                              </q-btn>

                              <q-btn
                                class="button-light"
                                flat
                                no-caps
                                icon="mdi-image-plus-outline"
                                :label="t('event.add_photos')"
                              >
                                <q-menu
                                  transition-show="jump-down"
                                  transition-hide="jump-up"
                                  anchor="bottom right"
                                  self="top right"
                                >
                                  <q-item
                                    v-close-popup
                                    v-ripple
                                    @click="showingAddEventPhotosDialog = true"
                                    clickable
                                  >
                                    <q-item-section avatar>
                                      <q-icon name="mdi-camera-plus-outline" />
                                    </q-item-section>
                                    <q-item-section>
                                      <q-item-label>{{
                                        t('event.add_photos')
                                      }}</q-item-label>
                                    </q-item-section>
                                  </q-item>
                                  <q-separator />
                                  <q-item
                                    v-close-popup
                                    v-ripple
                                    @click="showingAddLineupPosterDialog = true"
                                    clickable
                                  >
                                    <q-item-section avatar>
                                      <q-icon name="mdi-image-plus-outline" />
                                    </q-item-section>
                                    <q-item-section>
                                      <q-item-label>{{
                                        t('event.add_lineup_poster')
                                      }}</q-item-label>
                                    </q-item-section>
                                  </q-item>
                                  <q-item
                                    v-close-popup
                                    v-ripple
                                    @click="showingUploadNewLogoDialog = true"
                                    clickable
                                  >
                                    <q-item-section avatar>
                                      <q-icon name="mdi-image-sync-outline" />
                                    </q-item-section>
                                    <q-item-section>
                                      <q-item-label>{{
                                        t('event.update_event_logo')
                                      }}</q-item-label>
                                    </q-item-section>
                                  </q-item>
                                </q-menu>
                              </q-btn>

                              <!-- show EDIT BUTTON if user is host or user is staff and public event -->
                              <q-btn
                                v-if="currentUserCanEdit"
                                flat
                                class="button-light"
                                :label="t('event.edit')"
                                no-caps
                                :icon="
                                  $q.screen.gt.xs
                                    ? 'mdi-square-edit-outline'
                                    : undefined
                                "
                                style="padding-left: 4px"
                                :size="$q.screen.gt.xs ? '1em' : 'md'"
                                @click="editing = !editing"
                              />
                            </div>
                            <q-btn
                              flat
                              :color="$q.dark.isActive ? 'grey-10' : 'grey-1'"
                              :text-color="
                                $q.dark.isActive ? 'grey-4' : 'grey-6'
                              "
                              icon="mdi-dots-vertical"
                              class="q-px-sm q-ml-md"
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
                                {{ t('sidebar.more') }}
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
                                      t('report.report_event')
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
                                      : router.push({
                                          path: '/login',
                                          query: { from: route.path },
                                        })
                                  "
                                  clickable
                                >
                                  <q-item-section avatar>
                                    <q-icon name="mdi-check-decagram-outline" />
                                  </q-item-section>
                                  <q-item-section>
                                    <q-item-label>{{
                                      t('report.are_you_host')
                                    }}</q-item-label>
                                  </q-item-section>
                                </q-item>

                                <!-- SHOW SUGGESTIONS if there is no event host -->
                                <q-item
                                  v-close-popup
                                  v-ripple
                                  v-if="
                                    !currentUserCanEdit && event.host == null
                                  "
                                  @click="editing = true"
                                  clickable
                                >
                                  <q-item-section avatar>
                                    <q-icon name="las la-hand-peace" />
                                  </q-item-section>
                                  <q-item-section>
                                    <q-item-label>{{
                                      t('suggestions.improve_this_page')
                                    }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                                <!-- SHOW EDIT if currentUserIsStaff -->
                                <q-item
                                  v-if="currentUserCanEdit"
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
                                        t('event.edit_event')
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
                                      >{{ t('event.delete_event') }}
                                      <span
                                        v-if="
                                          currentUserIsStaff &&
                                          !currentUserIsHost
                                        "
                                        >(admin)</span
                                      ></q-item-label
                                    >
                                  </q-item-section>
                                </q-item>
                                <q-item
                                  v-if="currentUserIsStaff && false"
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
                        </CustomQScroll>
                      </div>
                      <div
                        class="flex column"
                        :class="{
                          'q-mt-md q-mx-lg': $q.screen.gt.xs && $q.screen.lt.md,
                        }"
                      >
                        <div
                          v-if="$q.screen.lt.sm"
                          class="separator"
                          :class="
                            $q.screen.lt.sm ? 'q-mb-sm q-mt-sm' : 'q-mb-md'
                          "
                        />

                        <EventDates />

                        <div
                          class="metropolis bolder text-h6 t1 q-pr-md event-page-header"
                          v-if="event?.youtube_url?.length > 0"
                          :class="{ 'q-mx-md': $q.screen.lt.sm }"
                        >
                          {{ t('event.aftermovie') }}:
                        </div>

                        <YoutubeVideoComponent
                          :key="event?.youtube_url"
                          class="q-mb-md"
                          :editing="editing"
                          v-if="
                            (editing ||
                              (event?.youtube_url &&
                                event?.youtube_url?.length > 0)) &&
                            !!event
                          "
                        />

                        <DescriptionComponent
                          :editing="editing"
                          v-if="
                            editing ||
                            (event.full_description &&
                              event?.full_description?.length > 0)
                          "
                          :class="{ 'q-px-md': $q.screen.lt.sm }"
                        />

                        <EventDateLineupComponent />

                        <ReviewsComponent
                          class="q-mb-xl q-mt-md"
                          :class="{ 'q-px-md': $q.screen.lt.sm }"
                        />
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
                  'column reverse no-wrap q-pa-md q-py-lg q-pb-lg ':
                    $q.screen.lt.sm,
                  'row justify-between items-center': $q.screen.gt.xs,
                  'q-pa-xl': $q.screen.gt.sm,
                  'q-px-xl q-py-xl': $q.screen.gt.xs && $q.screen.lt.md,
                }"
              >
                <div
                  class="flex column"
                  :class="$q.screen.gt.xs ? 'items-start' : ' q-pb-md'"
                >
                  <div class="t4">
                    <q-icon name="mdi-eye-outline" class="q-mr-sm" />{{
                      event.page_views
                    }}
                    views
                  </div>
                  <div class="t4 flex column items-start no-wrap q-mt-xs">
                    <div>
                      <q-icon name="mdi-refresh" class="q-mr-sm" />
                      <span
                        >{{ t('event.last_updated') }} &nbsp;{{
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

                    <div v-if="event?.transaction?.user?.username && false">
                      <!-- shown when displaying EventVersion -->
                      <span
                        class="link-hover underline"
                        @click="showingHistory = !showingHistory"
                        >{{ t('event.last_updated') }}</span
                      >
                      {{ timeAgo(event.transaction.issued_at + 'Z') }}
                      {{ t('event.by') }}
                      <router-link
                        class="link-hover underline"
                        :to="{
                          name: 'UserPage',
                          params: {
                            username: event.transaction.user.username,
                          },
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
      </CustomQScroll>
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
        <ReportDialog
          v-if="showingReportDialog"
          :mode="'reportEvent'"
          @closeDialog="showingReportDialog = false"
        />
      </q-dialog>
      <q-dialog v-model="showingClaimDialog">
        <ReportDialog
          @closeDialog="showingClaimDialog = false"
          :mode="'claimEvent'"
          v-if="showingClaimDialog"
        />
      </q-dialog>

      <q-dialog v-model="showingSuggestionsDialog">
        <SuggestionsDialog
          v-if="showingSuggestionsDialog"
          @closeDialog="showingSuggestionsDialog = false"
        />
      </q-dialog>

      <q-dialog v-model="showingAddEventPhotosDialog">
        <AddEventPhotosDialog
          v-if="showingAddEventPhotosDialog"
          @closeDialog="showingAddEventPhotosDialog = false"
        />
      </q-dialog>
      <q-dialog v-model="showingAddLineupPosterDialog">
        <AddLineupPosterDialog
          v-if="showingAddLineupPosterDialog"
          @closeDialog="showingAddLineupPosterDialog = false"
        />
      </q-dialog>
      <q-dialog v-model="showingUploadNewLogoDialog">
        <UploadNewLogoDialog
          v-if="showingUploadNewLogoDialog"
          @closeDialog="() => (showingUploadNewLogoDialog = false)"
        />
      </q-dialog>
      <q-dialog
        v-model="showingTicketDialog"
        @closeDialog="() => (showingTicketDialog = false)"
      >
        <EventDateTicketUrlDialog v-if="showingTicketDialog" />
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { deleteEventRequest, API_URL } from 'src/api';

import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { useMapStore } from 'src/stores/map';
import { useEventStore } from 'src/stores/event';

import { computed, ref, onActivated, onDeactivated, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { storeToRefs } from 'pinia';
import CustomQScroll from 'components/CustomQScroll.vue';

import _ from 'lodash';
import common from 'assets/common';

import DescriptionComponent from 'components/EventPage/DescriptionComponent.vue';
import YoutubeVideoComponent from 'components/EventPage/YoutubeVideoComponent.vue';
import SummaryComponent from 'components/EventPage/SummaryComponent.vue';
import EventDates from 'components/EventPage/EventDates/EventDates.vue';

import EventDateSidebarDesktop from 'components/EventPage/EventDates/EventDateSidebarDesktop.vue';
import FeaturedMediaBackground from 'components/EventPage/Gallery/FeaturedMediaBackground.vue';
import FeaturedMediaComponent from 'components/EventPage/Gallery/FeaturedMediaComponent.vue';
import EventDateLineupComponent from 'components/EventPage/EventDates/EventDateLineupComponent.vue';
import EventDateTicketUrlDialog from 'components/EventPage/EventDates/EventDateTicketUrlDialog.vue';

// import HistoryComponent from 'components/EventPage/Activity/HistoryComponent.vue';

import NextEventDateSummary from 'components/EventPage/EventDates/NextEventDateSummary.vue';
import ReportDialog from './ReportDialog.vue';
import TagsComponent from 'components/EventPage/Tags/TagsComponent.vue';
import ReviewsComponent from './Reviews/ReviewsComponent.vue';
import MobileSwipeHandle from '../MobileSwipeHandle.vue';
import InterestedComponent from './InterestedComponent.vue';
import SuggestionsDialog from './Suggestions/SuggestionsDialog.vue';
import AddEventPhotosDialog from 'components/EventPage/Gallery/AddEventPhotosDialog.vue';
import AddLineupPosterDialog from 'components/EventPage/Gallery/AddLineupPosterDialog.vue';
import UploadNewLogoDialog from 'components/EventPage/Gallery/UploadNewLogoDialog.vue';

import InnerLoading from 'components/InnerLoading.vue';
import { useI18n } from 'vue-i18n';
import { useDrag } from '@vueuse/gesture';
import { useMeta } from 'quasar';

import {
  MotionVariants,
  useMotionControls,
  useMotionProperties,
  useMotionTransitions,
  useSpring,
} from '@vueuse/motion';
/*
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
  */

interface Props {
  id: string;
  eventDateId?: string;
  name?: string;
}

const props = withDefaults(defineProps<Props>(), {});

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();

const previousMenubarOpacity = ref(0);
const disableScroll = ref(true);
const enableSwipeDown = ref(true);
const scrollPercentage = ref(0);
const showingReportDialog = ref(false);
const showingClaimDialog = ref(false);

const loading = ref(false);
const imageLoaded = ref(false);
const showingHistory = ref(false);
const showingSuggestionsDialog = ref(false);
const showingAddEventPhotosDialog = ref(false);
const showingAddLineupPosterDialog = ref(false);
const showingUploadNewLogoDialog = ref(false);
const showingTicketDialog = ref(false);
const eventStore = useEventStore();
const authStore = useAuthStore();
const mainStore = useMainStore();
const mapStore = useMapStore();

const timeAgo = common.timeAgo;
const getDomainFromUrl = common.getDomainFromUrl;

const { currentUser, currentUserIsStaff } = storeToRefs(authStore);
let {
  event,
  selectedEventDate,
  currentUserIsHost,
  currentUserCanEdit,
  editing,
} = storeToRefs(eventStore);

const scrollArea = ref<HTMLElement>();

const eventPage = ref();

const mediaLoaded = () => {
  imageLoaded.value = true;
};

const spring = ref();
const motionProperties = ref();
const motionControls = ref();
const motionTransitions = ref();

const hiddenYPosition = window.innerHeight - window.innerHeight * 0.2;

const previousRouteIsExplore = computed(
  () =>
    mainStore.routerHistory[mainStore.routerHistory.length - 1]?.name ===
    'Explore'
);

const setupSpring = () => {
  // start hidden
  const { motionProperties: mp } = useMotionProperties(eventPage, {
    y: hiddenYPosition,
  });
  motionProperties.value = mp;
  motionControls.value = useMotionControls(motionProperties.value);
  motionTransitions.value = useMotionTransitions();
  // spring up
  motionTransitions.value.push('y', 0, motionProperties.value, {
    type: 'spring',
    stiffness: 600,
    damping: 50,
    mass: 1.8,
  });
};

const dragHandler = ({
  movement: [x, y],
  dragging,
  swipe: [swipeX, swipeY],
  offset,
  delta,
  initial,
}) => {
  if (scrollPercentage.value <= 0 && enableSwipeDown.value) {
    if (swipeY == 1) {
      goBack();
      return;
    }

    if (!dragging) {
      if (y > 150) {
        goBack();
      } else {
        // spring.value.set({ x: 0, y: 0, cursor: 'grab' });
        motionTransitions.value.push('y', 0, motionProperties.value, {
          type: 'spring',
          stiffness: 600,
          damping: 50,
          mass: 1.8,
        });
      }
      return;
    }
    // only allow dragging down
    if (y > 0) {
      if (
        y > 150 &&
        mainStore.routerHistory?.[mainStore.routerHistory.length - 1]?.name ===
          'Explore'
      ) {
        // mainStore.sidebarOpacity = 1;
      }
      // update motion position but don't animate
      motionTransitions.value.push('y', y, motionProperties.value, {
        type: 'keyframes',
        duration: 0,
      });
    }
  }
};

useDrag(dragHandler, {
  domTarget: eventPage,
  axis: 'y',
  //preventWindowScrollY: true,
});

const clickBackground = () => {
  /*
      if (this.$q.platform.is.mobile || true) {
        this.peekMap = !this.peekMap;
      } else {
        this.goBack();
      }
      */
  goBack();
};

const swipeUp = () => {
  mapStore.peekMap = false;
};

const swipe = (event: any) => {
  if (event.direction === 'up') {
    swipeUp();
  } else if (event.direction === 'down') {
    goBack();
  }
};

const deleteEvent = () => {
  $q.dialog({
    title: t('event_dates.delete_event'),
    message: t('event_dates.delete_event_confirm'),
    cancel: true,
    persistent: false,
  }).onOk(() => {
    deleteEventRequest(event.value?.id).then(() => {
      router.push({ name: 'Explore' });
    });
  });
};

onBeforeRouteLeave((to, from, next) => {
  event.value = null;
  selectedEventDate.value = null;
  //mapStore.focusMarker = null;

  // transition out before going back on mobile
  if ($q.screen.lt.sm) {
    (scrollArea.value as any).setScrollPercentage('vertical', 0);

    motionTransitions.value.push('y', hiddenYPosition, motionProperties.value, {
      type: 'spring',
      stiffness: 600,
      damping: 50,
      mass: 1.8,
    });
    mainStore.sidebarOpacity = 1;
    if ($q.platform.is.android || $q.platform.is.mobile) {
      if (mainStore.showPanel) {
        mainStore.showPanelBackground = true;
        mainStore.sidebarOpacity = 1;
      }

      setTimeout(() => {
        next();
      }, 150);
    }
  } else {
    next();
  }
});

const goBack = () => {
  // if (this.$q.platform.is.android) event = null;
  //this.disableScroll = true; // helps animation be smoother on android

  if (mainStore.routerHistory.length > 0) {
    router.go(-1);
  } else {
    router.push({ name: 'Explore' });
  }
};

const handleSwipe = () => {
  goBack();
};

const onScrollMainContent = (info: any) => {
  // console.log(info);
  // var height = window.innerHeight / 3 - 120; // this is the height of the gap between menu bar and top of event card
  scrollPercentage.value = info.verticalPercentage;
  let verticalPostion = info.verticalPosition;
  if (scrollPercentage.value > 0) {
    enableSwipeDown.value = false;
  }
  // menubar should always show on large screens (when sidebar is open)c
  if ($q.screen.lt.md) {
    //this.menubarOpacity = ((info.target.scrollTop * 1.5) / 100) * -1 + 1;
    //this.menubarOpacity = ((info.target.scrollTop * 1.5) / 100) * 1;
    if (verticalPostion > 64) {
      mainStore.menubarOpacity = 1;
    } else {
      mainStore.menubarOpacity = 0;
    }
    mainStore.overlayOpacity = Math.min(((verticalPostion * 1.5) / 100) * 1, 1);
  } else {
    if (
      verticalPostion >
      window.innerHeight - window.innerHeight * 0.66 - 196
    ) {
      mainStore.overlayOpacity = 1;
      mainStore.menubarOpacity = 1;
    } else {
      mainStore.overlayOpacity = 0;
      mainStore.menubarOpacity = 0;
    }
    //this.overlayOpacity = ((info.target.scrollTop * 0.5) / 100) * 1;
  }
};

const onScrollEnd = () => {
  if (scrollPercentage.value <= 0) {
    enableSwipeDown.value = true;
  }
};

const getIcalFile = () => {
  window.location.assign(`${API_URL}/date/${selectedEventDate.value?.id}/ics`);
};

const copyUrlInput = ref(null);

const share = () => {
  if (navigator.share) {
    navigator.share({
      title: event.value?.name,
      text: t('event.check_out') + event.value?.name + t('event.on_partymap'),
      url: computedUrl.value,
    });
  } else {
    if (!navigator.clipboard) {
      // try the old way
      try {
        // copy url to clipboard
        var copyText = copyUrlInput as any;
        /* Select the text field */
        copyText.value.select();
        copyText.value.setSelectionRange(0, 99999); /* For mobile devices */

        /* Copy the text inside the text field */
        document.execCommand('copy');

        /* Alert the copied text */
        $q.notify(t('event.copied_link'));
      } catch (err) {
        $q.notify(t('event.sharing_not_supported'));
      }
      return;
    } else {
      // do it the modern way
      navigator.clipboard
        .writeText(computedUrl.value)
        .then(() => $q.notify(t('event.copied_link')))
        .catch(() => $q.notify(t('event.sharing_not_supported')));
    }
  }
};

const load = async () => {
  loading.value = true;
  try {
    const response = await eventStore.loadEvent(Number(props.id));

    editing.value = !!route.params.editing;
    loading.value = false;
    // add name to url if not already there
    var queryString = '?name=' + response.data.name.replace(/ /g, '_');
    if (
      window.location.pathname.indexOf(queryString) === -1 &&
      route.name === 'EventPage'
    ) {
      router.resolve({
        path: route.path,
        query: { name: response.data.name.replace(/ /g, '_') },
      });
    }

    // are we navigating to a specific event date?
    var eventDateId;
    if (route.params.eventDateId) {
      eventDateId = route.params.eventDateId;
    } else if (route.query.eventDateId) {
      eventDateId = route.query.eventDateId;
    } else {
      eventDateId = null;
    }
    if (
      (response.data.next_date && !eventDateId) ||
      (response.data.next_date && response.data.next_date.id === eventDateId)
    ) {
      if (!mapStore.focusMarker && route.name === 'EventPage') {
        // // weird but necessary
        // only do this if focusedlatlng not already set before mounting this component
        // (by eventdatecard)
        mapStore.focusMarker = {
          lat: response.data.next_date.location.lat,
          lng: response.data.next_date.location.lng,
          place_id: response.data.next_date.location.place_id,
        };
      }
    } else if (
      props.eventDateId &&
      (!response.data.next_date ||
        response.data.next_date.id !== props.eventDateId)
    ) {
      // if navigating to specific date, load it

      const eventDateResponse = await eventStore.loadEventDate(
        props.eventDateId
      );

      if (!mapStore.focusMarker && route.name === 'EventPage') {
        // weird but necessary
        // only do this if focusedlatlng not already set before mounting this component
        // (by eventdatecard)
        mapStore.focusMarker = {
          lat: eventDateResponse.data.location.lat,
          lng: eventDateResponse.data.location.lng,
          place_id: eventDateResponse.data.location.place_id,
        };
      }
    } else if (
      !response.data.next_date &&
      response.data.event_dates &&
      response.data.event_dates.length > 0
    ) {
      // no upcoming event, set current event to be the most recent event
      const lastIndex = response.data.event_dates.length - 1;
      eventStore.selectedEventDateIndex = lastIndex;
      // if no next date, set current event to be the most recent one
      const eventDateResponse = await eventStore.loadEventDate(
        eventStore.event?.event_dates?.[lastIndex]?.id + ''
      );
      mapStore.focusMarker = {
        lat: eventDateResponse.data.location.lat,
        lng: eventDateResponse.data.location.lng,
        place_id: eventDateResponse.data.location.place_id,
      };
    }
  } catch (error) {
    console.log(error);
  }

  // for prerender.io
  setTimeout(() => {
    (window as any).prerenderReady = true;
  }, 300);
};
/*
onBeforeRouteLeave(() => {
  if ($q.platform.is.mobile) {
    event.value = null;
  }
  mapStore.focusMarker = null;
});
*/
onMounted(() => {
  // called on initial mount
  // and every time it is re-inserted from the cache
  mainStore.sidebarOpacity = 0;

  setupSpring();
  if (scrollArea.value) {
    (scrollArea.value as any).setScrollPercentage('vertical', 0);
  }

  const eventAlreadyLoaded =
    event.value && event.value?.id + '' === props.id + '';

  if ($q.platform.is.mobile) {
    event.value = null;
    setTimeout(() => {
      load();
    }, 300);
  } else if (!eventAlreadyLoaded || true) {
    event.value = null;
    load();
  } else {
    mainStore.menubarOpacity = previousMenubarOpacity.value;
  }

  disableScroll.value = true; // helps animation be smoother on android

  // we need to reset spring state every time we open the event page on mobile

  // if android then do this for performance
  /*
  if ($q.platform.is.mobile) {
    setTimeout(
      () =>
        spring.value.set({
          cursor: 'grabbing',
          y: 0,
        }),
      500
    );
  } else {
    spring.value.set({
      cursor: 'grabbing',
      y: 0,
    });
  }
  */

  // ensure sidebar is transparent on mobile

  setTimeout(() => (disableScroll.value = false), 300);

  if (route.query.location) {
    mapStore.focusMarker = JSON.parse(route.query.location as string);
  }
  // wait for animation before loading
  // to avoid performance issues
});

/*
onDeactivated(() => {
  //  set({ x: 0, y: window.innerHeight, cursor: 'grab' });

  // called when removed from the DOM into the cache
  // and also when unmounted
  // event = null;

  previousMenubarOpacity.value = mainStore.menubarOpacity;
  mainStore.overlayOpacity = 0;
  mapStore.focusMarker = null;
});
*/

const computedUrl = computed(() => {
  if (eventStore.event) {
    return (
      'https://partymap.com/event/' +
      eventStore.event.id +
      '?' +
      route.query.name
    );
  } else {
    return '';
  }
});

const computedName = computed(() => {
  if (eventStore.event?.name) {
    return eventStore.event.name;
  } else if (route.query.name) {
    return (route.query.name as string).replace(/_/g, ' ');
  } else {
    return null;
  }
});

const computedExternalUrl = computed(() => {
  if (eventStore.selectedEventDate?.url) {
    // ensure that there is a protocol prefix
    if (
      eventStore.selectedEventDate.url.indexOf('http://') < 0 &&
      eventStore.selectedEventDate.url.indexOf('https://') < 0
    ) {
      return '//' + eventStore.selectedEventDate.url;
    } else return eventStore.selectedEventDate.url;
  } else {
    return undefined;
  }
});

const computedExternalUrlTitle = computed(() => {
  if (
    computedExternalUrl.value &&
    computedExternalUrl.value?.indexOf('facebook') > -1
  ) {
    return t('event_dates.facebook_page');
  } else {
    return t('event_dates.visit_website');
  }
});

const computedExternalUrlSubtitle = computed(() => {
  if (computedExternalUrl.value) {
    return getDomainFromUrl(computedExternalUrl.value);
  } else {
    return null;
  }
});

const computedTicketName = computed(() => {
  const ticketUrl = selectedEventDate.value?.tickets?.[0]?.url;
  if (ticketUrl) {
    return getDomainFromUrl(ticketUrl);
  } else {
    return null;
  }
});

useMeta(() => {
  return {
    // whenever "title" from above changes, your meta will automatically update
    title:
      computedName?.value +
      ' ' +
      common.year(
        selectedEventDate.value?.start_naive,
        selectedEventDate.value?.tz
      ) +
      t('meta.on_partymap'),
    meta: {
      description: {
        name: 'description',
        content:
          t('meta.more_about') +
          computedName?.value +
          t('meta.in') +
          common.monthYear(
            selectedEventDate.value?.start_naive,
            selectedEventDate.value?.tz
          ) +
          '! ' +
          event.value?.description,
      },
      keywords: {
        name: 'keywords',
        content:
          computedName?.value +
          ', ' +
          selectedEventDate.value?.location.description +
          ', ' +
          t('meta.event_page_tags'),
      },
    },
  };
});
</script>

<style lang="scss">
.q-dialog {
  @media only screen and (max-width: 599px) {
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
    .nav-button {
      background: $bi-3;
    }
    .edit-bar {
      background: $bi-2;
    }

    .scroll-area {
      .content-card {
        .event-buttons {
          background: $bi-2; // z-index: 100;
          //border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .main-content {
        }
        .content {
          :deep(.event-page-header) {
            background: $bi-2;
          }
          .main-content {
            //border: 1px solid #181818 !important;
            background: $bi-2;
          }
          .bottom-section {
            background: $bi-1;
            //  border-top: 1px solid rgba(255, 255, 255, 0.05);
            border-bottom: none;

            .page-views {
              border-radius: 4px;
              .page-view-char {
                border-color: $bi-4 !important;
                background: linear-gradient($bi-1, $bi-4, $bi-1) !important;
                color: ti-2 !important;
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
    // seems to speed up animations a bit on iphone
    -webkit-backface-visibility: hidden;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);

    will-change: tranform;
    .scroll-area {
      .edit-event-dates {
        background: $bi-2;
      }
      .content-card {
        background: $bi-2;

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
          background: white;
          .main-content {
            border-left: 1px solid $b-4 !important;
            border-right: 1px solid $b-4 !important;
            border-bottom: 1px solid $b-4 !important;
            background: white;
            min-height: 50vh;
            .event-buttons {
              //background: #fafafa; // z-index: 100;

              z-index: 1;
              .event-buttons-scroll {
                .button-light {
                  color: t-1 !important;
                  text-shadow: 1px 1px 2px rgba(255, 255, 255, 1);
                  border: 1px solid rgba(0, 0, 0, 0.1);
                  background: rgba(255, 255, 255, 0.9);
                }
              }
            }
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
                  border-color: rgba(255, 255, 255, 0.48) !important;
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
      color: t-2;
    }
  }
}

.event-page {
  //transform: translate3d(0, 0, 0);
  //backface-visibility: hidden;
  &.desktop-sidebar-padding {
    padding-left: 512px;
    .peek-address-wrapper {
      padding-left: 512px;
    }
  }

  .peek-address-wrapper {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    .peek-address {
      pointer-events: all;
      color: white;
      text-align: center;
      margin-top: 72px;
      max-width: 1024px;
    }
  }
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
      pointer-events: all;
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
      // -webkit-overflow-scrolling: touch; // WOW THIS ACTUALLY HELPS ON IOS

      &.disable-scroll {
        :deep(.scroll) {
          overflow: hidden !important;
        }
      }
      .main-row {
        position: relative;
        pointer-events: none;
        .content-card {
          min-height: 2000px;
          margin-top: Max(calc((100vh - 66vh) - 64px), 0px);
          max-width: 1024px;
          //border: none !important;
          min-height: 100vh;
          position: relative;
          pointer-events: all !important;
          padding-bottom: 0px;
          border-top-left-radius: 18px !important;
          border-top-right-radius: 18px !important;
          transition: transform 300ms;

          &.peek-map {
            // 256px represents how high the top of the panel is from the bottom
            transform: translate3d(
              0,
              calc(100vh - max(calc((100vh - 66vh) - 64px), 0px) - 256px),
              0
            );
            cursor: pointer;
            .peek-map-overlay {
              position: absolute;
              width: 100%;
              height: 100%;
              z-index: 12;
              cursor: pointer;
            }
          }
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
              cursor: grab;
              position: relative;
              width: 100%;
              display: flex;
              transition: flex-grow 1s;
              max-height: min-content;
              background: #fafafa;
              border-bottom: 1px solid #1a1a1a;
              .q-inner-loading {
                background: none;
              }

              .header-content {
                min-height: Min(66vh, 440px);

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
                :deep(.q-btn) {
                  border: 1px solid rgba(255, 255, 255, 0.3);
                  background: rgba(255, 255, 255, 0.1) !important;
                  color: white !important;
                  span {
                    text-align: start !important;
                  }
                }
                .event-buttons {
                  // height: 36px;
                  width: 100%;
                  .event-buttons-scroll {
                    height: 36px;
                  }
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
                border: 1px solid rgba(255, 255, 255, 0.48) !important;
                .tag-inner-wrapper {
                  background: transparent;
                  //border-color: rgba(0, 0, 0, 0.8) !important;
                }
              }
            }

            .main-content {
              min-height: 800px;
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
          cursor: grab;
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
  .peek-address {
    max-width: 960px !important;
  }
  .content-card {
    max-width: 960px !important;
  }
  .sticky-editing-footer-inner {
    max-width: 960px;
  }
}
@media only screen and (min-width: 1023px) {
  .peek-address {
    max-width: 1024px !important;
  }
  .content-card {
    max-width: 1024px !important;
  }
  .sticky-editing-footer-inner {
    max-width: 1024px;
  }
}

@media only screen and (max-width: 1024px) {
  .peek-address {
    max-width: 96vw !important;
  }
  .content-card {
    max-width: 96vw !important;

    @supports (
      (top: var(--safe-area-inset-top)) and (font: -apple-system-body) and
        (-webkit-appearance: none)
    ) {
      // stupid border radius fix for ios 15
      -webkit-transform: translateZ(0);
      -webkit-mask-image: -webkit-radial-gradient(
        circle,
        white 100%,
        black 100%
      );
    }
  }
  .sticky-editing-footer-inner {
    max-width: 96vw;
  }
}
@media only screen and (max-width: 599px) {
  .body--light {
    .action-buttons-wrapper {
      background: $b-2 !important;
      box-shadow: rgba(100, 100, 111, 0.25) 0px 7px 29px 0px;
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
      background: $bi-2;
      box-shadow: rgba(100, 100, 111, 0.1) 0px 7px 29px 0px;
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
            min-height: 100vh;
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
              // background: green !important;
            }
          }
        }
      }
    }
  }
}
</style>
