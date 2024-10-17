<template>
  <div
    class="flex items-center"
    @click.capture="
      (event) => {
        this.showing = true;
      }
    "
  >
    <q-icon v-if="iconName" :name="iconName" class="q-mr-sm q-pr-xs" />
    <q-select
      ref="controlSelect"
      class="inter bold control-select"
      :class="{
        'text-h5': size == 'md',
        'text-h4': size == 'lg',
        'text-large small': size == 'sm',
        small: size == 'xs',
      }"
      input-class="control-select-input"
      behavior="menu"
      :clearable="isClearable"
      :options="[]"
      :model-value="label"
      :dense="size == 'sm' || size == 'xs'"
      :hide-dropdown-icon="!label"
      @clear="$emit('clear')"
    >
    </q-select>
    <slot :showing="showing" :hide="() => (showing = false)" />
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  components: {},
  props: {
    label: { type: String, default: '' },
    size: { type: String, default: 'md' },
    iconName: { type: String, default: null },
  },
  data() {
    return {
      showing: false,
    };
  },
  methods: {},
  watch: {},
  computed: {},
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
.control-select {
  :deep(.q-field__native) {
    font-weight: 800 !important;
    span {
      line-height: 1.2em;
    }
  }
  :deep(.control-select-input) {
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

  &.small {
    :deep(.q-field__native) {
      font-weight: 700 !important;
      span {
        line-height: 1.2em;
      }
    }
    :deep(.control-select-input) {
      font-weight: 700 !important;
      height: 42px;
    }
    &.placeholder {
      &::before {
        font-weight: 700;
      }
    }
    &.loading-placeholder {
      &::before {
        font-weight: 700;
      }
    }
  }
}
</style>
