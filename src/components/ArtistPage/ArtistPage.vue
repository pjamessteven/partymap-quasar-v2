<template>
  <div class="artist-page flex column justify-center">
    <CustomQScroll
      vertical
      ref="scrollArea"
      style="height: 100%; width: 100%"
      @scroll="onScrollMainContent"
      :thumb-style="
        $q.screen.gt.xs
          ? {
              bottom: '0px',
              height: '8px',
              marginLeft: '16px',
              borderRadius: '0px',
            }
          : { bottom: '0px', height: '0px', borderRadius: '0px', width: '4px' }
      "
    >
      <div class="mobile-image-container" v-if="$q.screen.lt.md">
        <div class="image-container-background">
          <img :src="computedSmImageSrc" style="z-index: 2" />

          <img
            style="z-index: 3"
            v-show="loadedFullRes"
            :src="computedImageSrc"
            @load="loadedFullRes = true"
          />

          <div class="image-container-overlay" />
        </div>

        <div class="flex-column mobile-title q-pa-md">
          <div class="text-h4 metropolis bolder">
            <b>{{ computedName }}</b>
          </div>
        </div>
      </div>
      <div
        class="artist-header flex row justify-center no-wrap"
        v-if="$q.screen.gt.sm"
      >
        <div class="artist-background">
          <transition
            appear
            enter-active-class="animated fadeIn slow"
            leave-active-class="animated fadeOut"
          >
            <img :src="computedSmImageSrc" class="item" />
          </transition>
        </div>
        <div
          class="header-content flex col col-xs-12 col-md-10 col-lg-10 col-xl-8"
        >
          <div
            class="flex row no-wrap grow items-start justify-between q-pa-lg"
          >
            <div class="flex column">
              <div
                class="text-h2 metropolis bolder"
                style="color: white; z-index: 2"
              >
                {{ computedName }}
              </div>
            </div>
          </div>
          <div class="image-container" v-if="artist && computedImageSrc">
            <div class="image-container-background">
              <transition appear enter-active-class="animated fadeIn slower">
                <img
                  :src="computedSmImageSrc"
                  style="filter: blur(5px); z-index: 2"
                />
              </transition>
              <transition appear enter-active-class="animated fadeIn slower">
                <img
                  style="z-index: 3"
                  v-show="loadedFullRes"
                  :src="computedImageSrc"
                  @load="loadedFullRes = true"
                />
              </transition>
            </div>
          </div>
        </div>
      </div>
      <InnerLoading v-if="loading" :solid="false" style="padding-top: 256px" />

      <div
        class="artist-content flex row justify-center no-wrap"
        style="width: 100%; position: relative"
      >
        <div
          class="main-content q-mb-lg flex column col-xs-12 col-md-10 col-lg-10 col-xl-8"
        >
          <ArtistDetails
            :class="$q.screen.gt.sm ? 'q-ml-lg q-mb-lg' : 'q-mb-sm q-px-md'"
            @refreshArtist="refreshArtist()"
            :artist="artist"
          />
          <transition appear enter-active-class="animated fadeIn slower">
            <div
              class="flex column events"
              v-if="artist && !loading"
              :class="$q.screen.gt.sm ? ' q-px-lg' : ' q-mt-md q-px-md'"
            >
              <div class="flex column" v-if="artist" style="max-width: 100%">
                <div class="q-mb-md metropolis bold t2">Upcoming events:</div>
                <div
                  class="t3"
                  v-if="
                    !artist.future_event_dates ||
                    (artist?.future_event_dates?.length === 0 && !loading)
                  "
                >
                  No upcoming events for this artist.
                </div>
                <div v-else></div>
                <EventDateCard
                  style="max-width: 599px"
                  v-for="(ed, index) in artist.future_event_dates"
                  :key="index"
                  :event="ed"
                  class="q-mb-md ed-card"
                />
              </div>
              <div>
                <q-btn
                  flat
                  no-caps
                  class="nav-button soft-button-shadow q-mr-sm q-px-md q-mt-lg q-py-sm"
                  :class="$q.screen.gt.sm ? 'q-mt-lg' : ''"
                  @click="viewOnMap"
                  v-if="artist?.future_event_dates?.length > 0"
                >
                  View all upcoming on the map
                  <q-icon
                    name="mdi-chevron-right"
                    size="1rem"
                    class="q-ml-md"
                    :class="{ 'q-ml-md': $q.screen.gt.xs }"
                  />
                </q-btn>
              </div>

              <div
                class="flex column"
                style="max-width: 100%"
                v-if="
                  artist &&
                  artist.past_event_dates &&
                  artist.past_event_dates.length > 0
                "
              >
                <div class="q-mt-lg q-mb-md metropolis bold t2">
                  {{ $t('artists.past_events') }}:
                </div>
                <EventDateCard
                  v-for="(ed, index) in artist.past_event_dates"
                  :key="index"
                  :event="ed"
                  class="q-mb-md ed-card"
                />
              </div>
            </div>
          </transition>

          <transition appear enter-active-class="animated fadeIn slower">
            <div
              class="q-mt-xl footer"
              v-if="artist"
              :class="$q.screen.gt.sm ? 'q-px-lg q-pb-lg' : 'q-px-md '"
            >
              <div class="t3">
                Artist info courtesey of
                <a
                  href="https://musicbrainz.org/"
                  class="link-hover underline"
                  target="_blank"
                  >MusicBrainz</a
                >,
                <a
                  href="https://last.fm/"
                  class="link-hover underline"
                  target="_blank"
                  >Last.fm</a
                >
                and
                <a
                  href="https://spotify.com/"
                  class="link-hover underline"
                  target="_blank"
                  >Spotify</a
                >.
                <span class="link-hover" @click="refreshArtist">
                  [Fetch latest info]</span
                >
              </div>
            </div>
          </transition>
        </div>
      </div>
    </CustomQScroll>
  </div>
</template>

<script>
import { getArtistRequest, refreshArtistRequest } from 'src/api';
import { toRaw } from 'vue';
import InnerLoading from 'src/components/InnerLoading.vue';
import CustomQScroll from 'components/CustomQScroll.vue';

import _ from 'lodash';
import EventDateCard from 'components/EventDateCard.vue';
import ArtistDetails from 'components/ArtistPage/ArtistDetails.vue';
import { mapState, mapWritableState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { useQueryStore } from 'src/stores/query';
import { useMapStore } from 'src/stores/map';
import { useMainStore } from 'src/stores/main';
export default {
  name: 'ArtistPage',
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: this.computedName + ' | PartyMap',
      meta: {
        description: {
          name: 'description',
          content:
            'Upcoming festivals and event where ' +
            this.computedName +
            ' is  playing. ' +
            this.computedDescription,
        },
        keywords: {
          name: 'keywords',
          content:
            'Festival, Festivals, Map, Events, Party, Fiesta, Music, Music Festival, Music Festivals, Best Music Festivals, All Music Festivals, Top Music Festivals, List of music festivals, list, soundcloud, bandcamp, youtube',
        },
      },
    };
  },
  components: {
    EventDateCard,
    ArtistDetails,
    InnerLoading,
    CustomQScroll,
  },
  data() {
    return {
      artist: null,
      loading: false,
      showFullDescription: false,
      loadedFullRes: false, // full resolution image loaded, hide smaller placeholder
      previousMenubarOpacity: 0,
    };
  },
  props: {
    id: {
      default: null,
    },
  },
  methods: {
    viewOnMap() {
      setTimeout(() => {
        toRaw(this.map).flyTo({ zoom: 1 });
      }, 300);
      this.controlArtist = [this.artist];

      //this.$router.push({ name: 'Explore', query: { view: 'explore' } });
    },
    refreshArtist() {
      if (this.currentUser) {
        this.loading = true;
        refreshArtistRequest(this.artist.id).then(
          (response) => {
            this.loading = false;
            this.artist = response.data;
          },
          () => {
            this.loading = false;
          }
        );
      } else {
        this.$router.push({
          path: '/login',
          query: { from: this.$route.path },
        });
      }
    },
    onScrollMainContent(info) {
      // console.log(info);
      // var height = window.innerHeight / 3 - 120; // this is the height of the gap between menu bar and top of event card
      this.scrollPercentage = info.verticalPercentage;
      let verticalPostion = info.verticalPosition;
      // menubar should always show on large screens (when sidebar is open)c
      if (verticalPostion > 8) {
        this.overlayOpacity = 1;
        this.menubarOpacity = 1;
      } else {
        this.overlayOpacity = 0;
        this.menubarOpacity = 0;
      }
      //this.overlayOpacity = ((info.target.scrollTop * 0.5) / 100) * 1;
    },
  },
  mounted() {
    if (!this.artist || this.artist.id + '' !== this.id + '') {
      this.artist = null;
      this.menubarOpacity = 0;
      this.loading = true;
      this.$refs.scrollArea.setScrollPercentage('vertical', 0);

      getArtistRequest(this.id).then((response) => {
        this.loading = false;
        this.artist = response.data;

        var queryString = '?name=' + response.data.name.replace(/ /g, '_');

        if (window.location.pathname.indexOf(queryString) === -1) {
          this.$router.resolve({
            path: this.$route.path,
            query: { name: response.data.name.replace(/ /g, '_') },
          });
        }
      });
    } else {
      this.menubarOpacity = this.previousMenubarOpacity;
    }
  },
  beforeRouteLeave() {
    this.previousMenubarOpacity = this.menubarOpacity;
  },
  computed: {
    ...mapWritableState(useMainStore, ['menubarOpacity']),
    ...mapWritableState(useQueryStore, ['controlArtist']),
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useMapStore, ['map']),
    longDescription() {
      if (
        this.artist &&
        this.artist.description &&
        this.artist.description.length > 300
      ) {
        return true;
      } else {
        return false;
      }
    },
    computedDescription() {
      if (this.artist && this.artist.description) {
        if (this.showFullDescription) {
          return this.artist.description;
        } else {
          return this.artist.description.slice(0, 300);
        }
      } else return null;
    },
    computedName() {
      if (this.artist && this.artist.name) {
        return this.artist.name;
      } else if (this.$route.query.name) {
        return this.$route.query.name.replace(/_/g, ' ');
      } else {
        return null;
      }
    },
    computedSmImageSrc() {
      // make things seem faster by showing the thumbnail thats already loaded by ArtistHead component
      if (this.$route.query.thumb_xs_url) {
        return this.$route.query.thumb_xs_url;
      } else if (this.artist?.media_items?.[0]) {
        return this.artist.media_items[0].thumb_xs_url;
      } else {
        return '';
      }
    },
    computedImageSrc() {
      if (this.artist?.media_items?.[0]) {
        return this.artist.media_items[0].thumb_url;
      } else {
        return '';
      }
    },
    urls() {
      // add apple music and spotify types for 'streaming' type urls
      if (this.artist && this.artist.urls) {
        var urls = _.cloneDeep(this.artist.urls);
        for (var url of urls) {
          if (url.url.indexOf('spotify') > -1) {
            url.type = 'spotify';
          } else if (
            url.url.indexOf('apple') > -1 &&
            url.url.indexOf('itunes') === -1
          ) {
            url.type = 'apple music';
          } else if (url.url.indexOf('facebook') > -1) {
            url.type = 'facebook';
          } else if (url.url.indexOf('instagram') > -1) {
            url.type = 'instagram';
          } else if (url.url.indexOf('twitter') > -1) {
            url.type = 'twitter';
          } else if (url.url.indexOf('instagram') > -1) {
            url.type = 'instagram';
          } else if (url.url.indexOf('amazon') > -1) {
            url.type = 'amazon';
          }
        }
        return urls.filter(
          (x) =>
            x.type === 'spotify' ||
            x.type === 'bandcamp' ||
            x.type === 'youtube' ||
            x.type === 'soundcloud' ||
            x.type === 'apple music' ||
            x.type === 'facebook' ||
            x.type === 'instagram' ||
            x.type === 'twitter' ||
            x.type === 'official homepage'
        );
      } else {
        return [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .artist-page {
    background: black;
    .artist-header {
      .artist-background {
        background: $bi-2;
      }
    }
  }
}
.body--light {
  .artist-page {
    background: white;
    .artist-header {
      .artist-background {
        background: darkgrey;
      }
    }
  }
}
.artist-page {
  height: 100%;
  width: 100%;
  .artist-header {
    position: relative;
    padding-top: 128px;
    // height: 200px;

    .header-content {
      max-width: 1024px;
      position: relative;

      .tag {
        pointer-events: none;
        cursor: unset;
        color: white;

        border: 1px solid;
        border-color: rgba(255, 255, 255, 0.1) !important;
        background: transparent !important;
      }
    }
    .artist-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      //max-height: 512px;
      overflow: hidden;
      // transform: translate3d(0, 0, 0);

      &:before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 1;
        background: linear-gradient(rgba(0, 0, 0, 0.68), transparent);
      }
      img {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        //  filter: blur(50px);
        backface-visibility: hidden;
        // position by top left corner of image
        left: 0px;
        top: 0px;
        filter: blur(30px);
        transform: translate3d(0, 0, 0) scale(2);
        @supports (font: -apple-system-body) and (-webkit-appearance: none) {
          -webkit-backface-visibility: hidden;
          -webkit-transform: translate3d(0, 0, 0) scale(2);
          // translate3d is a hack for safari to force gpu rendering of blur()
        }
      }
    }
    .image-container {
      position: absolute;

      right: 0px;
      bottom: -150px;
      overflow: hidden;
      aspect-ratio: 1;
      border-radius: 100%;
      min-width: 308px;
      .image-container-background {
        width: 100%;
        //position: absolute;
        display: flex;
        flex-grow: 1;
        object-fit: cover;
        justify-content: center;
        align-items: center;

        img {
          position: absolute;
          left: 0px;
          top: 0px;
          width: 100%;

          height: auto;
        }
      }
    }
  }
  .main-content {
    max-width: 1024px;
    padding-right: 332px;
    .ed-card {
      max-width: 599px;
    }
  }
}

@media only screen and (max-width: 1023px) {
  .body--light {
    .artist-page {
      .image-container-background {
        background: $b-2;
      }
      :deep(.artist-details) {
        .details {
          color: black;
        }
      }
    }
  }
  .artist-page {
    width: 100%;
    padding-top: 0px !important;

    .image-container-background {
      background: $bi-2;
    }
    .artist-content {
      .main-content {
        width: 100%;
        padding-right: unset;
        .events {
          width: 100%;
          :deep(.ed-card) {
            width: calc(100vw - 32px);
          }
        }
      }
    }
    .mobile-image-container {
      width: 100%;
      height: 300px;
      position: relative;
      overflow: hidden;
      .mobile-title {
        position: absolute;
        bottom: 0px;
        z-index: 1;
        color: white;
      }
      .image-container-background {
        height: 100%;
        width: 100%;
        position: absolute;
        display: flex;
        flex-grow: 1;
        justify-content: center;
        align-items: center;
        z-index: 1;
        .image-container-overlay {
          z-index: 3000;
          position: absolute;
          left: 0px;
          top: 0px;
          height: 100%;
          width: 100%;
          background: linear-gradient(
            rgba(0, 0, 0, 0.68),
            transparent,
            rgba(0, 0, 0, 0.68)
          );
        }
        img {
          position: absolute;
          left: 0px;
          top: 0px;
          width: 100%;
          width: 100%;
        }
      }
    }

    .ed-card {
      max-width: 100%;
    }
  }
}
</style>
