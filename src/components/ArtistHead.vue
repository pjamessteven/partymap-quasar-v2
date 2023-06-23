<template>
  <router-link
    :to="{
      name: 'ArtistPage',
      params: { id: artist.id },
      query: {
        name: artist.name.replace(/ /g, '_'),
      },
    }"
  >
    <div class="artist-head-wrapper flex column justify-start items-center">
      <div class="card-bottom-background" :style="getBgImgStyle()" />
      <div class="card-bottom-background-underlay" />
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
        <div class="artist-name q-mt-sm inter bolder ellipsis">
          {{ artist.name }}
        </div>
      </div>
    </div>
  </router-link>
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
        //filter: blur(1px);

        `;
      } else {
        return `background-image:  url("${imageUrl}");
          background-size: cover;
          display: inline-block;
          background-position: center;
          //filter: blur(1px);

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
    .card-bottom-background {
      background: $bi-3;
      filter: blur(12px) brightness(68%);
    }
    .artist-head {
    }
  }
}
.body--light {
  .artist-head-wrapper {
    &:hover {
      opacity: 0.9;
    }
  }
}

.artist-head-wrapper {
  transition: all 0.3s ease;
  border-radius: 9px;
  width: 128px;
  height: 156px;
  max-width: 128px;
  position: relative;
  overflow: hidden;
  transition: opacity 0.3s;
  &:hover {
    .card-bottom-background {
      opacity: 0.9;
    }
    .artist-head {
      filter: brightness(120%);
    }
  }
  .card-bottom-background {
    border-radius: 9px;
    overflow: hidden;
    //border: 1px solid #181818;
    z-index: 0;
    filter: blur(12px);
    transform: rotate(180deg) scaleX(-1) scale(2);
    //mask-image: linear-gradient(to top, transparent 0%, white 64px);
    position: absolute;
    height: 100%;
    width: 100%;
    //opacity: 0.4;
    transition: opacity 0.2s ease;
  }
  .card-bottom-background-underlay {
    z-index: -1;
    position: absolute;
    height: 100%;
    width: 100%;
    opacity: 1;
    background: white;
    border-radius: 9px;
    //background: white;
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
      height: 100%;
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
a {
  color: unset;
  text-decoration: none;
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

@media only screen and (max-width: 600px) {
  /*
  .artist-head-wrapper {
    width: 80px;
    max-width: 80px;
    .artist-head {
      border-radius: 100%;
      height: 64px;
      width: 64px;
    }
  }
  */
  .artist-head-wrapper {
    .artist-head {
    }
  }
}
</style>
