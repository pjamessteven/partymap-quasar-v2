<template>
  <MenuWrapper :showing="showing" @hide="onHide()">
    <div
      class="q-gutter-sm flex column q-pr-md q-pa-xs"
      :class="$q.screen.lt.sm ? 'q-py-sm q-pb-xl' : ''"
    >
      <q-checkbox
        v-model="controlSize"
        val="0,1000"
        :label="$t('top_controls.less_than_one_thousand')"
      />
      <q-checkbox
        v-model="controlSize"
        val="1000,5000"
        :label="'1000 - 5000 ' + $t('top_controls.people')"
      />
      <q-checkbox
        v-model="controlSize"
        val="5000,20000"
        :label="'5000 - 20,000 ' + $t('top_controls.people')"
      />
      <q-checkbox
        v-model="controlSize"
        val="20000,50000"
        :label="'20,000 - 50,000 ' + $t('top_controls.people')"
      />

      <q-checkbox
        v-model="controlSize"
        val="50000,200000"
        :label="$t('top_controls.more_than_fifty_thousand')"
      />
    </div>
  </MenuWrapper>
</template>

<script>
import { mapWritableState } from 'pinia';
import { useQueryStore } from 'src/stores/query';
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
  watch: {},
  methods: {
    onHide() {
      this.$emit('hide');
    },
  },
  computed: {
    ...mapWritableState(useQueryStore, ['controlSize']),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}

@media only screen and (max-width: 599px) {
}
</style>
