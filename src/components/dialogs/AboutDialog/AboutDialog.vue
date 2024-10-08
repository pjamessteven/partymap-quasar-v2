<template>
  <q-card class="about-dialog dialog-card fullscreen-mobile-card">
    <q-card-section class="header row items-center dialog-card-header">
      <div class="inter bolder text-h6">{{ $t('sidebar.about') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="t2 dialog-card-content">
      <span
        >Welcome to the global directory of festivals, doofs, and underground
        parties!
      </span>
      <p />
      <b>About</b>
      <p />
      PartyMap is a crowd-sourced, community-driven platform for discovering
      festivals and experiences around the world. I built this because I wished
      something like this existed. If you have any thoughts, ideas or
      suggestions about PartyMap then please contact me through the
      <span class="link-hover underline" @click="showFeedbackDialog = true"
        >feedback form</span
      >
      or by email to
      <a class="link-hover underline" href="mailto:info@partymap.com"
        >info@partymap.com</a
      >
      <p />
      <b>How does it work?</b>
      <p />
      Anyone can add anything, as long as the information is already public on
      the internet. Anyone can also make changes to event pages that have no
      owner. If you add your own event and you are the host, you will have full
      control of the event page and other users will not be able to modify it.
      All submissions and changes are moderated, and as the site grows I will be
      seeking regional moderators.
      <p />
      <b>Open Source</b>
      <p />
      PartyMap would not have been possible without the amazing open source
      communtiy. Many thanks to the contributors of Vue, Python, Flask,
      SQLAlchemy, PostgreSQL, PostGIS, Quasar and Leaflet. Thanks to Spotify,
      Last.FM and Musicbrainz for artist info. And many thanks to you for
      submitting your events and reviews!
      <p />
      Partymap itself is open source. Keen to contribute? Hell yeah!!! Let's
      build the best event platform on the internet!
      <p></p>
      If you want to get involved you can find us on
      <a href="https://discord.gg/BD7BwrZA">Discord</a>
      <p />
      Source code:
      <p />
      <a href="https://github.com/pjamessteven/partymap-backend"
        >PartyMap Backend on Github</a
      ><br />
      <a href=" https://github.com/pjamessteven/partymap-quasar-v2"
        >PartyMap Frontend on Github</a
      >
      <p />

      <p />
      <b>Donate</b>
      <p />
      {{ $t('about.message_3') }}
      <a
        class="link-hover underline"
        target="_blank"
        href="https://www.paypal.com/donate/?hosted_button_id=9MVTW44EMSCRA"
        >PayPal</a
      >
      (and soon BTC)<!--
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
      -->
      <p />
      <b>I hate PartyMap!</b>
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
      <q-card-section
        class="flex column items-center justify-center q-pb-none q-mt-lg"
      >
        <q-icon name="las la-kiwi-bird" size="2em" class="t4" />
        <p class="t4 q-mt-md">
          {{ $t('about.made_in_aotaeroa') }}
        </p>
      </q-card-section>
    </q-card-section>
    <q-dialog
      v-model="showFeedbackDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <FeedbackDialog @closeDialog="showFeedbackDialog = false" />
    </q-dialog>
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
      <q-card class="rigs-out-dialog dialog-card">
        <q-card-section class="row items-center dialog-card-header">
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
import FeedbackDialog from 'components/dialogs/FeedbackDialog.vue';

export default {
  name: 'AboutDialog',
  components: {
    TermsAndConditionsDialog,
    PrivacyPolicyDialog,
    FeedbackDialog,
  },
  data() {
    return {
      showBtcAddress: false,
      showPrivacyPolicyDialog: false,
      showTermsAndConditionsDialog: false,
      showFeedbackDialog: false,
      showRigsOut: false,
    };
  },
  methods: {},
  watch: {
    route() {
      this.showTermsAndConditionsDialog = false;
      this.showPrivacyPolicyDialog = false;
    },
    showPrivacyPolicyDialog(newv) {
      if (newv) {
        window.history.pushState({}, '');
      }
    },
    showTermsAndConditionsDialog(newv) {
      if (newv) {
        window.history.pushState({}, '');
      }
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

<style lang="scss">
.about-dialog {
  max-height: 680px !important;
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
@media only screen and (max-width: 599px) {
}
</style>
