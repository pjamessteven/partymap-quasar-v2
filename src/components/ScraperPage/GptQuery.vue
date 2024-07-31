<template>
  <div class="flex row q-gutter-sm items-start">
    <div class="flex column">
      <q-input v-model="gptQuery" class="flex grow" label="Query prompt" />
      <q-card class="flex column q-pa-md q-mt-md">
        Exlude these events:
        <MiniEventDateQuery @result="($event) => (excludeEvents = $event)" />
        <q-btn
          v-if="excludeEvents?.length"
          class="q-mt-sm"
          @click="() => (showExcludeEvents = !showExcludeEvents)"
          >Excluding {{ excludeEvents.length }}
          <span v-if="!showExcludeEvents">(show)</span
          ><span v-else>(hide)</span></q-btn
        >
        <q-btn
          v-if="excludeEvents?.length"
          class="nav-button q-mt-sm"
          color="red"
          no-caps
          @click="() => (excludeEvents = [])"
          >Reset</q-btn
        >
        <q-list v-if="showExcludeEvents">
          <q-item
            dense
            clickable
            v-for="(event, index) in excludeEvents"
            :key="index"
            @click="excludeEvents.splice(index, 1)"
            >{{ event.name }}</q-item
          >
        </q-list>
      </q-card>
      <div class="q-mt-sm">
        {{ error }}
      </div>
    </div>
    <q-btn
      v-if="!loading && !error"
      class="nav-button primary q-ml-sm"
      no-caps
      @click="load()"
      >Run Query</q-btn
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
import { getFestivalSummaries } from 'src/api';
import { Notify } from 'quasar';
import MiniEventDateQuery from './MiniEventDateQuery.vue';
import AbortController from 'axios';

const emit = defineEmits(['result']);

const loading = ref(false);
const error = ref(null);
const gptQuery = ref();
const excludeEvents = ref();
const showExcludeEvents = ref(false);

const abortController = ref(null);

const cancel = () => {
  abortController.value.abort();
  loading.value = false;
};
const load = async () => {
  loading.value = true;
  error.value = null;
  abortController.value = new AbortController();
  try {
    const response = await getFestivalSummaries(
      excludeEvents.value?.length
        ? {
            query: gptQuery.value,
            exclude: JSON.stringify(excludeEvents.value?.map((x) => x.name)),
          }
        : {
            query: gptQuery.value,
          },
      abortController.value.signal
    );
    const eventJson = response.data?.data?.outputs?.json;
    if (eventJson) {
      if (eventJson[0]?.name) {
        emit('result', eventJson);
      } else {
        error.value = 'JSON invalid or lacks name field';
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
</script>
