<template>
  <q-card class="feedback-dialog">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6" v-if="mode === 'claim'">
        {{ $t('report.claim_event_page') }}
      </div>
      <div v-else class="text-h6">{{ $t('report.report_event') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="">
      <div class="t2" v-if="mode === 'claim'">
        {{ $t('report.claim_message') }}
        <a href="https://www.facebook.com/partymap.official" target="_blank"
          >Facebook</a
        >
        {{ $t('report.or') }}
        <a href="https://www.instagram.com/partymap.official" target="_blank"
          >Instagram</a
        >, {{ $t('report.or_from_your_email') }}
      </div>
      <div class="t2 q-mt-md" v-if="mode === 'claim'">
        {{ $t('report.claim_message_2') }}
      </div>
      <div class="t2" v-else>
        {{ $t('report.please_tell_us_your_problem') }}
      </div>
      <div class="t2 q-mt-xs" v-if="!currentUser">
        {{ $t('suggestions.captcha_required') }}
      </div>
      <q-input
        square
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
        square
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
        :disabled="
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
import VueHcaptcha from '@hcaptcha/vue-hcaptcha';

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
      postReportRequest({
        message:
          this.mode === 'claim'
            ? 'The following message is a claim for the event page: ' +
              this.message
            : this.message,
        event_id: this.event.id,
        email: this.email,
        hcaptcha_token: this.hcaptchaToken,
      }).then(() => {
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
  },
};
</script>

<style lang="scss">
.feedback-dialog {
  min-width: 400px;
}
</style>
