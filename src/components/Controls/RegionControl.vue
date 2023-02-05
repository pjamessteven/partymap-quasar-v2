<template>
  <div
    class="select-control-wrapper"
    :class="{
      active: controlCountrySelectedOption != null
    }"
  >
    <q-select
      borderless
      :disable="controlCountrySelectedOption == null"
      v-model="controlRegionSelectedOption"
      :options="
        controlCountrySelectedOption ? controlCountrySelectedOption.regions : []
      "
      option-value="short_name"
      option-label="long_name"
      :label="$t('list_view.region')"
      style="width: 150px"
      dense
      @input="onSelectRegion"
    >
      <template slot="prepend">
        <q-icon
          style=" font-size: 18px;"
          name="mdi-close-thick"
          class="q-pr-md"
          @click="controlRegionSelectedOption = null"
          v-if="controlRegionSelectedOption"
        />
      </template>
    </q-select>
  </div>
</template>

<script>
export default {
  components: {},
  props: {},
  data () {
    return {
      menuShowing: false
    }
  },
  watch: {},
  methods: {
    onSelectRegion () {
      this.controlLocalitySelectedOption = null
    }
  },
  computed: {
    localities () {
      return this.$store.state.main.localities
    },
    controlCountrySelectedOption: {
      get () {
        return this.$store.state.main.controlCountrySelectedOption
      },
      set (val) {
        this.$store.commit('main/setControlCountrySelectedOption', val)
      }
    },
    controlRegionSelectedOption: {
      get () {
        return this.$store.state.main.controlRegionSelectedOption
      },
      set (val) {
        this.$store.commit('main/setControlRegionSelectedOption', val)
      }
    },
    controlLocalitySelectedOption: {
      get () {
        return this.$store.state.main.controlLocalitySelectedOption
      },
      set (val) {
        this.$store.commit('main/setControlLocalitySelectedOption', val)
      }
    }
  },
  created () {},

  destroyed () {},
  beforeMount () {},
  mounted () {}
}
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}

.date-picker {
  border-radius: 0px !important;
  border-bottom-left-radius: 9px !important;
  border-bottom-rightradius: 9px !important;

  /deep/.vc-container {
  }
}

@media only (max-width: 1023px) {
}
</style>
