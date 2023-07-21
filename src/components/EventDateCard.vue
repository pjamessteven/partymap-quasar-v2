<template>
  <div>
    <router-link
      v-touch-swipe.mouse.up.prevent
      v-slot="{ navigate }"
      :custom="true"
      :to="{
        name: 'EventPage',
        params: {
          id: event.event_id,
          eventDateId: event.id,
        },
        query: {
          name: event.name.replace(/ /g, '_'),
        },
      }"
    >
      <transition appear enter-active-class="animated fadeIn">
        <div
          class="ed-card"
          @mousedown="() => onClickCard($event, navigate)"
          :class="{
            'animated-shimmer': false,
          }"
        >
          <div class="ed-card-content flex row no-wrap q-pa-md">
            <div
              class="card-bottom-background"
              :style="getBottomBgImgStyle()"
            />
            <div
              class="image-container flex justify-center items-center shadow-2xl"
            >
              <img
                :src="imgThumbXsUrl"
                class="image not-loaded"
                v-show="!loadedImage"
              />
              <img
                :src="imgThumbUrl"
                class="image"
                @load="() => (loadedImage = true)"
                v-show="loadedImage"
              />
            </div>
            <div class="flex column ellipsis q-pl-md">
              <div
                class="ed-card-header flex row justify-between items-start no-wrap ellipsis"
              >
                <div
                  class="flex row items-baseline no-wrap inter bold q-mr-sm ellipsis"
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
                class="flex column grow justify-between card-bottom-text q-mt-xs o-070"
                style="font-weight: 400"
              >
                <!--

          <div class="flex row items-center ">
            <q-badge
              class="q-my-xs"
              color="red"
              :label="$t('event_date_inline.cancelled')"
              v-if="event.cancelled"
            />
            <span v-if="!event.cancelled">
              <q-icon name="las la-clock" class="q-mr-sm" />{{
                relativeHumanTime(event.start_naive, event.end_naive, event.tz)
              }}
            </span>
          </div>
-->
                <div class="flex column">
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
                        <q-icon
                          class="q-ml-xs q-mr-sm"
                          name="las la-redo-alt"
                        />
                        {{ simplifiedRecurringPattern(event.event.rrule) }}
                      </span>
                    </div>
                  </div>
                  <div class="">
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
                    <span v-if="event.distance != null" class="o-050 ellipsis"
                      >&nbsp;({{
                        Intl.NumberFormat().format(
                          parseInt(Number(event.distance) / 1000)
                        )
                      }}km)</span
                    >
                  </div>
                </div>
              </div>
              <div
                class="tag-container flex row q-mt-sm no-wrap ellipsis"
                style="min-height: 31px"
                v-if="
                  event.event.event_tags && event.event.event_tags.length > 0
                "
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
      </transition>
    </router-link>
  </div>
</template>

<script>
import common, { localDayOfMonth } from 'assets/common';
import Tag from 'src/components/TagComponent.vue';
import { mapWritableState } from 'pinia';
import { useMapStore } from 'src/stores/map';

export default {
  components: {
    Tag,
  },
  props: {
    event: Object,
    shortDate: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      loadedImage: false,
    };
  },
  methods: {
    setFocusMarker() {
      if (this.$q.screen.gt.xs)
        this.eventDateHoverMarker = {
          lat: this.event.location.lat,
          lng: this.event.location.lng,
          name: this.event.name,
        };
    },
    getBottomBgImgStyle() {
      if (this.$q.dark.isActive) {
        return `background-image:  url("${this.imgThumbXsUrl}");
        background-size: cover;
        display: inline-block;
        background-position: center;
        //filter: blur(1px);

        `;
      } else {
        return `background-image:  url("${this.imgThumbXsUrl}");
          background-size: cover;
          display: inline-block;
          background-position: center;
          //filter: blur(1px);

          `;
      }
    },

    onClickCard(event, navigate) {
      // blocking map updates on focusMarker watcher in MainMap.vue
      this.focusMarker = {
        lat: this.event.location.lat,
        lng: this.event.location.lng,
      };

      navigate(event);
    },
  },
  computed: {
    ...mapWritableState(useMapStore, ['eventDateHoverMarker', 'focusMarker']),
    imgThumbUrl() {
      return this.event?.event?.cover_items?.[0]?.thumb_url;
    },
    imgThumbXsUrl() {
      return this.event?.event?.cover_items?.[0]?.thumb_xxs_url;
    },
  },
  created() {
    // import common methods
    this.relativeHumanTime = common.relativeHumanTime;
    this.localDateWithWeekday = common.localDateWithWeekday;
    this.monthYear = common.monthYear;
    this.timeZoneAbbreviention = common.timeZoneAbbreviention;
    this.simplifiedRecurringPattern = common.simplifiedRecurringPattern;
    this.localDayOfMonth = localDayOfMonth;
    this.localDay = common.localDay;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .ed-card {
    outline: 1px solid (rgba(255, 255, 255, 0.1));

    .ed-card-content {
      background: linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9));
      .card-bottom-background {
        background: $bi-3;
        opacity: 0.4;
      }
    }
    .card-background {
      background: $bi-4;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }
    &:first-child {
      margin-top: 0px;
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
  .ed-card {
    color: white;

    box-shadow: rgba(0, 0, 0, 0.12) 0px 3px 8px;
    font-smooth: always;

    .card-background {
      //background: #181818;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }
    .ed-card-content {
      border-top: 1px solid (rgba(255, 255, 255, 0.2));
      background: black;

      color: white !important;

      .card-bottom-background {
        opacity: 0.68;
        z-index: 0;
        background: white;
        transition: opacity 0.2s ease;
      }
    }
    &:first-child {
      margin-top: 0px;
    }

    .event-info {
    }
  }
}

.ed-card {
  border-radius: 9px;
  direction: ltr;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-transform: translate3d(0, 0, 0);
  background: white;

  &:hover {
    //transform: scale(1.01) translateY(0px);
    .ed-card-content {
      opacity: 0.9;
    }
  }

  &:active {
    //  transform: scale(0.98);
  }
  position: relative;

  .ed-card-content {
    position: relative;
    transition: opacity 0.3s ease;
    //color: white;
    //background: black;

    .card-bottom-background {
      border-radius: 9px;
      overflow: hidden;
      //border: 1px solid #181818;
      z-index: 0;
      filter: blur(12px);
      transform: rotate(180deg) scaleX(-1) scale(2);
      //mask-image: linear-gradient(to top, transparent 0%, white 64px);
      position: absolute;
      height: 100%;
      width: 100%;
      //opacity: 0.4;
      transition: opacity 0.2s ease;
    }

    .tag-container {
      :deep(.tag) {
        background: transparent !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
    }

    .ed-card-header {
      //font-size: 1rem;
      max-width: 100%;
      opacity: 1;
      //color: white !important;
      z-index: 2;
    }
    .card-bottom-text {
      position: relative;
      z-index: 2;
      //color: white !important;
      font-size: small;
    }
    .image-container {
      //max-width: 400px;
      // max-height: 400px;
      // min-width: 400px;
      width: 100%;
      position: relative;
      overflow: hidden;
      //border-radius: 100%;
      width: 86px;
      aspect-ratio: 595 / 842;
      min-width: 90px;
      border-radius: 9px;
      .image {
        height: 100%;
        width: 100%;
        max-height: 100%;
        max-width: 100%;
        object-fit: cover;
        z-index: 2;
      }
    }
  }

  .event-info {
    z-index: 1;
    .tag-container {
      display: flex;
      flex-direction: row;
      width: 100%;
      overflow: hidden;
    }
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
@media only screen and (max-width: 600px) {
  .ed-card {
    &:active,
    &:hover {
      transform: none;
    }
  }
}
</style>
