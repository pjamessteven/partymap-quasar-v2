<template>
  <q-card class="privacy-policy-dialog dialog-card fullscreen-mobile-card">
    <q-card-section class="row items-center dialog-card-header">
      <div class="text-h6 inter bolder">{{ $t('about.privacy_policy') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="t2 dialog-card-content">
      <u
        ><b>{{ $t('privacy.header') }}</b></u
      >
      <p />
      <p>
        {{ $t('privacy.1') }}
      </p>

      <p>
        {{ $t('privacy.2') }}
      </p>

      <p>
        {{ $t('privacy.3') }}
      </p>

      <u
        ><b> {{ $t('privacy.4') }}</b></u
      >
      <p />

      <p>
        {{ $t('privacy.5') }}
      </p>

      <u
        ><b> {{ $t('privacy.6') }}</b></u
      >
      <p />

      <p>
        {{ $t('privacy.7') }}
      </p>
      <p>
        {{ $t('privacy.8') }}
      </p>
      <p>
        {{ $t('privacy.9') }}
      </p>
      <p>
        {{ $t('privacy.10') }}
      </p>

      <u
        ><b> {{ $t('privacy.11') }} </b></u
      >
      <p />
      <p>
        {{ $t('privacy.12') }}
      </p>
      <p>
        {{ $t('privacy.13') }}
      </p>
      <p>
        {{ $t('privacy.14') }}
      </p>

      <p>
        {{ $t('privacy.15') }}
      </p>

      <u
        ><b>{{ $t('privacy.16') }} </b></u
      >
      <p />

      <p>{{ $t('privacy.17') }}</p>

      <ul>
        <li>{{ $t('privacy.18') }}</li>
        <li>{{ $t('privacy.19') }}</li>
        <li>{{ $t('privacy.20') }}</li>
        <li>{{ $t('privacy.21') }}</li>
        <li>
          {{ $t('privacy.22') }}
        </li>
        <li>{{ $t('privacy.23') }}</li>
        <li>{{ $t('privacy.24') }}</li>
      </ul>

      <u
        ><b>{{ $t('privacy.25') }}</b></u
      >
      <p />

      <p>
        {{ $t('privacy.26') }}
      </p>

      <u
        ><b>{{ $t('privacy.27') }}</b></u
      >
      <p />

      <p>
        {{ $t('privacy.28') }}
      </p>

      <u
        ><b>{{ $t('privacy.29') }}</b></u
      >
      <p />

      <p>
        {{ $t('privacy.30') }}
      </p>

      <p>
        {{ $t('privacy.31') }}
      </p>

      <u
        ><b> {{ $t('privacy.32') }} </b></u
      >
      <p />

      <p>
        {{ $t('privacy.33') }}
      </p>
      <ul>
        <li>
          {{ $t('privacy.34') }}
        </li>
        <li>
          {{ $t('privacy.35') }}
        </li>
        <li>
          {{ $t('privacy.36') }}
        </li>
      </ul>
      <p>
        {{ $t('privacy.37') }}
      </p>

      <u
        ><b> {{ $t('privacy.38') }} </b></u
      >
      <p />

      <p>
        {{ $t('privacy.39') }}
      </p>
      <ul>
        <li>
          {{ $t('privacy.40') }}
        </li>
        <li>
          {{ $t('privacy.41') }}
        </li>
        <li>
          {{ $t('privacy.42') }}
        </li>
        <li>
          {{ $t('privacy.43') }}
        </li>
        <li>
          {{ $t('privacy.44') }}
        </li>
        <li>
          {{ $t('privacy.45') }}
        </li>
      </ul>

      <p>
        {{ $t('privacy.46') }}
      </p>

      <u
        ><b> {{ $t('privacy.47') }} </b></u
      >
      <p />

      <p>
        {{ $t('privacy.48') }}
      </p>

      <p>
        {{ $t('privacy.49') }}
      </p></q-card-section
    >
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
