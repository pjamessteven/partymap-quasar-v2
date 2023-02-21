<template>
  <q-item :active="active" clickable @click="$emit('onClick')">
    <q-item-section avatar>
      <q-avatar class="avatar" square size="xl">
        <img
          v-if="artist?.media_items?.[0]?.thumb_xxs_url"
          :src="artist.media_items[0].thumb_xxs_url"
        />
        <q-icon v-else size="1em" class="t3" name="mdi-account-music-outline" />
      </q-avatar>
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
        <!--
        <q-checkbox
          :value="
            controlArtistSelectedOptions.findIndex(
              x => x.id == artist.id
            ) > -1xw
          "
          @update:model-value="clickArtist(artist)"
        />
        -->
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  components: {},
  props: { artist: Object, active: Boolean },
};
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 600px) {
}
</style>
