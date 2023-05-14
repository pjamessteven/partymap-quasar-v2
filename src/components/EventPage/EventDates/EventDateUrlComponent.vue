<template>
  <div
    v-if="selectedEventDate != null"
    class="flex row items-center no-wrap ed-inline-card editing-outline"
    :class="[editing ? 'editing q-px-md' : '']"
    @click="editing ? (showEditingDialog = true) : null"
  >
    <q-icon
      :size="$q.screen.gt.sm ? '2em' : '1.5rem'"
      :class="
        selectedEventDate.url && selectedEventDate.url.length > 0 ? ' t2' : 't4'
      "
      name="las la-external-link-alt"
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
          >{{ selectedEventDate.url }}</a
        >
      </div>
      <div
        v-else
        class="t4"
        @click="showEditingDialog = true"
        style="cursor: pointer"
      >
        <span>
          <u>{{ $t('event_date_inline.add_url') }}</u>
        </span>
      </div>
    </div>
    <q-dialog
      v-model="showEditingDialog"
      transition-show="fade"
      transition-hide="none"
    >
      <EditEventDateDialog :ed="selectedEventDate" mode="url" />
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

import EditEventDateDialog from './EditEventDateDialog.vue';

export default {
  name: 'EventDateUrlComponent',
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
      if (this.selectedEventDate && this.selectedEventDate.url) {
        // ensure that there is a protocol prefix
        if (
          this.selectedEventDate.url.indexOf('http://') < 0 &&
          this.selectedEventDate.url.indexOf('https://') < 0
        ) {
          return '//' + this.selectedEventDate.url;
        } else return this.selectedEventDate.url;
      } else {
        return null;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
