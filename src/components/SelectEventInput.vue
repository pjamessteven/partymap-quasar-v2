<template>
  <q-select
    option-label="name"
    style="max-width: 100%"
    ref="eventInput"
    :loading="loadingResults"
    outlined
    use-input
    menu-anchor="top left"
    menu-self="bottom left"
    v-model="selectValue"
    @update:model-value="onSelectItem"
    emit-value
    map-options
    :options="results"
    @filter="filterFn"
    :label="$t('add.search_for_event')"
  >
    <template v-slot:append>
      <q-icon name="search" class="q-pa-md" />
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            {{ scope.opt.name }}
            <span v-if="scope.opt.next_date?.start_naive"
              >({{
                localDay(
                  scope.opt.next_date.start_naive,
                  scope.opt.next_date.tz
                )
              }}
              {{
                localDate(
                  scope.opt.next_date.start_naive,
                  scope.opt.next_date.tz
                )
              }})</span
            >
          </q-item-label>
          <q-item-label caption>
            <span class="t2" v-if="scope.opt.description">
              {{ scope.opt.description.split(0, 50) }}...
            </span>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { getEventsRequest } from 'src/api';
import _ from 'lodash';
import common from 'assets/common';

export default {
  props: { mode: String, artists: Array, defaultDate: String, prefill: String },
  data() {
    return {
      results: null,
      loadingResults: false,
      selectValue: null,
    };
  },
  watch: {},
  created() {
    this.localDate = common.localDate;
    this.localDay = common.localDay;
  },
  mounted() {
    if (this.prefill) {
      this.$refs.eventInput.focus();
      this.$refs.eventInput.showPopup();
      this.$refs.eventInput.filter(this.prefill);
    }
  },
  methods: {
    onSelectItem(value) {
      this.$emit('event', value);
      this.results = [];
      this.selectValue = '';
    },
    filterFn(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      update(async () => {
        if (val === '') {
          this.results = [];
        } else {
          this.loadingResults = true;
          try {
            // if one of the below calls fails... both will.. :(
            const pmResponse = await getEventsRequest({
              query: val.replace(/[^a-z0-9]/gi, ' '),
              per_page: 20,
            });

            this.results = [...pmResponse.data.items];
            console.log(this.results);
            //this.$refs.musicBrainzInput.refresh();
            this.loadingResults = false;
          } catch {
            abort();
          }
        }
      });
    },
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
