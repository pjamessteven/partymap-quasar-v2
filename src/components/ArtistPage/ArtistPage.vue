<template>
  <DialogPage>
    <template v-slot:title>
      {{ computedName }}
    </template>
    <template v-slot>
      <InnerLoading v-if="loading" :solid="true" />

      <div class="artist-header flex row justify-between no-wrap">
        <div class="flex column no-wrap" style="width: 100%">
          <div class="mobile-image-container" v-if="$q.screen.lt.md">
            <div class="image-container-background">
              <transition appear enter-active-class="animated fadeIn slower">
                <img :src="computedImageSrc" v-if="computedImageSrc" />
              </transition>

              <div class="overlay" />
            </div>
            <div class="flex-column mobile-title q-pa-md">
              <div class="text-h5 chicago">
                <b>{{ computedName }}</b>
              </div>
              <div class="o-050" v-if="artist">
                {{ artist.disambiguation }}
              </div>
            </div>
          </div>

          <transition appear enter-active-class="animated fadeIn slower">
            <div class="main-content flex column" v-if="artist">
              <div
                class="t1 q-mt-md text-large chicago"
                v-if="artist && $q.screen.gt.xs"
              >
                {{ artist.disambiguation }}
              </div>
              <div
                class="q-mt-lg q-mb-sm chicago t3"
                v-if="
                  artist && artist.tags && artist.tags.length > 0 && !loading
                "
              >
                {{ $t('artists.tags') }}:
              </div>
              <!--
            <div
              class="t3"
              v-if="
                artist &&
                  ((artist.tags && artist.tags.length === 0) || !artist.tags) &&
                  !loading
              "
            >
              No tags for this artist yet.
            </div>
          -->
              <div
                class="flex row wrap q-gutter-xs"
                style="max-width: 100%"
                v-if="artist && artist.tags"
              >
                <Tag
                  v-for="(at, index) in artist.tags"
                  :key="index"
                  :value="at.tag"
                  :label="at.label"
                ></Tag>
              </div>

              <div
                class="q-mt-lg q-mb-sm chicago t3"
                v-if="computedDescription && computedDescription.length > 0"
              >
                {{ $t('artists.description') }}:
              </div>
              <!--
            <div
              class="t3"
              v-if="
                (!computedDescription || computedDescription.length === 0) &&
                  !loading
              "
            >
              No description for this artist yet.
            </div>
          -->
              <div
                style="max-width: 100%"
                v-if="computedDescription && computedDescription.length > 0"
              >
                <span v-if="artist" v-html="computedDescription" /><span
                  v-if="longDescription && !showFullDescription"
                  @click="showFullDescription = true"
                  class="link-hover underline q-ml-xs"
                  >...show more</span
                >
                <span
                  v-if="longDescription && showFullDescription"
                  @click="showFullDescription = false"
                  class="link-hover underline"
                  >...show less</span
                >
              </div>

              <div
                class="q-mt-lg q-mb-sm chicago t3"
                v-if="urls && urls.length > 0"
              >
                {{ $t('artists.links') }}:
              </div>

              <div class="flex column" style="max-width: 100%">
                <ArtistUrl
                  v-for="(url, index) in urls"
                  :url="url"
                  :key="index"
                />
              </div>

              <div class="flex column" v-if="artist" style="max-width: 100%">
                <div class="q-mt-lg q-mb-md chicago t3">
                  {{ $t('artists.upcoming_events') }}:
                </div>
                <div
                  class="t3"
                  v-if="
                    !artist.future_event_dates ||
                    (artist?.future_event_dates?.length === 0 && !loading)
                  "
                >
                  No upcoming events for this artist.
                </div>
                <EventDateCard
                  v-for="(ed, index) in artist.future_event_dates"
                  :key="index"
                  :event="ed"
                  class="q-mb-md ed-card"
                />
              </div>

              <div
                class="flex column"
                v-if="
                  artist &&
                  artist.past_event_dates &&
                  artist.past_event_dates.length > 0
                "
              >
                <div class="q-mt-lg q-mb-md chicago t3">
                  {{ $t('artists.past_events') }}:
                </div>
                <div class="flex column" style="max-width: 100%">
                  <EventDateCard
                    v-for="(ed, index) in artist.past_event_dates"
                    :key="index"
                    :event="ed"
                    class="q-mb-md ed-card"
                  />
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div class="image-container q-ma-lg" v-if="$q.screen.gt.sm">
          <div class="image-container-background">
            <transition appear enter-active-class="animated fadeIn slower">
              <img :src="computedImageSrc" v-if="computedImageSrc" />
            </transition>
          </div>
        </div>
      </div>
      <transition appear enter-active-class="animated fadeIn slower">
        <div class="q-pb-lg footer" v-if="artist">
          <div class="t4">
            Artist info by
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
            >. In the future users will be able to update this page.
            <span class="link-hover" @click="refreshArtist">
              [Refresh info]</span
            >
          </div>
        </div>
      </transition>
    </template>
  </DialogPage>
</template>

<script>
import { getArtistRequest, refreshArtistRequest } from 'src/api';

import _ from 'lodash';
import ArtistUrl from './ArtistUrl.vue';
import EventDateCard from 'components/EventDateCard.vue';
import Tag from 'components/EventPage/Tags/TagComponent.vue';
import DialogPage from 'components/dialogs/DialogPage.vue';

import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import InnerLoading from 'src/components/InnerLoading.vue';

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
    DialogPage,
    ArtistUrl,
    EventDateCard,
    Tag,
    InnerLoading,
  },
  data() {
    return {
      artist: null,
      loading: false,
      showFullDescription: false,
    };
  },
  props: {
    id: {
      default: null,
    },
  },
  methods: {
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
          name: 'Login',
          query: { from: $router.currentRoute.path },
        });
      }
    },
  },
  mounted() {
    this.loading = true;
    getArtistRequest(this.id).then((response) => {
      this.loading = false;
      this.artist = response.data;

      var queryString = '?name=' + response.data.name.replace(/ /g, '_');

      if (window.location.pathname.indexOf(queryString) === -1) {
        this.$router.replace({
          path: this.$route.path,
          query: { name: response.data.name.replace(/ /g, '_') },
        });
      }
    });
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),

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
    computedImageSrc() {
      if (this.artist) {
        if (this.artist.media_items && this.artist.media_items[0]) {
          return this.artist.media_items[0].thumb_url;
        } else {
          var imageUrl = '';
          var index = this.artist.urls.findIndex((x) => x.type === 'image');
          if (index > -1) {
            imageUrl = this.artist.urls[index].url;
          }
          return imageUrl;
        }
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

<style lang="scss">
.artist-header {
  position: relative;
  .image-container {
    //max-width: 400px;
    // max-height: 400px;
    // min-width: 400px;
    height: 100%;
    width: auto;
    position: relative;
    overflow: hidden;
    border-radius: 100%;
    .image-container-background {
      height: 100%;
      width: 100%;
      //position: absolute;
      display: flex;
      flex-grow: 1;
      justify-content: center;
      align-items: center;
      img {
        width: 100%;
      }
    }
  }
  .ed-card {
    max-width: 400px;
  }
}
.footer {
  position: absolute;
  bottom: 0px;
}
@media only screen and (max-width: 1023px) {
  .solid-page {
    .artist-header {
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
          .overlay {
            position: absolute;
            height: 100%;
            width: 100%;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.68));
          }
          img {
            width: 100%;
          }
        }
      }
      .main-content {
        padding-left: 16px;
        padding-right: 16px;
      }

      .ed-card {
        max-width: 100%;
      }
    }
    .footer {
      position: relative;
      margin-top: 128px;
      padding-left: 16px;
      padding-right: 16px;
    }
  }
}
</style>
