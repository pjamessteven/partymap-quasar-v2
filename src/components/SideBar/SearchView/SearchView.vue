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
    <div class="content flex column grow q-px-md">
      <div
        class="inter bold text-large t2"
        :class="$q.screen.lt.sm ? 'q-mt-md ' : ' q-mt-lg'"
      >
        Places, events, artists & more:
      </div>
      <div
        class="flex row no-wrap searchbar-wrapper justify-stretch q-mt-sm q-mb-md"
      >
        <q-input
          ref="search"
          clearable
          @clear="clearSearchResults"
          rounded
          dense
          outlined
          class="searchbar-input grow chicago q-mt-sm"
          v-model="query"
          @keyup.enter="() => $refs.search.blur()"
        >
          <template v-slot:prepend>
            <q-icon name="mdi-magnify" class="q-my-md" />
          </template>
        </q-input>
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
    autofocusInput() {
      // don't auto focus input on mobile
      // because it's annoying when the keyboard pops up without being summoned
      if (this.$q.screen.gt.xs) {
        // use timeout to wait until tab transition finishes
        setTimeout(() => {
          this.$refs.search.focus();
        }, 300);
      }
    },
  },
  watch: {
    query() {
      if (this.query?.length === 0) {
        this.clearSearchResults();
      } else this.debouncedSearch();
    },
    sidebarPanel(newVal, oldVal) {
      if (newVal === 'search') {
        // switched to search tab
        this.autofocusInput();
      }
    },
  },
  computed: {
    ...mapWritableState(useSearchStore, ['query']),
    ...mapState(useMainStore, ['sidebarPanel']),
  },
  mounted() {
    this.autofocusInput();
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
