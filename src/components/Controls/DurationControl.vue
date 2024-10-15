<template>
  <MenuWrapper :showing="showing" @hide="onHide()">
    <div
      class="flex row items-start"
      :class="$q.screen.lt.sm ? 'q-pb-xl' : undefined"
    >
      <div class="q-gutter-sm flex column q-pr-md q-pa-xs">
        <q-checkbox
          v-model="controlDuration"
          val="1"
          :label="$t('top_controls.one_day')"
        />
        <q-checkbox
          v-model="controlDuration"
          val="2"
          :label="$t('top_controls.two_days')"
        />
        <q-checkbox
          v-model="controlDuration"
          val="3"
          :label="$t('top_controls.three_days')"
        />
        <q-checkbox
          v-model="controlDuration"
          val="4"
          :label="$t('top_controls.four_days')"
        />
        <q-checkbox
          v-model="controlDuration"
          val="5"
          :label="$t('top_controls.five_days_plus')"
        />
      </div>
    </div>
  </MenuWrapper>
</template>

<script>
import { useQueryStore } from 'src/stores/query';
import { mapWritableState } from 'pinia';
import MenuWrapper from './MenuWrapper.vue';

export default {
  components: {
    MenuWrapper,
  },
  props: {
    showing: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {};
  },

  methods: {
    onHide() {
      this.$emit('hide');
    },
  },
  computed: {
    ...mapWritableState(useQueryStore, ['controlDuration']),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}
</style>
