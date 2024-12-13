<template>
  <q-card class="dialog-card upload-dialog">
    <div class="dialog-card-header flex row wrap items-center no-wrap q-mb-md">
      <div class="flex column">
        <div class="text-h6 card-title q-pr-md">
          {{ $t('event.add_lineup_poster') }}
        </div>
      </div>
    </div>
    <div class="dialog-card-content q-pb-md q-px-md">
      <q-select
        option-label="label"
        style="max-width: 100%"
        outlined
        use-input
        menu-anchor="top left"
        menu-self="bottom left"
        v-model="selectedDate"
        emit-value
        map-options
        :options="eventDates"
        :label="$t('event.event_date')"
      >
        <template v-slot:append>
          <q-icon name="mdi-calendar-outline" class="q-pa-md" />
        </template>
      </q-select>
      <MultipleMediaSelector
        :label="$t('add.select_drop')"
        :showUploadButton="true"
        @filesSelected="filesToUpload = $event"
        @upload="uploadMedia"
      />
    </div>
  </q-card>
</template>

<script>
import MultipleMediaSelector from 'components/MultipleMediaSelector.vue';

import { useEventStore } from 'src/stores/event';
import { mapState, mapActions, mapWritableState } from 'pinia';
import common from 'assets/common';
import { default as dayjs } from 'dayjs';
export default {
  components: { MultipleMediaSelector },
  props: {
    editing: Boolean,
    isLineup: Boolean,
  },
  data() {
    return {
      selectedDate: null,
      showGallery: false,
      reordering: false,
      filesToUpload: [],
      selectedEventDateId: null,
    };
  },
  created() {
    this.localDate = common.localDate;
    this.localDay = common.localDay;
  },
  mounted() {
    if (this.event) {
      // we want to have the upcoming date pre-selected
      const next_date = this.event.next_date;

      this.selectedDate = {
        id: next_date.id,
        label: this.getEdLabel(next_date),
      };
    }
  },
  methods: {
    getEdLabel(ed) {
      if (this.event.rrule?.recurring_type === 1) {
        // weekly recurring event, return full date
        this.localDay(ed.start_naive, ed.tz) +
          ' ' +
          this.localDate(ed.start_naive, ed.tz);
      } else if (this.event.rrule?.recurring_type === 2) {
        // monthly
        // return month year
        return this.event.name + ' ' + dayjs(ed.start_naive).format('MM YYYY');
      } else if (this.event.rrule?.recurring_type === 3) {
        // yearly
        // return year
        return this.event.name + ' ' + dayjs(ed.start_naive).format('YYYY');
      }
    },
    ...mapActions(useEventStore, [
      'updateEvent',
      'addReview',
      'updateEventDate',
      'suggestEventDateEdit',
    ]),
    closeDialog() {
      this.$emit('closeDialog');
    },
    async uploadMedia() {
      const progressDialog = this.$q.dialog({
        title: this.$t('gallery.uploading_media'),
        message: 'Uploading...',
        color: 'primary',
        progress: true, // we enable default settings
        cancel: false,
        persistent: true, // we want the user to not be able to close it
        ok: false,
      });

      if (this.currentUserCanEdit) {
        // append directly to event
        // if event_date selected
        try {
          // add images to event date
          const response = await this.updateEventDate(
            {
              lineup_images: this.filesToUpload,
            },
            this.selectedDate?.id
          );
          if (this.selectedDate.id === this.selectedEventDate.id) {
            // update current event date
            this.selectedEventDate = response.data;
          }

          progressDialog.hide();
        } catch (e) {
          progressDialog.hide();
        }
        this.$emit('closeDialog');
      } else {
        // make suggestion
        this.$q
          .dialog({
            parent: this,
            component: SubmitSuggestionPrompt,
          })
          .onOk(async (messageAndToken) => {
            // suggest edit instead of editing directly
            const progressDialog = this.$q.dialog({
              title: this.$t('edit_event_date.submitting'),
              color: 'primary',
              progress: true, // we enable default settings
              cancel: false,
              persistent: true, // we want the user to not be able to close it
              ok: false,
            });
            // include message and token in request
            try {
              await this.suggestEventDateEdit(
                {
                  lineup_images: this.filesToUpload,
                  ...messageAndToken,
                },
                this.selectedDate?.id
              );

              this.$q
                .dialog({
                  title: this.$t('edit_event_date.submitted'),
                  message: this.$t('edit_event_date.submitted_msg'),
                  color: 'primary',
                  persistent: false, // we want the user to not be able to close it
                })
                .onDismiss(() => {
                  this.$emit('closeDialog');
                });
            } catch (e) {}

            this.loading = false;
            progressDialog.hide();
          });
      }

      this.$emit('closeDialog');
    },

    getBgImgStyle(image = '') {
      return `background-image: url("${image}");
      background-size: cover;
      background-position: center;
      display: inline-block;
      `;
    },
  },
  watch: {},
  computed: {
    ...mapWritableState(useEventStore, [
      'event',
      'selectedEventDate',
      'currentUserCanEdit',
    ]),
    eventDates() {
      if (this.event.event_dates) {
        return [
          ...this.event?.event_dates.map((x) => ({
            id: x.id,
            label: this.getEdLabel(x),
          })),
        ];
      } else return [];
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .edit-gallery {
    background: $bi-1;
    .main-content {
      background: $bi-2;
    }
  }
  .upload-dialog {
    background: $bi-1;
  }
}
.body--light {
  .edit-gallery {
    background: $b-1;
  }
  .upload-dialog {
    background: $b-1;
  }
}

.upload-dialog {
  width: 600px;
}
.flip-list-move {
  transition: transform 300ms;
}
</style>
