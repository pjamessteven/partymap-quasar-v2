<template>
  <div
    class="flex"
    :class="editing ? 'editing' : ''"
    @click="openAddTagDialog()"
  >
    <div
      class="editing-outline flex row no-wrap items-center inter"
      :class="editing ? 'q-pa-md' : ''"
      :style="editing ? 'margin-left: 0px!important;' : ''"
    >
      <div class="flex row wrap" :class="small ? 'q-gutter-xs' : 'q-gutter-sm'">
        <Tag
          :small="small"
          v-for="(et, index) in computedTags"
          :key="index"
          :value="et.tag_t || et.tag"
          style="pointer-events: none"
        />
        <Tag
          v-if="!eventHasHost && !editing"
          :small="small"
          :key="-1"
          :value="$t('event.add_tags') + ' +'"
          @click="() => (showAddTagDialog = true)"
        />
      </div>
      <div style="color: white" v-if="editing && !computedTags.length == 0">
        {{ $t('event.add_tags') }}
      </div>

      <q-icon
        size="1rem"
        color="white"
        class="t4 q-ml-lg q-mr-sm"
        name="las la-plus"
        v-if="editing"
      />
    </div>

    <q-dialog
      v-model="showAddTagDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <SelectTagsDialog @closeDialog="showAddTagDialog = false" />
    </q-dialog>
  </div>
</template>

<script>
import SelectTagsDialog from 'components/EventPage/Tags/SelectTagsDialog.vue';
import Tag from 'components/EventPage/Tags/TagComponent.vue';
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

export default {
  components: {
    Tag,
    SelectTagsDialog,
  },
  props: {
    editing: Boolean,
    small: Boolean,
  },
  data() {
    return {
      showAddTagDialog: false,
    };
  },
  methods: {
    openAddTagDialog() {
      if (this.editing === true) {
        this.showAddTagDialog = true;
      }
    },
  },
  watch: {},
  computed: {
    ...mapState(useEventStore, ['event', 'eventHasHost']),
    computedTags() {
      return (
        this.event?.event_tags ||
        (this.$route.query?.tags && JSON.parse(this.$route.query?.tags)) ||
        []
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.taggroup-move {
  transition: transform 500ms;
}

.tag-container {
  display: flex;
  flex-direction: row;
  overflow: unset;
}
:deep(.tag) {
  .tag-inner {
    opacity: 0.67;
  }
}
</style>
