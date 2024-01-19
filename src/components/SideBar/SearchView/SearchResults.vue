<template>
  <transition
    appear
    enter-active-class="animated fadeIn faster"
    leave-active-class="animated fadeOut faster"
  >
    <div
      class="search-results"
      v-if="searchResults?.length > 0 || searchLocationResults?.length > 0"
    >
      <q-list separator v-if="eventResults?.length > 0">
        <div class="text-h6 inter bolder q-my-sm q-ml-sm">Events</div>
        <q-item
          clickable
          @click.stop="clickResult(result)"
          :key="index"
          v-for="(result, index) in eventResults"
        >
          <q-item-section avatar>
            <q-icon class="t3" name="las la-calendar" />
          </q-item-section>
          <q-item-section>
            <q-item-label
              style="text-transform: capitalize"
              class="flex items-center"
            >
              {{ result.result }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-list separator v-if="searchLocationResults?.length > 0">
        <div class="text-h6 inter bolder q-my-sm q-ml-sm">Places</div>
        <q-item
          clickable
          @click.stop="clickLocationResult(result)"
          :key="index + 30"
          v-for="(result, index) in searchLocationResults.slice(0, 3)"
        >
          <q-item-section avatar>
            <q-icon class="t3" name="las la-map-marker" />
          </q-item-section>
          <q-item-section>
            <q-item-label style="text-transform: capitalize">
              {{ result.label }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-list separator v-if="artistResults?.length > 0">
        <div class="text-h6 inter bolder q-my-sm q-ml-sm">Artists</div>
        <q-item
          clickable
          @click.stop="clickResult(result)"
          :key="index"
          v-for="(result, index) in artistResults"
        >
          <q-item-section avatar>
            <q-icon name="las la-music" class="t3" />
          </q-item-section>
          <q-item-section>
            <q-item-label
              style="text-transform: capitalize"
              class="flex items-center"
            >
              {{ result.result }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-list separator v-if="tagResults?.length > 0">
        <div class="text-h6 inter bolder q-my-sm q-ml-sm">Tags</div>
        <q-item
          clickable
          @click.stop="clickResult(result)"
          :key="index"
          v-for="(result, index) in tagResults"
        >
          <q-item-section avatar>
            <q-icon name="las la-music" class="t3" />
          </q-item-section>
          <q-item-section>
            <q-item-label
              style="text-transform: capitalize"
              class="flex items-center"
            >
              {{ result.result }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </transition>
</template>

<script>
import { mapWritableState, mapActions } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useSearchStore } from 'src/stores/search';
import { useQueryStore } from 'src/stores/query';
import { useMapStore } from 'src/stores/map';
import { useNearbyStore } from 'src/stores/nearby';
import { toRaw } from 'vue';
export default {
  name: 'SearchResults',

  props: {
    searchResults: {
      default: () => [],
      type: Array,
    },
    searchLocationResults: {
      default: () => [],
      type: Array,
    },
  },
  data() {
    return {};
  },

  methods: {
    ...mapActions(useNearbyStore, ['loadEverything']),
    clickResult(result) {
      var obj;
      if (result.type === 'artist') {
        this.$router.push({
          name: 'ArtistPage',
          params: {
            id: result.id,
          },
          query: {
            name: result.result.replace(/ /g, '_'),
          },
        });
      } else if (result.type === 'tag') {
        obj = { tag: result.result, count: 0 };
        this.controlTag = [obj];
        this.sidebarPanel = 'explore';
      } else if (result.type === 'event') {
        console.log(result);
        this.$router.push({
          name: 'EventPage',
          params: { id: result.id },
          query: {
            name: result.result.replace(/ /g, '_'),
          },
        });
      }
      this.closeSearchBar();
    },

    clickLocationResult(location) {
      this.userLocationFromSearch = true;
      this.userLocation = {
        lat: parseFloat(location.location.lat),
        lng: parseFloat(location.location.lng),
      };
      let labelParts = location.label.split(', ');
      this.userLocationCountry = labelParts.pop();
      this.userLocationCity = labelParts?.[0];
      if (!this.userLocationCity) {
        // no city, country level zoom
        // give it some time because we want to use
        // the bandwidth to load the nearby view first
        console.log('loc', this.userLocationCity);

        setTimeout(() => {
          if (this.$q.screen.gt.lg) {
            toRaw(this.map).setZoom(6);
          } else {
            toRaw(this.map).setZoom(4);
          }
        }, 1000);
      }
      this.fineLocation = false;
      this.sidebarPanel = 'nearby';
      this.loadEverything();
      if (this.$q.screen.gt.xs) {
        this.showPanel = false;
      }
      this.closeSearchBar();
    },
    closeSearchBar() {
      this.query = '';
      this.searchbarShowing = false;
    },
  },
  computed: {
    eventResults() {
      return this.searchResults?.filter((x) => x.type === 'event');
    },
    artistResults() {
      return this.searchResults?.filter((x) => x.type === 'artist');
    },
    tagResults() {
      return this.searchResults?.filter((x) => x.type === 'tag');
    },
    ...mapWritableState(useMapStore, ['map']),
    ...mapWritableState(useMainStore, [
      'userLocationFromSearch',
      'userLocation',
      'userLocationCity',
      'userLocationCountry',
      'sidebarPanel',
      'fineLocation',
      'showPanel',
    ]),
    ...mapWritableState(useQueryStore, ['controlTag']),
    ...mapWritableState(useSearchStore, ['query', 'searchbarShowing']),
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .search-popup-fullwidth {
    .search-popup-wrapper {
      background: rgba(255, 255, 255, 1);
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.2);
      border-top: none;
    }
  }
}
.body--dark {
  .search-popup-fullwidth {
    .search-popup-wrapper {
      background: rgba(0, 0, 0, 1);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-top: none;
    }
  }
}

.search-results {
  overflow-y: auto;
}
@media only screen and (max-width: 600px) {
  .body--light {
    .search-popup-fullwidth {
      background: rgba(255, 255, 255, 0.48);
      .search-popup-wrapper {
        background: white !important;
      }
    }
  }
  .body--dark {
    .search-popup-fullwidth {
      background: rgba(0, 0, 0, 0.48);

      .search-popup-wrapper {
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
    }
  }

  .search-popup-fullwidth {
    .search-popup-wrapper {
      width: 100%;
      max-height: 100%;
      max-width: unset;
      right: unset;
      .desktop-padding-top {
        display: none;
      }
    }
  }
}
</style>
