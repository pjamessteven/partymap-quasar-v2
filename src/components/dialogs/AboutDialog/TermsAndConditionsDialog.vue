<template>
  <q-card
    class="terms-and-conditions-dialog dialog-card fullscreen-mobile-card"
  >
    <q-card-section class="row items-center dialog-card-header">
      <div class="text-h6 inter bolder">
        {{ $t('terms_and_conditions.1') }}
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    <q-card-section class="t2 dialog-card-content">
      <p>
        <b>{{ $t('terms_and_conditions.2') }}</b>
      </p>
      <p>
        {{ $t('terms_and_conditions.3') }}
      </p>
      <p>
        <b>{{ $t('terms_and_conditions.4') }}</b>
      </p>

      <ul>
        <li>{{ $t('terms_and_conditions.5') }}</li>
        <li>{{ $t('terms_and_conditions.6') }}</li>
        <li>{{ $t('terms_and_conditions.7') }}</li>
      </ul>

      <p>
        <b>{{ $t('terms_and_conditions.8') }}</b>
      </p>

      <ul>
        <li>{{ $t('terms_and_conditions.9') }}</li>
        <li>{{ $t('terms_and_conditions.10') }}</li>
        <li>{{ $t('terms_and_conditions.11') }}</li>
      </ul>

      <p>
        <b>{{ $t('terms_and_conditions.12') }}</b>
      </p>

      <ul>
        <li>{{ $t('terms_and_conditions.13') }}</li>
        <li>{{ $t('terms_and_conditions.14') }}</li>
        <li>{{ $t('terms_and_conditions.15') }}</li>
      </ul>

      <p>
        <b>{{ $t('terms_and_conditions.16') }}</b>
      </p>

      <p>
        {{ $t('terms_and_conditions.17') }}
      </p>

      <p>
        <b>{{ $t('terms_and_conditions.18') }}</b>
      </p>

      <p>
        {{ $t('terms_and_conditions.19') }}
      </p>

      <p>
        <b>{{ $t('terms_and_conditions.20') }}</b>
      </p>

      <p>
        {{ $t('terms_and_conditions.21') }}
      </p>

      <p>
        <b>{{ $t('terms_and_conditions.22') }}</b>
      </p>

      <p>
        {{ $t('terms_and_conditions.23') }}
      </p>

      <p>
        <b>{{ $t('terms_and_conditions.24') }}</b>
      </p>

      <p>
        {{ $t('terms_and_conditions.25') }}
      </p>

      <p>
        <b>{{ $t('terms_and_conditions.26') }}</b>
      </p>

      <p>
        {{ $t('terms_and_conditions.27') }}
      </p>

      <p />
      {{ $t('terms_and_conditions.28') }}
      <p />
      <b>{{ $t('terms_and_conditions.29') }}</b>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'TermsAndConditionsDialog',
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss">
.terms-and-conditions-dialog {
  .header {
    position: sticky;
    top: 0;
    z-index: 6;
    width: 100%;
  }
}
</style>
