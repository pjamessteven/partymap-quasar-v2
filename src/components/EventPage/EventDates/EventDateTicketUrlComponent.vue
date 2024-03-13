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
            <span v-if="computedTicketSellerName"
              >Get tickets from&nbsp;{{ computedTicketSellerName }}</span
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
      <q-card class="flex column q-pa-md">
        <div
          class="flex column"
          v-for="(ticket, index) of selectedEventDate.tickets"
          :key="index"
        >
          <div class="flex row items-center justify-between">
            <div class="flex column">
              <div class="inter bold">{{ ticket.description }}</div>
              <div class="t2" v-if="ticket.price_min">
                {{ ticket.price_min
                }}<span class="t2" v-if="ticket.price_max"
                  >&nbsp;-&nbsp;{{ ticket.price_max }}</span
                >&nbsp;{{ ticket.price_currency_code }}
              </div>
            </div>
            <a
              style="text-decoration: none; color: unset"
              :href="ticket.url"
              target="_blank"
              class="q-ml-xl"
            >
              <q-btn
                no-caps
                class="nav-button primary"
                flat
                style="width: 190px"
                label="Buy tickets"
                icon="las la-external-link-alt"
                :class="$q.screen.gt.sm ? '' : 'flex grow'"
              />
            </a>
          </div>
          <q-separator
            v-if="index !== selectedEventDate.tickets.length - 1"
            class="q-my-sm"
          />
        </div>
      </q-card>
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
    return { showEditingDialog: false, showTicketDialog: false };
  },
  props: {
    editing: Boolean,
  },
  methods: {},
  computed: {
    ...mapState(useEventStore, ['event', 'selectedEventDate']),
    /*
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
    */
    computedTicketSellerName() {
      if (
        this.selectedEventDate &&
        this.selectedEventDate.tickets?.length > 0
      ) {
        // ensure that there is a protocol prefix
        if (
          this.selectedEventDate.tickets[0].url
            .toLowerCase()
            .indexOf('ticketmaster')
        ) {
          return 'Ticketmaster';
        } else if (
          this.selectedEventDate.tickets[0].url.toLowerCase().indexOf('moshtix')
        ) {
          return 'Moshtix';
        } else {
          return null;
        }
      } else {
        return null;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
