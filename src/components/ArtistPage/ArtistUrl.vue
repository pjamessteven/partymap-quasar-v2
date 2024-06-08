<template>
  <a :href="url.url" target="_blank" class="" @click.stop>
    <div
      class="nav-button q-pa-sm q-pl-md grow flex no-wrap row items-center"
      style="width: 100%"
    >
      <q-icon
        size="1.5em"
        name="lab la-soundcloud"
        v-if="url.type === 'soundcloud'"
      />
      <q-icon
        size="1.5em"
        name="lab la-youtube"
        v-else-if="url.type === 'youtube'"
      />
      <q-icon
        size="1.5em"
        name="lab la-bandcamp"
        v-else-if="url.type === 'bandcamp'"
      />
      <q-icon
        size="1.5em"
        name="lab la-lastfm"
        v-else-if="url.type === 'last.fm'"
      />
      <q-icon
        size="1.5em"
        name="lab la-wikipedia-w"
        v-else-if="url.type === 'wikipedia'"
      />
      <q-icon
        size="1.5em"
        name="lab la-spotify"
        v-else-if="url.type === 'spotify'"
      />
      <q-icon
        size="1.5em"
        name="lab la-apple"
        v-else-if="url.type === 'apple' || url.type === 'apple music'"
      />
      <q-icon
        size="1.5em"
        name="lab la-facebook-square"
        v-else-if="url.type === 'facebook'"
      />
      <q-icon
        size="1.5em"
        name="lab la-instagram"
        v-else-if="url.type === 'instagram'"
      />
      <q-icon
        size="1.5em"
        name="lab la-twitter"
        v-else-if="url.type === 'twitter'"
      />
      <q-icon
        size="1.5em"
        name="lab la-amazon"
        v-else-if="url.type === 'amazon'"
      />
      <q-icon
        size="1.5em"
        name="las la-play"
        v-else-if="url.type === 'streaming'"
      />
      <q-icon
        size="1.5em"
        name="las la-play"
        v-else-if="url.type === 'free streaming'"
      />
      <q-icon size="1.5em" name="las la-external-link-alt" v-else />
      <span class="url-type q-ml-sm" v-if="!iconsOnly">{{ url.type }}</span>
    </div>
  </a>
</template>

<script>
export default {
  name: 'ArtistUrl',
  data() {
    return {};
  },
  props: {
    url: {
      default: null,
    },
    iconsOnly: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
a {
  max-width: 300px;
  color: unset;
  text-decoration: none;
  &:hover {
    color: $primary;
  }
}
.artist-url {
  opacity: 0.68;
}
@media only screen and (max-width: 600px) {
  a {
    max-width: unset;
    width: 100%;
  }
}
</style>
