<template>
  <q-card class="upload-dialog q-pa-md">
    <div class="flex row wrap items-center no-wrap q-mb-md">
      <div class="flex column">
        <div class="text-h6 card-title q-pr-md">
          {{ $t('media_upload.add_media') }}
        </div>
        <div class="q-pr-md q-mt-sm t2">
          {{ $t('media_upload.add_media_msg') }}
        </div>
      </div>
    </div>
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
      :options="pastEventDates"
      label="Event Date"
    >
      <template v-slot:append>
        <q-icon name="mdi-calendar-outline" class="q-pa-md" />
      </template>
    </q-select>
    <MultipleMediaSelector
      :showUploadButton="true"
      @filesSelected="filesToUpload = $event"
      @upload="uploadMedia"
      :openDialogOnMount="true"
    />
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
  },
  data() {
    return {
      selectedDate: null,
      showGallery: false,
      reordering: false,
      filesToUpload: [],
      showUploadDialog: true,
      selectedEventDateId: null,
    };
  },
  created() {
    this.localDate = common.localDate;
    this.localDay = common.localDay;
  },
  mounted() {
    if (this.event) {
      // we want to have the previous date pre-selected
      const indexOfNextDate = this.event.event_dates.findIndex(
        (x) => x.id === this.event.next_date.id
      );
      let indexOfPreviousDate = 0;

      if (indexOfNextDate > 0) {
        indexOfPreviousDate = indexOfNextDate - 1;
      }

      const previousDate = this.event.event_dates[indexOfPreviousDate];

      this.selectedDate = {
        id: previousDate.id,
        label: this.getEdLabel(previousDate),
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
      'reloadEvent',
    ]),
    closeDialog() {
      this.$emit('closeDialog');
    },
    async uploadMedia() {
      var videoInUploads =
        this.filesToUpload.findIndex((x) => x.mimeType.indexOf('video') > -1) >
        -1;

      const progressDialog = this.$q.dialog({
        title: this.$t('gallery.uploading_media'),
        message: videoInUploads
          ? this.$t('gallery.video_conversion_msg')
          : this.$t('gallery.do_do_do'),
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
          if (this.selectedDate?.id) {
            // add images to event date
            const response = await this.updateEventDate(
              {
                media_items: this.filesToUpload,
              },
              this.selectedDate?.id
            );
            if (this.selectedDate.id === this.selectedEventDate.id) {
              // update current event date
              this.selectedEventDate = response;
            }
          } else {
            // add images to event body
            await this.updateEvent({
              media_items: this.filesToUpload,
            });
          }

          this.showUploadDialog = false;
          progressDialog.hide();
        } catch (e) {
          progressDialog.hide();
        }
      } else {
        // append as review if unprivileged
        await this.addReview({
          media_items: this.filesToUpload,
          event_date_id: this.selectedDate?.id,
        });
        progressDialog.hide();
      }
      this.reloadEvent();

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
    pastEventDates() {
      if (this.event.event_dates) {
        return [
          { id: null, label: 'No previous date' },

          ...this.event?.event_dates
            .filter((x) => dayjs(x.start_naive) < dayjs())
            .map((x) => ({ id: x.id, label: this.getEdLabel(x) })),
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
