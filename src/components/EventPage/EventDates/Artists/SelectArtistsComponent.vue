<template>
  <div class="select-artists-component flex column">
    <SelectArtistsInput @selectedArtist="onSelectArtist($event)" />
    <div
      class="flex row no-wrap items-center q-mt-sm list-select"
      style="max-width: 100%"
    >
      <q-tabs
        v-model="selectedList"
        inline-label
        shrink
        outside-arrows
        mobile-arrows
      >
        <q-tab v-for="list in lists" :key="list" :label="list" :name="list" />
      </q-tabs>
      <div class="flex row items-center no-wrap">
        <q-btn flat icon-right="mdi-plus" label="Add Stage" class="t3">
          <q-menu
            transition-show="jump-down"
            transition-hide="jump-up"
            anchor="bottom right"
            self="top right"
          >
            <div class="flex row">
              <q-input
                v-model="listToAdd"
                filled
                square
                placeholder="Stage name"
              />
              <q-btn @click="addList" label="Add" flat square />
            </div>
          </q-menu>
        </q-btn>
      </div>
    </div>
    <q-list v-if="artistsOfList.length > 0" class="q-mt-md">
      <div
        class="flex column"
        v-for="(artist, index) in artistsOfList"
        :key="artist.id + artist.mbid"
      >
        <q-separator v-if="index !== 0" />
        <ArtistListItem
          :artist="artist"
          :editing="true"
          :defaultDate="defaultDate"
          @delete="deleteArtist(artist)"
          @removeDate="removeArtistDate(aritst)"
          @updateDate="updateArtistDate(artist, $event)"
        />
      </div>
    </q-list>
    <span
      class="link-hover t3 q-mt-md"
      @click="copyLineupFromExistingEvent = !copyLineupFromExistingEvent"
      >[Copy lineup from a similar event?]</span
    >
    <SelectEventInput
      class="q-mt-sm"
      v-if="copyLineupFromExistingEvent"
      @event="loadArtistListFromExistingEvent($event)"
    />
    <q-btn
      v-if="lists?.length > 1"
      class="q-mt-md"
      color="red"
      label="Remove stage"
      icon="mdi-minus"
      @click="removeList"
    />
    <div
      class="select-artists-bottom flex row grow justify-end q-py-md"
      v-if="mode !== 'newEvent'"
    >
      <q-btn
        :label="$t('general.save_changes')"
        @click="saveChanges()"
        color="primary"
      />
    </div>
  </div>
</template>

<script>
import SelectEventInput from 'src/components/SelectEventInput.vue';

import _, { update } from 'lodash';
import ArtistListItem from './ArtistListItem.vue';
import SubmitSuggestionPrompt from 'components/EventPage/Suggestions/SubmitSuggestionPrompt.vue';
import SelectArtistsInput from './SelectArtistsInput.vue';
import { mapState, mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    ArtistListItem,
    SelectArtistsInput,
    SelectEventInput,
  },
  props: {
    mode: String,
    artists: Array,
    defaultDate: String,
    prepopulateArtistsToAdd: Array,
  },
  data() {
    return {
      copyLineupFromExistingEvent: false,
      copyLineupFromExistingEventArtists: null,

      originalArtistsList: [],
      artistsList: [],
      artistsToDelete: [],
      artistsToAdd: [],
      artistsToUpdate: [],
      listToAdd: null,
      lists: [],
      selectedList: null,
    };
  },
  watch: {
    prepopulateArtistsToAdd: {
      handler(newv, oldv) {
        if (newv.length > 0) {
          this.loadArtistListToAddFromProps();
        }
      },
      deep: true,
    },
    artistsToAdd: {
      handler(newv, oldv) {
        // for new event mode
        this.$emit('updated', newv);
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions(useEventStore, ['updateEventDate', 'suggestEventDateEdit']),
    removeArtistDate(artist) {
      artist.remove_date = true;
      artist.start_naive = null;
      const existingUpdateIndex = this.artistsToUpdate.findIndex(
        (x) => x.name === artist.name
      );
      if (existingUpdateIndex >= 0) {
        this.artistsToUpdate[existingUpdateIndex] = artist;
      } else {
        this.artistsToUpdate.push(artist);
      }
      this.sortArtistList();
    },
    updateArtistDate(artist, newDate) {
      artist.start_naive = newDate;
      const existingUpdateIndex = this.artistsToUpdate.findIndex(
        (x) => x.name === artist.name
      );
      if (existingUpdateIndex >= 0) {
        this.artistsToUpdate[existingUpdateIndex] = artist;
      } else {
        this.artistsToUpdate.push(artist);
      }
      this.sortArtistList();
    },
    deleteArtist(artist) {
      const originalExistingIndex = this.originalArtistsList.findIndex(
        (x) => x.name === artist.name
      );
      const existingIndex = this.artistsList.findIndex(
        (x) => x.name === artist.name
      );
      const existingAddIndex = this.artistsToAdd.findIndex(
        (x) => x.name === artist.name
      );
      const existingUpdateIndex = this.artistsToUpdate.findIndex(
        (x) => x.name === artist.name
      );

      if (existingIndex >= 0) {
        this.artistsList.splice(existingIndex, 1);
      }
      if (existingAddIndex >= 0) {
        this.artistsToAdd.splice(existingAddIndex, 1);
      }
      if (existingUpdateIndex >= 0) {
        this.artistsToUpdate.splice(existingUpdateIndex, 1);
      }
      // artist has already been saved so we do need to remove it
      if (originalExistingIndex >= 0) {
        this.artistsToDelete.push(artist);
      }
    },
    removeList() {
      var index = this.lists.indexOf(this.selectedList);
      this.lists.splice(index, 1);
      // remove artists associated with stage
      for (let x in this.artistsList) {
        if (this.artistsList[x].stage === this.selectedList) {
          this.artistsList[x].toDelete = true;
        }
      }
      this.selectedList = this.lists[0];
    },
    addList() {
      if (this.listToAdd) {
        this.lists.push(this.listToAdd);
        this.lists = [...new Set(this.lists)]; // remove duplicates
      }
      this.listToAdd = null;
    },
    loadLists() {
      var lists = [];
      // first get stages (need to rename to lists) that exist in artist list
      lists = this.artistsList.map((x) => x.stage);
      lists = lists.sort((a, b) => a.localeCompare(b));

      lists = [...new Set(lists)]; // remove duplicates

      if (lists.length === 0) {
        lists.push('main stage');
      } else if (lists.indexOf('main stage') > -1) {
        // move main stage to front of list
        lists.splice(lists.indexOf('main stage'), 1);
        lists.splice(0, 0, 'main stage');
      }
      this.lists = lists;
      this.selectedList = lists[0];
    },
    sortArtistList() {
      // sort by name first
      this.artistsList.sort((a, b) => {
        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
        var nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      // then sort by date
      this.artistsList.sort((a, b) => {
        if (!a.start_naive && !b.start_naive) {
          return 0;
        } else if (!a.start_naive) {
          return 1;
        } else if (!b.start_naive) {
          return -1;
        } else if (a.start_naive && b.start_naive) {
          return new Date(a.start_naive) - new Date(b.start_naive);
        }
      });
    },
    onSelectArtist(value) {
      value.toAdd = true;
      value.stage = this.selectedList;
      this.artistsList.push(value);
      this.artistsToAdd.push(value);
    },
    loadArtistList() {
      this.originalArtistsList = _.cloneDeep(this.selectedEventDate.artists);
      this.artistsList = _.cloneDeep(this.selectedEventDate.artists);
      this.sortArtistList();
    },
    loadArtistListFromExistingEvent(event) {
      console.log(event);
      // got map the event_date_artist artist_id to the id field
      const artistsMapped = event.next_date.artists.map((artist) => ({
        id: artist.artist_id,
        ...artist,
      }));
      this.originalArtistsList = _.cloneDeep(artistsMapped);
      this.artistsList = _.cloneDeep(artistsMapped);
      this.artistsToAdd = _.cloneDeep(artistsMapped);
      this.sortArtistList();
    },
    async saveChanges() {
      if (this.currentUserCanEdit) {
        const progressDialog = this.$q.dialog({
          title: this.$t('edit_event_date.submitting'),
          color: 'primary',
          progress: true, // we enable default settings
          cancel: false,
          persistent: true, // we want the user to not be able to close it
          ok: false,
        });
        try {
          await this.updateEventDate({
            add_artists: this.artistsToAdd,
            remove_artists: this.artistsToDelete,
            update_artists: this.artistsToUpdate,
          });
          this.$emit('hideDialog');
          window.bus.$emit('closeDialog');
        } catch (e) {}

        progressDialog.hide();
      } else {
        this.$q
          .dialog({
            parent: this,
            component: SubmitSuggestionPrompt,
          })
          .onOk(async (messageAndToken) => {
            // make suggestion
            // suggest edit instead of editing directly
            const progressDialog = this.$q.dialog({
              title: this.$t('edit_event_date.submitting'),
              color: 'primary',
              progress: true, // we enable default settings
              cancel: false,
              persistent: true, // we want the user to not be able to close it
              ok: false,
            });
            try {
              await this.suggestEventDateEdit({
                ...messageAndToken,
                ...{
                  add_artists: this.artistsToAdd,
                  remove_artists: this.artistsToDelete,
                  update_artists: this.artistsToUpdate,
                },
              });
              this.$q
                .dialog({
                  title: this.$t('edit_event_date.submitted'),
                  message: this.$t('edit_event_date.submitted_msg'),
                  color: 'primary',
                  persistent: false, // we want the user to not be able to close it
                })
                .onDismiss(() => {
                  this.$emit('hideDialog');
                  window.bus.$emit('closeDialog');
                });
            } catch (e) {}
            progressDialog.hide();
          });
      }
    },
  },
  computed: {
    ...mapState(useEventStore, [
      'event',
      'selectedEventDate',
      'currentUserCanEdit',
    ]),
    ...mapState(useAuthStore, ['currentUser']),
    artistsOfList() {
      if (this.selectedList === 'main stage') {
        // if main stage is selected, show artists with no list('stage') assigned
        return this.artistsList.filter(
          (x) => x.stage === 'main stage' || !x.stage
        );
      } else {
        return this.artistsList.filter((x) => x.stage === this.selectedList);
      }
    },
  },
  mounted() {
    if (this.mode !== 'newEvent') {
      this.loadArtistList();
      this.loadLists();
    } else {
      this.lists = ['main stage'];
      this.selectedList = 'main stage';
      // prepopulate the 'artists to add' list from props
      // used when copying one lineup from one event to a new event
    }
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .select-artists-component {
    .artist-list {
      background: $bi-3;
    }
    .select-artists-bottom {
      background: $bi-2;
    }
  }
}
.body--light {
  .select-artists-component {
    .artist-list {
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    .select-artists-bottom {
      border-top: 1px solid rgba(0, 0, 0, 0.1);

      background: white;
    }
  }
}
.select-artists-component {
  position: relative;
  .select-artists-bottom {
    position: sticky;
    bottom: 0px;
  }
}
.taggroup-move {
  transition: transform 500ms;
}
.tag-container {
  display: flex;
  flex-direction: row;
  overflow: unset;
  justify-content: flex-start;
  flex-wrap: wrap;
}
@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
