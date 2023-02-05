<template>
  <q-btn
    no-caps
    class="button-control flex items-center"
    :class="showingAllEvents ? 'active' : ''"
    @click="clearFilters"
  >
    <div>{{ $t('top_controls.all_events') }}</div>
  </q-btn>
</template>

<script>
export default {
  components: {},
  props: {},
  data () {
    return {}
  },
  watch: {},
  methods: {
    clearFilters () {
      this.controlDateSelectedOption = { value: null }
      this.$store.commit('main/toggleTagSelection', null)
    }
  },
  computed: {
    showingAllEvents () {
      if (
        this.controlDateSelectedOption &&
        this.controlDateSelectedOption.value == null &&
        (!this.selectedTags || this.selectedTags.length === 0)
      ) {
        return true
      } else {
        return false
      }
    },
    selectedTags () {
      return this.$store.state.main.selectedTags
    },
    controlDateSelectedOption: {
      get () {
        return this.$store.state.main.controlDateSelectedOption
      },
      set (val) {
        this.$store.commit('main/setControlDateSelectedOption', val)
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

.reset-control {
  white-space: nowrap;
}

@media only (max-width: 1023px) {
}
</style>
