<template>
  <q-card class="privacy-policy-dialog dialog-card fullscreen-mobile-card">
    <q-card-section class="row items-center dialog-card-header">
      <div class="text-h6 inter bolder">{{ $t('about.privacy_policy') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="t2 dialog-card-content">
      <p>
        {{ $t('privacy.1') }}
      </p>

      <p>
        {{ $t('privacy.2') }}
      </p>

      <u
        ><b> {{ $t('privacy.3') }}</b></u
      >
      <p />

      <p>
        {{ $t('privacy.4') }}
      </p>

      <u
        ><b> {{ $t('privacy.5') }}</b></u
      >
      <p />
      <ul>
        <li>
          {{ $t('privacy.6') }}
        </li>
        <li>
          {{ $t('privacy.7') }}
        </li>
        <li>
          {{ $t('privacy.8') }}
        </li>
        <li>
          {{ $t('privacy.9') }}
        </li>
      </ul>

      <u
        ><b> {{ $t('privacy.11') }} </b></u
      >
      <p />
      <ul>
        <li>
          {{ $t('privacy.12') }}
        </li>
        <li>
          {{ $t('privacy.13') }}
        </li>
        <li>
          {{ $t('privacy.14') }}
        </li>
      </ul>
      <p></p>

      <u
        ><b> {{ $t('privacy.15') }} </b></u
      >
      <p />

      <p>{{ $t('privacy.16') }}</p>
      <p>{{ $t('privacy.17') }}</p>

      <u
        ><b>{{ $t('privacy.18') }}</b></u
      >
      <p />

      <p>
        {{ $t('privacy.19') }}
      </p>

      <u
        ><b>{{ $t('privacy.20') }}</b></u
      >
      <p />

      <p>
        {{ $t('privacy.21') }}
      </p>

      <u
        ><b>{{ $t('privacy.22') }}</b></u
      >
      <p />

      <p>
        {{ $t('privacy.23') }}
      </p>

      <p>
        {{ $t('privacy.24') }}
      </p>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'PrivacyPolicyDialog',
  data() {
    return {};
  },
};
</script>

<style lang="scss">
.privacy-policy-dialog {
  max-height: 660px !important;
  .header {
    position: sticky;
    top: 0;
    z-index: 6;
    width: 100%;
  }
}
</style>
