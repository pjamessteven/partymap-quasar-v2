<template>
  <div>
    <q-btn
      @click="
        () => {
          showing = !showing;
        }
      "
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
            (event) => {
              controlArtist = [];
              event.preventDefault();
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
      <MenuWrapper
        :showing="showing"
        @hide="onHide()"
        @show="onShow()"
        class="menu-wrapper"
      >
        <div class="sticky-input">
          <q-input
            debounce="500"
            clearable
            class="q-ml-md q-mr-md"
            v-model="query"
            ref="input"
            borderless
            bg-color="transparent"
            :label="$t('top_controls.search_artists')"
            @keyup.enter="$refs.input.blur()"
          >
            <template v-slot:append>
              <q-icon
                name="mdi-magnify"
                class="q-my-md"
                v-if="!query || query?.length == 0"
              />
            </template>
          </q-input>
          <div class="separator" style="width: 100%" />
        </div>
        <div @scroll="onScrollMainContent($event)" class="control-menu">
          <div
            class="flex column grow"
            v-if="artistOptions && artistOptions.length > 0"
          >
            <q-list>
              <q-item-label
                header
                class="t3 q-pb-sm"
                v-if="!query || query.length == 0"
                >{{ $t('top_controls.top_artists_in_area') }}:</q-item-label
              >

              <div
                class="flex column"
                v-for="(artist, index) in artistOptions"
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
                          @update:model-value="clickArtist(artist)"
                        />
                        -->
                    </div>
                  </q-item-section>
                </q-item>
              </div>
            </q-list>
            <div
              class="row justify-center q-my-lg"
              v-if="artistOptionsHasNext && artistOptions?.length > 0"
            >
              <q-spinner-ios
                :color="$q.dark.isActive ? 'white' : 'black'"
                size="2em"
              />
            </div>
          </div>
          <div
            class="flex row grow justify-center items-center"
            v-if="artistOptionsLoading && artistOptionsPage == 1"
          >
            <q-spinner-ios
              :color="$q.dark.isActive ? 'white' : 'black'"
              size="2em"
            />
          </div>
        </div>
      </MenuWrapper>
    </q-btn>
  </div>
</template>

<script>
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useMapStore } from 'src/stores/map';
import { useQueryStore } from 'src/stores/query';

import MenuWrapper from './MenuWrapper.vue';

export default {
  components: {
    MenuWrapper,
  },
  data() {
    return {
      query: null,
      showing: false,
    };
  },
  methods: {
    ...mapActions(useQueryStore, [
      'loadArtistOptions',
      'loadMoreArtistOptions',
    ]),
    clickArtist(artist) {
      this.controlArtist = [artist];

      this.onHide();
    },
    onShow() {
      // used to stop the ed list refrshing on mobile viewport size change
      this.blockUpdates = true;
      if (!this.artistOptions || this.artistOptions.length === 0) {
        this.loadInitialList();
      }
    },
    onHide() {
      this.showing = false;
      // unload additional pages to reduce render load next time the dialog is opened
      this.artistOptions = this.artistOptions.slice(
        0,
        this.artistOptionsPerPage
      );
      this.artistOptionsPage = 2;
      setTimeout(() => {
        this.blockUpdates = false;
      }, 1500);
    },
    onScrollMainContent(event) {
      this.$emit('testing', event.target.scrollTop);
      if (
        event.target.offsetHeight + event.target.scrollTop >=
        event.target.scrollHeight
      ) {
        // reached bottom, load more
        this.loadArtistOptions(this.query);
      }
    },
    loadInitialList() {
      this.artistOptionsPage = 1;
      this.loadArtistOptions(this.query);
    },
  },
  watch: {
    query() {
      this.artistOptions = [];
      this.loadInitialList();
    },
  },
  computed: {
    ...mapWritableState(useMapStore, ['blockUpdates']),
    ...mapWritableState(useQueryStore, [
      'controlArtist',
      'artistOptionsPage',
      'artistOptions',
    ]),
    ...mapState(useQueryStore, [
      'artistOptionsHasNext',
      'artistOptionsLoading',
      'artistOptionsPerPage',
    ]),
  },
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

.avatar {
  overflow: hidden;
}
.control-menu {
  display: flex;
  flex-direction: column;

  min-height: 400px;
  max-width: 300px;
}

@media only screen and (max-width: 600px) {
  .control-menu {
    max-width: unset;
  }
}
</style>
