<template>
  <div class="search-view flex column grow no-wrap">
    <div class="sidebar-header">
      <div
        class="chicago text-h4 q-mt-md q-pl-md"
        :class="$q.screen.lt.sm ? ' ' : 'q-mb-sm'"
      >
        Search
      </div>
    </div>
    <div class="content flex column grow q-px-md q-pt-md">
      <div
        class="chicago text-large t2 q-mt-sm"
        :class="$q.screen.lt.sm ? 'q-mt-md ' : ' '"
      >
        Events, artists, places & more:
      </div>
      <div
        class="flex row no-wrap searchbar-wrapper justify-stretch q-mt-sm q-mb-md"
      >
        <q-input
          ref="search"
          debounce="300"
          clearable
          rounded
          dense
          outlined
          class="searchbar-input grow chicago q-mt-sm"
          v-model="query"
          @keyup.enter="search"
        >
          <template v-slot:prepend>
            <q-icon name="mdi-magnify" class="q-my-md" />
          </template>
        </q-input>
      </div>
      <SearchResults class="q-pb-md" />
    </div>
  </div>
</template>

<script>
import SearchResults from './SearchResults.vue';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { getSearchSuggestionsRequest } from 'src/api';
export default {
  components: { SearchResults },
  data() {
    return {
      searchResults: [],
      searchLocationReslults: [],
    };
  },
  methods: {
    async search() {
      this.$refs.search.blur();
      const provider = new OpenStreetMapProvider();

      const [searchResultsResponse, locationSearchResponse] = await Promise.all(
        [
          getSearchSuggestionsRequest({ query: this.query })(),
          provider.search({ query: this.query }),
        ]
      );

      this.searchResults = searchResultsResponse.data.results;
      this.locationSearchResults = locationSearchResponse.map((res) => ({
        label: res.label,
        location: { lat: res.y, lng: res.x },
      }));
    },
  },
  watch: {},
  computed: {},
  mounted() {
    setTimeout(() => {
      // mobile hack
      // Align temp input element approximately where the input element is
      // so the cursor doesn't jump around
      if (this.$q.screen.gt.xs) {
        this.$refs.search.focus();
      }
    }, 300);
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .searchbar-input {
    :deep(.q-field__inner) {
      .q-field__control {
        &::before {
          //border-color: rgba(0, 0, 0, 0);'
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
}

.search-view {
  height: 100%;
}
.searchbar-input {
  :deep(.q-field__inner) {
    .q-field__control {
      &::before {
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
    }
  }
}
@media only screen and (max-width: 600px) {
}
</style>
