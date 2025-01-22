<template>
  <q-card class="edit-gallery dialog-card" :class="editing ? 'editing' : ''">
    <q-inner-loading :showing="loading">
      <q-spinner-puff size="300px" color="primary" />
    </q-inner-loading>
    <!-- list view (editing mode) -->
    <q-card-section class="dialog-card-header">
      <div class="text-h6 inter bolder card-title q-pr-md">
        {{ $t('gallery.edit_gallery') }}
      </div>
    </q-card-section>
    <div class="flex column album-list">
      <div class="main-content flex column q-pa-md">
        <div class="q-pr-md t2">
          {{ $t('gallery.edit_gallery_message') }}
        </div>
        <div class="flex row justify-end q-my-md">
          <q-btn
            flat
            class="q-mr-sm"
            no-caps
            @click="reordering = !reordering"
            :label="reordering ? 'Done' : 'Change order'"
            icon="las la-sort"
          />
          <q-btn
            no-caps
            color="primary"
            @click="showUploadDialog = !showUploadDialog"
            label="Upload Media"
            icon="las la-upload"
          />
        </div>
        <transition-group
          name="flip-list"
          v-if="event && event.media_items && event.media_items.length > 0"
          class="q-mt-md"
        >
          <EditGalleryListItem
            v-for="item in event.media_items"
            :item="item"
            :key="item.id"
            :reordering="reordering"
          />
        </transition-group>
      </div>
      <q-card-section class="flex justify-end">
        <q-btn label="done" @click="closeDialog" color="primary" />
      </q-card-section>
    </div>
    <BackdropBlurDialog v-model="showUploadDialog">
      <q-card class="upload-dialog q-pa-md">
        <div class="flex row wrap items-center q-mb-md">
          <q-icon left size="1.25em" name="las la-upload" />
          <div class="flex column">
            <div class="text-h6 card-title q-pr-md">
              {{ $t('media_upload.upload_media') }}
            </div>
            <div class="q-pr-md t2">
              {{ $t('media_upload.add_media_msg') }}
            </div>
          </div>
        </div>
        <MultipleMediaSelector
          :showUploadButton="true"
          @filesSelected="filesToUpload = $event"
          @upload="uploadMedia"
          :openDialogOnMount="true"
        />
      </q-card>
    </BackdropBlurDialog>
  </q-card>
</template>

<script>
import EditGalleryListItem from 'components/EventPage/Gallery/EditGalleryListItem.vue';
import MultipleMediaSelector from 'components/MultipleMediaSelector.vue';

import { useEventStore } from 'src/stores/event';
import { mapState, mapActions } from 'pinia';
import BackdropBlurDialog from '../../BackdropBlurDialog.vue';

export default {
  components: {
    EditGalleryListItem,
    MultipleMediaSelector,
    BackdropBlurDialog,
  },
  props: {
    editing: Boolean,
  },
  data() {
    return {
      loading: false,
      showGallery: false,
      reordering: false,
      filesToUpload: [],
      showUploadDialog: false,
    };
  },
  methods: {
    ...mapActions(useEventStore, ['updateEvent']),
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

      try {
        await this.updateEvent({
          media_items: this.filesToUpload,
        });
        this.loading = false;
        this.showUploadDialog = false;
        progressDialog.hide();
      } catch (e) {
        progressDialog.hide();
      }
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
    ...mapState(useEventStore, ['event']),
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
