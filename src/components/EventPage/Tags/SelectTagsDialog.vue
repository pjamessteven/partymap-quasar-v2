<template>
  <q-card>
    <q-card-section class="flex items-center dialog-card-header">
      <div class="text-h6">{{ $t('suggestions.event_tags') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="flex column no-wrap q-mt-sm">
      <div class="t3 q-mb-md">{{ $t('suggestions.event_tags_msg') }}</div>
      <SelectTagsComponent
        :mode="'updateExisting'"
        @closeDialog="$emit('closeDialog')"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import { mapState } from 'pinia';

import { useEventStore } from 'src/stores/event';
import SelectTagsComponent from './SelectTagsComponent.vue';

export default {
  components: {
    SelectTagsComponent,
  },
  props: {},
  data() {
    return {};
  },
  watch: {},
  methods: {},
  computed: {
    ...mapState(useEventStore, ['event']),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}

@media only screen and (max-width: 1023px) {
}
</style>
