<template>
  <div class="flex row q-gutter-sm items-center">
    <q-input v-model="name" label="Name" />
    <q-select
      label="Country"
      style="width: 250px"
      :options="countryCodes"
      options-dense
      option-label="name"
      option-value="alpha2"
      emit-value
      map-options
      v-model="country"
    />

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
    <q-btn v-else class="nav-button q-ml-sm" no-caps @click="cancel()"
      ><q-spinner size="xs" class="q-mr-sm" />Cancel</q-btn
    >
    <div class="q-ml-sm"></div>
  </div>
</template>
<script setup>
import { toRefs, watch, ref } from 'vue';
import countryCodes from 'src/assets/country-code';
import { getEventDatesRequest } from 'src/api';
import { Notify } from 'quasar';
const props = defineProps(['modelValue']);

const country = ref();
const name = ref();
const emit = defineEmits(['update:modelValue', 'load', 'result']);

const loading = ref(false);
const error = ref(null);

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getEventDatesRequest({
      query: name.value,
      country_id: country.value,
      distinct: true,
      per_page: 300,
    });
    const eventDates = response.data?.items?.map((x) => x[0]);
    if (eventDates) {
      emit('result', eventDates);
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
</script>
