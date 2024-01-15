<template>
  <div class="container">
    <q-select
      ref="input"
      outlined
      use-input
      :loading="loading"
      clearable
      v-model="selectedPlace"
      :label="'Location'"
      :options="autoCompleteResults"
      @filter="locationSearchFilter"
      @update:model-value="getPlaceInformation"
      style="width: 100%"
      option-label="description"
      map-options
      emit-value
      menu-anchor="bottom left"
      menu-self="top left"
      v-on:click="selectedPlace = null"
      v-on:focusout="
        !selectedPlace || selectedPlace.length == 0
          ? (selectedPlace = locationProp || previouslySelectedPlace)
          : undefined
      "
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey"> No results </q-item-section>
        </q-item>
      </template>
    </q-select>
    <div ref="placesDiv" />
  </div>
</template>

<script>
import gmapsInit from 'assets/gmaps-script';

export default {
  components: {},
  props: ['locationProp', 'preSearch'],
  data() {
    return {
      loading: false,
      location: null,
      results: [],
      google: null,
      autoCompleteService: null,
      placesService: null,
      autoCompleteSessionToken: null,
      autoCompleteResults: [],
      selectedPlace: this.locationProp,
      previouslySelectedPlace: this.locationProp,
      locations: {},
      locationSearchResults: [],
    };
  },
  watch: {
    $props: {
      handler() {
        this.selectedPlace = this.locationProp;
      },
      deep: true,
      immediate: true,
    },
    selectedPlace(newv, oldv) {
      if (oldv) {
        this.previouslySelectedPlace = oldv;
      }
    },
  },
  methods: {
    locationSearchFilter(query, update, abort) {
      if (query) {
        this.autoCompleteService.getPlacePredictions(
          {
            input: query,
            sessionToken: this.autoCompleteSessionToken,
          },
          (results) => {
            this.autoCompleteResults = results;
            update();
          }
        );
      } else {
        abort();
      }
    },
    getPlaceInformation() {
      if (this.selectedPlace?.place_id) {
        var request = {
          placeId: this.selectedPlace.place_id,
          fields: ['name', 'type', 'address_component', 'geometry'],
          sessionToken: this.autoCompleteSessionToken,
        };
        this.placesService.getDetails(request, (place) => {
          let loc = {};
          loc = place;
          loc.description = this.selectedPlace.description;
          loc.place_id = this.selectedPlace.place_id;
          this.location = loc;
          this.$emit('location', loc);
        });
      } else {
        this.$emit('location', null);
      }
    },
  },
  async mounted() {
    try {
      this.google = await gmapsInit();
      this.autoCompleteService =
        new this.google.maps.places.AutocompleteService();
      this.placesService = new this.google.maps.places.PlacesService(
        this.$refs.placesDiv
      );

      this.autoCompleteSessionToken =
        new this.google.maps.places.AutocompleteSessionToken();
      console.log('pre', this.preSearch);
      if (this.preSearch) {
        this.loading = true;
        // lookup place and select first place
        this.autoCompleteService.getPlacePredictions(
          {
            input: this.preSearch,
            sessionToken: this.autoCompleteSessionToken,
          },
          (results) => {
            const firstResult = results[0];
            console.log('fis', firstResult);
            this.selectedPlace = firstResult;
            var request = {
              placeId: firstResult.place_id,
              fields: ['name', 'type', 'address_component', 'geometry'],
              sessionToken: this.autoCompleteSessionToken,
            };
            this.placesService.getDetails(request, (place) => {
              let loc = {};
              loc = place;
              loc.description = this.selectedPlace.description;
              loc.place_id = this.selectedPlace.place_id;
              this.location = loc;
              this.$emit('location', loc);
              this.loading = false;
            });
          }
        );
      }
    } catch (error) {
      this.$q.notify(error);
    }
  },
};
</script>
