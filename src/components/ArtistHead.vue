<template>
  <div>
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
      <div
        class="artist-head-wrapper flex column justify-start items-center"
        :class="$q.platform.is.ios ? 'no-hover' : ''"
      >
        <div class="card-bottom-background" :style="getBgImgStyle()" />
        <div class="artist-head flex column no-wrap">
          <div class="artist-head-background shadow-2xl">
            <img
              :src="artist.media_items[0].thumb_xs_url"
              v-if="artist.media_items && artist.media_items[0]"
            />
            <q-icon
              v-else
              size="2em"
              class="t3"
              name="mdi-account-music-outline"
            />
          </div>
          <div
            class="artist-name q-mt-sm inter bold ellipsis"
            :class="{ 'text-large': false }"
          >
            {{ artist.name }}
          </div>
        </div>
      </div>
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
  .artist-head-wrapper {
    overflow: hidden;
    border: 1px solid black;
    border-top: 1px solid rgba(48, 48, 48);

    .card-bottom-background {
      background: $bi-3;
    }
  }
}
.body--light {
  .artist-head-wrapper {
    .card-bottom-background {
      background: $b-4;
    }
  }
}
.artist-head-link {
  color: unset !important;
}

.artist-head-wrapper {
  transition: all 0.3s ease;
  border-radius: 9px;
  width: 144px;
  height: 176px;
  max-width: 144px;
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
  .card-bottom-background {
    border-radius: 9px;
    overflow: hidden;
    z-index: -1;
    filter: blur(30px) brightness(0.8);
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

  .artist-head {
    padding: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    transition: all 0.3s ease;
    .artist-head-background {
      border-radius: 100%;
      overflow: hidden;
      height: 96px;
      width: 96px;
      //height: 100%;
      width: 100%;
      display: flex;
      flex-grow: 1;
      justify-content: center;
      align-items: center;
      transition: all 0.3s ease;
      opacity: 0.9;
      img {
        width: 100%;
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
  .artist-head-wrapper {
    transition: all 0.3s ease;
    border-radius: 9px;
    width: 144px;
    height: 168px;
    max-width: 144px;
    position: relative;
    overflow: hidden;
  }
}

@media only screen and (max-width: 599px) {
  .artist-head-wrapper {
    width: 128px;
    height: 156px;
    max-width: 128px;
    .artist-head {
    }
  }
}
</style>
