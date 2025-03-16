<template>
  <q-card>
    <q-card-section class="text-h6">
      Pending events:

      <div class="row q-mt-md q-gutter-sm">
        <q-input
          v-model="searchQuery"
          label="Search events"
          class="grow"
          @keyup.enter="refreshEvents"
        />
        <q-select
          emit-value
          v-model="sortField"
          :options="sortOptions"
          label="Sort by"
          style="min-width: 200px"
        />
        <q-toggle
          v-model="sortDesc"
          label="Descending"
          style="font-size: small"
        />
        <q-toggle
          v-model="showHiddenOnly"
          label="Show hidden only"
          style="font-size: small"
        />
      </div>
    </q-card-section>
    <q-card-section class="">
      <q-list v-if="events && events.length > 0">
        <q-item v-for="(item, index) in events" :key="index" clickable @click="toggleSelectEvent(item.id)">
          <q-item-section avatar @click.stop>
            <q-checkbox 
              :model-value="selectedEvents.has(item.id)"
              @update:model-value="val => toggleSelectEvent(item.id, val)"
            />
          </q-item-section>
          <q-item-section>
            <div class="flex row grow justify-between no-wrap items-center">
              <div class="flex column no-wrap">
                <q-item-label class="flex row items-center">
                  <router-link
                    class="link-hover"
                    :to="{ name: 'EventPage', params: { id: item.id } }"
                    >{{ item.name }} </router-link
                  ><q-icon
                    class="q-ml-sm"
                    name="mdi-check-decagram"
                    v-if="item.host"
                  >
                    <q-tooltip
                      :content-class="
                        $q.dark.isActive
                          ? 'bg-black text-white'
                          : 'bg-white text-black'
                      "
                      :offset="[10, 10]"
                      content-style="font-size: 16px"
                    >
                      {{ $t('event.official_page') }}
                    </q-tooltip></q-icon
                  >
                </q-item-label>
                <q-item-label caption>
                  created {{ timeAgo(item.created_at) }} by
                  <router-link
                    class="link-hover"
                    v-if="item.creator"
                    :to="{
                      name: 'UserPage',
                      params: { username: item.creator?.username },
                    }"
                    >{{ item.creator?.username }}</router-link
                  >
                </q-item-label>
              </div>
              <div class="controls">
                <q-btn
                  color="red"
                  round
                  size="sm"
                  flat
                  @click="deleteEvent(item.id)"
                >
                  <q-icon name="las la-trash" />
                </q-btn>
                <q-btn
                  color="green"
                  round
                  size="sm"
                  flat
                  @click="approveEvent(item.id)"
                >
                  <q-icon name="las la-check" />
                </q-btn>
              </div>
            </div>
          </q-item-section>
        </q-item>
        <div class="flex grow justify-center">
          <q-btn
            :label="$t('activity.load_more')"
            v-if="hasNext"
            icon="mdi-chevron-down"
            @click="loadMore"
            flat
          />
        </div>
      </q-list>
      <div class="t3 flex grow justify-center" v-else>No pending events :(</div>
    </q-card-section>
    <q-footer v-if="selectedEvents.size > 0" class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          {{ selectedEvents.size }} event(s) selected
        </q-toolbar-title>
        
        <q-btn 
          flat 
          round 
          icon="delete" 
          @click="bulkDelete"
          :disable="bulkProcessing"
        >
          <q-tooltip>Delete selected</q-tooltip>
        </q-btn>
        
        <q-btn 
          flat 
          round 
          icon="check" 
          @click="bulkApprove"
          :disable="bulkProcessing"
        >
          <q-tooltip>Approve selected</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-footer>

    <q-inner-loading :showing="loading || bulkProcessing">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import {
  getEventsRequest,
  deleteEventRequest,
  editEventRequest,
} from 'src/api';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';

import common from 'assets/common';

export default {
  components: {},
  props: {
    id: {
      default: null,
      loading: false,
    },
  },
  data() {
    return {
      events: null,
      page: 1,
      perPage: 10,
      hasNext: false,
      loading: false,
      showHiddenOnly: true,
      searchQuery: '',
      sortField: 'created_at',
      sortDesc: true,
      sortOptions: [
        { label: 'Created Date', value: 'created_at' },
        { label: 'Name', value: 'name' },
        { label: 'ID', value: 'id' },
      ],
      selectedEvents: new Set(),
      bulkProcessing: false,
      bulkProgress: 0
    };
  },
  mounted() {
    // load user activities
    this.loadEvents();
  },
  methods: {
    toggleSelectEvent(id, checked) {
      if (checked === undefined) {
        // Toggle if no value provided
        if (this.selectedEvents.has(id)) {
          this.selectedEvents.delete(id);
        } else {
          this.selectedEvents.add(id);
        }
      } else {
        // Set based on checkbox value
        if (checked) {
          this.selectedEvents.add(id);
        } else {
          this.selectedEvents.delete(id);
        }
      }
    },
    
    async bulkDelete() {
      this.$q.dialog({
        title: 'Delete Events',
        message: `Are you sure you want to delete ${this.selectedEvents.size} events?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        this.bulkProcessing = true;
        this.bulkProgress = 0;
        
        const progressDialog = this.$q.dialog({
          title: 'Deleting Events...',
          message: this.bulkProgressMessage,
          progress: true,
          persistent: true,
          ok: false
        });
        
        const total = this.selectedEvents.size;
        let completed = 0;
        
        for (const id of this.selectedEvents) {
          try {
            await deleteEventRequest(id);
            this.events = this.events.filter(event => event.id !== id);
          } catch (error) {
            console.error('Error deleting event:', error);
          }
          
          completed++;
          this.bulkProgress = Math.round((completed / total) * 100);
          progressDialog.update({
            message: this.bulkProgressMessage
          });
        }
        
        this.selectedEvents.clear();
        progressDialog.hide();
        this.bulkProcessing = false;
      });
    },
    
    async bulkApprove() {
      this.$q.dialog({
        title: 'Approve Events',
        message: `Are you sure you want to approve ${this.selectedEvents.size} events?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        this.bulkProcessing = true;
        this.bulkProgress = 0;
        
        const progressDialog = this.$q.dialog({
          title: 'Approving Events...',
          message: this.bulkProgressMessage,
          progress: true,
          persistent: true,
          ok: false
        });
        
        const total = this.selectedEvents.size;
        let completed = 0;
        
        for (const id of this.selectedEvents) {
          try {
            await editEventRequest(id, { hidden: false });
            this.events = this.events.filter(event => event.id !== id);
          } catch (error) {
            console.error('Error approving event:', error);
          }
          
          completed++;
          this.bulkProgress = Math.round((completed / total) * 100);
          progressDialog.update({
            message: this.bulkProgressMessage
          });
        }
        
        this.selectedEvents.clear();
        progressDialog.hide();
        this.bulkProcessing = false;
      });
    },
    
    deleteEvent(id) {
      this.$q
        .dialog({
          title: 'Delete event',
          message: 'Are you sure?',
          color: 'primary',
          persistent: false, // we want the user to not be able to close it
        })
        .onOk(() => {
          const progressDialog = this.$q.dialog({
            title: 'Doo do doo..',
            color: 'primary',
            progress: true, // we enable default settings
            cancel: false,
            persistent: true, // we want the user to not be able to close it
            ok: false,
          });
          deleteEventRequest(id).then(
            () => {
              progressDialog.hide();
              var indexToDelete = this.events.findIndex((x) => x.id === id);
              this.events.splice(indexToDelete, 1);
            },
            () => {
              // on error
              progressDialog.hide();
            },
          );
        });
    },
    approveEvent(id) {
      editEventRequest(id, { hidden: false }).then(
        () => {
          var indexToDelete = this.events.findIndex((x) => x.id === id);
          this.events.splice(indexToDelete, 1);
        },
        () => {
          // on error
        },
      );
    },
    loadMore() {
      this.page += 1;
      this.loadEvents();
    },
    refreshEvents() {
      this.page = 1;
      this.events = null;
      this.loadEvents();
    },
    loadEvents() {
      this.loading = true;
      getEventsRequest({
        query: this.searchQuery || undefined,
        hidden: this.showHiddenOnly ? true : undefined,
        page: this.page,
        sort: this.sortField,
        desc: this.sortDesc,
        per_page: this.perPage,
      }).then((response) => {
        this.loading = false;
        if (this.page === 1) {
          this.events = response.data.items;
        } else {
          this.events = [...this.events, ...response.data.items];
        }
        this.hasNext = response.data.has_next;
      });
    },
  },
  watch: {
    showHiddenOnly() {
      this.refreshEvents();
    },
    sortField() {
      this.refreshEvents();
    },
    sortDesc() {
      this.refreshEvents();
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    bulkProgressMessage() {
      return `Processing ${this.bulkProgress}% complete...`;
    }
  },
  created() {
    this.timeAgo = common.timeAgo;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
</style>
