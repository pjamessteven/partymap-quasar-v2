<template>
  <div class="flex column">
    <div class="flex row q-gutter-sm items-center no-wrap">
      <q-input v-model="name" label="Name" />
      <!--
    <q-select
      label="Country"
      style="width: 250px"
      clearable=""
      :options="countryCodes.map((x) => x.name)"
      options-dense
      v-model="country"
    />
    -->
      <q-input v-model="country" label="Country" />

      <q-input v-model="year" label="Year" />
      <q-input v-model="month" label="Month" />

      <q-btn
        v-if="!loading && !error"
        class="nav-button primary q-ml-sm"
        no-caps
        @click="load()"
        >Load</q-btn
      >
      <q-btn
        v-else-if="!!error"
        class="nav-button q-ml-sm"
        color="red"
        no-caps
        @click="load()"
        >Retry</q-btn
      >
      <q-btn
        v-else-if="loading"
        class="nav-button q-ml-sm"
        no-caps
        @click="cancel()"
        ><q-spinner size="xs" class="q-mr-sm" />Cancel</q-btn
      >
      <div class="flex column" style="width: 400px" v-if="summary">
        <div>{{ summary }}</div>
      </div>

      <div class="q-ml-sm" style="color: darkred">
        {{ error }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { toRefs, watch, ref } from 'vue';
import { getFestivalInfo } from 'src/api';
import AbortController from 'axios';
import { Notify } from 'quasar';
const props = defineProps(['modelValue']);

const { name, country, year, month, summary } = toRefs(props.modelValue);

const emit = defineEmits(['update:modelValue', 'load', 'result']);

const loading = ref(false);
const error = ref(null);
const abortController = ref(null);

const load = async () => {
  loading.value = true;
  error.value = null;
  abortController.value = new AbortController();
  try {
    const response = await getFestivalInfo(
      { name: name.value, country: country.value, year: year.value + '' },
      abortController.value.signal,
    );
    const eventJson = response.data?.data?.outputs?.json;
    if (eventJson) {
      try {
        const parsedJson = JSON.parse(eventJson);
        console.log('parsed JSON', parsedJson);
        if (parsedJson.name) {
          emit('result', parsedJson);
        } else {
          error.value = 'JSON lacks name field';
        }
      } catch (e) {
        error.value =
          'error parsing JSON \n' +
          JSON.stringify(response.data?.data?.outputs);
        console.log('error parsing JSON', eventJson);
      }
    } else {
      error.value = response.data?.data?.outputs?.__reason || 'Error';
    }
  } catch (e) {
    console.log('error');
    error.value = e.message;

    Notify.create({
      closeBtn: true,
      message: 'Error loading ' + name.value + ': ' + e.message,
    });
  }

  loading.value = false;
};

const cancel = () => {
  abortController.value.abort();
  loading.value = false;
};

watch(name, () => updateValue());
watch(country, () => updateValue());
watch(year, () => updateValue());

const updateValue = () => {
  emit('update:modelValue', {
    name: name.value,
    country: country.value,
    year: year.value,
  });
};
</script>
