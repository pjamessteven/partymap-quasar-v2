<template>
  <q-card class="about-dialog">
    <q-card-section class="header row items-center">
      <div class="chicago text-h6">{{ $t('sidebar.about') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="t2">
      {{ $t('about.mission') }}
      <p />
      {{ $t('about.message') }}
      <a class="link-hover underline" href="mailto:info@partymap.com"
        >info@partymap.com</a
      >
      <p />

      <p />
      {{ $t('about.message_3') }}
      <a
        class="link-hover underline"
        target="_blank"
        href="https://www.paypal.com/donate/?hosted_button_id=9MVTW44EMSCRA"
        >PayPal</a
      >
      {{ $t('about.or') }}
      <span
        @click="showBtcAddress = !showBtcAddress"
        class="link-hover underline"
        >Bitcoin</span
      >{{ $t('about.it_would_be_appreciated') }}

      <p v-if="showBtcAddress"></p>
      <a
        v-if="showBtcAddress"
        class="link-hover underline"
        href="bitcoin:bc1qnn5rhppt78ay2aavex2d8v0u9u7j7025mec9hd?message=Donations&time=1639975733"
        >BTC: bc1qnn5rhppt78ay2aavex2d8v0u9u7j7025mec9hd</a
      >
      <p />
      {{ $t('about.message_2') }}
      <p />

      <div class="flex justify-start">
        <a
          class="link-hover underline"
          @click="showPrivacyPolicyDialog = true"
          >{{ $t('about.read_privacy_policy') }}</a
        >
        &nbsp;
        <a
          class="link-hover underline q-ml-sm"
          @click="showTermsAndConditionsDialog = true"
          >{{ $t('about.read_terms_and_conditions') }}</a
        >
      </div>
    </q-card-section>

    <q-card-section
      class="flex column items-center justify-center q-mb-none q-mt-lg"
    >
      <q-icon name="las la-kiwi-bird" size="2em" class="t4" />
      <p class="t4 q-mt-md">
        {{ $t('about.made_in_aotaeroa') }}
      </p>
    </q-card-section>
    <div class="q-mt-lg q-pb-xl" style="overflow: hidden">
      <div class="polaroid-container">
        <div class="image-container" @click="showRigsOut = true">
          <img
            src="assets/rigs_out_twisted_2020.jpg"
            style="width: 100%; height: auto"
          />
          <div class="image-overlay" />
          <div class="image-attribute">
            Twisted Frequency 2020 by
            <a href="https://www.lbullphotography.com/" target="_blank"
              >LB Photography</a
            >
          </div>
        </div>
      </div>
    </div>

    <q-dialog
      v-model="showPrivacyPolicyDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <PrivacyPolicyDialog />
    </q-dialog>
    <q-dialog
      v-model="showTermsAndConditionsDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <TermsAndConditionsDialog />
    </q-dialog>
    <q-dialog
      v-model="showRigsOut"
      transition-show="jump-up"
      transition-hide="jump-down"
      maximized
    >
      <q-card class="rigs-out-dialog">
        <q-card-section class="row items-center sticky-card-header">
          <div class="text-h6">rigs_out_twisted_2020.jpg</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <div class="img-wrapper">
          <img
            src="assets/rigs_out_twisted_2020.jpg"
            style="width: 100%; height: auto"
          />
        </div>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import TermsAndConditionsDialog from './TermsAndConditionsDialog.vue';
import PrivacyPolicyDialog from './PrivacyPolicyDialog.vue';

export default {
  name: 'AboutDialog',
  components: {
    TermsAndConditionsDialog,
    PrivacyPolicyDialog,
  },
  data() {
    return {
      showBtcAddress: false,
      showPrivacyPolicyDialog: false,
      showTermsAndConditionsDialog: false,
      showRigsOut: false,
    };
  },
  methods: {},
};
</script>

<style lang="scss">
.about-dialog {
  max-height: 660px !important;
  .header {
    position: sticky;
    top: 0;
    z-index: 6;
    width: 100%;
  }
  .polaroid-container {
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 16px;
    padding-bottom: 48px;
    box-shadow: 10px 10px 14px rgba(0, 0, 0, 0.2);
    transform: rotate(-7deg) scale(0.8);
    background: linear-gradient(white, #fafafa);
    cursor: zoom-in;
    .image-container {
      position: relative;
      .image-overlay {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 2;
        top: 0px;
      }
      .image-attribute {
        position: absolute;
        bottom: 0px;
        right: 0px;
        z-index: 5;
        background: black;
        padding: 2px;
        margin: 10px;
        opacity: 0.5;
        font-size: 8pt;
        color: white;
        a {
          color: white;
        }
      }
    }
  }
}
// sm
@media only screen and (max-width: 600px) {
  .about-dialog {
    height: 100vh !important;
    max-height: unset !important;
    width: 100%;
  }
}
</style>
