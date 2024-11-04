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
      class="inter bold date-select"
      :class="{
        'text-h5': $q.screen.gt.sm,
        'text-h4': $q.screen.lt.sm,
        'text-large': $q.screen.lt.md,
        'dates-selected': !!controlDateRangeSelectedOption?.label,
      }"
      input-class="date-select-input"
      behavior="menu"
      :clearable="!!controlDateRangeSelectedOption?.label"
      :options="[]"
      :model-value="
        controlDateRangeSelectedOption?.label || $t(`nearby_view.any_dates`)
      "
      :hide-dropdown-icon="!!controlDateRangeSelectedOption?.label"
      @clear="clear"
    >
      <template v-slot:prepend v-if="false">
        <q-icon
          name="las la-calendar"
          :class="$q.screen.gt.sm ? ' q-pl-sm q-mr-xs' : 'q-pa-sm'"
          size="sm"
      /></template>
    </q-select>
    <DateControl :showing="showing" @hide="showing = false" />
  </div>
</template>

<script>
import { mapWritableState, mapActions } from 'pinia';

import _ from 'lodash';
import { useQueryStore } from 'src/stores/query';
import DateControl from 'src/components/Controls/DateControl.vue';
import { default as dayjs } from 'dayjs';

export default {
  components: { DateControl },
  props: {},
  data() {
    return {
      loading: false,
      showing: false,
    };
  },
  methods: {
    ...mapActions(useQueryStore, ['clearDateFilter']),
    clear() {
      this.clearDateFilter();
      this.showing = false;
    },
  },
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
  .date-select {
    :deep(.q-field__control) {
      &:before {
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.body--light {
  .date-select {
    :deep(.q-field__control) {
      &:before {
        border-bottom: 1px solid rgba(0, 0, 0, 0.2);
      }
    }
  }
}
.date-select {
  // font-family: 'logotype' !important;
  //text-transform: uppercase;
  :deep(.q-field__native) {
    font-weight: 800 !important;
    text-transform: capitalize;
    span {
      line-height: 1.2em;
    }
    .q-field__append {
      align-items: flex-end;
    }
  }
  :deep(.date-select-input) {
    font-weight: 800 !important;
    height: 42px;
  }

  font-weight: 900 !important;
  position: relative;
  // text-transform: uppercase;
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
  &.dates-selected {
    width: 150px;
    font-size: 1rem;
  }
}
</style>
