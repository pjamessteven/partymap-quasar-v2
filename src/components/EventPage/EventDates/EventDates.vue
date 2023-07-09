<template>
  <div v-if="!!event" class="flex column grow no-wrap">
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
      class="flex row wrap items-center event-page-header"
      v-if="event.event_dates.length > 1"
    >
      <div class="text-large inter bolder t2 q-pr-md">
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

    <div
      v-if="
        (event && event.event_dates && event.event_dates.length > 1) || editing
      "
    >
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
      class="flex column"
      v-else-if="!!selectedEventDate"
      :key="selectedEventDateIndex + 101"
    >
      <div class="inter bolder t2 text-large q-pr-md event-page-header">
        <span v-if="event.event_dates.length > 1">Date details:</span
        ><span v-else>Event details:</span>
      </div>

      <q-list class="q-mb-lg" style="position: relative">
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
            class="q-py-md"
            :class="{
              'q-pl-md': $q.screen.gt.xs,
              'q-my-sm': editing || showMoreFields,
            }"
          >
          </component>
        </div>
        <!-- SHOW MORE FIELDS -->
        <div
          v-if="
            !!selectedEventDate &&
            !editing &&
            !event.host &&
            (informationMissing || showMoreFields)
          "
          class="flex row items-center no-wrap link-hover ed-inline-card editing-outline q-py-md"
          :class="{ 'q-pl-md': $q.screen.gt.xs }"
          @click="addMissingInformation()"
          style="cursor: pointer"
        >
          <q-icon
            size="2em"
            :name="showMoreFields ? 'las la-minus' : 'las la-plus'"
            class="t4"
          />
          <div
            class="flex column q-ml-md t2"
            :class="{ 'text-large': $q.screen.gt.sm }"
          >
            <u class="t4 q-ml-sm" v-if="!showMoreFields">{{
              $t('event_date_inline.add_missing_information')
            }}</u>
            <u class="t4 q-ml-sm" v-else>{{
              $t('event_date_inline.hide_missing_information')
            }}</u>
          </div>
        </div>
      </q-list>
      <div
        class="inter bolder text-large t2 q-pr-md q-mt-md event-page-header"
        v-if="selectedEventDate?.artists?.length > 0"
      >
        {{ $t('event_dates.lineup') }}
      </div>
      <ArtistsComponent
        :editing="editing"
        class="q-mb-lg"
        v-if="selectedEventDate?.artists?.length > 0"
      />
    </div>
  </div>
</template>

<script>
import common from 'assets/common';

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
  },
  props: {},
  data() {
    return {
      loading: false,
      showMoreFields: false,
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
      'editing',
      'currentUserIsHost',
    ]),
    ...mapState(useAuthStore, ['currentUser', 'currentUserIsStaff']),
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
          active:
            eventDate.ticket_url != null && eventDate.ticket_url.length > 0,
          visible:
            (eventDate.ticket_url != null && eventDate.ticket_url.length > 0) ||
            (this.eventHasHost && this.showMoreFields) ||
            this.editing,
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
@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
