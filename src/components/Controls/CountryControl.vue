<template>
  <div
    class="select-control-wrapper"
    :class="{
      active: controlCountry != null,
    }"
  >
    <q-select
      borderless
      v-model="controlCountry"
      :options="countryOptions"
      option-value="short_name"
      option-label="long_name"
      :label="$t('list_view.country')"
      style="width: 150px"
      dense
      @input="onSelectCountry"
      :loading="countryOptionsLoading"
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
  components: {},
  props: {},
  data() {
    return {
      menuShowing: false,
    };
  },
  watch: {},
  methods: {
    ...mapActions(useQueryStore, ['loadCountries']),
    onSelectCountry() {
      this.controlRegion = null;
      this.controlLocality = null;
    },
  },
  computed: {
    ...mapWritableState(
      useQueryStore,
      'controlCountry',
      'controlRegion',
      'controlLocality'
    ),
    ...mapState(useQueryStore, 'countryOptions, countryOptionsLoading'),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}
</style>
