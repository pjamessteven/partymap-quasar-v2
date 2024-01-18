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
      class="q-ml-md t2"
      style="display: grid; width: 100%"
      :class="$q.screen.gt.sm ? 'text-large' : ''"
    >
      <div
        class="flex no-wrap"
        :class="$q.screen.gt.xs ? 'justify-between' : 'column'"
        style="white-space: pre-line; width: 100%"
        v-if="selectedEventDate?.ticket_url"
      >
        <div class="flex column" :class="$q.screen.gt.sm ? 'text-large' : ''">
          <div class="t2">Tickets</div>
          <a
            v-if="computedTicketSellerName"
            class="t3 link-hover q-mr-sm"
            :href="computedExternalUrl"
            style="text-decoration: none; line-break: anywhere"
            target="_blank"
          >
            <span v-if="computedTicketSellerName"
              >Get tickets from&nbsp;{{ computedTicketSellerName }}</span
            ><span v-else>Get tickets to this event</span>
          </a>
        </div>
        <!--
        <a
          class="link-hover underline ellipsis"
          target="_blank"
          :href="!editing ? computedExternalUrl : undefined"
          >{{ selectedEventDate.url }}</a
        >
        -->
        <a
          style="text-decoration: none; color: unset"
          :href="computedExternalUrl"
          target="_blank"
          class="q-mt-sm"
          v-if="computedExternalUrl && !editing"
        >
          <q-btn
            no-caps
            class="nav-button"
            flat
            style="width: 190px"
            label="Buy tickets"
            :color="$q.dark.isActive ? 'white' : 'black'"
            icon="las la-external-link-alt"
            :class="$q.screen.gt.sm ? '' : 'flex grow'"
          />
        </a>
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
    computedTicketSellerName() {
      if (this.selectedEventDate && this.selectedEventDate.ticket_url) {
        // ensure that there is a protocol prefix
        if (
          this.selectedEventDate.ticket_url
            .toLowerCase()
            .indexOf('ticketmaster')
        ) {
          return 'Ticketmaster';
        } else if (
          this.selectedEventDate.ticket_url.toLowerCase().indexOf('moshtix')
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
