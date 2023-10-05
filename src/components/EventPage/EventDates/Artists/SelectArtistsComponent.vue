<template>
  <div class="select-artists-component flex column">
    <q-select
      option-label="name"
      style="max-width: 100%"
      ref="musicBrainzInput"
      :loading="loadingResults"
      outlined
      use-input
      menu-anchor="top left"
      menu-self="bottom left"
      v-model="selectValue"
      @update:model-value="onSelectArtist"
      emit-value
      map-options
      :options="results"
      @filter="filterFn"
      label="Search for artists"
    >
      <template v-slot:append>
        <q-icon name="search" class="q-pa-md" />
      </template>
      <template v-slot:option="scope">
        <q-item :key="scope.opt.id" v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>
              {{ scope.opt.name }}
              <span v-if="scope.opt.newRecord">(Create new record)</span>
            </q-item-label>
            <q-item-label caption>
              {{ scope.opt.disambiguation }}
              <span v-if="scope.opt.area && scope.opt.area.name">
                ({{ scope.opt.area.name }})
              </span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
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
    <q-list v-if="artistsListWithoutToDelete.length > 0" class="q-mt-md">
      <div
        class="flex column"
        v-for="(artist, index) in artistsListWithoutToDelete"
        :key="artist.id + artist.mbid"
      >
        <q-separator v-if="index !== 0" />
        <ArtistListItem
          :artist="artist"
          :editing="true"
          @updated="sortArtistList"
          :defaultDate="defaultDate"
          @delete="
            () => {
              artist.toDelete = true;
              sortArtistList();
            }
          "
          @removeDate="
            () => {
              artist.remove_date = true;
              artist.start_naive = null;
              artist.toUpdate = true;
              sortArtistList();
            }
          "
          @updateDate="
            (newDate) => {
              artist.start_naive = newDate;
              artist.toUpdate = true;
              sortArtistList();
            }
          "
        />
      </div>
    </q-list>
    <q-btn
      v-if="lists?.length > 1"
      class="q-mt-md"
      color="red"
      label="Remove stage"
      icon="mdi-minus"
      @click="removeList"
    />
    <div class="flex row grow justify-end q-mt-lg" v-if="mode !== 'emit'">
      <q-btn
        :label="$t('general.save_changes')"
        @click="saveChanges()"
        color="primary"
      />
    </div>
  </div>
</template>

<script>
import { getMusicBrainzArtist, getArtistsRequest } from 'src/api';
import _ from 'lodash';
import ArtistListItem from './ArtistListItem.vue';
import SubmitSuggestionPrompt from 'components/EventPage/Suggestions/SubmitSuggestionPrompt.vue';

import { mapState, mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    ArtistListItem,
  },
  props: { mode: String, artists: Array, defaultDate: String },
  data() {
    return {
      results: null,
      loadingResults: false,
      selectValue: null,
      artistsList: [],
      listToAdd: null,
      lists: [],
      selectedList: null,
    };
  },
  watch: {},
  methods: {
    ...mapActions(useEventStore, ['updateEventDate', 'suggestEventDateEdit']),

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
      // for emit mode
      this.$emit('updated', this.artistsToAdd);
    },
    onSelectArtist(value) {
      value.toAdd = true;
      value.stage = this.selectedList;
      this.artistsList.push(value);
      this.sortArtistList();
      this.results = [];
      this.selectValue = '';
    },
    filterFn(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      update(async () => {
        if (val === '') {
          this.results = [];
        } else {
          this.loadingResults = true;
          try {
            // if one of the below calls fails... both will.. :(
            const [pmResponse, mbResponse] = await Promise.all([
              getArtistsRequest({
                query: val,
                page: 1,
                sort: 'event_count',
                desc: true,
                per_page: 5,
              }),
              getMusicBrainzArtist(val),
            ]);
            let mappedResponse = mbResponse.data.artists
              .map(({ id, ...rest }) => ({ ...rest, mbid: id }))
              .filter(
                (x) =>
                  pmResponse.data.items.findIndex((y) => y.mbid === x.mbid) ===
                  -1
              );
            this.results = [
              ...[{ name: val, newRecord: true }],
              ...pmResponse.data.items,
              ...mappedResponse,
            ];
            //this.$refs.musicBrainzInput.refresh();
            this.loadingResults = false;
          } catch {
            abort();
          }
        }
      });
    },
    loadArtistList() {
      this.artistsList = _.cloneDeep(this.selectedEventDate.artists);
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
    artistsListWithoutToDelete() {
      // all artists without ones to delete
      // for UI
      var list = this.artistsList.filter((x) => !x.toDelete);
      if (this.selectedList) {
        list = list.filter((x) => x.stage === this.selectedList);
      }
      return list;
    },
    artistsToUpdate() {
      // don't include artists that haven't been added yet or artists to delete
      return this.artistsList.filter(
        (x) => x.toUpdate && !x.toAdd && !x.toDelete
      );
    },
    artistsToAdd() {
      return this.artistsList.filter((x) => x.toAdd && !x.toDelete);
    },
    artistsToDelete() {
      // don't include artists that haven't been added yet
      return this.artistsList.filter((x) => x.toDelete && !x.toAdd);
    },
  },
  mounted() {
    if (this.mode !== 'emit') {
      this.loadArtistList();
      this.loadLists();
    } else {
      this.lists = ['main stage'];
      this.selectedList = 'main stage';
    }
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .artist-list {
    background: $bi-3;
  }
  .list-select {
    //background: $bi-2;
  }
}
.body--light {
  .artist-list {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  .list-select {
    //background: $b-2;
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
