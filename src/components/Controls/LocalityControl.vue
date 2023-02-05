<template>
  <div>
    <q-btn
      no-caps
      class="button-control flex items-center"
      :class="{
        active:
          controlSizeSelectedOptions && controlSizeSelectedOptions.length > 0,
      }"
    >
      <div class="flex items-center row no-wrap">
        <q-icon
          style="font-size: 18px"
          name="mdi-close-circle"
          class="q-pr-md"
          @click.stop="
            () => {
              controlSizeSelectedOptions = [];
              menuShowing = false;
            }
          "
          v-if="
            controlSizeSelectedOptions && controlSizeSelectedOptions.length > 0
          "
        />

        <i class="las la-map-marker q-mr-sm q-ml-none q-pr-none" />

        <div>
          {{ $t('top_controls.locality') }}
        </div>
        <!--
        <i
          class="q-select__dropdown-icon material-icons q-icon notranslate  q-mr-none q-pr-none"
          :class="{ 'rotate-180': menuShowing }"
        >
          arrow_drop_down
        </i>-->
      </div>
    </q-btn>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuShowing: false,
    };
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}
</style>
