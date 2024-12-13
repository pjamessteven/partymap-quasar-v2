<template>
  <q-card class="flex column dialog-card fullscreen-mobile-card">
    <q-card-section class="header row items-center dialog-card-header">
      <div class="inter bolder text-h6">
        {{ $t('event_dates.buy_tickets') }}
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    <q-card-section class="t2 dialog-card-content">
      <div class="q-mb-lg t3">
        {{ $t('event_dates.we_earn_commission') }}
      </div>
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
            <div class="t3" v-else>{{ $t('event_dates.no_price_listed') }}</div>
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
              :label="getTicketRetailerName(ticket.url)"
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
    </q-card-section>
  </q-card>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import common from 'assets/common';

export default {
  name: 'EventDateTicketUrlComponent',
  components: {},
  watch: {},
  data() {
    return { showEditingDialog: false, showTicketDialog: false };
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

<style lang="scss" scoped></style>
