<template>
  <div
    class="flex"
    @click.capture="
      (event) => {
        if (userLocationCity) {
          userLocationCity = null;

          $refs.locationSelect.updateInputValue('', true);

          $nextTick(() => $refs.locationSelect.focus());

          event.stopPropagation();
          return false;
        }
      }
    "
  >
    <q-select
      ref="locationSelect"
      class="text-h4 inter bold country-select"
      :input-style="$q.screen.gt.xs ? 'width: 300px;' : 'width: 250px'"
      input-class="country-select-input"
      behavior="menu"
      :class="
        (!query || query?.length === 0) && !userLocationCity
          ? userLocationLoading
            ? 'loading-placeholder'
            : 'placeholder'
          : ''
      "
      :model-value="userLocationCity"
      :use-input="userLocationCity == null"
      @input-value="
        ($event) => {
          query = $event;
        }
      "
      :hide-dropdown-icon="!userLocationCity"
      :options="locationSearchResults"
      @filter="locationSearchFilter"
      @update:model-value="setLocation($event)"
      :loading="userLocationLoading || loading"
      map-options
      @popup-show="
        () => {
          if (userLocationCity) {
            userLocationCity = null;

            $refs.locationSelect.updateInputValue('', true);

            $nextTick(() => $refs.locationSelect.focus());
            return false;
          }
        }
      "
      v-on:focusout="
        () => {
          $refs.locationSelect.updateInputValue('', true);

          !userLocationCity || userLocationCity.length == 0
            ? (userLocationCity = previouslySelectedCity)
            : undefined;
        }
      "
    >
    </q-select>
  </div>
</template>

<script>
import { mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import _ from 'lodash';
export default {
  props: {},
  data() {
    return {
      locationSearchResults: [],
      query: '',
      loading: false,
      selectedLocation: {},
      previouslySelectedPlace: this.userLocationCity,
    };
  },
  methods: {
    async search(query) {
      if (query?.length > 0) {
        this.loading = true;
        const providerCity = new OpenStreetMapProvider({
          params: {
            limit: 5,
            featureType: 'city',
          },
        });
        const providerCountry = new OpenStreetMapProvider({
          params: { limit: 3, format: 'geocodejson', featureType: 'country' },
        });
        const [citySearchResponse, countrySearchResponse] = await Promise.all([
          providerCity.search({ query }),
          providerCountry.search({ query }),
        ]);

        console.log('results', citySearchResponse, countrySearchResponse);
        const combinedSearchResults = [
          ...countrySearchResponse,
          ...citySearchResponse,
        ];
        this.locationSearchResults = combinedSearchResults.map((res) => ({
          label: res.label,
          location: { lat: res.y, lng: res.x },
        }));

        this.loading = false;
      }
    },
    async locationSearchFilter(query, update, abort) {
      if (query) {
        this.locationSearchResults = [];
        await this.debouncedSearch(query);
        update();
      } else {
        abort();
      }
    },
    clearSearchResults() {
      this.searchResults = [];
      this.locationSearchResults = [];
    },
    setLocation(location) {
      this.$refs.locationSelect.blur();
      this.userLocation = {
        lat: parseFloat(location.location.lat),
        lng: parseFloat(location.location.lng),
      };
      let labelParts = location.label.split(', ');
      this.userLocationCountry = labelParts.pop();
      this.userLocationCity = labelParts?.[0] || this.userLocationCountry;
      this.userLocationFromSearch = true;
    },
  },
  watch: {
    userLocationCity(newv, oldv) {
      if (oldv || (newv && !oldv)) {
        this.previouslySelectedCity = oldv;
      }
    },
  },
  computed: {
    ...mapWritableState(useMainStore, [
      'userLocationLoading',
      'userLocation',
      'userLocationFromSearch',
      'userLocationCity',
      'userLocationCountry',
      'fineLocation',
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
}

.body--light {
}
.country-select {
  :deep(.q-field__native) {
    font-weight: 800 !important;
  }
  :deep(.country-select-input) {
    font-weight: 800 !important;
    height: 42px;
  }

  font-weight: 800 !important;
  position: relative;
  &.placeholder {
    &::before {
      z-index: 2;
      position: absolute;
      left: 0px;
      top: 8px;
      height: 100%;
      width: 100%;
      content: 'Search places';
      // color: grey;
      font-weight: 800;
    }
  }
  &.loading-placeholder {
    &::before {
      opacity: 0.68;
      z-index: 2;
      position: absolute;
      left: 0px;
      top: 8px;
      height: 100%;
      width: 100%;
      content: '...';
      // color: grey;
      font-weight: 800;
    }
  }
}
</style>
