<template>
  <div>
    <q-btn
      no-caps
      class="button-control flex items-center"
      :class="{
        active: controlDuration && controlDuration.length > 0,
      }"
    >
      <div class="flex items-center row no-wrap">
        <q-icon
          @click.stop="
            () => {
              controlDuration = [];
              menuShowing = false;
            }
          "
          style="font-size: 18px"
          name="mdi-close-circle"
          v-if="controlDuration && controlDuration.length > 0"
          class="q-pr-md"
        />
        <i class="las la-clock q-mr-sm q-ml-none q-pr-none" />

        <div>
          {{ $t('top_controls.select_duration') }}
        </div>
      </div>
      <q-menu
        transition-show="jump-down"
        transition-hide="jump-up"
        v-model="menuShowing"
        anchor="top middle"
        self="bottom middle"
        :offset="[0, 8]"
      >
        <div class="q-gutter-xs flex column q-pr-md q-pa-xs">
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
      </q-menu>
    </q-btn>
  </div>
</template>

<script>
import { useQueryStore } from 'src/stores/query';
import { mapWritableState } from 'pinia';

export default {
  data() {
    return {
      menuShowing: false,
    };
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
