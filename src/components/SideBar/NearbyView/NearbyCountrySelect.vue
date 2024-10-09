<template>
  <div
    class="flex"
    @click.capture="
      (event) => {
        inputValue = null;

        $refs.locationSelect.updateInputValue('', true);

        $nextTick(() => $refs.locationSelect.focus());

        event.stopPropagation();
        return false;
      }
    "
  >
    <transition
      leave-active-class="animated fadeOut"
      enter-active-class="animated fadeIn"
      mode="out-in"
    >
      <q-select
        style="min-width: 170px"
        :key="currentLocationCity"
        ref="locationSelect"
        class="text-h5 inter bold country-select"
        :input-style="$q.screen.gt.xs ? 'width: 169px;' : 'width: 250px'"
        input-class="country-select-input"
        behavior="menu"
        :class="
          (!query || query?.length === 0) && !currentLocationCity
            ? userLocationLoading
              ? 'loading-placeholder'
              : 'placeholder'
            : ''
        "
        :model-value="inputValue"
        :use-input="inputValue == null"
        @input-value="
          ($event) => {
            query = $event;
          }
        "
        :input-debounce="0"
        :hide-dropdown-icon="!inputValue"
        :options="locationSearchResults"
        @filter="locationSearchFilter"
        @update:model-value="setLocation($event)"
        :loading="userLocationLoading || loading"
        map-options
        @popup-show="
          () => {
            inputValue = null;

            $refs.locationSelect.updateInputValue('', true);

            $nextTick(() => $refs.locationSelect.focus());
            return false;
          }
        "
        v-on:focusout="
          () => {
            $refs.locationSelect.updateInputValue('', true);

            !inputValue || inputValue.length == 0
              ? (inputValue = userLocationCity)
              : undefined;
          }
        "
      >
      </q-select>
    </transition>
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
      inputValue: null,
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
      this.currentLocation = {
        lat: parseFloat(location.location.lat),
        lng: parseFloat(location.location.lng),
      };
      let labelParts = location.label.split(', ');
      this.currentLocationCountry = labelParts.pop();
      this.currentLocationCity = labelParts?.[0] || this.currentLocationCountry;
      this.currentLocationFromSearch = true;
    },
  },
  watch: {
    userLocationCity(newv, oldv) {
      if (oldv || (newv && !oldv)) {
        this.previouslySelectedCity = oldv;
        this.inputValue = newv;
      }
    },
    currentLocationCity(newv, oldv) {
      if (oldv || (newv && !oldv)) {
        this.previouslySelectedCity = oldv;
        this.inputValue = newv;
      }
    },
  },
  computed: {
    ...mapWritableState(useMainStore, [
      'userLocationLoading',
      'currentLocation',
      'userLocation',
      'currentLocationFromSearch',
      'userLocationCity',
      'userLocationCountry',
      'fineLocation',
      'currentLocationCity',
      'currentLocationCountry',
    ]),
  },
  created() {
    this.debouncedSearch = _.debounce(this.search, 300, {
      leading: false,
      trailing: true,
    });
    this.inputValue = this.userLocationCity;
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
    span {
      line-height: 1.2em;
    }
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
      top: 12px;
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
