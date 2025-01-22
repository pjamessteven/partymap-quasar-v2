<template>
  <q-card class="flex column dialog-card fullscreen-mobile-card">
    <q-card-section class="header row items-center dialog-card-header">
      <div class="inter bolder text-h6">
        {{ $t('edit_event_date.mark_as_cancelled') }}
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    <q-card-section class="dialog-card-content q-pa-none">
      <q-list class="q-py-sm">
        <q-item clickable class="q-pa-md" @click="showCancelDateDialog = true">
          <q-item-section>
            <q-item-label class="text-large inter bold q-mb-sm">
              {{ $t('edit_event_date.mark_only_this_as_cancelled') }}
            </q-item-label>
            <q-item-label class="t3">
              {{ $t('edit_event_date.mark_only_this_as_cancelled_msg') }}
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
              {{ $t('edit_event_date.cancel_all') }}
            </q-item-label>
            <q-item-label class="t3">
              {{ $t('edit_event_date.cancel_all_msg') }}
            </q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="$q.screen.gt.xs">
            <q-icon name="mdi-chevron-right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <BackdropBlurDialog
      v-model="showCancelDateDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditEventDateDialog
        v-if="showCancelDateDialog"
        :ed="selectedEventDate"
        mode="cancel"
      />
    </BackdropBlurDialog>
    <BackdropBlurDialog
      v-model="showRemoveRruleDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <RemoveRruleDialog v-on:closeDialog="showRemoveRruleDialog = false" />
    </BackdropBlurDialog>
  </q-card>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import EditEventDateDialog from './EditEventDateDialog.vue';
import RemoveRruleDialog from './RemoveRruleDialog.vue';
import BackdropBlurDialog from '../../BackdropBlurDialog.vue';

export default {
  name: 'EventDateMarkCancelledDialog',
  components: { EditEventDateDialog, RemoveRruleDialog, BackdropBlurDialog },
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
