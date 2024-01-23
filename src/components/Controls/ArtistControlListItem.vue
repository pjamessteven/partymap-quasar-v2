<template>
  <q-item :active="isActive" clickable>
    <q-item-section avatar>
      <router-link
        style="text-decoration: none; color: inherit"
        :to="{
          name: 'ArtistPage',
          params: { id: artist.id },
          query: {
            name: artist.name.replace(/ /g, '_'),
            thumb_xs_url: artist?.media_items?.[0]?.thumb_xxs_url,
          },
        }"
      >
        <q-avatar class="avatar">
          <img
            v-if="
              artist &&
              artist.media_items &&
              artist.media_items[0] &&
              artist.media_items[0].thumb_xxs_url
            "
            :src="artist.media_items[0].thumb_xxs_url"
          />
          <q-icon
            v-else
            size="1em"
            class="t3"
            name="mdi-account-music-outline"
          />
        </q-avatar>
      </router-link>
    </q-item-section>
    <q-item-section>
      <div class="flex row justify-between no-wrap">
        <div class="flex column justify-center no-wrap">
          <q-item-label>
            {{ artist.name }}
          </q-item-label>

          <q-item-label
            caption
            class="t4 ellipsis-2-lines"
            v-if="artist.disambiguation || artist.area"
          >
            {{ artist.disambiguation }}
            <span v-if="artist.area">
              <span v-if="artist.area.name"> ({{ artist.area.name }}) </span>
              <span v-else> ({{ artist.area }}) </span>
            </span>
          </q-item-label>
        </div>
        <q-checkbox
          :modelValue="isActive || false"
          style="pointer-events: none"
        />
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  props: ['artist', 'isActive'],
  data() {
    return {};
  },
  methods: {},
  computed: {},
};
</script>

<style lang="scss" scoped>
.body--dark {
  .avatar {
    background: $bi-4;
  }
}

.body--light {
  .avatar {
    background: $b-4;
  }
}
</style>
