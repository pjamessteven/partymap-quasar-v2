<template>
  <div class="view-options flex justify-center items-center">
    <q-btn-dropdown
      :label="$q.screen.gt.xs && 'View Options'"
      class="chicago t3"
      flat
      :dropdown-icon="$q.screen.lt.sm && 'mdi-dots-vertical'"
      :no-icon-animation="$q.screen.lt.sm"
    >
      <div class="row no-wrap q-pa-md">
        <div class="column">
          <div class="text-large chicago t3 q-mb-md" v-if="$q.screen.lt.sm">
            View options
          </div>
          <q-toggle v-model="compactView" label="Compact view" />
          <q-toggle v-model="groupEventsByMonth" label="Group by Month" />
        </div>
      </div>
    </q-btn-dropdown>
  </div>
</template>

<script>
import { mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';

export default {
  components: {},
  props: {
    solid: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapWritableState(useMainStore, ['compactView', 'groupEventsByMonth']),
  },
};
</script>

<style lang="scss" scoped>
.body--light {
}
.body--dark {
}
.view-options {
}
</style>
