<template>
  <router-link
    :to="{
      name: 'UserProfile',
      params: { id: artist?.id || 0 },
      query: {
        name: artist?.name.replace(/ /g, '_'),
      },
    }"
  >
    <q-card v-if="!closed" class="shadow-lg card flex column">
      <q-inner-loading :showing="loading">
        <q-spinner-ios
          :color="$q.dark.isActive ? 'white' : 'black'"
          size="2em"
        />
      </q-inner-loading>
      <div
        v-if="artist"
        class="artist-header flex row justify-between items-start no-wrap q-pa-md"
      >
        <div
          class="image-container flex justify-center items-center shadow-2xl"
        >
          <div
            class="image-container-background"
            :style="computedAvatarStyle"
            v-if="computedImageSrc.length > 0"
          >
            <transition appear enter-active-class="animated fadeIn slower">
            </transition>
          </div>
          <div class="" v-else>
            <q-icon size="2em" class="t3" name="mdi-account-music-outline" />
          </div>
        </div>
        <div class="flex q-ml-md column no-wrap justify-between">
          <div class="flex-column ellipsis" style="max-width: 200px">
            <div class="text-h6 inter bold ellipsis">
              {{ computedName }}
            </div>
            <div
              class="ellipsis o-070 q-mt-sm"
              v-if="artist.disambiguation && artist.disambiguation.length > 0"
            >
              {{ artist.disambiguation_t || artist.disambiguation }}
            </div>

            <div
              class="q-mb-md o-070 ellipsis"
              v-if="artist && artist.tags && artist.tags.length > 0 && !loading"
              style="max-width: 200px"
            >
              <span v-for="(at, index) in artist.tags" :key="index">
                {{ at.tag
                }}<span v-if="index + 1 !== artist.tags.length">,</span>
              </span>
            </div>
            <div
              class="o-070 q-mb-md"
              v-if="
                artist &&
                ((artist.tags && artist.tags.length === 0) || !artist.tags) &&
                !loading
              "
            >
              No tags for this artist yet.
            </div>
            <div
              v-if="urls && urls.length > 0"
              class="flex row q-gutter-sm o-070 no-wrap"
              style="max-width: 100%; overflow-x: auto"
            >
              <ArtistUrl
                style="font-size: 1.2rem"
                :iconsOnly="true"
                v-for="(url, index) in urls"
                :url="url"
                :key="index"
              />
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
          --></div>
        </div>
      </div>
      <div class="card-background">
        <img
          :key="computedImageSrc"
          v-if="computedImageSrc"
          :src="computedImageSrc"
          class="item"
        />
      </div>
    </q-card>
  </router-link>
</template>

<script>
import { getArtistRequest } from 'src/api';

import _ from 'lodash';
import ArtistUrl from 'src/components/ArtistUrl.vue';

export default {
  name: 'UserListItem',

  components: {
    ArtistUrl,
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
    profileOnly: {
      default: false,
    },
  },

  mounted() {
    this.loading = true;
    getArtistRequest(this.id).then((response) => {
      this.loading = false;
      this.artist = response.data;

      /*
      TODO: set and restore selected artists from url query
      var queryString = '?name=' + response.data.name.replace(/ /g, '_');

      if (window.location.pathname.indexOf(queryString) === -1) {
        this.$router.replace({
          path: this.$router.currentRoute.path,
          query: { name: response.data.name.replace(/ /g, '_') },
        });
      }
          */
    });
  },
  computed: {
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
          return this.artist.media_items[0].thumb_xs_url;
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
    computedAvatarStyle() {
      if (this.computedImageSrc.length > 0) {
        return `background-image: url(${this.computedImageSrc});
        background-position: cover`;
      }
      return '';
    },
    urls() {
      // TODO: move this function to shared lib
      // because it's used on artist page as well
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
  .image-container {
    background: $bi-3;
  }
  .card {
    &:hover {
      .card-background {
        opacity: 0.8;
      }
    }
  }
  @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
    .card {
      background-color: rgba(36, 36, 36, 1) !important;

      -webkit-backdrop-filter: blur(20px);
      backdrop-filter: blur(20px);
    }
  }
}
.body--light {
  @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
    .card {
      background-color: rgba(0, 0, 0, 0.48) !important;
      color: white;
      -webkit-backdrop-filter: blur(8px);
      backdrop-filter: blur(10px);
    }
  }
  .card {
    &:hover {
      .card-background {
        opacity: 0.2;
      }
    }
  }
  .image-container {
    background: $b-3;
  }
}
.card {
  transition: opacity 0.3s;
  position: relative;
  overflow: hidden;
  .artist-header {
    position: relative;
    height: 100%;
    .image-container {
      //max-width: 400px;
      // max-height: 400px;
      // min-width: 400px;
      width: 100%;
      position: relative;
      overflow: hidden;
      //border-radius: 100%;
      height: 96px;
      width: 96px;
      border-radius: 9px;
      .image-container-background {
        height: 100%;
        width: 100%;
        background-position: center;
        background-size: contain;
        display: flex;
        flex-grow: 1;
        justify-content: flex-start;
        align-items: flex-start;
        img {
          width: 100%;
        }
      }
    }
    .ed-card {
      max-width: 400px;
    }
  }
  .card-background {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    z-index: -1;
    opacity: 0.48;
    transition: opacity 0.3s;
    border-radius: 9px;
    overflow: hidden;
    display: flex;
    // height: Min(calc(100vh - 360px), 548px);
    height: 100%;
    //justify-content: center;
    transform: scale(1.2) translateX(1);
    will-change: auto;
    .item {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      //  filter: blur(50px);
      -webkit-backface-visibility: hidden;
      -webkit-transform: translate3d(0, 0, 0);
      -webkit-transform: translateZ(0);
      backface-visibility: hidden;
      transform: translate3d(0, 0, 0);
      transform: translateZ(0) scale(2);
      filter: blur(50px);
      // position by top left corner of image
      left: calc(0px + (100% / 2) - 128px);
      top: calc(0px + (100% / 2) - 128px);
    }
  }
}

@media only screen and (max-width: 599px) {
  .card {
    color: white;

    .artist-header {
      .image-container {
        //max-width: 400px;
        // max-height: 400px;
        // min-width: 400px;
        max-height: 96px;
        max-width: 96px;
      }
      .main-content {
        padding-left: 16px;
        padding-right: 16px;
      }

      .ed-card {
        max-width: 100%;
      }
    }
  }
}
</style>
