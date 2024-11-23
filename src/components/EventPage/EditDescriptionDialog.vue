<template>
  <q-card class="edit-card dialog-card">
    <q-card-section class="no-wrap justify-between flex dialog-card-header">
      <div class="text-h6 card-title q-pr-md">
        {{ $t('description.edit_description') }}
      </div>
      <q-btn icon="close" class="q-ml-md" flat round dense v-close-popup />
    </q-card-section>
    <q-card-section class="dialog-card-content">
      <div class="t2 q-mb-md">
        <div class="t2">
          {{ $t('description.keep_it_short') }}
          {{ $t('description.put_more_details_in_event_date') }}
          {{ $t('description.attribute_msg_long') }}
        </div>
      </div>
      <q-input
        class="border-radius"
        counter
        maxlength="10000"
        outlined
        autogrow
        :input-style="{ 'min-height': '100px' }"
        v-model="description"
        :rules="[(val) => !!val]"
        label="Event Description"
      />
      <!-- ATRRIBUTE -->
      <q-input
        v-if="!currentUserIsHost"
        outlined
        maxlength="200"
        class="q-mt-sm"
        :input-style="{ 'min-height': '50px' }"
        color="bg-grey-7"
        v-model="attribute"
        label="Source (optional)"
      />
    </q-card-section>
    <q-card-section class="q-pt-md flex justify-end dialog-card-footer">
      <q-btn
        color="primary"
        :label="$t('description.update')"
        v-on:click="updateDescription"
      />
    </q-card-section>
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
    this.description = this.event.full_description;
    this.attribute = this.event.full_description_attribute;
  },
  data() {
    return {
      description: null,
      attribute: null,
    };
  },
  methods: {
    ...mapActions(useEventStore, ['updateEvent', 'suggestEventEdit']),
    async updateDescription() {
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
          full_description: this.description,
          full_description_attribute: this.attribute,
        });
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
                  full_description: this.description,
                  full_description_attribute: this.attribute,
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
              this.$emit('closeDialog');
            } catch (e) {
              progressDialog.hide();
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
