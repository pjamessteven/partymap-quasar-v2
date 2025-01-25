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
        :class="`artist-head-wrapper flex column justify-start items-center size-${size}`"
      >
        <div class="artist-head flex column no-wrap">
          <div
            class="artist-head-img"
            :class="{
              'no-hover': $q.platform.is.ios,
            }"
          >
            <img
              :src="artist?.media_items[0].thumb_xs_url"
              v-if="artist?.media_items[0]"
            />
            <q-icon v-else size="3em" name="mdi-account-music-outline" />
          </div>
          <div
            class="artist-name q-mt-sm t2 ellipsis"
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
  props: { artist: Object, size: String },
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
    .artist-head {
      .artist-head-img {
        border-top: 1px solid rgba(48, 48, 48);
        border-bottom: 1px solid rgba(48, 48, 48, 0.4);
        background: $bi-3;
        box-shadow:
          0 7px 4px -4px rgba(0, 0, 0, 0.4),
          0 12px 10px 2px rgba(0, 0, 0, 0.3),
          0 5px 16px 4px rgba(0, 0, 0, 0.5);
        color: $ti-2;
      }
    }
    .card-bottom-background {
      background: $bi-3;
    }
  }
}
.body--light {
  .artist-head-wrapper {
    .card-bottom-background {
      background: $b-1;
    }
    .artist-head {
      .artist-head-img {
        //background: grey;
        background: $b-1;

        color: $t-4;
        /*
        box-shadow: 0 7px 8px -4px rgba(0, 0, 0, 0.1),
          0 6px 8px 2px rgba(0, 0, 0, 0.05), 0 5px 10px 4px rgba(0, 0, 0, 0.08);
          */
      }
    }
  }
}
.artist-head-link {
  color: unset !important;
}

.artist-head-wrapper {
  margin-right: -48px;
  transition: all 0.3s ease;
  border-radius: 9px;
  width: 164px;
  height: 196px;
  max-width: 164px;
  position: relative;
  overflow: hidden;
  transition: opacity 0.3s;
  transform: translate3d(0, 0, 0); // needed for ios
  cursor: pointer;

  .artist-name {
    z-index: 10;
    text-align: center;
    width: 100%;
  }

  &.size-sm {
    width: 96px;
    height: 116px;
    max-width: 96px;
    font-size: 10px;
    margin-right: -42px;
    .artist-name {
      padding: 0px 4px;
    }
  }

  &.size-md {
    width: 144px;
    height: 172px;
    max-width: 144px;
    .artist-name {
      font-weight: 400 !important;
      font-size: small;
      max-width: 90px;
      margin-left: 10px;
      padding: 0px 4px;
    }
  }

  &.size-lg {
    width: 164px;
    height: 196px;
    max-width: 164px;
    .artist-name {
      padding: 0px 12px;
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
    transition: opacity 0.2s ease;
  }

  .artist-head {
    padding: 16px;
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 99%; // dont ask
    transition: all 0.3s ease;
    .artist-head-img {
      border-radius: 100%;
      overflow: hidden;
      height: 96px;
      width: 96px;
      width: 100%;
      display: flex;
      flex-grow: 1;
      justify-content: center;
      align-items: center;
      transition: all 0.3s ease;
      position: relative;
      box-shadow:
        rgba(0, 0, 0, 0.1) 0px 3px 12px 0px,
        rgba(0, 0, 0, 0.07) 0px 0px 0px 1px;
      img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &:not(.no-hover) {
        &:before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.15);
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
    }
  }
}

@media only screen and (max-width: 599px) {
}
</style>
