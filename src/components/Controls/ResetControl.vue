<template>
  <q-btn
    no-caps
    class="button-control flex items-center"
    :class="anyControlFiltersEnabled ? 'active' : ''"
    @click="clearAllFilters"
  >
    Reset
  </q-btn>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { useQueryStore } from 'src/stores/query';
export default {2
  methods: {
    ...mapActions(useQueryStore, ['clearAllFilters']),
  },
  computed: {
    ...mapState(useQueryStore, ['anyControlFiltersEnabled']),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}

.reset-control {
  white-space: nowrap;
}

@media only screen and (max-width: 1023px) {
}
</style>
