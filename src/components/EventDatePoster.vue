<template>
  <transition appear enter-active-class="animated fadeIn">
    <div class="ed-poster" @mouseenter="mouseEnter" @mouseleave="mouseLeave">
      <router-link
        style="text-decoration: none; color: inherit"
        :to="{
          name: 'EventPage',
          params: {
            id: event.event_id,
            eventDateId: event.id,
          },
          query: {
            name: event.name.replace(/ /g, '_'),
            thumbXsUrl: imgThumbXsUrl,
            location: JSON.stringify({
              lat: event.location.lat,
              lng: event.location.lng,
            }),
          },
        }"
      >
        <div class="ed-poster-bg" :style="getBottomBgImgStyle()" />

        <div class="ed-poster-content flex column no-wrap">
          <div
            class="image-container flex justify-center items-center shadow-2xl"
          >
            <img
              style="filter: blur(2px); transform: scale(1.2)"
              :src="imgThumbXsUrl"
              class="not-loaded"
              v-show="!loadedImage"
            />
            <transition enter-active-class="animated fadeIn">
              <img
                :src="imgThumbUrl"
                @load="() => (loadedImage = true)"
                v-show="loadedImage"
              />
            </transition>
          </div>
          <div class="card-bottom-content">
            <div class="flex column ellipsis q-pa-sm" v-if="hideInfo">
              <div
                class="ed-poster-header flex row justify-between items-start no-wrap ellipsis"
              >
                <div
                  class="flex row items-baseline no-wrap inter bolder q-mr-sm ellipsis"
                >
                  <span class="ellipsis">{{ event.name }}</span>
                  <q-icon
                    class="q-ml-xs o-080"
                    name="mdi-check-decagram"
                    v-if="event.event.host"
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
                </div>
              </div>
              <div class="flex items-center no-wrap">
                <q-icon name="las la-clock" class="q-mr-xs" />
                <q-badge
                  v-if="event.cancelled"
                  class="q-my-xs"
                  color="red"
                  :label="$t('event_date_inline.cancelled')"
                />
                <span v-else-if="event.date_confirmed">{{
                  relativeHumanTime(
                    event.start_naive,
                    event.end_naive,
                    event.tz
                  )
                }}</span>
                <span v-else>Date TBC</span>
              </div>
            </div>

            <div class="flex column ellipsis q-pa-md" v-if="!hideInfo">
              <div
                class="ed-poster-header flex row justify-between items-start no-wrap ellipsis"
              >
                <div
                  class="flex row items-baseline no-wrap inter bolder q-mr-sm ellipsis"
                >
                  <span class="ellipsis">{{ event.name }}</span>
                  <q-icon
                    class="q-ml-sm o-080"
                    name="mdi-check-decagram"
                    v-if="event.event.host"
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
                </div>
              </div>

              <div
                class="flex column card-bottom-text q-mt-xs o-080"
                style="font-weight: 400"
              >
                <span>
                  <q-icon name="las la-clock" class="q-mr-sm" />
                  <q-badge
                    v-if="event.cancelled"
                    class="q-my-xs"
                    color="red"
                    :label="$t('event_date_inline.cancelled')"
                  />
                  <span v-else-if="event.date_confirmed">{{
                    relativeHumanTime(
                      event.start_naive,
                      event.end_naive,
                      event.tz
                    )
                  }}</span>

                  <span v-else>Date TBC</span>
                </span>
                <div class="flex row items-center no-wrap ellipsis">
                  <q-icon name="las la-calendar" class="q-mr-sm" />
                  <div class="flex row no-wrap ellipsis">
                    <span v-if="event.date_confirmed">
                      {{ localDateWithWeekday(event.start_naive, event.tz) }}
                    </span>
                    <span v-else>
                      {{ monthYear(event.start_naive, event.tz) }}
                    </span>
                    <span
                      v-if="
                        event.event.rrule &&
                        event.event.rrule.separation_count > 0
                      "
                      class="flex row items-center q-ml-xs o-070 no-wrap ellipsis"
                    >
                      <q-icon class="q-ml-xs q-mr-sm" name="las la-redo-alt" />
                    </span>
                  </div>
                </div>
                <div class="ellipsis">
                  <span v-if="event.location && event.location.locality">
                    <q-icon name="las la-map-marker" class="q-mr-sm" />{{
                      event.location.locality.long_name
                    }},
                    {{ event.location.locality.region.long_name }}
                  </span>
                  <span v-else>
                    <q-icon name="las la-map-marker" class="q-mr-sm" />{{
                      event.location.name
                    }}
                  </span>
                  <span v-if="event.distance != null" class="o-070 ellipsis"
                    >&nbsp;({{
                      Intl.NumberFormat().format(
                        parseInt(Number(event.distance) / 1000)
                      )
                    }}km)</span
                  >
                </div>
                <div
                  class="tag-container flex row q-mt-sm no-wrap ellipsis"
                  v-if="event?.event?.event_tags?.length > 0 && $q.screen.gt.xs"
                >
                  <Tag
                    class="q-mr-xs"
                    v-for="(et, index) in event.event.event_tags"
                    :key="index"
                    :value="et.tag"
                  ></Tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </transition>
</template>

<script>
import common, { localDayOfMonth } from 'assets/common';
import Tag from 'src/components/TagComponent.vue';
import { mapWritableState } from 'pinia';
import { useMapStore } from 'src/stores/map';

export default {
  components: { Tag },
  props: {
    event: Object,
    shortDate: {
      default: false,
      type: Boolean,
    },
    hideInfo: Boolean,
  },
  data() {
    return {
      loadedImage: false,
    };
  },
  methods: {
    mouseEnter() {
      if (this.$q.screen.gt.xs)
        this.eventDateHoverMarker = {
          lat: this.event.location.lat,
          lng: this.event.location.lng,
          name: this.event.name,
        };
    },
    mouseLeave() {
      this.eventDateHoverMarker = null;
    },

    getImageContainerBgStyle() {
      if (this.$q.dark.isActive) {
        return `background-image:  url("${this.imgThumbXsUrl}");
        background-size: cover;
        display: inline-block;
        background-position: center;
        filter: blur(20px);

        `;
      } else {
        return `background-image:  url("${this.imgThumbXsUrl}");
          background-size: cover;
          display: inline-block;
          background-position: center;
          filter: blur(20px);

          `;
      }
    },
    getBottomBgImgStyle() {
      if (this.$q.dark.isActive) {
        return ` background: linear-gradient(
          0deg,
          rgba(18, 18, 18, 0.7) 66%,
          rgba(48, 48, 48, 0.3) 100%
        ), url("${this.imgThumbXsUrl}");
        background-size: cover;
        display: inline-block;
        background-position: center;
        //filter: blur(1px);

        `;
      } else {
        return `background: linear-gradient(rgba(0, 0, 0, 0.28), rgba(0, 0, 0, 0)),  url("${this.imgThumbXsUrl}");
          background-size: cover;
          display: inline-block;
          background-position: center;
          //filter: blur(1px);

          `;
      }
    },
    getBgImgStyle() {
      var imageUrl = '';
      if (
        this.event &&
        this.event.event.cover_items &&
        this.event.event.cover_items[0]
      ) {
        imageUrl = this.event.event.cover_items[0].thumb_url;
      }
      if (this.$q.dark.isActive) {
        return `background-image: linear-gradient(0deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.2) 100%), url("${imageUrl}");
        background-size: cover;
        display: inline-block;
        background-position: center;
        //filter: blur(1px);

        `;
      } else {
        return `background-image: linear-gradient(0deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.2) 100%), url("${imageUrl}");
        background-size: cover;
        display: inline-block;
        background-position: center;
        //filter: blur(1px);
        `;
      }
    },
  },
  computed: {
    ...mapWritableState(useMapStore, ['eventDateHoverMarker', 'focusMarker']),
    imgThumbUrl() {
      return this.event?.event?.cover_items?.[0]?.image_med_url;
    },
    imgThumbXsUrl() {
      return this.event?.event?.cover_items?.[0]?.thumb_xxs_url;
    },
  },
  created() {
    // import common methods
    this.relativeHumanTime = common.relativeHumanTime;
    this.localDateWithWeekday = common.localDateWithWeekday;
    this.timeZoneAbbreviention = common.timeZoneAbbreviention;
    this.monthYear = common.monthYear;
    this.simplifiedRecurringPattern = common.simplifiedRecurringPattern;
    this.localDayOfMonth = localDayOfMonth;
    this.localDay = common.localDay;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .ed-poster {
    .ed-poster-content {
      .image-container {
        border-top: 1px solid rgba(48, 48, 48);
      }
    }

    .event-info {
      color: $ti-2;
    }
  }

  .tag-container {
    .tag {
      color: $ti-2 !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
  }
}

.body--light {
  .ed-poster {
    box-shadow: rgba(0, 0, 0, 0.12) 0px 3px 8px;
    font-smooth: always;

    .ed-poster-bg {
      opacity: 0.68;
    }

    .ed-poster-content {
      color: white !important;
      z-index: 1;
      .card-bottom-content {
        background: linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.3) 0%,
          rgba(0, 0, 0, 0.64) 80%
        );
      }
    }
  }
}

.ed-poster {
  border: none !important;
  border-radius: 9px;
  direction: ltr;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  overflow: hidden;
  position: relative;

  @supports (font: -apple-system-body) and (-webkit-appearance: none) {
    -webkit-backface-visibility: hidden;
    -webkit-transform: translate3d(0, 0, 0);
    // translate3d is a hack for safari to force gpu rendering of blur()
  }

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  &:hover {
    // transform: scale(1.01) translateY(0px);
    &:before {
      opacity: 1;
    }
  }

  .ed-poster-bg {
    z-index: 1;
    filter: blur(12px);
    transform: rotate(180deg) scaleX(-1) scale(1.6);
    position: absolute;
    height: 100%;
    width: 100%;
    /* Safari 10.1+ */
    @supports (font: -apple-system-body) and (-webkit-appearance: none) {
      transform: rotate(180deg) scaleX(-1) scale(1.6) translate3d(0, 0, 0);
      // translate3d is a hack for safari to force gpu rendering of blur()
    }
  }

  .ed-poster-content {
    z-index: 1;
    position: relative;
    width: 100%;
    pointer-events: all;
    @supports (font: -apple-system-body) and (-webkit-appearance: none) {
      -webkit-backface-visibility: hidden;
      -webkit-transform: translate3d(0, 0, 0);
      // translate3d is a hack for safari to force gpu rendering of blur()
    }
    .card-bottom-content {
      .tag-container {
        :deep(.tag) {
          background: transparent !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
      }
    }

    .ed-poster-header {
      max-width: 100%;
      opacity: 1;
      z-index: 2;
    }
    .card-bottom-text {
      position: relative;
      z-index: 2;
      font-size: small;
    }
    .image-container {
      aspect-ratio: 595 / 842;
      width: 100%;
      position: relative;
      overflow: hidden;
      box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px,
        rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px,
        rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
      .image-container-bg {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 1;
        transform: scale(1.2);
      }
      img {
        height: 100%;
        width: 100%;
        max-height: 100%;
        max-width: 100%;
        object-fit: cover;
        z-index: 2;
        pointer-events: none;
      }
    }
  }

  .event-info {
    z-index: 1;
  }
}

.body--light {
  .animated-shimmer {
    box-shadow: none;
    background: linear-gradient(
      315deg,
      transparent,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    background-size: 400% 400%;
    border-color: rgba(255, 255, 255, 0.1);
    -webkit-animation: shimmer 2s ease-in-out infinite;
    -moz-animation: shimmer 2s ease-in-out infinite;
    animation: shimmer 2s ease-in-out infinite;
    .card-content {
      opacity: 0;
    }
  }
}
.body--dark {
  .animated-shimmer {
    background: linear-gradient(315deg, $bi-1, transparent 50%, $bi-1 100%);
    background-size: 400% 400%;

    -webkit-animation: shimmer 1.5s ease infinite;
    -moz-animation: shimmer 1.5s ease infinite;
    animation: shimmer 1.5s ease infinite;
    .card-content {
      opacity: 0;
    }
  }
}

@-webkit-keyframes shimmer {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 51%;
  }
  100% {
    background-position: 0% 50%;
  }
}
@-moz-keyframes shimmer {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 51%;
  }
  100% {
    background-position: 0% 50%;
  }
}
@keyframes shimmer {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 51%;
  }
  100% {
    background-position: 0% 50%;
  }
}

// sm
@media only screen and (max-width: 599px) {
  .card {
    &:active {
      transform: none;
    }
  }
}
</style>
