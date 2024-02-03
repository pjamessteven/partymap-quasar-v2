<template>
  <div
    class="flex column"
    v-if="$q.screen.gt.sm && event?.event_dates?.length > 0"
  >
    <EventDateTimeComponent :inline="false" />
    <EventDateLocationComponent
      class="q-mt-lg"
      :key="selectedEventDate?.id"
      v-if="!!selectedEventDate?.location"
    />
  </div>
</template>

<script>
import EventDateLocationComponent from 'components/EventPage/EventDates/EventDateLocationComponent.vue';
import EventDateTimeComponent from 'components/EventPage/EventDates/EventDateTimeComponent.vue';

import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    EventDateTimeComponent,
    EventDateLocationComponent,
  },
  data() {
    return {
      loading: false,
      showMoreFields: false,
    };
  },
  methods: {},
  watch: {},
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

    eventHasHost() {
      return this.event?.host?.username;
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}
</style>
