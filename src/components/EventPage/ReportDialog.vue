<template>
  <q-card class="feedback-dialog dialog-card">
    <q-card-section class="row items-center q-pb-none dialog-card-header">
      <div class="text-h6" v-if="mode === 'claimEvent'">
        {{ $t('report.claim_event_page') }}
      </div>
      <div v-else-if="mode === 'reportEvent'" class="text-h6">
        {{ $t('report.report_event') }}
      </div>
      <div v-else-if="mode === 'reportReview'" class="text-h6">
        {{ $t('report.report_review') }}
      </div>
      <div v-else-if="mode === 'reportMediaItem'" class="text-h6">
        {{ $t('report.report_media') }}
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="dialog-card-content">
      <div class="t2" v-if="mode === 'claimEvent'">
        {{ $t('report.claim_message') }}
        <a href="https://www.facebook.com/partymap.official" target="_blank"
          >Facebook</a
        >
        {{ $t('report.or') }}
        <a href="https://www.instagram.com/partymap.official" target="_blank"
          >Instagram</a
        >, {{ $t('report.or_from_your_email') }}
      </div>
      <div class="t2 q-mt-md" v-if="mode === 'claimEvent'">
        {{ $t('report.claim_message_2') }}
      </div>

      <div class="t2" v-else>
        {{ $t('report.report_message') }}
      </div>

      <q-input
        outlined
        :input-style="{ 'min-height': '100px' }"
        autogrow
        textarea
        class="q-mt-md"
        color="bg-grey-7"
        v-model="message"
        :label="
          mode === 'claim' ? $t('report.claim_input_msg') : $t('report.message')
        "
      />
      <q-input
        outlined
        color="bg-grey-7"
        v-model="email"
        class="q-mt-md"
        v-if="!currentUser"
        :label="$t('feedback.contact_email')"
        :error="emailValidation != true && email && email.length > 0"
      >
        <template v-slot:error>
          {{ emailValidation }}
        </template>
      </q-input>
      <vue-hcaptcha
        v-if="!currentUser"
        class="q-mt-md"
        sitekey="147c4ce5-0c6b-4de0-99cf-ca14503265e2"
        @verify="verify"
      ></vue-hcaptcha>
    </q-card-section>

    <q-card-section class="flex row justify-end">
      <q-btn
        color="primary"
        @click="postReport"
        :disable="
          !message ||
          message.length === 0 ||
          (email && emailValidation != true) ||
          (!currentUser && !hcaptchaToken)
        "
        :label="$t('feedback.send')"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import { postReportRequest } from 'src/api';
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';

import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  name: 'ReportDialog',
  data() {
    return {
      message: null,
      email: null,
      hcaptchaToken: null,
    };
  },
  components: { VueHcaptcha },
  props: {
    mode: String,
    reviewId: String,
    mediaItemId: String,
  },
  methods: {
    verify(token) {
      this.hcaptchaToken = token;
    },
    postReport() {
      const progressDialog = this.$q.dialog({
        title: this.$t('report.sending_report'),
        color: 'primary',
        progress: true, // we enable default settings
        cancel: false,
        persistent: true, // we want the user to not be able to close it
        ok: false,
      });
      postReportRequest(this.computedPayload).then(() => {
        progressDialog.hide();
        this.$q
          .dialog({
            title: this.$t('report.report_sent'),
            message: this.$t('report.we_will_look_into_this_soon'),
            color: 'primary',
            persistent: false, // we want the user to not be able to close it
          })
          .onDismiss(() => {
            this.message = null;
            this.$emit('closeDialog');
          });
      });
    },
  },
  computed: {
    ...mapState(useEventStore, ['event']),
    ...mapState(useAuthStore, ['currentUser']),
    emailValidation() {
      if (
        // eslint-disable-next-line
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          this.email
        )
      ) {
        return true;
      } else return this.$t('validation.email_invalid');
    },
    computedPayload() {
      let payload = {
        message: this.message,
        email: this.email,
        hcaptcha_token: this.hcaptchaToken,
      };
      if (this.mode === 'claimEvent') {
        payload = {
          ...payload,
          event_id: this.event.id,
          message:
            'The following message is a claim for the event page: ' +
            this.message,
        };
      } else if (this.mode === 'reportEvent') {
        payload = {
          ...payload,
          event_id: this.event.id,
        };
      } else if (this.mode === 'reportReview') {
        payload = {
          ...payload,
          event_review_id: this.reviewId,
          event_id: this.event?.id,
        };
      } else if (this.mode === 'reportMediaItem') {
        payload = {
          ...payload,
          media_item_id: this.mediaItemId,
          event_id: this.event?.id,
        };
      }
      return payload;
    },
  },
};
</script>

<style lang="scss"></style>
