<template>
  <div class="view-options flex justify-center items-center">
    <q-btn-dropdown
      class="inter semibold t3"
      flat
      no-caps
      label="View"
      :dropdown-icon="$q.screen.lt.sm ? 'mdi-dots-vertical' : undefined"
      no-icon-animation
    >
      <div class="row no-wrap q-pa-sm">
        <div class="column">
          <div class="t3 q-ma-sm">View options</div>
          <q-toggle v-model="compactView" label="Compact view" />
          <q-toggle
            v-if="showGroupByMonth"
            v-model="groupEventsByMonth"
            label="Group by Month"
          />
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
    showGroupByMonth: {
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
