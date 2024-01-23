<template>
  <div
    class="tag flex column"
    :class="{ disabled: disabled, selected: selected }"
    @click="clickTag()"
  >
    <div class="tag-inner-wrapper flex">
      <div
        class="tag-inner flex row no-wrap align-center justify-center items-center"
      >
        <q-icon
          style="margin-left: -4px; font-size: 18px"
          name="mdi-minus-circle q-mr-xs"
          v-if="showIcons && selected"
        />
        <q-icon
          style="margin-left: -4px; font-size: 18px"
          name="mdi-plus-circle q-mr-xs"
          v-if="showIcons && !selected"
        />
        <div>{{ value }}</div>
        <div v-if="count">&nbsp;({{ count }})</div>
      </div>
    </div>
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
  },
  data() {
    return {
      loading: false,
      tagClicked: false,
    };
  },
  methods: {
    clickTag() {
      this.$emit('selected', this.value);
    },
  },
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
  }
}

.body--light {
  .tag {
    //box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    &:hover {
      background: $b-2;
      // box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 3px 0px;
    }
  }
}

.disabled {
  opacity: 0.67 !important;
  pointer-events: none;
  cursor: default;
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
  &.selected {
    background: $primary !important;
    color: $ti-1 !important;
    &:hover {
      filter: brightness(1.1);
    }
  }
  .tag-inner-wrapper {
    padding: 6px 12px;

    position: relative;
    transition: all 150ms ease-in-out;
    border-radius: 20px;
    .tag-inner {
      width: max-content;
      //  padding: 4px;
    }
  }
}
</style>
