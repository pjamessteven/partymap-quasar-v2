<template>
  <q-card class="suggestions-dialog dialog-card">
    <q-card-section class="row items-start no-wrap dialog-card-header">
      <div class="flex column">
        <div class="text-h6">{{ $t('suggestions.improve_this_page') }}</div>
        <div class="t2 q-mt-sm" style="font-weight: normal">
          {{ $t('suggestions.improve_this_page_msg') }}
        </div>
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    <q-card-section class="q-px-none q-pt-sm q-pb-sm dialog-card-content">
      <q-list>
        <div
          class="flex column grow"
          v-for="(item, index) in items"
          :key="index"
        >
          <q-item clickable v-ripple @click="editMode = item.mode">
            <q-item-section>
              <q-item-label>
                {{ item.name }}
              </q-item-label>
              <q-item-label caption class="t3">
                {{ item.description }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-list>

      <div class="q-px-md">
        <div class="separator q-mt-sm" />
      </div>

      <q-list
        v-if="
          event != null &&
          event.event_dates != null &&
          event.event_dates.length > 0
        "
        class="q-mt-sm"
      >
        <q-item-label header>Update the selected date </q-item-label>

        <q-expansion-item :content-inset-level="1">
          <template v-slot:header>
            <div class="flex row grow items-center no-wrap">
              <q-icon name="las la-calendar" size="1.5em" left />
              <div class="flex column">
                <div>
                  {{
                    localDateTimeShort(
                      selectedEventDate.start_naive,
                      selectedEventDate.tz
                    )
                  }}
                </div>
                <div class="">
                  <span class="t4">
                    {{ selectedEventDate?.location?.description }}
                  </span>
                </div>
              </div>
            </div>
          </template>
          <q-item
            clickable
            v-ripple
            v-for="(item, index) in eventDateFields"
            @click="dateEditMode = item.mode"
            :key="index"
          >
            <q-item-section>
              <q-item-label>
                {{ item.name }}
              </q-item-label>
              <q-item-label caption class="t3">
                {{ item.description }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-card-section>
    <q-dialog
      :model-value="editMode === 'name'"
      @hide="editMode = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditNameDialog @closeDialog="closeDialog()" />
    </q-dialog>

    <q-dialog
      :model-value="editMode === 'main_description'"
      @hide="editMode = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditSummaryDialog @closeDialog="closeDialog()" />
    </q-dialog>

    <q-dialog
      :model-value="editMode === 'tags'"
      @hide="editMode = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <SelectTagsDialog @closeDialog="closeDialog()" />
    </q-dialog>

    <q-dialog
      :model-value="editMode === 'addEventDate'"
      @hide="editMode = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <AddEventDateDialog
        @closeDialog="closeDialog()"
        :suggestionMessageAndToken="messageAndToken"
      />
    </q-dialog>

    <q-dialog
      :model-value="editMode === 'rrule'"
      @hide="editMode = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditRruleDialog @closeDialog="closeDialog()" />
    </q-dialog>

    <q-dialog
      :model-value="editMode === 'remove_rrule'"
      @hide="editMode = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <RemoveRruleDialog @closeDialog="closeDialog()" />
    </q-dialog>

    <q-dialog
      :model-value="dateEditMode != null"
      @hide="editmode = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditEventDateDialog
        @closeDialog="dateEditMode = null"
        :ed="selectedEventDate"
        :mode="dateEditMode"
        :key="dateEditMode"
      />
    </q-dialog>
    <q-dialog
      :model-value="editMode === 'media'"
      @hide="editmode = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <UploadNewLogoDialog @closeDialog="closeDialog()" />
    </q-dialog>
    <q-dialog
      :model-value="editMode === 'artists'"
      @hide="editmode = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <SelectArtistsDialog
        @closeDialog="closeDialog()"
        :eventName="event.name"
        :eventCountry="computedEventDateCountry"
        :eventYear="computedEventDateYear"
      />
    </q-dialog>
  </q-card>
</template>

<script>
import common from 'assets/common';

import AddEventDateDialog from 'components/EventPage/EventDates/AddEventDateDialog.vue';
import EditSummaryDialog from 'components/EventPage/EditSummaryDialog.vue';
import EditEventDateDialog from 'components/EventPage/EventDates/EditEventDateDialog.vue';
import EditNameDialog from 'components/EventPage/EditNameDialog.vue';
import EditRruleDialog from 'components/EventPage/EventDates/EditRruleDialog.vue';
import RemoveRruleDialog from 'components/EventPage/EventDates/RemoveRruleDialog.vue';
import SelectArtistsDialog from 'components/EventPage/EventDates/Artists/SelectArtistsDialog.vue';
import SelectTagsDialog from 'components/EventPage/Tags/SelectTagsDialog.vue';
import UploadNewLogoDialog from 'src/components/EventPage/Gallery/UploadNewLogoDialog.vue';
//import { Vue } from 'vue';

import { useEventStore } from 'src/stores/event';
import { mapState } from 'pinia';

export default {
  name: 'SuggestionsDialog',
  components: {
    EditEventDateDialog,
    AddEventDateDialog,
    EditRruleDialog,
    RemoveRruleDialog,
    SelectTagsDialog,
    EditSummaryDialog,
    EditNameDialog,
    UploadNewLogoDialog,
    SelectArtistsDialog,
  },
  data() {
    return {
      messageAndToken: null,
      editMode: null,
      dateEditMode: null,
      eventDateToEdit: null,
      addingEventDate: false,
      showAllEventDates: false,
      eventDateFields: [
        {
          name: this.$t('suggestions.date'),
          description: this.$t('suggestions.date_msg'),
          mode: 'date',
        },
        {
          name: this.$t('suggestions.location'),
          description: this.$t('suggestions.location_msg'),
          mode: 'location',
        },
        {
          name: this.$t('suggestions.ed_description'),
          description:
            "A detailed description of what's happening on this date",
          mode: 'description',
        },
        {
          name: this.$t('suggestions.artists'),
          description: this.$t('suggestions.edit_artists_msg'),
          mode: 'artists',
        },
        {
          name: this.$t('suggestions.size'),
          description: this.$t('suggestions.size_msg'),
          mode: 'size',
        },
        {
          name: this.$t('suggestions.url'),
          description: this.$t('suggestions.url_msg'),
          mode: 'url',
        },
        {
          name: this.$t('suggestions.cancelled'),
          description: this.$t('suggestions.cancelled_msg'),
          mode: 'cancel',
        },
        {
          name: this.$t('suggestions.delete'),
          description: this.$t('suggestions.delete_msg'),
          mode: 'delete',
        },
      ],
    };
  },
  created() {
    this.localDateTimeLong = common.localDateTimeLong;
    this.localDateTimeShort = common.localDateTimeShort;
    // used to show the add date dialog after removing rrule.
    // regular events wont work because chain of q-dialogs in editrrulecomponent
    /*
    window.bus = new Vue({});
    window.bus.$on('addDate', (value) => {
      this.messageAndToken = value;
      this.editMode = 'addEventDate';
    });
    window.bus.$on('closeDialog', () => {
      this.closeDialog();
    });
    */
  },
  methods: {
    closeDialog() {
      this.$emit('closeDialog');
    },
    editEventDate(mode) {
      this.editMode = mode;
    },
  },
  computed: {
    ...mapState(useEventStore, ['event', 'selectedEventDate']),
    computedEventDateYear() {
      return dayjs(this.selectedEventDate.start_naive).year();
    },
    computedEventDateCountry() {
      return selectedEventDate?.location?.description?.split(',').pop();
    },
    rruleStatus() {
      if (this.event?.rrule?.separation_count > 0) {
        return true;
      } else {
        return false;
      }
    },
    items() {
      return [
        {
          name: this.$t('suggestions.name'),
          description: this.$t('suggestions.name_msg'),
          mode: 'name',
        },
        {
          name: this.$t('suggestions.main_description'),
          description: this.$t('suggestions.main_description_msg'),
          mode: 'main_description',
        },
        {
          name: this.$t('suggestions.event_tags'),
          description: this.$t('suggestions.event_tags_msg'),
          mode: 'tags',
        },
        {
          name: this.$t('suggestions.image'),
          description: this.$t('suggestions.image_message'),
          mode: 'media',
        },
        ...((this.event.rrule && this.event.rrule.separation_count === 0) ||
        this.event.rrule === null
          ? [
              {
                name: this.$t('suggestions.add_schedule'),
                description: this.$t('suggestions.schedule_msg'),
                mode: 'rrule',
              },
            ]
          : [
              {
                name: this.$t('suggestions.change_schedule'),
                description: this.$t('suggestions.schedule_msg'),
                mode: 'rrule',
              },
            ]),
        ...(this.event.rrule !== null &&
        this.event.rrule &&
        this.event.rrule.separation_count > 0
          ? [
              {
                name: this.$t('suggestions.remove_schedule'),
                description: this.$t('suggestions.remove_schedule_msg'),
                mode: 'remove_rrule',
              },
            ]
          : []),
        ...(this.event.rrule === null ||
        (this.event.rrule && this.event.rrule.separation_count === 0)
          ? [
              {
                name: this.$t('suggestions.add_date'),
                description: this.$t('suggestions.add_date_msg'),
                mode: 'addEventDate',
              },
            ]
          : []),
      ];
    },

    eventDates() {
      if (this.event && this.event.event_dates) {
        if (this.showAllEventDates) {
          return this.event.event_dates;
        } else {
          return this.event.event_dates.slice(0, 3);
        }
      } else {
        return [];
      }
    },
  },
};
</script>

<style lang="scss"></style>
