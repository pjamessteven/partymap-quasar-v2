<template>
  <div class="event-dates-component flex column" :class="editing ? '' : ''">
    <div
      v-if="this.event?.event_dates?.length > 1 || editing"
      class="list-container flex column"
    >
      <div
        class="flex column"
        :class="{
          'q-pb-lg': event?.event_dates?.length === 0,
          'q-mb-sm': $q.screen.gt.sm,
        }"
      >
        <div
          class="inter bolder text-large t2 event-page-header"
          v-if="editing && event?.event_dates?.length === 0"
        >
          Event Dates:
        </div>
        <div
          class="flex row justify-start grow no-wrap schedule-msg-buttons q-mt-md q-pa-md"
          v-if="editing"
          :class="$q.screen.gt.xs ? 'q-mr-xl' : ''"
        >
          <div class="flex column" v-if="rruleStatus">
            <div class="t2">
              {{ $t('event_dates.schedule_msg') }}
            </div>
            <div class="flex row items-center no-wrap q-mr-sm q-mt-sm">
              <q-btn
                class="soft-button-shadow"
                color="red"
                @click="removeRrule"
                :label="$t('event_dates.remove_schedule')"
              />
              <q-btn
                class="soft-button-shadow q-ml-sm"
                @click="changeRrule"
                color="primary"
                :label="$t('event_dates.change_schedule')"
              />
            </div>
          </div>
          <div class="flex row justify-start grow" v-else>
            <q-btn
              label="Add date"
              size="md"
              no-caps
              style="white-space: nowrap"
              class="q-mr-sm soft-button-shadow"
              icon="las la-plus"
              v-on:click="showAddEventDateDialog = true"
            />
            <q-btn
              class="soft-button-shadow"
              no-caps
              @click="enableRrule"
              :label="$t('event_dates.set_up_recurring_dates')"
            />
          </div>
        </div>
      </div>
      <q-scroll-area
        v-if="this.event?.event_dates?.length > 0"
        horizontal
        ref="scrollArea"
        style="height: 136px"
        :bar-style="{
          height: '2px',
        }"
        :thumb-style="{
          bottom: '0px',
          height: '4px',
        }"
      >
        <div class="flex q-py-sm row no-wrap" :class="editing ? '' : 'q-pl-'">
          <EventDate
            v-for="(ed, index) in this.event?.event_dates"
            :key="index"
            :expanded="index === selectedEventDateIndex"
            :next="index == 0"
            :ed="ed"
            :editing="editing"
            :opacity="getEventDateOpacity(index)"
            :ref="'ed' + index"
            v-on:click="onSelectEventDate(ed, index)"
          />
        </div>
      </q-scroll-area>
    </div>

    <q-dialog v-model="showRemoveRruleWarningDialog">
      <RemoveRruleDialog
        v-on:closeDialog="showRemoveRruleWarningDialog = false"
      />
    </q-dialog>

    <q-dialog
      v-model="showManageRruleDialog"
      transition-show="fade-in"
      transition-hide=""
    >
      <EditRruleDialog @closeDialog="showManageRruleDialog = false" />
    </q-dialog>
    <q-dialog
      v-model="showAddEventDateDialog"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <AddEventDateDialog v-on:closeDialog="showAddEventDateDialog = false" />
    </q-dialog>
  </div>
</template>

<script>
import AddEventDateDialog from './AddEventDateDialog.vue';
import common from 'assets/common';
import EventDate from './EventDate.vue';
import EditRruleDialog from './EditRruleDialog.vue';
import RemoveRruleDialog from './RemoveRruleDialog.vue';
//import Vue from 'vue';

import { mapState, mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';

// import 'leaflet/dist/leaflet.css';
import { scroll } from 'quasar';

const { getScrollTarget, setScrollPosition } = scroll;

export default {
  data() {
    return {
      previousExpandedEventDate: 0,
      expandedEventDate: 0,
      showManageRruleDialog: false,
      showRemoveRruleWarningDialog: false,
      showAddEventDateDialog: false,
      rruleEnabled: false,
    };
  },
  components: {
    EventDate,
    EditRruleDialog,
    AddEventDateDialog,
    RemoveRruleDialog,
  },
  props: {
    eventDates: Array,
    editing: Boolean,
  },
  watch: {
    event: function () {
      // this.selectedEventDate = this.this.event?.event_dates?[0]
    },
    selectedEventDateIndex: function () {
      this.scrollSelectedEdIntoView();
    },
  },
  methods: {
    ...mapActions(useEventStore, ['updateEvent', 'loadEventDate']),

    enableRrule() {
      this.$q
        .dialog({
          title: this.$t('event_dates.set_up_recurring_dates'),
          message: this.$t('event_dates.set_up_recurring_dates_warning'),
          color: 'primary',
          cancel: true,
          ok: true,
          persistent: false, // we want the user to not be able to close it
        })
        .onOk(() => {
          this.showManageRruleDialog = true;
        });
    },
    changeRrule() {
      this.showManageRruleDialog = true;
    },
    async removeRrule() {
      this.showRemoveRruleWarningDialog = true;
    },
    getEventDateOpacity(index) {
      var diff;
      if (index > this.selectedEventDateIndex) {
        diff = index - this.selectedEventDateIndex;
      } else {
        diff = this.selectedEventDateIndex - index;
      }
      var opacity;
      if (index === this.selectedEventDateIndex) {
        opacity = 1;
      } else {
        opacity = 0.68 - diff * 0.15;
        if (opacity < 0.2) {
          opacity = 0.2;
        }
      }
      return opacity;
    },
    onSelectEventDate(ed) {
      // don't reload the current event
      if (!this.selectedEventDate || this.selectedEventDate.id !== ed.id) {
        // update route
        const route = {
          name: 'EventPage',
          params: {
            eventDateId: ed.id,
            id: this.event.id,
          },
          query: { name: this.event.name.replace(/ /g, '_') },
        };
        const { href } = this.$router.resolve(route);
        window.history.pushState({}, null, href);

        this.loadEventDate(ed.id);
      }
    },
    scrollToElement(el, index) {
      if (index > this.previousExpandedEventDate) {
        const target = getScrollTarget(el);
        var offset;
        if (this.$q.screen.gt.sm) {
          offset = el.offsetTop - 270;
        } else {
          offset = el.offsetTop - 330;
        }
        const duration = 300;
        setScrollPosition('horizontal', target, offset, duration);
      } else {
        const target = getScrollTarget(el);
        const offset = el.offsetTop - 120;
        const duration = 300;
        setScrollPosition('horizontal', target, offset, duration);
      }
    },
    scrollSelectedEdIntoView() {
      if (this.selectedEventDateIndex > 0) {
        if (this.$q.screen.gt.xs) {
          // scroll to middle
          this.$refs.scrollArea.setScrollPosition(
            'horizontal',
            this.selectedEventDateIndex * (180 + 18) - (180 + 18),
            100
          );
        } else {
          // scroll so item is on the left
          this.$refs.scrollArea.setScrollPosition(
            'horizontal',
            this.selectedEventDateIndex * (180 + 18),
            100
          );
        }
      } else {
        this.$refs.scrollArea.setScrollPosition(
          'horizontal',
          this.selectedEventDateIndex * (180 + 18)
        );
      }
    },
  },
  computed: {
    ...mapState(useEventStore, [
      'event',
      'selectedEventDate',
      'selectedEventDateIndex',
    ]),
    rruleStatus() {
      if (this.event?.rrule?.separation_count > 0) {
        return true;
      } else {
        return false;
      }
    },
  },
  created() {
    // import common methods
    this.relativeHumanTime = common.relativeHumanTime;
    this.localTime = common.localTime;
    this.localTimeCompact = common.localTimeCompact;
    this.recurringPattern = common.recurringPattern;
    // used to show the add date dialog after removing rrule.
    // regular events wont work because chain of q-dialogs in editrrulecomponent
    /*
    TODO: need solution for vue3
    window.bus = new Vue({});
    window.bus.$on('addDate', () => {
      // Do stuff
      this.showAddEventDateDialog = true;
    });
    */
  },
  mounted() {
    this.scrollSelectedEdIntoView(this.selectedEventDateIndex);
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .event-dates-component {
    .schedule-msg-buttons {
      background: $bi-3;
      border: rgba(255, 255, 255, 0.05);
      border-radius: 9px;
    }
  }
  .show-more-button-container {
    :deep(.q-icon) {
      background: $bi-2;
      color: $ti-3;
    }
  }
}

.body--light {
  .event-dates-component {
    .schedule-msg-buttons {
      background: $b-3;
      border: rgba(0, 0, 0, 0.05);
      border-radius: 9px;
    }
  }
  .show-more-button-container {
    :deep(.q-icon) {
      background: white;
      color: $t-3;
    }
  }
}

.event-dates-component {
  //overflow: hidden;
  &.editing {
  }
  .editing-dialog {
    min-width: 400px;
  }
  .list-container {
    overflow: hidden;
    width: 100%;
  }

  .list-container-showing-more {
    max-height: 500px;
    overflow-y: auto;
  }

  .show-more-button-container {
    position: absolute;
    z-index: 1000;
    bottom: 0px;
    left: 0px;
    padding-left: 6px;
    padding-bottom: 6px;
    :deep(.q-icon) {
      border-radius: 100px;
      padding: 12px;
    }
  }
}
</style>
