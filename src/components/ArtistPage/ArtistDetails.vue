<template>
  <div class="artist-details flex column justify-center">
    <transition appear enter-active-class="animated fadeIn slower">
      <div class="flex column" v-if="artist && !loading">
        <div class="flex column details">
          <div
            class="q-mt-lg q-mb-sm metropolis bold o-080"
            v-if="artist && artist.disambiguation?.length > 0 && false"
          >
            {{ $t('artist_page.disambiguation') }}:
          </div>
          <div
            class="o-080 q-mt-lg"
            v-if="artist && artist.disambiguation?.length > 0"
          >
            {{ artist.disambiguation_t || artist.disambiguation }}
          </div>

          <div
            class="q-mt-lg q-mb-sm metropolis bold o-080"
            v-if="artist && artist.tags && artist.tags.length > 0 && !loading"
          >
            {{ $t('artist_page.tags') }}:
          </div>
          <!--
            <div
              class="o-060"
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
            class="flex row wrap q-gutter-xs q-mt-xs"
            style="max-width: 100%"
            v-if="artist && artist.tags"
          >
            <Tag
              v-for="(at, index) in artist.tags"
              :key="index"
              :value="at.tag_t || at.tag"
              :label="at.label"
            ></Tag>
          </div>

          <div
            class="q-mt-lg q-mb-sm metropolis bold o-080"
            v-if="computedDescription && computedDescription.length > 0"
          >
            {{ $t('artist_page.description') }}:
          </div>
          <!--
            <div
              class="o-060"
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
            class="t2"
            v-if="computedDescription && computedDescription.length > 0"
          >
            <span v-if="artist" v-html="computedDescription" /><span
              v-if="longDescription && !showFullDescription"
              @click="showFullDescription = true"
              class="link-hover underline q-ml-xs"
            >
              {{ $t('artist_page.show_more') }}
            </span>
            <span
              v-if="longDescription && showFullDescription"
              @click="showFullDescription = false"
              class="link-hover underline"
            >
              {{ $t('artist_page.show_less') }}
            </span>
          </div>

          <div
            class="q-mt-lg q-mb-sm metropolis bold o-080"
            v-if="urls && urls.length > 0"
          >
            {{ $t('artist_page.links') }}:
          </div>

          <div class="flex column q-gutter-sm q-pt-xs" style="max-width: 100%">
            <ArtistUrl v-for="(url, index) in urls" :url="url" :key="index" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { toRaw } from 'vue';

import _ from 'lodash';
import ArtistUrl from './ArtistUrl.vue';
import Tag from 'components/EventPage/Tags/TagComponent.vue';

import { mapState, mapWritableState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { useQueryStore } from 'src/stores/query';
import { useMapStore } from 'src/stores/map';

import { useMainStore } from 'src/stores/main';
export default {
  name: 'ArtistDetails',
  components: {
    //SolidPage,
    ArtistUrl,
    Tag,
  },
  data() {
    return {
      loading: false,
      showFullDescription: false,
      loadedFullRes: false, // full resolution image loaded, hide smaller placeholder
    };
  },
  props: {
    artist: {
      default: null,
    },
  },

  computed: {
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
.artist-details {
  z-index: 10;

  .details {
  }

  .footer {
    display: flex;
    flex-grow: 1;
    align-items: flex-end;
    position: relative;
    color: white;
  }
}
@media only screen and (max-width: 1023px) {
  .artist-page {
    .footer {
      padding-left: 16px;
      padding-right: 16px;
    }
  }
}
</style>
