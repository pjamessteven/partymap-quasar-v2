<template>
  <div class="flex column">
    <div class="flex row q-gutter-sm items-center no-wrap">
      <q-btn
        v-if="!loading && !error"
        class="nav-button primary q-ml-sm"
        no-caps
        @click="load()"
        >Try to fetch lineup with AI</q-btn
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
      <div class="q-ml-sm" v-if="loading">This can take up to a minute...</div>
      <div class="q-ml-sm" style="color: darkred">
        {{ error }}
      </div>
    </div>
    <q-card class="q-pa-sm q-mt-md flex column" v-if="results?.length > 0">
      <div :key="artist.name" v-for="(artist, index) of results">
        <q-item>
          <q-item-section>
            <q-item-label>{{ artist.name }}</q-item-label>
            <q-item-label caption>{{ artist.mbid }}</q-item-label>
          </q-item-section>

          <q-item-section v-if="editArtist === index">
            <div class="flex row items-stretch no-wrap">
              <SelectArtistsInput
                @selectedArtist="replaceArtist(index, $event)"
                :prefill="artist.name"
              />
              <q-btn @click="editArtist = null"
                ><q-icon name="mdi-close"></q-icon
              ></q-btn>
            </div>
          </q-item-section>
          <q-item-section v-else>
            <div class="flex row items-center no-wrap">
              <q-btn @click="editArtist = index" class="q-mr-sm"
                ><q-icon name="mdi-pencil" class="q-mr-sm"></q-icon
                >Refine</q-btn
              >
              <q-btn @click="() => deleteArtist(index)"
                ><q-icon name="mdi-delete"></q-icon
              ></q-btn>
              <q-spinner
                class="q-ml-md"
                v-if="gettingMbidForIndex === index"
              ></q-spinner>
            </div>
          </q-item-section>
        </q-item>
      </div>
      <div class="q-pa-md">
        <b>Make sure to refine all artists before saving!</b>
      </div>
      <q-btn class="nav-button primary q-ml-sm q-mt-md" no-caps @click="save()"
        >Save</q-btn
      >
    </q-card>
  </div>
</template>
<script setup lang="ts">
import { ref, defineProps, withDefaults } from 'vue';

import {
  getArtistsRequest,
  getGptArtists,
  getMusicBrainzArtist,
} from 'src/api';
import { Notify } from 'quasar';
import SelectArtistsInput from 'components/EventPage/EventDates/Artists/SelectArtistsInput.vue';

interface Props {
  name: string;
  country: string;
  year: number;
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
});

const emit = defineEmits(['save']);

const loading = ref(false);
const error = ref<string | null>(null);
const abortController = ref<AbortController>(new AbortController());
const results = ref<any>([]);
const editArtist = ref<number | null>(null);
const gettingMbidForIndex = ref<number | null>(null);

const replaceArtist = (index: number, artist: any) => {
  results.value[index] = artist;
  editArtist.value = null;
};

const deleteArtist = (index: number) => {
  results.value.splice(index, 1);
  editArtist.value = null;
};

const save = () => {
  emit('save', results.value);
  results.value = [];
};

const load = async () => {
  loading.value = true;
  error.value = null;
  abortController.value = new AbortController();
  try {
    const response = await getGptArtists(
      { name: props.name, country: props.country, year: props.year + '' },
      abortController.value.signal
    );
    const eventJson = response.data?.data?.outputs?.json;
    if (eventJson) {
      try {
        const parsedJson = JSON.parse(eventJson);
        console.log('parsed JSON', parsedJson);
        if (parsedJson.length > 0 && parsedJson[0].name) {
          results.value = parsedJson;
          triggerMbidAutoLookups();
          // emit('result', parsedJson);
        } else {
          error.value =
            'Result is malformed. Try again or let Pete know if this continues to be a problem.';
        }
      } catch (e: any) {
        error.value =
          'error parsing JSON \n' +
          JSON.stringify(response.data?.data?.outputs);
        console.log('error parsing JSON', eventJson);
      }
    } else {
      error.value = response.data?.data?.outputs?.__reason || 'Error';
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message;

    Notify.create({
      closeBtn: true,
      message: 'Error loading artists: ' + error.value,
    });
  }

  loading.value = false;
};

const triggerMbidAutoLookups = async () => {
  for (const [index, artist] of results.value.entries()) {
    gettingMbidForIndex.value = index;
    try {
      const [pmResponse, mbResponse] = await Promise.all([
        getArtistsRequest({
          query: artist.name,
          page: 1,
          sort: 'event_count',
          desc: true,
          per_page: 5,
        }),
        getMusicBrainzArtist(artist.name),
      ]);
      let mappedResponse = mbResponse.data.artists
        .map(({ id, ...rest }: any) => ({ ...rest, mbid: id }))
        .filter(
          (x: any) =>
            pmResponse.data.items.findIndex((y: any) => y.mbid === x.mbid) ===
            -1
        );
      const searchResults = [...pmResponse.data.items, ...mappedResponse];
      const matches = searchResults.filter(
        (x) => x.name.toLowerCase() === artist.name.toLowerCase()
      );
      console.log('matches', matches);
      if (matches.length === 1) {
        results.value[index].mbid = matches[0]?.mbid;
        console.log('results.value', results.value[index]);
      }
    } catch (e) {}
    gettingMbidForIndex.value = null;
    setTimeout(() => null, 1000);
  }
};

const cancel = () => {
  abortController.value.abort();
  loading.value = false;
};
</script>
