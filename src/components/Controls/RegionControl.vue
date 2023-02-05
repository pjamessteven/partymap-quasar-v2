<template>
  <div
    class="select-control-wrapper"
    :class="{
      active: controlCountry != null,
    }"
  >
    <q-select
      borderless
      v-model="controlRegion"
      :options="countryOptions"
      option-value="short_name"
      option-label="long_name"
      :label="$t('list_view.country')"
      style="width: 150px"
      dense
      @input="onSelect"
      :loading="regionOptionsLoading"
    >
      <template v-slot:prepend>
        <q-icon
          style="font-size: 18px"
          name="mdi-close-circle"
          class="q-pr-md"
          @click="controlCountry = null"
          v-if="controlCountry"
        />
      </template>
    </q-select>
  </div>
</template>

<script>
import { mapActions, mapWritableState } from 'pinia';
import { useQueryStore } from 'src/stores/query';
export default {
  data() {
    return {
      menuShowing: false,
    };
  },
  watch: {},
  methods: {
    ...mapActions(useQueryStore, ['loadRegions']),
    onSelect() {
      this.controlLocality = null;
    },
  },
  computed: {
    ...mapWritableState(useQueryStore, 'controlRegion', 'controlLocality'),
    ...mapState(useQueryStore, 'regionOptions, regionOptionsLoading'),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}
</style>
