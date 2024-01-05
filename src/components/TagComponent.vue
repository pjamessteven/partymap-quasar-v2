<template>
  <div
    class="tag flex column"
    v-bind:class="{ disabled: disabled, selected: selected }"
    v-on:click="clickTag()"
  >
    <div class="tag-inner-wrapper flex">
      <div
        class="tag-inner flex row no-wrap align-center justify-center items-center"
      >
        <q-icon
          style="margin-left: -4px; font-size: 18px"
          name="mdi-close-circle q-mr-xs"
          v-if="selected"
        />
        <!--<i class="las la-hashtag"></i>-->
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
};
</script>

<style lang="scss" scoped>
.body--dark {
  .tag {
    background: $bi-3 !important;
    color: $ti-1 !important;
    .tag-inner-wrapper {
    }

    &:hover {
      background: $bi-4 !important;
      color: white !important;
    }
    &.selected {
      background: $b-1 !important;
      color: $t-1 !important;
      .tag-inner-wrapper {
        // background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.body--light {
  .tag {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;

    border: 1px solid rgba(0, 0, 0, 0.48);
    &:hover {
      background: $b-2 !important;
      box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 3px 0px;
    }
    .tag-inner-wrapper {
      //
    }
    &.selected {
      .tag-inner-wrapper {
        // background: rgb(230,230,230);
      }
    }
    &.hover {
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
  // margin-right: 5px;
  &:first-child {
    // margin-right: 0px;
  }
  // background: linear-gradient(135deg,   #a14ebf 0%, #5fb0b7 100%);
  // box-shadow: 0 0px 1px 1px #ffc299, 1px 1px 1px 0px #ff99c2;
  //box-shadow: 0 0.5em 1em -0.125em rgba(0,0,0, 0.1), 0 0px 0 1px rgba(0,0,0, 0.02);

  &.selected {
    //font-weight: 500;
  }
  .tag-inner-wrapper {
    //box-shadow: 0 0px 1px 1px #ffc299, 1px 1px 1px 1px #ff99c2;
    padding: 0px 6px;
    position: relative;
    transition: all 150ms ease-in-out;
    border-radius: 20px;

    .tag-inner {
      width: max-content;
      //background-color: rgba(0,0,0,0);
      //color: black;

      padding: 4px;
      //background: linear-gradient(135deg,   #ffc299 0%,    #ff99c2 100%);
      // border: 1px solid #ff99c2;
    }
  }
}
</style>
