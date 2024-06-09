<template>
  <q-card class="flex column dialog-card fullscreen-mobile-card">
    <q-card-section class="header row items-center dialog-card-header">
      <div class="inter bolder text-h6">Mark as cancelled</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    <q-card-section class="dialog-card-content q-pa-none">
      <q-list class="q-py-sm">
        <q-item clickable class="q-pa-md" @click="showCancelDateDialog = true">
          <q-item-section>
            <q-item-label class="text-large inter bold q-mb-sm">
              Mark only this event date as cancelled
            </q-item-label>
            <q-item-label class="t3">
              Choose this option if the next event date is cancelled, but the
              event will happen again next year or some other time.
            </q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="$q.screen.gt.xs">
            <q-icon name="mdi-chevron-right" />
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable class="q-pa-md" @click="showRemoveRruleDialog = true">
          <q-item-section>
            <q-item-label class="text-large inter bold q-mb-sm">
              Cancel all future event dates
            </q-item-label>
            <q-item-label class="t3">
              Choose this option if the festival likely isn't going to happen
              again. The event page will still be searchable on PartyMap and can
              be bought back to life if the festival makes a come-back.
            </q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="$q.screen.gt.xs">
            <q-icon name="mdi-chevron-right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-dialog
      v-model="showCancelDateDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditEventDateDialog
        v-if="showCancelDateDialog"
        :ed="selectedEventDate"
        mode="cancel"
      />
    </q-dialog>
    <q-dialog
      v-model="showRemoveRruleDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <RemoveRruleDialog v-on:closeDialog="showRemoveRruleDialog = false" />
    </q-dialog>
  </q-card>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import EditEventDateDialog from './EditEventDateDialog.vue';
import RemoveRruleDialog from './RemoveRruleDialog.vue';

export default {
  name: 'EventDateMarkCancelledDialog',
  components: { EditEventDateDialog, RemoveRruleDialog },
  watch: {},
  data() {
    return { showRemoveRruleDialog: false, showCancelDateDialog: false };
  },
  props: {
    editing: Boolean,
  },
  methods: {},

  computed: {
    ...mapState(useEventStore, ['event', 'selectedEventDate']),
  },
};
</script>

<style lang="scss" scoped></style>
