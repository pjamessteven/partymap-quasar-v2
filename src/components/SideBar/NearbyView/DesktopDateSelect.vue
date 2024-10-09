<template>
  <div
    class="flex"
    @click.capture="
      (event) => {
        this.showing = true;
      }
    "
  >
    <q-select
      ref="dateSelect"
      class="text-h5 inter bold date-select"
      input-class="date-select-input"
      behavior="menu"
      :options="[]"
      :model-value="controlDateRangeSelectedOption?.label || 'Any Dates'"
      :hide-dropdown-icon="!!controlDateRange?.label"
    >
    </q-select>
    <DateControl :showing="showing" @hide="showing = false" />
  </div>
</template>

<script>
import { mapWritableState } from 'pinia';

import _ from 'lodash';
import { useQueryStore } from 'src/stores/query';
import DateControl from 'src/components/Controls/DateControl.vue';
export default {
  components: { DateControl },
  props: {},
  data() {
    return {
      loading: false,
      showing: false,
    };
  },
  methods: {},
  watch: {},
  computed: {
    ...mapWritableState(useQueryStore, [
      'controlDateRange',
      'controlDateRangeSelectedOption',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
.date-select {
  :deep(.q-field__native) {
    font-weight: 800 !important;
    span {
      line-height: 1.2em;
    }
  }
  :deep(.date-select-input) {
    font-weight: 800 !important;
    height: 42px;
  }

  font-weight: 800 !important;
  position: relative;
  &.placeholder {
    &::before {
      z-index: 2;
      position: absolute;
      left: 0px;
      top: 8px;
      height: 100%;
      width: 100%;
      content: 'Search places';
      // color: grey;
      font-weight: 800;
    }
  }
  &.loading-placeholder {
    &::before {
      opacity: 0.68;
      z-index: 2;
      position: absolute;
      left: 0px;
      top: 8px;
      height: 100%;
      width: 100%;
      content: '...';
      // color: grey;
      font-weight: 800;
    }
  }
}
</style>
