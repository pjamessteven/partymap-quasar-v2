<template>
  <div v-if="!!event">
    <div class="flex column">
      <div class="inter bolder text-large t2 q-pr-md q-mb event-page-header">
        Description:
      </div>

      <div class="description text-large" :class="editing ? 'editing ' : ''">
        <div
          @click="openEditorDialog()"
          class="editing-outline"
          :class="editing ? 'q-pa-md' : ''"
        >
          <span v-if="event.full_description?.length > 0">
            <span
              class="o-080"
              style="white-space: pre-line; word-break: break-word"
              >{{ event.full_description }}</span
            ><span
              v-if="
                event.full_description_attribute &&
                event.full_description_attribute.length > 0
              "
              >&nbsp;
              <a
                class="link-hover o-050"
                target="_blank"
                :href="computedAttributeUrl"
                >[source]</a
              ></span
            ></span
          ><span v-else class="t4 inter text-large q-mt-sm">
            Nothing here yet.
          </span>
        </div>
      </div>
    </div>
    <q-dialog
      v-model="showEditingDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditDescriptionDialog @closeDialog="showEditingDialog = false" />
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import EditDescriptionDialog from './EditDescriptionDialog.vue';

export default {
  components: { EditDescriptionDialog },
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
      if (this.event?.full_description_attribute?.length > 0) {
        // ensure that there is a protocol prefix
        if (
          this.event.full_description_attribute.indexOf('http://') < 0 &&
          this.event.full_description_attribute.indexOf('https://') < 0
        ) {
          return '//' + this.event.full_description_attribute;
        } else return this.event.full_description_attribute;
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
