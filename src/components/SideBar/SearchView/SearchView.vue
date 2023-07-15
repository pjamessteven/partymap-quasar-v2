<template>
  <div class="search-view main-content flex column grow no-wrap">
    <!--
    <div class="sidebar-header" v-if="$q.screen.gt.xs">
      <div
        class="chicago text-h4 q-mt-md q-pl-md"
        :class="$q.screen.lt.sm ? ' ' : 'q-mb-sm'"
      >
        Search
      </div>
    </div>
    -->
    <div
      class="content flex column grow q-px-md"
      :class="$q.screen.gt.xs ? 'q-px-lg' : ''"
    >
      <div
        class="inter bolder t1"
        :class="$q.screen.lt.sm ? 'q-mt-md q-my-md' : ' q-my-lg  text-h6'"
      >
        Search results
      </div>
      <SearchResults
        class="q-pb-md"
        :search-results="searchResults"
        :search-location-results="locationSearchResults"
      />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import SearchResults from './SearchResults.vue';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { getSearchSuggestionsRequest } from 'src/api';
import { mapState, mapWritableState } from 'pinia';
import { useSearchStore } from 'src/stores/search';
import { useMainStore } from 'src/stores/main';
export default {
  components: { SearchResults },
  data() {
    return {
      searchResults: [],
      locationSearchResults: [],
    };
  },
  methods: {
    async search() {
      if (this.query?.length > 0) {
        const provider = new OpenStreetMapProvider();

        const [searchResultsResponse, locationSearchResponse] =
          await Promise.all([
            getSearchSuggestionsRequest({ query: this.query }),
            provider.search({ query: this.query }),
          ]);

        this.searchResults = searchResultsResponse.data.results;
        this.locationSearchResults = locationSearchResponse.map((res) => ({
          label: res.label,
          location: { lat: res.y, lng: res.x },
        }));
      }
    },
    clearSearchResults() {
      this.searchResults = [];
      this.locationSearchResults = [];
    },
  },
  watch: {
    query() {
      if (this.query?.length === 0) {
        this.clearSearchResults();
      } else this.debouncedSearch();
    },
  },
  computed: {
    ...mapWritableState(useSearchStore, ['query']),
    ...mapState(useMainStore, ['sidebarPanel']),
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
