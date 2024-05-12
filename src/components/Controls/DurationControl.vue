<template>
  <div style="height: 100%">
    <q-btn
      no-caps
      flat
      @click="
        () => {
          showing = !showing;
        }
      "
      class="button-control flex items-center"
      :class="{
        active: controlDuration && controlDuration.length > 0,
      }"
    >
      <div class="flex items-center row no-wrap">
        <div
          class="close-icon-wrapper"
          v-if="controlDuration && controlDuration.length > 0"
          @click.stop="
            () => {
              controlDuration = [];
              menuShowing = false;
            }
          "
        >
          <q-icon style="font-size: 18px" name="mdi-close" />
        </div>
        <i class="las la-clock q-mr-sm q-ml-none q-pr-none" />

        <div class="button-label flex row items-center row no-wrap">
          <div>
            {{ $t('top_controls.select_duration') }}
          </div>
        </div>
      </div>
      <MenuWrapper :showing="showing" @hide="onHide()" @show="onShow()">
        <div
          class="flex row items-start"
          :class="$q.screen.lt.sm ? 'q-pb-xl' : undefined"
        >
          <div class="q-gutter-sm flex column q-pr-md q-pa-xs">
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
        </div>
      </MenuWrapper>
    </q-btn>
  </div>
</template>

<script>
import { useQueryStore } from 'src/stores/query';
import { mapWritableState } from 'pinia';
import MenuWrapper from './MenuWrapper.vue';

export default {
  components: {
    MenuWrapper,
  },
  data() {
    return {
      showing: false,
    };
  },
  methods: {
    onHide() {
      this.showing = false;
    },
    onShow() {
      this.showing = true;
    },
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
