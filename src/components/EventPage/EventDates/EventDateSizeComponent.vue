<template>
  <div
    v-if="selectedEventDate != null"
    class="flex row items-center no-wrap ed-inline-card editing-outline"
    :class="[editing || showMoreFields ? 'editing q-px-md' : '']"
    @click="editing || showMoreFields ? (showEditingDialog = true) : null"
  >
    <q-icon
      :size="$q.screen.gt.sm ? '2em' : '1.5rem'"
      :class="selectedEventDate.size ? ' t2' : 't4'"
      name="las la-user-friends"
    />
    <div
      class="flex column q-ml-md t2"
      :class="$q.screen.gt.sm ? 'text-large' : ''"
    >
      <div v-if="selectedEventDate.size" class="flex column">
        ~{{ selectedEventDate.size.toLocaleString('en-US') }}&nbsp;{{
          $t('event_dates.size_people')
        }}
      </div>
      <div
        v-else
        class="t4 link-hover underline"
        @click="showEditingDialog = true"
      >
        {{ $t('event_dates.add_size') }}
      </div>
    </div>
    <q-dialog
      v-model="showEditingDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditEventDateDialog :ed="selectedEventDate" mode="size" />
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

import EditEventDateDialog from './EditEventDateDialog.vue';

export default {
  name: 'EventDateSizeComponent',
  components: {
    EditEventDateDialog,
  },
  watch: {},
  data() {
    return { showEditingDialog: false };
  },
  props: {
    editing: Boolean,
    showMoreFields: Boolean,
  },
  methods: {},
  computed: {
    ...mapState(useEventStore, ['event', 'selectedEventDate']),
  },
};
</script>

<style lang="scss" scoped></style>
