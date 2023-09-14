<template>
  <div v-if="!!event">
    <div class="description text-large" :class="editing ? 'editing ' : ''">
      <div
        @click="openEditorDialog()"
        class="editing-outline"
        style="white-space: pre-line; word-break: break-word"
        :class="editing ? 'q-pa-md' : ''"
      >
        <span class="o-080">{{ event.description }}</span
        ><span
          v-if="
            event.description_attribute &&
            event.description_attribute.length > 0
          "
        >
          <a
            class="link-hover o-050"
            target="_blank"
            :href="computedAttributeUrl"
            >&nbsp;[source]</a
          ></span
        >
      </div>
    </div>

    <q-dialog
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
    computedAttributeUrl() {
      if (this.event?.description_attribute?.length > 0) {
        // ensure that there is a protocol prefix
        if (
          this.event.description_attribute.indexOf('http://') < 0 &&
          this.event.description_attribute.indexOf('https://') < 0
        ) {
          return '//' + this.event.description_attribute;
        } else return this.event.description_attribute;
      } else {
        return null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 1023px) {
}
</style>
