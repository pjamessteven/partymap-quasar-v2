<template>
  <div class="flex">
    <router-link
      class="artist-head-link"
      style="text-decoration: none; color: inherit"
      :to="{
        name: 'ArtistPage',
        params: { id: artist.id },
        query: {
          name: artist.name.replace(/ /g, '_'),
          thumb_xs_url: artist?.media_items?.[0]?.thumb_xs_url,
        },
      }"
    >
      <q-chip
        class="artist-head"
        :class="$q.platform.is.ios ? 'no-hover' : ''"
        v-model="cookies"
      >
        <div class="artist-head-background" :style="getBgImgStyle()" />
        <div class="q-pl-lg">
          <q-avatar size="md">
            <img
              :src="artist.media_items[0].thumb_xxs_url"
              v-if="artist.media_items && artist.media_items[0]"
            />
            <q-icon
              v-else
              size="2em"
              class="t3"
              name="mdi-account-music-outline"
            />
          </q-avatar>
        </div>
        <div class="ellipsis inter bold q-pr-md">
          {{ artist.name }}
          <q-tooltip>{{ cookiesLabel }}</q-tooltip>
        </div>
      </q-chip>
    </router-link>
  </div>
</template>

<script>
export default {
  components: {},
  props: { artist: Object },
  data() {
    return {};
  },
  watch: {},
  methods: {
    getBgImgStyle() {
      var imageUrl = '';
      if (
        this.artist &&
        this.artist.media_items[0] &&
        this.artist.media_items[0].thumb_xs_url
      ) {
        imageUrl = this.artist.media_items[0].thumb_xs_url;
      }
      if (this.$q.dark.isActive) {
        return `background-image:  url("${imageUrl}");
        background-size: cover;
        display: inline-block;
        background-position: center;
        `;
      } else {
        return `background-image:  url("${imageUrl}");
          background-size: cover;
          display: inline-block;
          background-position: center;
          `;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .artist-head {
    overflow: hidden;
    border: 1px solid black;
    border: 1px solid rgba(48, 48, 48);

    .artist-head-background {
      background: $bi-3;
    }
  }
}
.body--light {
  .artist-head {
    .artist-head-background {
      background: $b-4;
    }
  }
}
.artist-head-link {
  color: unset !important;

  .artist-head {
    transition: all 0.3s ease;
    border-radius: 32px;
    height: 48px;
    padding: 0px;
    color: white;
    max-width: 400px;
    position: relative;
    overflow: hidden;
    transition: opacity 0.3s;
    transform: translate3d(0, 0, 0); // needed for ios
    cursor: pointer;
    @supports (font: -apple-system-body) and (-webkit-appearance: none) {
      //  -webkit-backface-visibility: hidden;
      // -webkit-transform: translate3d(0, 0, 0);
      // translate3d is a hack for safari to force gpu rendering of blur()
    }

    &:not(.no-hover) {
      &:before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        z-index: 10;
        opacity: 0;
        transition: opacity 0.3s;
      }
      &:hover {
        &:before {
          opacity: 1;
        }
      }
    }

    .artist-head-background {
      border-radius: 9px;
      overflow: hidden;
      z-index: -1;
      filter: blur(30px) brightness(0.4);
      transform: rotate(180deg) scaleX(-1) scale(2);
      position: absolute;
      height: 100%;
      width: 100%;
      //opacity: 0.4;
      transition: opacity 0.2s ease;

      @supports (font: -apple-system-body) and (-webkit-appearance: none) {
        -webkit-backface-visibility: hidden;
        transform: rotate(180deg) scaleX(-1) scale(2) translate3d(0, 0, 0);
        // translate3d is a hack for safari to force gpu rendering of blur()
      }
    }
  }

  .artist-name {
    color: white;
    z-index: 10;
    text-align: center;
    width: 100%;
  }
}

@media only screen and (min-width: 1921px) {
}

@media only screen and (max-width: 599px) {
}
</style>
