<template>
  <div
    v-if="(selectedEventDate && selectedEventDate.ticket_url) || editing"
    class="flex row items-center no-wrap ed-inline-card editing-outline q-py-md"
    :class="[editing ? 'editing q-px-md' : '']"
    @click="editing ? (showEditingDialog = true) : null"
  >
    <q-icon
      :size="$q.screen.gt.sm ? '2em' : '1.5rem'"
      :class="
        selectedEventDate.url && selectedEventDate.url.length > 0 ? ' t2' : 't4'
      "
      name="las la-ticket-alt"
    />
    <div
      class="flex column q-ml-md t2"
      :class="$q.screen.gt.sm ? 'text-large' : ''"
    >
      <div style="white-space: pre-line" v-if="computedExternalUrl">
        <a
          class="link-hover underline"
          target="_blank"
          :href="computedExternalUrl"
          >{{ selectedEventDate.ticket_url }}</a
        >
      </div>
      <div v-else class="t4">
        <span>
          <u>{{ $t('event_date_inline.add_ticket_url') }}</u>
        </span>
      </div>
    </div>
    <q-dialog
      v-if="editing"
      v-model="showEditingDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditEventDateDialog :ed="selectedEventDate" mode="ticketUrl" />
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

import EditEventDateDialog from './EditEventDateDialog.vue';

export default {
  name: 'EventDateTicketUrlComponent',
  components: {
    EditEventDateDialog,
  },
  watch: {},
  data() {
    return { showEditingDialog: false };
  },
  props: {
    editing: Boolean,
  },
  methods: {},
  computed: {
    ...mapState(useEventStore, ['event', 'selectedEventDate']),

    computedExternalUrl() {
      if (this.selectedEventDate && this.selectedEventDate.ticket_url) {
        // ensure that there is a protocol prefix
        if (
          this.selectedEventDate.ticket_url.indexOf('http://') < 0 &&
          this.selectedEventDate.ticket_url.indexOf('https://') < 0
        ) {
          return '//' + this.selectedEventDate.ticket_url;
        } else return this.selectedEventDate.ticket_url;
      } else {
        return null;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
