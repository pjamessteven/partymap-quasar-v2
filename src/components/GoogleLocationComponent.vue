<template>
  <div class="container">
    <q-select
      outlined
      use-input
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
          ? (selectedPlace = locationProp)
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
  props: ['locationProp'],
  data() {
    return {
      location: null,
      results: [],
      google: null,
      autoCompleteService: null,
      placesService: null,
      autoCompleteSessionToken: null,
      autoCompleteResults: [],
      selectedPlace: this.locationProp,
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
    } catch (error) {
      this.$q.notify(error);
    }
  },
};
</script>
