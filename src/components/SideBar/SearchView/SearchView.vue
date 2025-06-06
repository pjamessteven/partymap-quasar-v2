<template>
  <div
    class="search-view main-content flex column grow no-wrap"
    :class="$q.screen.gt.xs ? 'q-px-lg ' : 'q-px-md'"
  >
    <SearchResults
      v-if="!loading"
      class="q-pb-md"
      :search-results="searchResults"
      :search-location-results="locationSearchResults"
      @closeDialog="$emit('closeDialog')"
    />
    <transition
      appear
      enter-active-class="animated fadeIn faster"
      leave-active-class="animated fadeOut faster"
    >
      <div
        style="height: 50%"
        v-if="
          searchResults?.length == 0 &&
          locationSearchResults?.length == 0 &&
          query?.length > 0 &&
          currentQuery === query &&
          !loading
        "
        class="flex justify-center items-center t3"
      >
        No results
      </div>
    </transition>
    <InnerLoading
      v-if="loading"
      :solid="false"
      :style="$q.screen.gt.xs ? 'height: 200px' : 'height: 50%'"
    />
  </div>
</template>

<script>
import _ from 'lodash';
import InnerLoading from 'src/components/InnerLoading.vue';
import SearchResults from './SearchResults.vue';
import { getSearchSuggestionsRequest } from 'src/api';
import { mapState, mapWritableState } from 'pinia';
import { useSearchStore } from 'src/stores/search';

export default {
  components: { SearchResults, InnerLoading },
  data() {
    return {
      loading: false,
      currentQuery: '',
    };
  },
  methods: {
    async search() {
      if (process.env.CLIENT) {
        import('leaflet-geosearch')
          .then(async ({ OpenStreetMapProvider }) => {
            if (this.query?.length > 0) {
              this.loading = true;
              const provider = new OpenStreetMapProvider();
              this.currentQuery = this.query;
              const [searchResultsResponse, locationSearchResponse] =
                await Promise.all([
                  getSearchSuggestionsRequest({ query: this.query }),
                  provider.search({ query: this.query }),
                ]);

              if (this.currentQuery === this.query) {
                //only set results if query hasn't changed
                this.searchResults = searchResultsResponse.data.results;
                this.locationSearchResults = locationSearchResponse.map(
                  (res) => ({
                    label: res.label,
                    location: { lat: res.y, lng: res.x },
                  }),
                );
              }
              this.loading = false;
            }
          })
          .catch((error) => {
            console.error('Error loading leaflet-geosearch:', error);
          });
      }
    },
    clearSearchResults() {
      this.searchResults = [];
      this.locationSearchResults = [];
    },
  },
  watch: {
    query() {
      this.clearSearchResults();

      if (this.query?.length > 0) {
        this.debouncedSearch();
      }
    },
  },
  computed: {
    ...mapWritableState(useSearchStore, [
      'query',
      'searchResults',
      'locationSearchResults',
    ]),
  },
  created() {
    this.debouncedSearch = _.debounce(this.search, 300, {
      leading: false,
      trailing: true,
    });
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
  overflow: auto;
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
@media only screen and (max-width: 599px) {
}
</style>
