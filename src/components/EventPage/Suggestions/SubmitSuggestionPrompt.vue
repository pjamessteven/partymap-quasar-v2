<template>
  <q-dialog ref="dialog">
    <q-card class="q-dialog-plugin dialog-card">
      <q-card-section class="dialog-card-header">
        <div class="text-h6">
          {{ $t('suggestions.submit_improvement') }}
        </div>
      </q-card-section>
      <q-card-section class="dialog-card-content">
        <q-input
          class="q-mt-md"
          type="textarea"
          outlined
          :placeholder="$t('suggestions.tell_us_why_improvement_needed')"
          v-model="message"
        />
        <vue-hcaptcha
          v-if="!currentUser && !devServer"
          class="q-mt-md"
          sitekey="147c4ce5-0c6b-4de0-99cf-ca14503265e2"
          @verify="verify"
        ></vue-hcaptcha>
      </q-card-section>
      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat color="primary" label="Cancel" @click="hide()" />
        <q-btn
          :disable="!hcaptchaToken && !currentUser && !devServer"
          color="primary"
          :label="$t('add.continue')"
          @click="onOKClick"
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
      devServer: process.env.NODE_ENV === 'development',
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

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.hide();

      this.$emit('ok', {
        message: this.message,
        hcaptcha_token: this.hcaptchaToken,
      });
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
