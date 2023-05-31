<template>
  <div
    class="flex"
    :class="editing ? 'editing' : ''"
    @click="openAddTagDialog()"
  >
    <div
      class="editing-outline flex row wrap items-center q-gutter-xs"
      :class="editing ? 'q-pa-md' : ''"
      :style="editing ? 'margin-left: 0px!important;' : ''"
    >
      <Tag
        v-for="(et, index) in event?.event_tags"
        :key="index"
        :value="et.tag"
      />
      <div
        style="color: white"
        v-if="editing && (!event.event_tags || event.event_tags.length == 0)"
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

    <q-dialog
      v-model="showAddTagDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <q-card class="dialog-card event-page-editing-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('tags.tag_event') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="flex column">
          <SelectTagsComponent
            :mode="'updateExisting'"
            @closeDialog="showAddTagDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import SelectTagsComponent from 'components/EventPage/Tags/SelectTagsComponent.vue';
import Tag from 'components/EventPage/Tags/TagComponent.vue';
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

export default {
  components: {
    Tag,
    SelectTagsComponent,
  },
  props: {
    editing: Boolean,
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
    ...mapState(useEventStore, ['event']),
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
    opacity: 0.48;
  }
}
</style>
