<template>
  <div
    class="tag flex row no-wrap align-center justify-center"
    :class="{
      disabled,
      selected,
      small,
      outlined,
      shadow,
      'no-interaction': noInteraction,
    }"
  >
    <q-icon
      style="margin-left: -4px; font-size: 18px"
      name="mdi-minus-circle q-mr-sm"
      v-if="showIcons && selected"
    />
    <q-icon
      style="margin-left: -4px; font-size: 18px"
      name="mdi-plus-circle q-mr-xs"
      v-if="showIcons && !selected"
    />
    <div>{{ value }}</div>
    <div v-if="count">&nbsp;({{ count }})</div>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    value: String,
    disabled: Boolean,
    count: String,
    selected: Boolean,
    showIcons: Boolean,
    small: Boolean,
    noInteraction: Boolean,
    outlined: Boolean,
    shadow: Boolean,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {},
  computed: {},
};
</script>

<style lang="scss" scoped>
.body--dark {
  .tag {
    background: $bi-3;
    color: $ti-1;

    &:hover {
      background: $bi-4;
      color: white;
    }
    &.selected {
      //  background: $bi-4 !important;
      color: $ti-1 !important;
    }
    &.outlined {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}

.body--light {
  .tag {
    //box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
    background: $b-2;
    &:hover {
      background: $b-2;
      // box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 3px 0px;
    }
    &.outlined {
      background: transparent;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    &.shadow {
      background: white;
      box-shadow:
        rgba(14, 63, 126, 0.03) 0px 0px 0px 1px,
        rgba(42, 51, 70, 0.03) 0px 1px 1px -0.5px,
        rgba(42, 51, 70, 0.04) 0px 2px 2px -1px,
        rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px,
        rgba(42, 51, 70, 0.03) 0px 5px 5px -2.5px,
        rgba(42, 51, 70, 0.03) 0px 10px 10px -5px,
        rgba(42, 51, 70, 0.03) 0px 24px 24px -8px;
    }
    &.disabled {
      background: $b-3;
    }
  }
}

.tag {
  position: relative;
  cursor: pointer;
  display: flex;
  width: max-content;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  transition: all 0.3s;
  padding: 6px 12px;

  &.selected {
    background: $primary !important;
    color: $ti-1 !important;
    &:hover {
      filter: brightness(1.1);
    }
  }

  &.small {
    padding: 3px 8px;
    font-size: small;
  }
  &.disabled {
    opacity: 0.67;
    pointer-events: none;
    cursor: default;
  }
  &.no-interaction {
    pointer-events: none;
    cursor: default;
  }
}
</style>
