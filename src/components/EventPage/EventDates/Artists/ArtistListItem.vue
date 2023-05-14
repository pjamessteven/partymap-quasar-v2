<template>
  <q-item
    class="flex row items-center artist-list-item"
    :class="{
      add: artist.toAdd,
      delete: artist.toDelete,
      update: artist.toUpdate && !artist.toAdd && !artist.toDelete,
    }"
  >
    <q-item-section avatar>
      <router-link
        v-if="artist.artist_id || artist.id"
        :to="{
          name: 'ArtistPage',
          params: {
            id: artist.artist_id ? artist.artist_id : artist.id,
          },
          query: {
            name: (artist.name + '').replace(/ /g, '_'),
          },
        }"
      >
        <q-avatar class="avatar">
          <img
            v-if="artist?.media_items?.[0]?.thumb_xxs_url"
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
      <q-avatar class="avatar" v-else>
        <q-icon size="1em" class="t3" name="mdi-account-music-outline" />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <div class="flex row justify-between items-center no-wrap">
        <div class="flex row items-center no-wrap">
          <q-btn
            class="delete-button q-mr-md"
            color="red"
            round
            size="sm"
            flat
            v-if="editing"
            @click="deleteArtist"
          >
            <q-icon name="las la-trash" />
          </q-btn>
          <div class="flex column justify-center no-wrap">
            <q-item-label>
              <div class="flex row no-wrap items-center">
                <span
                  class="q-mr-sm t2"
                  :class="$q.screen.gt.sm ? 'text-large' : ''"
                >
                  <router-link
                    v-if="artist.artist_id || artist.id"
                    :to="{
                      name: 'ArtistPage',
                      params: {
                        id: artist.artist_id ? artist.artist_id : artist.id,
                      },
                      query: {
                        name: (artist.name + '').replace(/ /g, '_'),
                      },
                    }"
                    class="artist-link"
                  >
                    {{ artist.name }}
                  </router-link>
                  <span v-else> {{ artist.name }} </span>
                </span>
                <div
                  class="q-gutter-xs t4 text-large flex row items-center"
                  v-if="!editing"
                >
                  <div v-for="url in urls" :key="url.url">
                    <a
                      :href="url.url"
                      target="_blank"
                      v-if="url.type === 'spotify'"
                    >
                      <q-icon name="lab la-spotify" />
                    </a>
                    <a
                      :href="url.url"
                      target="_blank"
                      v-if="url.type === 'apple'"
                    >
                      <q-icon name="lab la-apple" />
                    </a>
                    <a
                      :href="url.url"
                      target="_blank"
                      v-if="url.type === 'soundcloud'"
                    >
                      <q-icon name="lab la-soundcloud" />
                    </a>
                    <a
                      :href="url.url"
                      target="_blank"
                      v-if="url.type === 'youtube'"
                    >
                      <q-icon name="lab la-youtube" />
                    </a>
                    <a
                      :href="url.url"
                      target="_blank"
                      v-if="url.type === 'bandcamp'"
                    >
                      <q-icon name="lab la-bandcamp" />
                    </a>
                  </div>
                </div>
              </div>
            </q-item-label>
            <q-item-label
              caption
              class="t4"
              v-if="artist.disambiguation || artist.area"
            >
              {{ artist.disambiguation }}
              <span v-if="artist.area">
                <span v-if="artist.area.name"> ({{ artist.area.name }}) </span>
                <span v-else> ({{ artist.area }}) </span>
              </span>
            </q-item-label>
          </div>
        </div>
        <div class="time">
          <q-btn
            :label="$t('artists.add_time')"
            @click="showDateTimeDialog = true"
            flat
            color="primary"
            style="white-space: nowrap"
            v-if="editing && !artist.start_naive"
          />
          <q-btn
            :label="
              localDay(artist.start_naive) +
              ' ' +
              localTimeCompact(artist.start_naive)
            "
            @click="showDateTimeDialog = true"
            flat
            class="t3"
            style="white-space: nowrap"
            v-else-if="editing && artist.start_naive"
            :style="editing ? ' ' : 'pointer-events: none;'"
          />
          <div
            v-else-if="artist.start_naive"
            class="t4 q-ml-sm"
            style="white-space: nowrap; font-size: 0.75rem"
          >
            {{
              localDay(artist.start_naive) +
              ' ' +
              localTimeCompact(artist.start_naive)
            }}
          </div>
        </div>
      </div>
    </q-item-section>

    <q-dialog
      v-model="showDateTimeDialog"
      transition-show="fade"
      transition-hide="none"
    >
      <q-card class="q-pa-md flex column">
        <DateTimePicker
          @singleDate="newDate = $event"
          :singleValue="artist.start_naive || defaultDate"
        />
        <div class="flex row justify-end q-gutter-sm q-mt-lg">
          <q-btn
            v-if="artist.start_naive"
            :label="$t('artists.remove_time')"
            @click="removeDate"
            color="red"
          />
          <q-btn
            color="primary"
            @click="showDateTimeDialog = false"
            label="Cancel"
          />
          <q-btn color="primary" @click="updateDate" label="Ok" />
        </div>
      </q-card>
    </q-dialog>
  </q-item>
</template>

<script>
import _ from 'lodash';
import common from 'assets/common';
import DateTimePicker from 'components/DateTimePicker.vue';

import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

export default {
  name: 'ArtistListItem',
  components: { DateTimePicker },
  watch: {},
  data() {
    return { showDateTimeDialog: false, newDate: null };
  },
  props: {
    artist: Object,
    editing: Boolean,
    defaultDate: String,
  },
  methods: {
    deleteArtist() {
      this.$emit('delete');
    },
    removeDate() {
      this.showDateTimeDialog = false;
      this.$emit('removeDate');
    },
    updateDate() {
      this.showDateTimeDialog = false;
      this.$emit('updateDate', this.newDate);
    },
  },
  computed: {
    ...mapState(useEventStore, ['event', 'selectedEventDate']),

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
            url.type = 'apple';
          }
        }
        return urls.filter(
          (x) =>
            x.type === 'spotify' ||
            x.type === 'bandcamp' ||
            x.type === 'youtube' ||
            x.type === 'soundcloud' ||
            x.type === 'apple'
        );
      } else {
        return [];
      }
    },
  },
  created() {
    this.localTimeCompact = common.localTimeCompact;
    this.localDay = common.localDay;
  },
};
</script>

<style lang="scss" scoped>
a {
  color: unset;
  text-decoration: none;
  &:hover {
    color: $primary;
  }
}
.body--dark {
  .avatar {
    background: $bi-3;
  }
}
.body--light {
  .avatar {
    background: $b-3;
  }
}

.artist-list-item {
  position: relative;
  .artist-link {
    &:hover {
      color: $primary;
    }
  }
}
</style>
