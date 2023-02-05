<template>
  <div class="flex row items-baseline">
    <a
      :href="url.url"
      target="_blank"
      class="no-wrap flex row items-baseline"
      @click.stop
    >
      <q-icon name="lab la-soundcloud" v-if="url.type === 'soundcloud'" />
      <q-icon name="lab la-youtube" v-else-if="url.type === 'youtube'" />
      <q-icon name="lab la-bandcamp" v-else-if="url.type === 'bandcamp'" />
      <q-icon name="lab la-lastfm" v-else-if="url.type === 'last.fm'" />
      <q-icon name="lab la-wikipedia-w" v-else-if="url.type === 'wikipedia'" />
      <q-icon name="lab la-spotify" v-else-if="url.type === 'spotify'" />
      <q-icon name="lab la-apple" v-else-if="url.type === 'apple'" />
      <q-icon
        name="lab la-facebook-square"
        v-else-if="url.type === 'facebook'"
      />
      <q-icon name="lab la-instagram" v-else-if="url.type === 'instagram'" />
      <q-icon name="lab la-twitter" v-else-if="url.type === 'twitter'" />
      <q-icon name="lab la-amazon" v-else-if="url.type === 'amazon'" />
      <q-icon name="las la-play" v-else-if="url.type === 'streaming'" />
      <q-icon name="las la-play" v-else-if="url.type === 'free streaming'" />
      <q-icon name="las la-external-link-alt" v-else />
      <span class="url-type t1 q-ml-xs" v-if="!iconsOnly">{{ url.type }}</span>
    </a>
  </div>
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

<style lang="scss">
a {
  color: unset;
  text-decoration: none;
  &:hover {
    color: $primary;
  }
}
.artist-url {
  opacity: 0.68;
}
</style>
