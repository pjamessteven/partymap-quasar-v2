<template>
  <transition
    appear
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
  >
    <div
      class="search-suggestions"
      v-if="searchResults && searchResults.length > 0"
    >
      <q-list separator>
        <q-item
          clickable
          @click.stop="clickResult(result)"
          :key="index"
          v-for="(result, index) in searchSuggestions"
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
      } else if (result.type === 'event') {
        this.$router.push({
          name: 'EventPage',
          params: { id: result.id },
          query: {
            name: result.result.replace(/ /g, '_'),
          },
        });
      }
      this.query = null;
      this.$emit('resultSelected');
    },
    clickLocationResult(location) {
      this.$store.commit('main/setCurrentLocationName', location.label);

      this.$store.commit('main/setCurrentLocation', {
        lat: parseFloat(location.location.lat),
        lng: parseFloat(location.location.lng),
      });
      this.query = null;
      this.$emit('resultSelected');
      this.sidebarPanel = 'nearby';
    },
  },
  computed: {
    ...mapWritableState(useQueryStore, ['controlTag']),
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

.search-suggestions {
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
