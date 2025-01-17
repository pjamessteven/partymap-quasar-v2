<template>
  <q-card class="edit-gallery" :class="editing ? 'editing' : ''">
    <q-inner-loading :showing="loading">
      <q-spinner-puff size="300px" color="primary" />
    </q-inner-loading>

    <q-dialog v-model="showUploadDialog">
      <q-card class="upload-dialog q-pa-md">
        <div class="flex row wrap items-center q-mb-md q-mb-lg">
          <q-icon left size="1.25em" name="las la-upload" />
          <div class="flex column" v-if="!currentUserCanEdit">
            <div class="text-h6 card-title q-pr-md">
              {{ $t('suggestions.upload_new_logo') }}
            </div>
            <div class="q-pr-md t2">
              {{ $t('suggestions.upload_new_logo_msg') }}
            </div>
          </div>
          <div class="flex column" v-else>
            {{ $t('event.upload_new_logo') }}
          </div>
        </div>
        <MultipleMediaSelector
          :singleSelectMode="true"
          :showUploadButton="true"
          @filesSelected="filesToUpload = $event"
          @upload="uploadMedia"
          :openDialogOnMount="true"
        />
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import { suggestEventEditRequest } from 'src/api';

import MultipleMediaSelector from 'components/MultipleMediaSelector.vue';
import SubmitSuggestionPrompt from 'components/EventPage/Suggestions/SubmitSuggestionPrompt.vue';

import { mapState, mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: { MultipleMediaSelector },
  props: {
    editing: Boolean,
  },
  data() {
    return {
      loading: false,
      showGallery: false,
      reordering: false,
      filesToUpload: [],
      showUploadDialog: true,
    };
  },
  methods: {
    ...mapActions(useEventStore, ['updateEvent']),
    async uploadMedia() {
      if (!this.currentUserCanEdit) {
        // make suggestion
        this.$q
          .dialog({
            parent: this,
            component: SubmitSuggestionPrompt,
          })
          .onOk((messageAndToken) => {
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
            suggestEventEditRequest(this.event.id, {
              ...messageAndToken,
              ...{ logo: this.filesToUpload[0] },
            }).then(() => {
              progressDialog.hide();
              this.loading = false;
              this.showUploadDialog = false;
              this.$q
                .dialog({
                  title: this.$t('edit_event_date.submitted'),
                  message: this.$t('edit_event_date.submitted_msg'),
                  color: 'primary',
                  persistent: false, // we want the user to not be able to close it
                })
                .onDismiss(() => {
                  this.$nextTick(() => {
                    this.$emit('closeDialog'); // close parent dialog
                  });
                });
            });
          });
      } else {
        const progressDialog = this.$q.dialog({
          title: this.$t('gallery.uploading_media'),
          color: 'primary',
          progress: true, // we enable default settings
          cancel: false,
          persistent: true, // we want the user to not be able to close it
          ok: false,
        });

        try {
          await this.updateEvent({
            logo: this.filesToUpload[0],
          });
          this.loading = false;
          this.showUploadDialog = false;
          progressDialog.hide();
          this.$emit('closeDialog');
        } catch (e) {
          progressDialog.hide();
        }
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
    ...mapState(useEventStore, ['event', 'currentUserCanEdit']),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .edit-gallery {
    background: $bi-1;
    .main-content {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
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
    .main-content {
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
  }
  .upload-dialog {
    background: $b-1;
  }
}

.edit-gallery {
  min-width: 400px;
}
.upload-dialog {
  width: 600px;
}
.flip-list-move {
  transition: transform 300ms;
}
</style>
