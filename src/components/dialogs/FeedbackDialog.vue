<template>
  <q-card class="feedback-dialog dialog-card fullscreen-mobile-card">
    <q-card-section class="row items-center q-pb-none dialog-card-header">
      <div class="inter bolder text-h6">{{ $t('feedback.give_feedback') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="">
      <p class="t3">
        {{ $t('feedback.give_feedback_msg') }}
      </p>
      <q-input
        outlined
        :input-style="{ 'min-height': '100px' }"
        autogrow
        textarea
        color="bg-grey-7"
        v-model="feedback"
        :label="$t('feedback.feedback')"
      />
    </q-card-section>
    <q-card-section class="q-pt-none">
      <p class="t3">
        {{ $t('feedback.give_feedback_msg_2') }}
      </p>
      <q-input
        outlined
        autogrow
        color="bg-grey-7"
        v-model="contactEmail"
        :label="$t('feedback.contact_email')"
      />
    </q-card-section>
    <q-card-section class="flex row justify-end">
      <q-btn
        class="soft-button-shadow"
        color="primary"
        @click="postFeedback"
        :disable="!feedback || feedback.length === 0"
        :label="$t('feedback.send')"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import { postFeedbackRequest } from 'src/api';

export default {
  name: 'FeedbackDialog',
  data() {
    return {
      feedback: null,
      contactEmail: null,
    };
  },
  methods: {
    postFeedback() {
      const progressDialog = this.$q.dialog({
        title: this.$t('feedback.sending_feedback'),
        color: 'primary',
        progress: true, // we enable default settings
        cancel: false,
        persistent: true, // we want the user to not be able to close it
        ok: false,
      });
      postFeedbackRequest({
        message: this.feedback,
        contact_email: this.contactEmail,
      }).then(() => {
        progressDialog.hide();
        this.$q
          .dialog({
            title: this.$t('feedback.thanks'),
            message: this.$t('feedback.thanks_msg'),
            color: 'primary',
            persistent: false, // we want the user to not be able to close it
          })
          .onDismiss(() => {
            this.feedback = null;
            this.contactEmail = null;
            this.$nextTick(() => {
              this.$emit('closeDialog'); // close parent dialog
            });
          });
      });
    },
  },
  watch: {
    route() {
      this.$emit('closeDialog');
    },
  },
  mounted() {
    window.history.pushState({}, '');
  },
  computed: {
    route() {
      return this.$route;
    },
  },
};
</script>

<style lang="scss" scoped>
// sm
@media only screen and (max-width: 599px) {
  .feedback-dialog {
    height: 100vh !important;
    max-height: unset !important;
    width: 100%;
  }
}
</style>
