<template>
  <div class="scroll-area-wrapper">
    <q-scroll-area
      horizontal
      ref="scrollArea"
      @scroll="onScrollMainContent"
      class="artist-scroll-area "
      v-if="nearbyArtists && nearbyArtists.length > 0"
      :thumb-style="
        $q.screen.gt.xs
          ? {
              bottom: '-4px',
              height: '4px',
              marginLeft: '16px'
            }
          : { bottom: '0px', height: '0px' }
      "
    >
      <div
        class="flex row no-wrap q-gutter-md q-pr-xl q-pl-md"
        v-if="nearbyArtists"
      >
        <ArtistHead
          v-for="(artist, index) in nearbyArtists"
          :key="index"
          :artist="artist"
        ></ArtistHead>
        <div
          v-if="nearbyArtistsHasNext"
          class="pagination-icon flex justify-center items-center t3 link-hover "
          style="width: 128px; "
        >
          <q-spinner-ios
            :thickness="2"
            :color="$q.dark.isActive ? 'white' : 'black'"
            size="3em"
          />
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import ArtistHead from "components/ArtistPage/ArtistHead.vue";

export default {
  name: "ArtistsComponent",
  components: { ArtistHead },
  props: {},
  data() {
    return {};
  },
  watch: {},
  methods: {
    onScrollMainContent(info) {
      console.log(info);
      const triggerPositoion =
        info.horizontalSize - info.horizontalContainerSize - 128; // width of loading spinner

      if (info.horizontalPosition >= triggerPositoion) {
        // reached bottom

        this.loadMoreNearbyArtists();
      }
    },
    loadMoreNearbyArtists() {
      this.nearbyArtistsPage += 1;
      this.$store.dispatch("main/loadNearbyArtists", {
        per_page: 10,
        page: this.nearbyArtistsPage,
        sort: "event_count",
        desc: true
      });
    }
  },
  computed: {
    // NEARBY ARTISTS
    nearbyArtists: {
      get() {
        return this.$store.state.landingPage.nearbyArtists;
      },
      set(val) {
        this.$store.commit("landingPage/setNearbyArtists", val);
      }
    },
    loadingNearbyArtists() {
      return this.$store.state.landingPage.loadingNearbyArtists;
    },
    nearbyArtistsHasNext() {
      return this.$store.state.landingPage.nearbyArtistsHasNext;
    },
    nearbyArtistsPage: {
      get() {
        return this.$store.state.landingPage.nearbyArtistsPage;
      },
      set(val) {
        this.$store.commit("landingPage/setNearbyArtistsPage", val);
      }
    }
  },
  created() {},

  destroyed() {},
  beforeMount() {},
  mounted() {}
};
</script>

<style lang="scss" scoped>
.body--dark {
  .pagination-icon {
    /deep/.q-icon {
      background: black;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
.body--light {
  .pagination-icon {
    /deep/.q-icon {
      border: 1px solid rgba(0, 0, 0, 0.1);
      background: white;
    }
  }
}

.scroll-area-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  .artist-scroll-area {
    height: 164px;
    width: 100%;
    mask-image: linear-gradient(
      to left,
      transparent 0px,
      white 32px,
      white calc(100% - 16px),
      transparent 100%
    );

    /deep/.artist-head-wrapper {
      .artist-name {
        //font-size: small;
      }
    }
  }
  .pagination-icon {
    z-index: 100;
    height: 154px;
    width: auto;
    display: flex;
    align-items: center;
    /deep/.q-icon {
      border-radius: 100%;
    }
  }
}

@media only (max-width: 600px) {
  .scroll-area-wrapper {
    .artist-scroll-area {
      height: 168px;
    }
  }
}
</style>
