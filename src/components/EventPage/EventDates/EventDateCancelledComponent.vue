<template>
  <div
    v-if="selectedEventDate != null"
    class="flex row items-center no-wrap ed-inline-card editing-outline"
    :class="[editing || showMoreFields ? 'editing q-px-md' : '']"
    @click="editing || showMoreFields ? (showEditingDialog = true) : null"
  >
    <q-icon
      :size="$q.screen.gt.sm ? '2em' : '1.5rem'"
      :class="selectedEventDate.cancelled == true ? ' t2' : 't4'"
      name="las la-ban"
    />
    <div
      class="flex column q-ml-md t2"
      :class="$q.screen.gt.sm ? 'text-large' : ''"
    >
      <div
        v-if="selectedEventDate.cancelled"
        @click="showEditingDialog = true"
        class="flex items-start column"
      >
        <q-badge color="red" :label="$t('event_date_inline.cancelled')" />
        <u
          class="t4 q-mt-sm link-hover underline"
          style="cursor: pointer"
          v-if="editing || showMoreFields"
          @click="showEditingDialog = true"
          >Mark as happening</u
        >
      </div>
      <div
        v-else
        class="t4"
        @click="showEditingDialog = true"
        style="cursor: pointer"
      >
        <span>
          <u>{{ $t('event_date_inline.mark_date_as_cancelled') }}</u>
        </span>
      </div>
    </div>
    <q-dialog
      v-if="editing || showMoreFields"
      v-model="showEditingDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditEventDateDialog :ed="selectedEventDate" mode="cancel" />
    </q-dialog>
  </div>
</template>

<script>
import EditEventDateDialog from './EditEventDateDialog.vue';
import { useEventStore } from 'src/stores/event';
import { mapState } from 'pinia';

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
