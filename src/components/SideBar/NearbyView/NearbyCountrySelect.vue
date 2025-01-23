<template>
  <div
    class="country-select flex ellipsis"
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
        :key="currentLocationCity"
        ref="locationSelect"
        class="select inter bold"
        :input-style="$q.screen.gt.xs ? 'width: 169px;' : 'width: 250px'"
        input-class="country-select-input"
        behavior="menu"
        :borderless="$q.screen.gt.sm"
        :class="{
          'loading-placeholder':
            (!query || query?.length === 0) &&
            !currentLocationCity &&
            userLocationLoading,
          placeholder:
            (!query || query?.length === 0) &&
            !currentLocationCity &&
            !userLocationLoading,
          'text-h5': $q.screen.gt.sm,
          'text-h4': $q.screen.lt.md,
        }"
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
            // inputValue = null;

            // $refs.locationSelect.updateInputValue('', true);

            $nextTick(() => $refs.locationSelect.focus());
            return false;
          }
        "
        v-on:focusout="
          () => {
            $refs.locationSelect.updateInputValue('', true);

            !inputValue || inputValue.length == 0
              ? (inputValue = currentLocationCity)
              : undefined;
          }
        "
      >
        <template v-slot:prepend v-if="false">
          <router-link
            :to="{ name: 'Explore' }"
            style="text-decoration: none; color: inherit"
          >
            <q-btn
              flat
              :class="$q.screen.gt.sm ? 'q-pa-md' : 'q-pa-sm'"
              style="border-radius: 100px !important"
            >
              <template v-slot:default>
                <q-icon size="sm" name="mdi-crosshairs" />
              </template>
            </q-btn> </router-link
        ></template>
      </q-select>
    </transition>
  </div>
</template>

<script>
import { mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';

import _ from 'lodash';
export default {
  props: { size: { type: String, default: 'md' } },
  data() {
    return {
      locationSearchResults: [],
      query: '',
      loading: false,
      inputValue: null,
      selectedLocation: {},
      previouslySelectedPlace: this.currentLocationCity,
    };
  },
  methods: {
    async search(query) {
      console.log(process.env.CLIENT);
      if (process.env.CLIENT) {
        import('leaflet-geosearch')
          .then(async ({ OpenStreetMapProvider }) => {
            if (query?.length > 0) {
              this.loading = true;
              const providerCity = new OpenStreetMapProvider({
                params: {
                  limit: 5,
                  'accept-language': this.languagePref,
                },
              });
              const providerCountry = new OpenStreetMapProvider({
                params: {
                  limit: 3,
                  format: 'geocodejson',
                  featureType: 'country',
                },
              });
              const [citySearchResponse, countrySearchResponse] =
                await Promise.all([
                  providerCity.search({ query }),
                  providerCountry.search({ query }),
                ]);

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
          })
          .catch((error) => {
            console.error('Error loading leaflet-geosearch:', error);
          });
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
      'currentLocation',
      'currentLocationFromSearch',
      'currentLocationCity',
      'currentLocationCountry',
      'fineLocation',
      'currentLocationCity',
      'currentLocationCountry',
      'languagePref',
    ]),
  },
  created() {
    this.debouncedSearch = _.debounce(this.search, 300, {
      leading: false,
      trailing: true,
    });
    this.inputValue = this.currentLocationCity;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .country-select {
    :deep(.q-field__control) {
      &:before {
        border-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.body--light {
  .country-select {
    :deep(.q-field__control) {
      &:before {
        border-color: rgba(0, 0, 0, 0.2);
      }
    }
  }
}
.country-select {
  .select {
    font-weight: 800 !important;
    position: relative;
    min-width: 150px;
    //text-transform: capitalize; // dont do this because deutsch

    //font-family: 'logotype' !important;
    //text-transform: uppercase;

    :deep(.q-field__native) {
      font-weight: 800 !important;
      //font-family: 'Chicago';
      //  font-style: italic;
      //text-transform: lowercase;
      //text-transform: lowercase;
      //text-transform: uppercase;
      // text-transform: uppercase;

      max-width: 300px;

      span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2em;
      }
      .q-field__append {
        align-items: flex-end;
      }
    }
    :deep(.country-select-input) {
      font-weight: 800 !important;
      height: 42px;
    }
    &.placeholder {
      &::before {
        z-index: 2;
        position: absolute;
        left: 0px;
        top: 12px;
        height: 100%;
        width: 100%;
        content: '';
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
        content: '';
        // color: grey;
        font-weight: 800;
      }
    }
  }
}
@media only screen and (max-width: 1023px) {
  .country-select {
    .select {
      min-width: 130px;
      :deep(.q-field__native) {
        max-width: unset;
      }
    }
  }
}
</style>
