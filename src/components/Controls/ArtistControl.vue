<template>
  <div>
    <q-btn
      no-caps
      class="button-control flex items-center"
      :class="{
        active: controlArtist && controlArtist.length > 0,
      }"
    >
      <div class="flex items-center row no-wrap">
        <q-icon
          style="font-size: 18px"
          name="mdi-close-circle"
          class="q-pr-md"
          @click.stop="
            () => {
              controlArtist = [];
              menuShowing = false;
            }
          "
          v-if="controlArtist && controlArtist.length > 0"
        />
        <i class="las la-music q-mr-sm q-ml-none q-pr-none" />

        <div v-if="!controlArtist || controlArtist.length === 0">
          {{ $t('top_controls.select_artist') }}
        </div>
        <div v-else>
          <span v-for="(artist, index) in controlArtist" :key="index"
            >{{ artist.name
            }}<span
              v-if="
                index != controlArtist.length - 1 && controlArtist.length > 1
              "
            >
              &
            </span></span
          >
        </div>
      </div>

      <q-menu
        @before-show="onBeforeShowMenu"
        @before-hide="onBeforeHideMenu"
        v-model="menuShowing"
        anchor="top middle"
        self="bottom middle"
        :offset="[0, 8]"
      >
        <div class="flex column">
          <div class="sticky-input">
            <q-input
              @input="loadInitialList()"
              debounce="500"
              clearable
              class="q-ml-md q-mr-md"
              v-model="query"
              borderless
              bg-color="transparent"
              :label="$t('top_controls.search_artists')"
            >
              <template v-slot:append>
                <q-icon name="mdi-magnify" class="q-my-md" />
              </template>
            </q-input>
            <div class="separator" style="width: 100%" />
          </div>
          <q-scroll-area
            vertical
            ref="scroll"
            @scroll="onScrollMainContent"
            style="
              max-height: 400px !important;
              max-width: 350px;
              height: 400px;
              min-width: 300px;
              overflow-x: hidden;
            "
          >
            <div
              class="flex column"
              style="position: relative; min-height: 400px"
            >
              <q-list v-if="artists && artists.length > 0">
                <q-item-label
                  header
                  class="t3 q-pb-sm"
                  v-if="!query || query.length == 0"
                  >{{ $t('top_controls.top_artists_in_area') }}:</q-item-label
                >

                <div
                  class="flex column"
                  v-for="(artist, index) in artists"
                  :key="index"
                >
                  <q-separator v-if="index > 0" />
                  <q-item
                    :active="
                      controlArtist.findIndex((x) => x.id == artist.id) > -1
                    "
                    clickable
                    @click="clickArtist(artist)"
                  >
                    <q-item-section avatar>
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
                              <span v-if="artist.area.name">
                                ({{ artist.area.name }})
                              </span>
                              <span v-else> ({{ artist.area }}) </span>
                            </span>
                          </q-item-label>
                        </div>
                        <!--
                        <q-checkbox
                          :value="
                            controlArtist.findIndex(
                              x => x.id == artist.id
                            ) > -1
                          "
                          @input="clickArtist(artist)"
                        />
                        -->
                      </div>
                    </q-item-section>
                  </q-item>
                </div>
              </q-list>
              <div class="row justify-center q-my-md" v-if="hasNext">
                <q-spinner-ios
                  :color="$q.dark.isActive ? 'white' : 'black'"
                  size="2em"
                />
              </div>
              <div
                class="flex row grow justify-center items-center q-my-md"
                v-if="loading && page == 1"
                style="height: 100%"
              >
                <q-spinner-ios
                  :color="$q.dark.isActive ? 'white' : 'black'"
                  size="2em"
                />
              </div>
            </div>
          </q-scroll-area>
        </div>
      </q-menu>
    </q-btn>
  </div>
</template>

<script>
import { mapActions, mapWritableState } from 'pinia';
import { useMapStore } from 'src/stores/map';
export default {
  data() {
    return {
      menuShowing: false,
      query: null,
    };
  },
  methods: {
    ...mapActions(useQueryStore, [
      'loadArtistOptions',
      'loadMoreArtistOptions',
    ]),
    clickArtist(artist) {
      this.controlArtist = [artist];
    },
    onBeforeShowMenu() {
      // used to stop the ed list refrshing on mobile viewport size change
      this.blockUpdates = true;
      if (!this.artists || this.artists.length === 0) {
        this.loadInitialList();
      }
    },
    onBeforeHideMenu() {
      setTimeout(() => {
        this.blockUpdates = false;
      }, 1500);
    },
    onScrollMainContent(info) {
      if (info.verticalPercentage === 1) {
        // reached bottom
        this.loadMoreArtistOptions(this.query);
      }
    },
    loadInitialList() {
      this.artistOptionsPage = 1;
      this.loadArtistOptions(this.query);
    },
  },
  computed: {
    ...mapWritableState(useMapStore, ['blockUpdates']),
    ...mapWritableState(useQueryStore, ['controlArtist', 'artistOptionsPage']),
    ...mapState(useQueryStore, [
      'artistOptions',
      'artistOptionsHasNext',
      'artistOptionsLoading',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .sticky-input {
    background: black;
  }
  .avatar {
    background: $bi-4;
  }
}

.body--light {
  .sticky-input {
    background: white;
  }
  .avatar {
    background: $b-4;
  }
}

.avatar {
  overflow: hidden;
}
.sticky-input {
  position: sticky;
  z-index: 1;
  top: 0;
}
.date-picker {
  border-radius: 0px !important;
  border-bottom-left-radius: 9px !important;
  border-bottom-rightradius: 9px !important;
}
</style>
