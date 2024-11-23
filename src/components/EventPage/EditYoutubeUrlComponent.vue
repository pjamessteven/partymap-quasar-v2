<template>
  <q-card class="edit-card dialog-card">
    <q-card-section class="flex row justify-between no-wrap dialog-card-header">
      <div class="text-h6 card-title q-pr-md">
        {{ $t('edit_event.update_video') }}
      </div>
      <q-btn icon="close" class="q-ml-md" flat round dense v-close-popup />
    </q-card-section>
    <q-card-section class="dialog-card-content">
      <div class="t2 q-mb-md">
        <div class="t2">
          {{ $t('edit_event.update_video_msg') }}
        </div>
      </div>
      <q-input
        class="border-radius"
        outlined
        v-model="youtube_url"
        label="Youtube URL"
      />
    </q-card-section>
    <q-card-section class="q-pt-md flex justify-end dialog-card-footer">
      <q-btn
        color="primary"
        :label="$t('description.update')"
        v-on:click="update"
      />
    </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import SubmitSuggestionPrompt from 'components/EventPage/Suggestions/SubmitSuggestionPrompt.vue';
import { useAuthStore } from 'src/stores/auth';
import { useEventStore } from 'src/stores/event';
import { mapActions, mapState } from 'pinia';

export default {
  components: {},
  props: {
    editing: Boolean,
  },
  mounted() {
    this.youtube_url = this.event.youtube_url;
  },
  data() {
    return {
      youtube_url: null,
      loading: false,
    };
  },
  methods: {
    ...mapActions(useEventStore, ['updateEvent', 'suggestEventEdit']),
    async update() {
      this.loading = true;
      if (this.currentUserCanEdit) {
        const progressDialog = this.$q.dialog({
          title: this.$t('edit_event.updating_event'),
          color: 'primary',
          progress: true, // we enable default settings
          cancel: false,
          persistent: true, // we want the user to not be able to close it
          ok: false,
        });
        await this.updateEvent({
          youtube_url: this.youtube_url,
        });
        this.loading = false;
        progressDialog.hide();
        this.$emit('closeDialog'); // close parent dialog
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

            try {
              // include message and token in request
              await this.suggestEventEdit({
                ...messageAndToken,
                ...{
                  youtube_url: this.youtube_url,
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
                  this.$emit('closeDialog');
                });
              progressDialog.hide();
              this.loading = false;
              this.$emit('closeDialog');
            } catch (e) {
              progressDialog.hide();
              this.loading = false;
            }
          });
      }
    },
  },
  watch: {},
  computed: {
    ...mapState(useEventStore, [
      'event',
      'currentUserCanEdit',
      'currentUserIsHost',
    ]),
    ...mapState(useAuthStore, ['currentUser']),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}

@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
