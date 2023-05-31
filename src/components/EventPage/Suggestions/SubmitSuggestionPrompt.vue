<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">
          {{ $t('suggestions.submit_improvement') }}
          <p />
        </div>
        <div class="t2">
          {{ $t('suggestions.tell_us_why_improvement_needed') }}
        </div>
        <div class="t2" v-if="!currentUser">
          {{ $t('suggestions.captcha_required') }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-input
          type="textarea"
          outlined
          :label="$t('suggestions.message')"
          v-model="message"
        />
        <vue-hcaptcha
          v-if="!currentUser"
          class="q-mt-md"
          sitekey="147c4ce5-0c6b-4de0-99cf-ca14503265e2"
          @verify="verify"
        ></vue-hcaptcha>
      </q-card-section>
      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat color="primary" label="Cancel" v-close-popup />
        <q-btn
          :disable="!hcaptchaToken && !currentUser"
          color="primary"
          :label="$t('add.continue')"
          v-on:click="onOKClick()"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: { VueHcaptcha },
  data() {
    return {
      message: null,
      hcaptchaToken: null,
    };
  },
  methods: {
    verify(token) {
      this.hcaptchaToken = token;
    },
    show() {
      this.$refs.dialog.show();
    },

    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      this.$emit('hide');
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok', {
        message: this.message,
        hcaptcha_token: this.hcaptchaToken,
      });
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide();
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
  },
};
</script>
