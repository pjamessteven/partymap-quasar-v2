<template>
  <div>
    <q-card style="width: 300px" class="edit-card dialog-card">
      <q-card-section class="dialog-card-header">
        <div class="text-h6">
          {{ $t('edit_event.remove_schedule') }}
        </div>
      </q-card-section>
      <q-card-section>
        {{ $t('edit_event.remove_schedule_msg') }}
      </q-card-section>
      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat color="primary" label="Cancel" v-close-popup />
        <q-btn
          color="primary"
          :label="$t('add.continue')"
          v-on:click="removeRrule()"
          v-close-popup
        />
      </q-card-actions>
    </q-card>

    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </div>
</template>

<script>
import SubmitSuggestionPrompt from 'components/EventPage/Suggestions/SubmitSuggestionPrompt.vue';

import { mapState, mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {},
  props: {},
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    ...mapActions(useEventStore, ['updateEvent', 'suggestEventEdit']),
    async removeRrule() {
      if (this.currentUserCanEdit) {
        const progressDialog = this.$q.dialog({
          title: this.$t('edit_event.updating_event'),
          color: 'primary',
          progress: true, // we enable default settings
          cancel: false,
          persistent: true, // we want the user to not be able to close it
          ok: false,
        });
        try {
          await this.updateEvent({
            remove_rrule: true,
          });
          this.$emit('closeDialog'); // close parent dialog
        } catch (e) {}
        progressDialog.hide();
      } else {
        this.$q
          .dialog({
            parent: this,
            component: SubmitSuggestionPrompt,
          })
          .onOk(async (messageAndToken) => {
            const progressDialog = this.$q.dialog({
              title: this.$t('edit_event_date.submitting'),
              color: 'primary',
              progress: true, // we enable default settings
              cancel: false,
              persistent: true, // we want the user to not be able to close it
              ok: false,
            });

            try {
              await this.suggestEventEdit({
                ...messageAndToken,
                ...{ remove_rrule: true },
              });

              this.$q
                .dialog({
                  title: this.$t('event_dates.add_event_date_q'),
                  message: this.$t('event_dates.add_event_date_q_msg'),
                  ok: {
                    label: this.$t('event_dates.add_a_date'),
                    push: true,
                  },
                  cancel: {
                    label: this.$t('event_dates.ignore_add_date'),
                    push: true,
                  },
                  persistent: true,
                })
                .onOk(() => {
                  window.bus.$emit('addDate', messageAndToken);
                  // do you want to generate a new date?
                  // or is this event cancelled.
                  // close dialog handled by emit on addeventdate component
                })
                .onCancel(() => {
                  this.$nextTick(() => {
                    this.$emit('closeDialog'); // close parent dialog
                  });
                });
            } catch (e) {}
            progressDialog.hide();
          });
      }
    },
  },
  watch: {},
  computed: {
    ...mapState(useEventStore, ['event', 'currentUserCanEdit']),
    ...mapState(useAuthStore, ['currentUser']),
  },
};
</script>

<style lang="scss" scoped>
.top-section {
  cursor: pointer;
}

@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
