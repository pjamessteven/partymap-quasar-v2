<template>
  <div
    class="flex column"
    v-if="(selectedEventDate && selectedEventDate.tickets) || editing"
  >
    <div
      class="flex row items-center no-wrap ed-inline-card editing-outline q-py-md"
      :class="[editing ? 'editing q-px-md' : '']"
      @click="editing ? (showEditingDialog = true) : null"
      v-if="editing"
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
          class="t4"
          @click="showEditingDialog = true"
          style="cursor: pointer"
        >
          <span>
            <u>{{ $t('event_dates.add_links_ticket_url') }}</u>
          </span>
        </div>
      </div>
    </div>
    <div v-else class="flex column no-wrap grow q-pt-sm q-gutter-sm q-my-sm">
      <div class="flex row items-center no-wrap q-mb-md">
        <q-icon
          v-if="false"
          :size="$q.screen.gt.sm ? '1.7em' : '1.5rem'"
          :class="
            selectedEventDate.tickets && selectedEventDate.tickets.length > 0
              ? ' t2'
              : 't4'
          "
          name="las la-ticket-alt"
        />
        <div class="t1 text-h6 bolder inter" :class="$q.screen.gt.sm ? '' : ''">
          {{ $t('event.get_tickets') }}
        </div>
      </div>
      <div
        v-for="(ticket, index) of selectedEventDate.tickets"
        class="flex row items-center no-wrap ticket q-py-sm"
      >
        <div
          class="q-ml-md t2"
          style="display: grid; width: 100%"
          :class="$q.screen.gt.sm ? 'text-large' : ''"
        >
          <div
            class="flex no-wrap"
            :class="
              $q.screen.gt.xs
                ? 'justify-between items-center'
                : 'column items-start'
            "
            style="white-space: pre-line; width: 100%"
            v-if="selectedEventDate?.tickets?.length > 0"
          >
            <div
              class="flex column"
              :class="$q.screen.gt.sm ? 'text-large' : ''"
            >
              <span
                class="t1"
                v-if="!ticket.description || ticket.description?.length === 0"
              >
                {{ $t('event.get_tickets') }}</span
              >
              <div class="t1 metropolis bold" v-else>
                {{ ticket.description }}
              </div>
              <div class="t3" v-if="ticket.price_min">
                {{ ticket.price_min
                }}<span v-if="ticket.price_max"
                  >&nbsp;-&nbsp;{{ ticket.price_max }}</span
                >&nbsp;{{ ticket.price_currency_code }}
              </div>
              <div></div>
            </div>
            <!--
Direct link when only one ticket available
        -->
            <a
              style="text-decoration: none; color: unset"
              :href="ticket.url"
              target="_blank"
            >
              <q-btn
                no-caps
                class="nav-button primary"
                flat
                :label="getTicketRetailerName(ticket.url)"
                :color="'white'"
                icon="las la-external-link-alt"
                :class="$q.screen.gt.sm ? '' : 'flex grow q-mt-sm'"
              />
            </a>
          </div>
        </div>
      </div>
      <div class="q-mb-sm q-mt-md t3">
        {{ $t('event_dates.we_earn_commission') }}
      </div>
      <q-separator />
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
    return { showEditingDialog: false };
  },
  props: {
    editing: Boolean,
  },
  methods: {},
  created() {
    this.getTicketRetailerName = common.getTicketRetailerName;
  },
  computed: {
    ...mapState(useEventStore, ['event', 'selectedEventDate']),
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .ticket {
    background: $b-2;
  }
}
.body--dark {
  .ticket {
    background: $bi-3;
  }
}
.ticket {
  padding: 12px;
  border-radius: 18px;
}
</style>
