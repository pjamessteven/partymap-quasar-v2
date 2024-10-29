<template>
  <q-select
    option-label="name"
    style="max-width: 100%"
    ref="musicBrainzInput"
    :loading="loadingResults"
    outlined
    use-input
    menu-anchor="top left"
    menu-self="bottom left"
    v-model="selectValue"
    @update:model-value="onSelectArtist"
    emit-value
    map-options
    :options="results"
    @filter="filterFn"
    :label="$t('event_dates.search_for_artists')"
  >
    <template v-slot:append>
      <q-icon name="search" class="q-pa-md" />
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            {{ scope.opt.name }}
            <span v-if="scope.opt.newRecord"
              >({{ $t('event_dates.create_new_record') }})</span
            >
          </q-item-label>
          <q-item-label caption>
            {{ scope.opt.disambiguation }}
            <span v-if="scope.opt.area && scope.opt.area.name">
              ({{ scope.opt.area.name }})
            </span>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { getMusicBrainzArtist, getArtistsRequest } from 'src/api';
import _ from 'lodash';

export default {
  props: { artists: Array, prefill: String },
  data() {
    return {
      results: [],
      loadingResults: false,
      selectValue: null,
      artistsList: [],
      listToAdd: null,
      lists: [],
      selectedList: null,
    };
  },
  watch: {},
  mounted() {
    if (this.prefill) {
      console.log(this.prefill);
      this.$refs.musicBrainzInput.focus();
      this.$refs.musicBrainzInput.showPopup();
      this.$refs.musicBrainzInput.filter(this.prefill);
    }
  },
  methods: {
    onSelectArtist(value) {
      this.$emit('selectedArtist', value);
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
            const [pmResponse, mbResponse] = await Promise.all([
              getArtistsRequest({
                query: val,
                page: 1,
                sort: 'event_count',
                desc: true,
                per_page: 5,
              }),
              getMusicBrainzArtist(val),
            ]);
            let mappedResponse = mbResponse.data.artists
              .map(({ id, ...rest }) => ({ ...rest, mbid: id }))
              .filter(
                (x) =>
                  pmResponse.data.items.findIndex((y) => y.mbid === x.mbid) ===
                  -1
              );
            this.results = [
              ...[{ name: val, newRecord: true }],
              ...pmResponse.data.items,
              ...mappedResponse,
            ];
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
