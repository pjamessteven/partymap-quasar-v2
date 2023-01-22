<template>
  <q-select
    transition-show="none"
    transition-hide="none"
    dense
    v-model="sortMethod"
    map-options
    emit-value
    :behavior="'menu'"
    option-value="value"
    option-label="label"
    input-debounce="0"
    :options="sortMethodOptions"
    class="sort-control"
  >
    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents"
        v-on:click="clickOption(scope.opt.value)"
      >
        <q-item-section>
          <q-item-label v-html="scope.opt.description" />
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:prepend>
      <q-icon name="mdi-sort" class="q-mr-sm" />
    </template>
  </q-select>
</template>

<script>
export default {
  components: {},
  props: {},
  data () {
    return {
      sortMethodOptions: [
        {
          label: this.$t('top_controls.distance'),
          description: this.$t('top_controls.sort_by_distance'),
          value: 'distance'
        },
        {
          label: this.$t('top_controls.date'),
          description: this.$t('top_controls.sort_by_date'),
          value: 'date'
        }
      ]
    }
  },
  watch: {},
  methods: {},
  computed: {
    selectedDateRange: {
      get () {
        return this.$store.state.main.selectedDateRange
      },
      set (val) {
        this.$store.commit('main/setSelectedDateRange', val)
      }
    },
    sortMethod: {
      get () {
        return this.$store.state.main.sortMethod
      },
      set (val) {
        this.$store.commit('main/setSortMethod', val)
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
  .nav-input-date {
    // background: $bi-2;
    // opacity: 0.68;
  }
}
.body--light {
  .nav-input-date {
    // opacity: 0.68;

    // background: $b-1;
  }
}
.nav-input-date {
  border-radius: 9px;
}
.vc-border {
  border-width: 0px;
}

.q-field {
  pointer-events: auto;
}
// dont show select border

/deep/.q-field__control::after {
  border: none !important;
  border-width: 0px !important;
}
/deep/.q-field--outlined.q-field--focused .q-field__control::after {
  border: none !important;
  border-width: 0px !important;
}

.sort-control {
  /deep/.q-field__inner {
    padding: 0px;

    background-color: transparent;
    .q-field__control {
      opacity: 0.68;
      border: 0px;
      border-radius: 0px;
      background: transparent;
    }
    .q-field__control::before {
      border: none;
    }
  }
}

@media only (max-width: 1023px) {
}
</style>
