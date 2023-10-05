<template>
  <q-card class="dialog-card edit-card">
    <q-card-section class="flex items-center dialog-card-header">
      <div class="text-h6">{{ $t('suggestions.artists') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="flex column no-wrap q-mt-sm dialog-card-content">
      <div class="t3 q-mb-md">{{ $t('suggestions.artists_msg') }}</div>
      <SelectArtistsComponent
        class="select-artists"
        @hideDialog="$emit('hideDialog')"
        :defaultDate="defaultDate"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import SelectArtistsComponent from './SelectArtistsComponent.vue';

export default {
  components: {
    SelectArtistsComponent,
  },
  props: { defaultDate: String },
  data() {
    return {};
  },
  watch: {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}
.select-artists {
  min-width: 400px;
}

@media only screen and (max-width: 600px) {
  .select-artists {
    min-width: unset;
  }
}
</style>
