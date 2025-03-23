<template>
  <div
    class="ed-location flex row editing-outline ed-inline-card no-wrap"
    :class="{
      inline: inline,
      'column items-stretch': inline,
      'editing q-px-md': editing || showMoreFields,
      'items-start': $q.screen.lt.sm,
      'items-center': $q.screen.gt.xs,
    }"
    @click="editing || showMoreFields ? (showEditDialog = true) : expand()"
  >
    <div class="flex row items-center grow no-wrap">
      <q-icon
        :size="$q.screen.gt.sm ? '2em' : '1.5rem'"
        class="t2"
        name="las la-map-marker"
        v-if="inline"
      />
      <div
        class="flex row grow align-center items-start justify-between no-wrap"
        v-if="inline"
      >
        <div class="q-ml-md flex column" style="width: 100%">
          <div class="flex grow no-wrap row items-center">
            <div
              class="flex column"
              :class="$q.screen.gt.sm ? 'text-large' : ''"
            >
              <div class="t2">{{ selectedEventDate.location.name }}</div>
              <div class="t4">
                {{ selectedEventDate.location.description }}
              </div>
            </div>
          </div>
          <div v-if="$q.screen.lt.md">
            <a
              :href="computedMapsUrl"
              target="_blank"
              v-if="computedMapsUrl"
              style="text-decoration: none; color: unset"
            >
              <q-btn
                class="nav-button q-mt-sm"
                flat
                no-caps
                size="md"
                v-if="!editing"
                icon="las la-directions"
                label="Open in Maps "
              >
              </q-btn>
            </a>
          </div>
        </div>
        <div v-if="$q.screen.gt.sm">
          <a
            :href="computedMapsUrl"
            target="_blank"
            v-if="computedMapsUrl"
            style="text-decoration: none; color: unset"
          >
            <q-btn
              class="nav-button q-mt-sm q-ml-md"
              flat
              style="width: 160px"
              no-caps
              size="md"
              v-if="!editing"
              icon="las la-directions"
              label="Google Maps "
            >
            </q-btn>
          </a>
        </div>
        <!--
        <q-icon
          size="2em"
          class="t3 q-ml-md"
          name="mdi-chevron-down"
          v-if="expandable && !expanded && !editing"
        />
        <q-icon
          size="2em"
          class="t3 q-ml-md"
          name="mdi-chevron-up"
          v-else-if="expandable && expanded && !editing"
        />
        -->
      </div>
    </div>
    <div
      class="square-map flex"
      :class="[inline ? 'q-mt-md' : '']"
      v-if="(!inline || showMap) && markerCoords && false"
    >
      <!--
      <div class="map-container satellite-enabled">
        <UseDevicePixelRatio v-slot="{ pixelRatio: { pixelRatio } }">
          <mgl-map
            :map-style="classicMapStyleUrl"
            :pixel-ratio="pixelRatio"
            :center="markerCoords"
            :zoom="8"
            :attributionControl="false"
          >
            <mgl-marker v-model:coordinates="markerCoords">
              <template v-slot:marker>
                <div
                  :style="{
                    backgroundColor: 'red',
                    width: '10px',
                    height: '10px',
                  }"
                ></div>
              </template>
            </mgl-marker>
          </mgl-map>
        </UseDevicePixelRatio>
      </div>
      -->
    </div>
    <BackdropBlurDialog
      v-model="showEditDialog"
      v-if="editing || showMoreFields"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditEventDateDialog :ed="selectedEventDate" mode="location" />
    </BackdropBlurDialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import EditEventDateDialog from './EditEventDateDialog.vue';
import { useEventStore } from 'src/stores/event';
import { useMapStore } from 'src/stores/map';
import { UseDevicePixelRatio } from '@vueuse/components';
import BackdropBlurDialog from '../../BackdropBlurDialog.vue';

export default {
  name: 'EventDateMap',
  components: { EditEventDateDialog, UseDevicePixelRatio, BackdropBlurDialog },
  props: {
    editing: Boolean,
    inline: Boolean, // desktop and mobile (only show text, no map)
    expandable: Boolean, // mobile only,
    showMoreFields: Boolean,
  },
  data() {
    return {
      MglMap: null,
      MglMarker: null,
      expanded: false,
      showEditDialog: false,
      map: null,
      tileLayer: null,
      labelLayer: null,
      markers: null,
      markerCoords: null,
      pointPaint: {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#fff',
      },
    };
  },
  watch: {
    selectedEventDate: {
      handler: function (newval) {
        if (newval) {
          if (newval?.location) {
            this.markerCoords = [newval.location.lng, newval.location.lat];
          }
        }
      },
    },
  },
  mounted() {
    if (process.env.CLIENT) {
      // Dynamically import vue-maplibre-gl components only on the client-side
      import('@indoorequal/vue-maplibre-gl')
        .then((module) => {
          this.MglMap = module.MglMap;
          this.MglMarker = module.MglMarker;
          this.MglNavigationControl = module.MglNavigationControl;
        })
        .catch((error) => {
          console.error('Error loading vue-maplibre-gl:', error);
        });
    }
    if (this.selectedEventDate) {
      this.markerCoords = [
        this.selectedEventDate.location.lng,
        this.selectedEventDate.location.lat,
      ];
    }
  },
  methods: {
    expand() {
      this.expanded = !this.expanded;
    },

    addMarker() {
      if (this.markers && this.map.hasLayer(this.markers)) {
        this.map.removeLayer(this.markers);
      }
      // add marker for this event
      let marker = L.marker(
        [
          this.selectedEventDate.location.lat,
          this.selectedEventDate.location.lng,
        ],
        {
          icon: this.defaultIcon,
        },
      );
      this.markers = L.layerGroup([marker]);
      this.map.addLayer(this.markers);
    },
    initTileLayers() {
      let filter = [];

      if (this.tileLayer && this.map.hasLayer(this.tileLayer)) {
        this.map.removeLayer(this.tileLayer);
      }
      if (this.labelLayer && this.map.hasLayer(this.labelLayer)) {
        this.map.removeLayer(this.labelLayer);
      }

      this.tileLayer = L.tileLayer.colorFilter(this.transportMapTileUrl, {
        filter: filter,
        detectRetina: false,
        attribution: this.transportMapTileAttribution,
      });
      this.tileLayer.addTo(this.map);
      this.tileLayer.setOpacity(1);
    },
  },
  computed: {
    ...mapState(useEventStore, ['selectedEventDate']),
    ...mapState(useMapStore, ['mapStyle', 'classicMapStyleUrl', 'defaultIcon']),
    showMap() {
      return !this.inline || (this.inline && this.expandable && this.expanded);
    },
    computedMapsUrl() {
      return `https://www.google.com/maps/search/?api=1&query=${this.selectedEventDate?.location?.description}&query_place_id=${this.selectedEventDate?.location?.place_id}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .square-map {
  }
}
.body--dark {
  .square-map {
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .nav-button {
    background: $bi-3;
  }
}

.ed-location {
  //width: 100%;
  .square-map {
    width: 100%;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 0.5em 1em -0.125em rgba(0, 0, 0, 0.1),
      0 0px 0 1px rgba(0, 0, 0, 0.02);
    &:after {
      content: '';
      display: block;
      padding-bottom: 100%;
    }
    .map-container {
      width: 100%;
      height: 100%;
      display: flex;
      position: absolute;
      overflow: hidden;
      flex-grow: 1;
      .map {
        position: relative;
        z-index: 0;
        width: 100%;
        flex-grow: 1;
        z-index: 0;
        width: 100%;
        background: unset !important;
      }
    }
  }
}
.inline {
  box-shadow: none;
  border: none;
}
</style>
