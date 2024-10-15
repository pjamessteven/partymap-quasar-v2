<template>
  <div class="controls-wrapper flex no-wrap q-ml-sm">
    <div class="controls-wrapper-inner">
      <q-btn
        no-caps
        @click="
          () => {
            showing = !showing;
          }
        "
        class="button-control flex items-center"
        :class="{
          active: isActive,
        }"
      >
        <div class="flex items-center row no-wrap">
          <div
            class="close-icon-wrapper"
            v-if="isActive"
            @click.stop="$emit('clear')"
          >
            <q-icon style="font-size: 16px" name="mdi-close" />
          </div>

          <q-icon
            class="q-mr-sm"
            :size="iconSize || '1.5em'"
            :name="iconName"
            v-if="!isActive"
          />

          <div class="button-label flex row items-center row no-wrap">
            {{ label }}
          </div>
          <q-icon
            v-if="$q.screen.gt.xs && false"
            class="q-ml-xs"
            size="1.4em"
            name="mdi-menu-down"
            style="margin-right: -8px"
          />
        </div>
        <slot :showing="showing" :hide="() => (showing = false)" />
      </q-btn>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    isActive: {
      default: false,
      type: Boolean,
    },
    showSelectedValue: {
      default: false,
      type: Boolean,
    },
    label: {
      type: String,
    },
    iconName: {
      type: String,
    },
    iconSize: {
      type: String,
    },
  },
  data() {
    return {
      showing: false,
    };
  },
  watch: {},
  methods: {},
  computed: {},
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}

@media only screen and (max-width: 599px) {
  .body--dark {
  }
  .body--light {
  }
}
</style>
