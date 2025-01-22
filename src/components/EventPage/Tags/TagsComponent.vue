<template>
  <div :class="editing ? 'editing' : ''" @click="openAddTagDialog()">
    <div
      class="editing-outline inter"
      :class="editing ? 'q-pa-md' : ''"
      :style="editing ? 'margin-left: 0px!important;' : ''"
    >
      <div :class="small ? 'q-gutter-xs' : 'q-gutter-sm'">
        <Tag
          :small="small"
          v-for="(et, index) in computedTags"
          :key="index"
          :value="et.tag_t || et.tag"
          style="pointer-events: none; display: inline-flex"
        />
        <Tag
          v-if="!eventHasHost && !editing"
          :small="small"
          style="display: inline-flex"
          :key="-1"
          :value="$t('event.add_tags') + ' +'"
          @click="() => (showAddTagDialog = true)"
        />
      </div>
      <div
        style="color: white"
        v-if="editing && !computedTags.length == 0"
        @click="() => (showAddTagDialog = true)"
      >
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

    <BackdropBlurDialog
      v-model="showAddTagDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <SelectTagsDialog @closeDialog="showAddTagDialog = false" />
    </BackdropBlurDialog>
  </div>
</template>

<script>
import SelectTagsDialog from 'components/EventPage/Tags/SelectTagsDialog.vue';
import Tag from 'components/EventPage/Tags/TagComponent.vue';
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import BackdropBlurDialog from '../../BackdropBlurDialog.vue';

export default {
  components: {
    Tag,
    SelectTagsDialog,
    BackdropBlurDialog,
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
