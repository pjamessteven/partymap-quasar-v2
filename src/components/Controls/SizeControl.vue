<template>
  <div>
    <q-btn
      no-caps
      class="button-control flex items-center"
      :class="{
        active: controlSize && controlSize.length > 0,
      }"
    >
      <div class="flex items-center row no-wrap">
        <!--<q-icon left name="las la-calendar " />-->
        <q-icon
          style="font-size: 18px"
          name="mdi-close-circle"
          class="q-pr-md"
          @click.stop="
            () => {
              controlSize = [];
              menuShowing = false;
            }
          "
          v-if="controlSize && controlSize.length > 0"
        />

        <i class="las la-user-friends q-mr-sm q-ml-none q-pr-none" />

        <div>
          {{ $t('top_controls.select_size') }}
        </div>
        <!--
        <i
          class="q-select__dropdown-icon material-icons q-icon notranslate  q-mr-none q-pr-none"
          :class="{ 'rotate-180': menuShowing }"
        >
          arrow_drop_down
        </i>-->
      </div>
      <q-menu
        v-model="menuShowing"
        anchor="top middle"
        self="bottom middle"
        :offset="[0, 8]"
      >
        <div class="q-gutter-xs flex column q-pr-md q-pa-xs">
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
      </q-menu>
    </q-btn>
  </div>
</template>

<script>
import { mapWritableState } from 'pinia';
import { useQueryStore } from 'src/stores/query';
export default {
  components: {},
  props: {},
  data() {
    return {
      menuShowing: false,
    };
  },
  watch: {},
  methods: {},
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

@media only screen and (max-width: 1023px) {
}
</style>
