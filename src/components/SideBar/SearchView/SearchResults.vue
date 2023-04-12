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
      <q-list separator>
        <q-item
          clickable
          @click.stop="clickResult(result)"
          :key="index"
          v-for="(result, index) in searchResults"
        >
          <q-item-section>
            <q-item-label
              style="text-transform: capitalize"
              class="flex items-center"
            >
              {{ result.result }}
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-icon
              v-if="result.type === 'event'"
              class="t3"
              name="las la-calendar"
            />
            <q-icon
              v-else-if="result.type === 'artist'"
              name="las la-music"
              class="t3"
            />
            <q-icon
              v-else-if="result.type === 'tag'"
              class="t3"
              name="las la-tag"
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          @click.stop="clickLocationResult(result)"
          :key="index + 30"
          v-for="(result, index) in searchLocationResults.slice(0, 3)"
        >
          <q-item-section>
            <q-item-label style="text-transform: capitalize">
              {{ result.label }}
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-icon class="t3" name="las la-map-marker" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </transition>
</template>

<script>
import { mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useSearchStore } from 'src/stores/search';
import { useQueryStore } from 'src/stores/query';
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
    },
    clickLocationResult(location) {
      this.userLocation = {
        lat: parseFloat(location.location.lat),
        lng: parseFloat(location.location.lng),
      };
      this.userLocationCity = location.label.split(',')[0];
      this.fineLocation = false;
      this.sidebarPanel = 'nearby';
    },
  },
  computed: {
    ...mapWritableState(useMainStore, [
      'userLocation',
      'userLocationCity',
      'sidebarPanel',
      'fineLocation',
    ]),
    ...mapWritableState(useQueryStore, ['controlTag']),
    ...mapWritableState(useSearchStore, ['query']),
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
