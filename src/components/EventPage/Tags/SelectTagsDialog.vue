<template>
  <q-card class="dialog-card">
    <q-card-section class="flex items-center dialog-card-header">
      <div class="text-h6">{{ $t('suggestions.event_tags') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="flex column no-wrap q-pt-none">
      <div class="t3 q-my-md">{{ $t('suggestions.event_tags_msg') }}</div>
      <SelectTagsComponent
        :showTopTags="true"
        :existing-tags="existingTags"
        @valueUpdated="($value) => (newTagsList = $value)"
        @closeDialog="$emit('closeDialog')"
      />
    </q-card-section>

    <q-card-section class="q-pt-lg flex justify-end">
      <q-btn
        color="primary"
        :label="$t('general.save_changes')"
        v-on:click="updateEventWithTags"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import { mapState, mapActions } from 'pinia';

import { useEventStore } from 'src/stores/event';
import SelectTagsComponent from './SelectTagsComponent.vue';

export default {
  components: {
    SelectTagsComponent,
  },
  props: {},
  data() {
    return { newTagsList: [] };
  },
  watch: {},
  methods: {
    ...mapActions(useEventStore, ['updateEvent', 'suggestEventEdit']),
    async updateEventWithTags() {
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
            add_tags: this.tagsToAdd,
            remove_tags: this.tagsToRemove,
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
            try {
              await suggestEventEdit({
                ...messageAndToken,
                ...{ add_tags: this.tagsToAdd, remove_tags: this.tagsToRemove },
              });
              this.$q
                .dialog({
                  title: this.$t('edit_event_date.submitted'),
                  message: this.$t('edit_event_date.submitted_msg'),
                  color: 'primary',
                  persistent: false, // we want the user to not be able to close it
                })
                .onDismiss(() => {
                  this.$emit('closeDialog'); // close parent dialog
                  window.bus.$emit('closeDialog');
                });
            } catch (e) {}
            progressDialog.hide();
          });
      }
    },
  },
  computed: {
    ...mapState(useEventStore, ['event', 'currentUserCanEdit']),
    existingTags() {
      return this.event?.event_tags?.map((x) => x.tag) || [];
    },
    tagsToAdd() {
      let toAdd = [];
      for (let tag of this.newTagsList) {
        if (this.existingTags.indexOf(tag) === -1) {
          toAdd.push(tag);
        }
      }
      return toAdd;
    },
    tagsToRemove() {
      let toRemove = [];
      for (let tag of this.existingTags) {
        if (this.newTagsList.indexOf(tag) === -1) {
          toRemove.push(tag);
        }
      }
      return toRemove;
    },
  },
  mounted() {
    this.newTagsList = [...this.existingTags];
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}

@media only screen and (max-width: 1023px) {
}
</style>
