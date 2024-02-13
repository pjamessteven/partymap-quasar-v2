<template>
  <div style="height: 100%">
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
        <div
          class="close-icon-wrapper"
          v-if="controlArtist && controlArtist.length > 0"
          @click.stop="
            (event) => {
              controlArtist = [];
              event.preventDefault();
            }
          "
        >
          <q-icon style="font-size: 18px" name="mdi-close" />
        </div>
        <div class="button-label flex row items-center row no-wrap">
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
      </div>
      <MenuWrapper
        :showing="showing"
        @hide="onHide()"
        @show="onShow()"
        class="menu-wrapper"
        @scroll="onScrollMainContent($event)"
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
        <div class="control-menu" @scroll="onScrollMainContent($event)">
          <div
            :class="$q.screen.lt.sm ? 'q-pb-lg' : undefined"
            class="flex column grow"
            v-if="artistOptions && artistOptions.length > 0"
          >
            <q-list>
              <q-item-label
                header
                class="t3 q-pb-sm"
                v-if="
                  (!query || query.length == 0) && topArtistsInArea?.length > 0
                "
                >Top artists in this area:</q-item-label
              >

              <div
                class="flex column"
                v-for="(artist, index) in topArtistsInArea"
                :key="index + 'a'"
              >
                <div class="q-px-md">
                  <q-separator v-if="index > 0" />
                </div>
                <ArtistControlListItem
                  @click="clickArtist(artist)"
                  :artist="artist"
                  :isActive="
                    controlArtist.findIndex((x) => x.id == artist.id) > -1
                  "
                />
              </div>
              <q-item-label
                header
                class="t3 q-pb-sm"
                v-if="!query || query.length == 0"
                >Top artists worldwide:</q-item-label
              >

              <div
                class="flex column"
                v-for="(artist, index) in artistOptions"
                :key="index"
              >
                <div class="q-px-md">
                  <q-separator v-if="index > 0" />
                </div>
                <ArtistControlListItem
                  @click="clickArtist(artist)"
                  :artist="artist"
                  :isActive="
                    controlArtist.findIndex((x) => x.id == artist.id) > -1
                  "
                />
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
import _ from 'lodash';
import ArtistControlListItem from './ArtistControlListItem.vue';
import MenuWrapper from './MenuWrapper.vue';

export default {
  components: {
    MenuWrapper,
    ArtistControlListItem,
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
      if (this.controlArtist.findIndex((x) => x.id === artist.id) > -1) {
        this.controlArtist = [];
      } else {
        this.controlArtist = [artist];
      }

      this.onHide();
    },
    onShow() {
      // used to stop the ed list refrshing on mobile viewport size change
      //  this.blockUpdates = true;
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
      /*
      setTimeout(() => {
        this.blockUpdates = false;
      }, 1500);
      */
    },
    onScrollMainContent(event) {
      if (
        event.target.offsetHeight + event.target.scrollTop >=
        event.target.scrollHeight - 1
      ) {
        // reached bottom, load more
        this.debouncedLoadMore(this.query);
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
      'topArtistsInArea',
      'artistOptionsHasNext',
      'artistOptionsLoading',
      'artistOptionsPerPage',
    ]),
  },
  created() {
    this.debouncedLoadMore = _.debounce(this.loadArtistOptions, 150, {
      leading: true,
      trailing: false,
    });
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
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

@media only screen and (max-width: 599px) {
  .control-menu {
    max-width: unset;
  }
}
</style>
