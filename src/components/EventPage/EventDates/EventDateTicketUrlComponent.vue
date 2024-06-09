<template>
  <div
    v-if="(selectedEventDate && selectedEventDate.tickets) || editing"
    class="flex row items-center no-wrap ed-inline-card editing-outline q-py-md"
    :class="[editing ? 'editing q-px-md' : '']"
    @click="editing ? (showEditingDialog = true) : null"
  >
    <q-icon
      :size="$q.screen.gt.sm ? '2em' : '1.5rem'"
      :class="
        selectedEventDate.tickets && selectedEventDate.tickets.length > 0
          ? ' t2'
          : 't4'
      "
      name="las la-ticket-alt"
    />
    <div
      class="q-ml-md t2"
      style="display: grid; width: 100%"
      :class="$q.screen.gt.sm ? 'text-large' : ''"
    >
      <div
        class="flex no-wrap items-center"
        :class="$q.screen.gt.xs ? 'justify-between' : 'column'"
        style="white-space: pre-line; width: 100%"
        v-if="selectedEventDate?.tickets?.length > 0"
      >
        <div class="flex column" :class="$q.screen.gt.sm ? 'text-large' : ''">
          <div class="t2">Tickets</div>
          <span class="t3">
            <span v-if="computedTicketSellerName">{{
              computedTicketSellerName
            }}</span
            ><span v-else>Get tickets to this event</span></span
          >
        </div>
        <!--
Direct link when only one ticket available
        -->
        <a
          v-if="selectedEventDate.tickets.length === 1 && !editing"
          style="text-decoration: none; color: unset"
          :href="selectedEventDate.tickets[0].url"
          target="_blank"
          class="q-mt-sm"
        >
          <q-btn
            no-caps
            class="nav-button primary"
            flat
            style="width: 190px"
            label="Buy tickets"
            :color="$q.dark.isActive ? 'white' : 'black'"
            icon="las la-external-link-alt"
            :class="$q.screen.gt.sm ? '' : 'flex grow'"
          />
        </a>
        <q-btn
          @click="showTicketDialog = true"
          v-else-if="!editing && selectedEventDate.tickets.length > 1"
          no-caps
          class="nav-button primary"
          flat
          style="width: 190px"
          label="Buy tickets"
          icon="las la-external-link-alt"
          :class="$q.screen.gt.sm ? '' : 'flex grow'"
        />
      </div>
      <div
        v-else
        class="t4"
        @click="showEditingDialog = true"
        style="cursor: pointer"
      >
        <span>
          <u>{{ $t('event_date_inline.add_ticket_url') }}</u>
        </span>
      </div>
    </div>
    <!--
    <div
      class="flex column q-ml-md t2"
      :class="$q.screen.gt.sm ? 'text-large' : ''"
    >
      <div style="white-space: pre-line" v-if="computedExternalUrl">
        <a
          class="link-hover underline"
          target="_blank"
          :href="!editing ? computedExternalUrl : undefined"
          >{{ selectedEventDate.ticket_url }}</a
        >
      </div>
      <div v-else class="t4">
        <span>
          <u>{{ $t('event_date_inline.add_ticket_url') }}</u>
        </span>
      </div>
    </div>
    -->
    <q-dialog
      v-if="editing"
      v-model="showEditingDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditEventDateDialog :ed="selectedEventDate" mode="ticketUrl" />
    </q-dialog>
    <q-dialog
      v-model="showTicketDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EventDateTicketUrlDialog />
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import common from 'assets/common';

import EditEventDateDialog from './EditEventDateDialog.vue';
import EventDateTicketUrlDialog from './EventDateTicketUrlDialog.vue';

export default {
  name: 'EventDateTicketUrlComponent',
  components: {
    EditEventDateDialog,
    EventDateTicketUrlDialog,
  },
  watch: {},
  data() {
    return { showEditingDialog: false, showTicketDialog: false };
  },
  props: {
    editing: Boolean,
  },
  methods: {},
  created() {
    this.getDomainFromUrl = common.getDomainFromUrl;
  },
  computed: {
    ...mapState(useEventStore, ['event', 'selectedEventDate']),

    computedTicketSellerName() {
      return this.getDomainFromUrl(this.selectedEventDate?.tickets?.[0]?.url);
    },
  },
};
</script>

<style lang="scss" scoped></style>
