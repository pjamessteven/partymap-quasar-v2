<template>
  <div>
    <div class="description text-large" :class="editing ? 'editing ' : ''">
      <div
        @click="openEditorDialog()"
        class="editing-outline"
        style="word-break: break-word"
        :class="editing ? 'q-pa-md' : ''"
      >
        <span class="o-080">{{
          event?.description || $route.query?.description
        }}</span>
        <div
          class="q-mt-sm o-050"
          v-if="
            event?.description_attribute &&
            event?.description_attribute?.length > 0 &&
            false
          "
        >
          <!--
          -&nbsp;<a
            class="link-hover"
            target="_blank"
            :href="computedAttributeUrl"
            >{{ computedAttributeDomain }}</a
          >
          -->
        </div>
      </div>
    </div>

    <q-dialog
      v-if="!!event"
      v-model="showEditingDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditSummaryDialog @closeDialog="showEditingDialog = false" />
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import EditSummaryDialog from './EditSummaryDialog.vue';

export default {
  components: { EditSummaryDialog },
  props: {
    editing: Boolean,
  },
  data() {
    return {
      showEditingDialog: false,
    };
  },
  methods: {
    openEditorDialog() {
      if (this.editing) {
        this.showEditingDialog = true;
      }
    },
  },
  watch: {},
  computed: {
    ...mapState(useEventStore, ['event']),
  },
};
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 1023px) {
}
</style>
