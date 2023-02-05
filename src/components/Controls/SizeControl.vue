<template>
  <div>
    <q-btn
      no-caps
      class="button-control flex items-center "
      :class="{
        active:
          controlSizeSelectedOptions && controlSizeSelectedOptions.length > 0,
      }"
    >
      <div class="flex items-center row no-wrap">
        <!--<q-icon left name="las la-calendar " />-->
        <q-icon
          style=" font-size: 18px;"
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

        <i class="las la-user-friends q-mr-sm q-ml-none q-pr-none" />

        <div>
          {{ $t("top_controls.select_size") }}
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
            v-model="controlSizeSelectedOptions"
            val="0,1000"
            :label="$t('top_controls.less_than_one_thousand')"
          />
          <q-checkbox
            v-model="controlSizeSelectedOptions"
            val="1000,5000"
            :label="'1000 - 5000 ' + $t('top_controls.people')"
          />
          <q-checkbox
            v-model="controlSizeSelectedOptions"
            val="5000,20000"
            :label="'5000 - 20,000 ' + $t('top_controls.people')"
          />
          <q-checkbox
            v-model="controlSizeSelectedOptions"
            val="20000,50000"
            :label="'20,000 - 50,000 ' + $t('top_controls.people')"
          />
          <q-checkbox
            v-model="controlSizeSelectedOptions"
            val="50000,200000"
            :label="$t('top_controls.more_than_fifty_thousand')"
          />
        </div>
      </q-menu>
    </q-btn>
  </div>
</template>

<script>
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
    controlSizeSelectedOptions: {
      get() {
        return this.$store.state.main.controlSizeSelectedOptions;
      },
      set(val) {
        this.$store.commit("main/setControlSizeSelectedOptions", val);
      },
    },
  },
  created() {},

  destroyed() {},
  beforeMount() {},
  mounted() {},
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}

@media only (max-width: 1023px) {
}
</style>
