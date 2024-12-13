<template>
  <div v-if="!!event" class="event-dates flex column grow no-wrap">
    <!--
          <div class="flex row q-mb-lg q-gutter-sm q-pr-xl o-080">
            <q-btn
              icon="mdi-star-plus-outline"
              label="Interested"
              class="flex grow"
            />
            <q-btn
              icon="mdi-star-plus-outline"
              label="Going"
              class="flex grow"
            />
            <q-btn icon="mdi-share" label="share" />

            <q-btn icon="las la-cloud-download-alt" />
          </div>
          -->

    <div
      class="inter bolder t1 text-large q-pr-md event-page-header"
      v-if="computedImages?.length > 0"
    >
      <span v-if="selectedDateImages?.length > 0"
        >{{ $t('event_dates.photos_from_this_date') }}:</span
      >
      <span v-else>{{ $t('event_dates.all_photos') }}:</span>
    </div>

    <CustomQScroll
      class="q-mb-sm q-mt-sm"
      v-if="computedImages?.length > 0"
      horizontal
      ref="scrollArea"
      style="height: 134px"
      :bar-style="{
        height: '2px',
      }"
      :thumb-style="{
        bottom: '0px',
        height: '4px',
      }"
    >
      <div class="flex row no-wrap" style="height: 128px; overflow: none">
        <GalleryDialog
          v-if="computedImages.length > 0"
          :open="computedImagesGalleryIndex != null"
          :items="computedImages"
          :showThumbnails="true"
          :currentItemIndex="computedImagesGalleryIndex"
          @onClose="computedImagesGalleryIndex = null"
        />
        <div
          v-for="(media_item, index) of computedImages"
          :key="index"
          style="height: 100%; position: relative"
          :class="index > 0 ? 'q-ml-sm' : ''"
        >
          <img
            @click="computedImagesGalleryIndex = index"
            style="cursor: pointer; height: 100%"
            :src="media_item.thumb_url"
          />
        </div>
      </div>
    </CustomQScroll>

    <div
      class="flex row wrap items-center event-page-header"
      :class="{ 'q-mt-md': $q.screen.gt.sm, 'q-px-md': $q.screen.lt.sm }"
      v-if="event.event_dates.length > 1"
    >
      <div class="metropolis bolder text-h6 t1 q-pr-md">
        <span v-if="event.next_date">
          {{ $t('event_dates.upcoming_dates') }}</span
        >
        <span v-else> {{ $t('event_dates.past_dates') }}</span>
      </div>

      <span class="t3" v-if="rruleStatus && $q.screen.gt.xs">
        <q-icon left size="1.2em" name="las la-redo-alt" />
        <span>{{ simplifiedRecurringPattern(event.rrule) }}</span>
      </span>
    </div>

    <div v-if="(event && event.event_dates) || editing">
      <EventDateSelectionComponent :editing="editing" />
    </div>
    <div
      v-if="loadingEventDate && false"
      style="position: relative; height: 200px; width: 100%"
    >
      <q-inner-loading :showing="true" style="z-index: 10">
        <q-spinner-ios
          :color="$q.dark.isActive ? 'white' : 'black'"
          size="2em"
        />
      </q-inner-loading>
    </div>
    <div
      class="flex column selected-event-date"
      v-else-if="!!selectedEventDate"
      :key="selectedEventDateIndex + 101"
      :class="{ 'q-px-md': $q.screen.lt.sm }"
    >
      <div class="metropolis bolder t1 text-h6 q-pr-md event-page-header">
        <span v-if="event.event_dates.length > 1"
          >{{ $t('event_dates.details') }}:</span
        ><span v-else>{{ $t('event_dates.event_details') }}:</span>
      </div>

      <q-list class="q-mb-md event-date-components" style="position: relative">
        <div
          v-for="(component, index) in visibleComponents"
          :key="component.type"
          class="flex column"
          :class="editing || showMoreFields ? 'q-gutter-sm' : ''"
        >
          <q-separator v-if="index > 0 && !editing && !showMoreFields" />

          <component
            :is="component.type"
            v-bind="component.propsData"
            :class="{
              'q-my-sm': editing || showMoreFields,
            }"
          >
          </component>
          <q-separator
            v-if="
              index === visibleComponents.length - 1 &&
              !editing &&
              !showMoreFields
            "
          />
        </div>
        <!-- SHOW MORE FIELDS -->
        <div
          v-if="
            !!selectedEventDate &&
            !editing &&
            (!event.host || currentUserIsHost) &&
            (informationMissing || showMoreFields)
          "
          class="flex row items-center no-wrap link-hover ed-inline-card editing-outline q-py-md"
          @click="editing = true"
          style="cursor: pointer"
        >
          <q-icon
            size="2em"
            :name="currentUserIsHost ? 'las la-edit' : 'las la-hand-peace'"
            class="t4"
          />
          <div
            class="flex column q-ml-md t2"
            :class="{ 'text-large': $q.screen.gt.sm }"
          >
            <u class="t4" v-if="!showMoreFields">{{
              currentUserIsHost
                ? $t('event_dates.add_missing_information')
                : $t('suggestions.improve_this_page')
            }}</u>
            <u class="t4 q-ml-sm" v-else>{{
              $t('event_dates.hide_missing_information')
            }}</u>
          </div>
        </div>
      </q-list>
    </div>
  </div>
</template>

<script>
import common from 'assets/common';
import GalleryDialog from './../Gallery/GalleryDialog.vue';

import ArtistsComponent from 'components/EventPage/EventDates/Artists/ArtistsComponent.vue';
import EventDateAddArtistsComponent from 'components/EventPage/EventDates/EventDateAddArtistsComponent.vue';
import EventDateCancelledComponent from 'components/EventPage/EventDates/EventDateCancelledComponent.vue';
import EventDateDescriptionComponent from 'components/EventPage/EventDates/EventDateDescriptionComponent.vue';
import EventDateLocationComponent from 'components/EventPage/EventDates/EventDateLocationComponent.vue';
import EventDateSelectionComponent from 'components/EventPage/EventDates/EventDateSelectionComponent.vue';
import EventDateSizeComponent from 'components/EventPage/EventDates/EventDateSizeComponent.vue';
import EventDateTimeComponent from 'components/EventPage/EventDates/EventDateTimeComponent.vue';
import EventDateUrlComponent from 'components/EventPage/EventDates/EventDateUrlComponent.vue';
import EventDateTicketUrlComponent from 'components/EventPage/EventDates/EventDateTicketUrlComponent.vue';
import CustomQScroll from 'components/CustomQScroll.vue';

import { mapActions, mapState, mapWritableState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    EventDateAddArtistsComponent,
    EventDateSelectionComponent,
    EventDateTimeComponent,
    EventDateDescriptionComponent,
    EventDateUrlComponent,
    EventDateTicketUrlComponent,
    EventDateCancelledComponent,
    EventDateLocationComponent,
    EventDateSizeComponent,
    ArtistsComponent,
    CustomQScroll,
    GalleryDialog,
  },
  data() {
    return {
      loading: false,
      showMoreFields: false,
      lineupGalleryIndex: null,
      computedImagesGalleryIndex: null,
    };
  },
  methods: {
    ...mapActions(useEventStore, ['loadEvent', 'toggleFavorite']),
    addMissingInformation() {
      this.showMoreFields = !this.showMoreFields;
    },
  },
  watch: {
    selectedEventDate: {
      // reload event when date status changes
      handler(newv, oldv) {
        if (
          oldv &&
          newv.id === oldv.id &&
          newv.date_confirmed !== oldv.date_confirmed
        ) {
          this.loadEvent(this.event.id);
        }
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useEventStore, [
      'event',
      'loadingEventDate',
      'selectedEventDateIndex',
      'selectedEventDate',
      'currentUserIsHost',
    ]),
    ...mapWritableState(useEventStore, ['editing']),
    ...mapState(useAuthStore, ['currentUser', 'currentUserIsStaff']),
    lineupImages() {
      return this.selectedEventDate?.media_items?.filter(
        (x) => x.attributes?.isLineupImage
      );
    },
    computedImages() {
      if (this.selectedDateImages?.length > 0) {
        return this.selectedDateImages;
      } else {
        return this.allEventImages;
      }
    },
    selectedDateImages() {
      return this.selectedEventDate?.media_items?.filter(
        (x) => !x.attributes?.isLineupImage
      );
    },
    allEventImages() {
      return this.event?.media_items
        ?.filter((x) => !x.attributes?.isLineupImage)
        ?.slice(1);
    },
    rruleStatus() {
      if (this.event?.rrule?.separation_count > 0) {
        return true;
      } else {
        return false;
      }
    },
    informationMissing() {
      if (this.visibleComponents && this.computedComponents) {
        return this.visibleComponents.length < this.computedComponents.length;
      } else {
        return true;
      }
    },
    visibleComponents() {
      if (this.computedComponents) {
        return this.computedComponents.filter((x) => x.visible);
      } else {
        return [];
      }
    },
    computedComponents() {
      var eventDate = this.selectedEventDate;
      if (!eventDate) return [];
      var components = [
        {
          type: 'EventDateTimeComponent',
          propsData: {
            editing: this.editing,
            expandable: this.$q.screen.lt.md,
            inline: true,
            showMoreFields: this.showMoreFields,
          },
          active: true,
          visible: true, // date is always shown
        },
        {
          type: 'EventDateCancelledComponent',
          propsData: {
            editing: this.editing,
            showMoreFields: this.showMoreFields,
          },
          active: this.editing || eventDate.cancelled, // only active if host is editing
          visible:
            eventDate.cancelled ||
            (!this.eventHasHost && this.showMoreFields) ||
            this.editing,
        },
        {
          type: 'EventDateLocationComponent',
          propsData: {
            editing: this.editing,
            expandable: this.$q.screen.lt.md,
            inline: true,
            showMoreFields: this.showMoreFields,
          },
          active: true,
          visible: true, // location always shown
        },

        {
          type: 'EventDateSizeComponent',
          propsData: {
            editing: this.editing,
            showMoreFields: this.showMoreFields,
          },
          active: eventDate.size != null && eventDate.size > 0,
          visible:
            eventDate.size != null ||
            (!this.eventHasHost && this.showMoreFields) ||
            this.editing,
        },
        {
          type: 'EventDateUrlComponent',
          propsData: {
            editing: this.editing,
            showMoreFields: this.showMoreFields,
          },
          active: eventDate.url != null && eventDate.url.length > 0,
          visible:
            (eventDate.url != null && eventDate.url.length > 0) ||
            (!this.eventHasHost && this.showMoreFields) ||
            this.editing,
        },
        {
          type: 'EventDateTicketUrlComponent',
          propsData: {
            editing: this.editing,
            showMoreFields: this.showMoreFields,
          },
          active: eventDate.tickets != null && eventDate.tickets.length > 0,
          visible:
            (eventDate.tickets != null && eventDate.tickets.length > 0) ||
            (this.eventHasHost && this.showMoreFields) ||
            (this.editing && this.currentUser?.role > 20),
        },
        {
          type: 'EventDateDescriptionComponent',
          propsData: {
            editing: this.editing,
            showMoreFields: this.showMoreFields,
          },
          active:
            eventDate.description != null && eventDate.description.length > 0,
          visible:
            (eventDate.description != null &&
              eventDate.description.length > 0) ||
            (!this.eventHasHost && this.showMoreFields) ||
            this.editing,
        },
        {
          type: 'EventDateAddArtistsComponent',
          propsData: {
            editing: this.editing,
            showMoreFields: this.showMoreFields,
          },
          active: false,
          visible:
            ((eventDate.artists == null ||
              (eventDate.artists && eventDate.artists.length === 0)) &&
              !this.eventHasHost &&
              this.showMoreFields) ||
            this.editing ||
            this.showMoreFields,
        },
      ];

      return components.sort((a, b) => {
        // sort components list so non-active components come last
        if (!a.active && b.active) {
          return 1;
        }
        if (!b.active && a.active) {
          return -1;
        }
        return 0;
      });
    },
    eventHasHost() {
      return this.event?.host?.username;
    },
  },
  created() {
    this.simplifiedRecurringPattern = common.simplifiedRecurringPattern;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .q-separator--dark {
    background: none;
    border-top: 1px solid rgb(42, 42, 42) !important;
  }
}
.body--light {
}
.contribution {
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
}
.interested-buttons {
  .q-btn {
    border-radius: 9px !important;
    opacity: 0.68;
  }
}
.event-dates {
  .selected-event-date {
    .event-date-components {
      :deep(.ed-inline-card) {
        padding-top: 16px;
        padding-bottom: 16px;
      }
    }
  }
}
@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
