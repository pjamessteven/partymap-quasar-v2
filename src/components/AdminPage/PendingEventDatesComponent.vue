<template>
  <q-card class="column events-card" style="height: 100%">
    <q-card-section class="text-h6">
      All event dates:

      <div class="row q-mt-md q-gutter-sm">
        <q-input
          v-model="searchQuery"
          label="Search event dates"
          class="grow"
          @keyup.enter="refreshEventDates"
        />
        <q-select
          emit-value
          v-model="sortField"
          :options="sortOptions"
          label="Sort by"
          style="min-width: 100px"
        />
        <q-toggle
          v-model="showEmptyLineupOnly"
          label="No lineup"
          style="font-size: small"
        />
        <q-toggle
          v-model="showDateUnconfirmedOnly"
          label="Date unconfirmed"
          style="font-size: small"
        />
        <q-toggle
          v-model="disctinct"
          label="Distinct"
          style="font-size: small"
        />
        <q-input
          v-model="dateMin"
          label="From date"
          type="date"
          style="min-width: 150px"
          @update:model-value="refreshEventDates"
        />
        <q-btn
          flat
          round
          icon="mdi-sort"
          @click="() => (sortDesc = !sortDesc)"
          :disable="!eventDates || eventDates.length === 0"
        >
          <q-tooltip>Toggle sort direction</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="mdi-select-all"
          @click="selectAll"
          :disable="!eventDates || eventDates.length === 0"
        >
          <q-tooltip>Select all</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>
    <q-card-section class="col" style="overflow: auto">
      <q-list v-if="eventDates && eventDates.length > 0">
        <q-item
          v-for="(item, index) in eventDates"
          :key="index"
          clickable
          @click="toggleSelectEvent(item.id)"
        >
          <q-item-section avatar @click.stop>
            <q-checkbox
              :model-value="selectedEvents.has(item.id)"
              @update:model-value="(val) => toggleSelectEvent(item.id, val)"
            />
          </q-item-section>
          <q-item-section>
            <div class="flex row grow justify-between no-wrap items-center">
              <div class="flex column no-wrap">
                <q-item-label class="flex row items-center">
                  <router-link
                    class="link-hover"
                    :to="{ name: 'EventPage', params: { id: item.event_id } }"
                    >{{ item.name || 'Untitled Event Date' }}</router-link
                  >
                </q-item-label>
                <q-item-label caption>
                  {{ formatDate(item.start) }} - {{ formatDate(item.end) }}
                </q-item-label>
                <q-item-label caption>
                  Created {{ timeAgo(item.created_at) }}
                </q-item-label>
              </div>
              <div class="controls">
                <q-btn
                  color="red"
                  round
                  size="sm"
                  flat
                  @click="deleteEventDate(item.id)"
                >
                  <q-icon name="las la-trash" />
                </q-btn>
                <q-btn
                  color="green"
                  round
                  size="sm"
                  flat
                  @click="approveEventDate(item.id)"
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
      <div class="t3 flex grow justify-center" v-else>
        No pending event dates :(
      </div>
    </q-card-section>

    <div v-show="selectedEvents.size > 0" class="footer bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          {{ selectedEvents.size }} event date(s) selected
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
    </div>

    <q-inner-loading :showing="loading || bulkProcessing">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import {
  getEventDatesRequest,
  deleteEventDateRequest,
  editEventDateRequest,
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
      eventDates: null,
      page: 1,
      perPage: 10,
      hasNext: false,
      loading: false,
      showDateUnconfirmedOnly: false,
      showEmptyLineupOnly: false,
      disctinct: true,
      searchQuery: '',
      tagQuery: '',
      dateMin: new Date().toISOString().split('T')[0], // Default to today's date
      sortField: 'created_at',
      sortDesc: true,
      sortOptions: [
        { label: 'Created Date', value: 'created_at' },
        { label: 'Start Date', value: 'start' },
      ],
      selectedEvents: new Set(),
      bulkProcessing: false,
      bulkProgress: 0,
    };
  },
  mounted() {
    this.loadEventDates();
  },
  methods: {
    selectAll() {
      if (this.eventDates && this.eventDates.length > 0) {
        if (
          this.eventDates.every((event) => this.selectedEvents.has(event.id))
        ) {
          this.selectedEvents.clear();
        } else {
          this.eventDates.forEach((event) => {
            this.selectedEvents.add(event.id);
          });
        }
      }
    },

    toggleSelectEvent(id, checked) {
      if (checked === undefined) {
        if (this.selectedEvents.has(id)) {
          this.selectedEvents.delete(id);
        } else {
          this.selectedEvents.add(id);
        }
      } else {
        if (checked) {
          this.selectedEvents.add(id);
        } else {
          this.selectedEvents.delete(id);
        }
      }
    },

    async bulkDelete() {
      this.$q
        .dialog({
          title: 'Delete Event Dates',
          message: `Are you sure you want to delete ${this.selectedEvents.size} event dates?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          this.bulkProcessing = true;
          this.bulkProgress = 0;

          const progressDialog = this.$q.dialog({
            title: 'Deleting Event Dates...',
            message: this.bulkProgressMessage,
            progress: true,
            persistent: true,
            ok: false,
          });

          const total = this.selectedEvents.size;
          let completed = 0;

          for (const id of this.selectedEvents) {
            try {
              await deleteEventDateRequest(id);
              this.eventDates = this.eventDates.filter(
                (event) => event.id !== id,
              );
            } catch (error) {
              console.error('Error deleting event date:', error);
            }

            completed++;
            this.bulkProgress = Math.round((completed / total) * 100);
            progressDialog.update({
              message: this.bulkProgressMessage,
            });
          }

          this.selectedEvents.clear();
          progressDialog.hide();
          this.bulkProcessing = false;
        });
    },

    deleteEventDate(id) {
      this.$q
        .dialog({
          title: 'Delete event date',
          message: 'Are you sure?',
          color: 'primary',
          persistent: false,
        })
        .onOk(() => {
          const progressDialog = this.$q.dialog({
            title: 'Deleting...',
            color: 'primary',
            progress: true,
            cancel: false,
            persistent: true,
            ok: false,
          });
          deleteEventDateRequest(id).then(
            () => {
              progressDialog.hide();
              const indexToDelete = this.eventDates.findIndex(
                (x) => x.id === id,
              );
              this.eventDates.splice(indexToDelete, 1);
            },
            () => {
              progressDialog.hide();
            },
          );
        });
    },

    loadMore() {
      this.page += 1;
      this.loadEventDates();
    },

    refreshEventDates() {
      this.page = 1;
      this.eventDates = null;
      this.loadEventDates();
    },

    loadEventDates() {
      this.loading = true;
      getEventDatesRequest({
        query: this.searchQuery || undefined,
        date_unconfirmed: this.showDateUnconfirmedOnly || undefined,
        empty_lineup: this.showEmptyLineupOnly || undefined,
        date_min: this.dateMin || undefined,
        page: this.page,
        sort: this.sortField,
        desc: this.sortDesc,
        per_page: this.perPage,
        disctinct: this.disctinct,
        tags: this.tagQuery?.length ? [this.tagQuery] : undefined,
      }).then((response) => {
        this.loading = false;
        if (this.page === 1) {
          this.eventDates = response.data.items;
        } else {
          this.eventDates = [...this.eventDates, ...response.data.items];
        }
        this.hasNext = response.data.has_next;
      });
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    },
  },
  watch: {
    showEmptyLineupOnly() {
      this.refreshEventDates();
    },
    showHiddenOnly() {
      this.refreshEventDates();
    },
    showDateUnconfirmedOnly() {
      this.refreshEventDates();
    },
    sortField() {
      this.refreshEventDates();
    },
    sortDesc() {
      this.refreshEventDates();
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    bulkProgressMessage() {
      return `Processing ${this.bulkProgress}% complete...`;
    },
  },
  created() {
    this.timeAgo = common.timeAgo;
  },
};
</script>

<style lang="scss" scoped>
.events-card {
  position: relative;
  .footer {
    position: sticky;
    bottom: 0;
    width: 100%;
  }
}
</style>
