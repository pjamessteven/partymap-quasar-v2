<template>
  <div style="height: 100%">
    <q-btn
      flat
      no-caps
      @click="
        () => {
          showing = !showing;
        }
      "
      class="button-control flex items-center"
      :class="{
        active: controlSize && controlSize.length > 0,
      }"
    >
      <div class="flex items-center row no-wrap">
        <div
          class="close-icon-wrapper"
          v-if="controlSize && controlSize.length > 0"
          @click.stop="
            () => {
              controlSize = [];
              menuShowing = false;
            }
          "
        >
          <q-icon style="font-size: 18px" name="mdi-close" />
        </div>
        <i class="las la-user-friends q-mr-sm q-ml-none q-pr-none" />

        <div class="button-label flex row items-center row no-wrap">
          <div>
            {{ $t('top_controls.select_size') }}
          </div>
        </div>
      </div>
      <MenuWrapper :showing="showing" @hide="onHide()" @show="onShow()">
        <div
          class="q-gutter-sm flex column q-pr-md q-pa-xs"
          :class="$q.screen.lt.sm ? 'q-py-sm q-pb-xl' : ''"
        >
          <q-checkbox
            v-model="controlSize"
            val="0,1000"
            :label="$t('top_controls.less_than_one_thousand')"
          />
          <q-checkbox
            v-model="controlSize"
            val="1000,5000"
            :label="'1000 - 5000 ' + $t('top_controls.people')"
          />
          <q-checkbox
            v-model="controlSize"
            val="5000,20000"
            :label="'5000 - 20,000 ' + $t('top_controls.people')"
          />
          <q-checkbox
            v-model="controlSize"
            val="20000,50000"
            :label="'20,000 - 50,000 ' + $t('top_controls.people')"
          />

          <q-checkbox
            v-model="controlSize"
            val="50000,200000"
            :label="$t('top_controls.more_than_fifty_thousand')"
          />
        </div>
      </MenuWrapper>
    </q-btn>
  </div>
</template>

<script>
import { mapWritableState } from 'pinia';
import { useQueryStore } from 'src/stores/query';
import MenuWrapper from './MenuWrapper.vue';

export default {
  components: {
    MenuWrapper,
  },
  props: {},
  data() {
    return {
      showing: false,
    };
  },
  watch: {},
  methods: {
    onHide() {
      this.showing = false;
    },
    onShow() {
      this.showing = true;
    },
  },
  computed: {
    ...mapWritableState(useQueryStore, ['controlSize']),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}

@media only screen and (max-width: 599px) {
}
</style>
