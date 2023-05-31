<template>
  <q-card class="edit-card event-page-editing-dialog">
    <q-card-section class="flex column no-wrap top-section grow">
      <div class="flex items-start no-wrap justify-between grow">
        <div class="flex column">
          <div class="text-h6 card-title q-pr-md">
            {{ $t('event.edit_name') }}
          </div>
        </div>
        <q-btn icon="close" class="q-ml-md" flat round dense v-close-popup />
      </div>
      <q-input
        class="border-radius q-mt-lg"
        counter
        :maxlength="50"
        outlined
        autogrow
        :input-style="{ 'min-height': '100px' }"
        v-model="name"
        style="padding-bottom: 0px"
      />
    </q-card-section>

    <q-card-section class="q-pt-md flex justify-end">
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
    this.name = this.event.name + ' ';
  },
  data() {
    return {
      loading: false,
      name: null,
    };
  },
  methods: {
    ...mapActions(useEventStore, ['suggestEventEdit']),
    async update() {
      this.loading = true;

      if (this.currentUserCanEdit) {
        try {
          await this.updateEvent({ name: this.name });
          progressDialog.hide();
          this.loading = false;
          this.$emit('closeDialog');
        } catch (e) {
          this.loading = false;
        }
      } else {
        // ONLY ALLOW SUGGESTING A NEW NAME
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
                  name: this.name,
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

.edit-card {
  min-width: 400px;
}
@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
