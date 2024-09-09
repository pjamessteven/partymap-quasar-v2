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
      <div
        class="flex column"
        :key="artist.name"
        v-for="(artist, index) of results"
      >
        <q-item v-if="(!artist.mbid && !artist.id) || showHidden">
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
        <q-item class="b3 q-ml-lg" v-if="artist.results?.length">
          <q-item-section>
            <q-item-label> <b>Multiple options found</b> </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          class="b3 q-ml-lg"
          clickable
          v-if="artist.results?.length"
          :onClick="() => (results[index].results = null)"
        >
          <q-item-section>
            <q-item-label> (Create new record) </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          :onClick="() => (results[index] = result)"
          class="b3 q-ml-lg"
          v-for="(result, resultIndex) of artist.results?.slice(0, 5)"
          :key="resultIndex"
        >
          <q-item-section>
            <q-item-label>{{ result.name }}</q-item-label>
            <q-item-label caption>{{
              result.disambiguation || result.description
            }}</q-item-label>
            <q-item-label caption>mbid: {{ result.mbid }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>
      <div class="q-pa-md" v-if="artistsWithId?.length">
        <b>{{ artistsWithId.length }}</b
        >&nbsp; matched artists hidden
        <span class="t2 link-hover" @click="() => (showHidden = !showHidden)">{{
          !showHidden ? '[show]' : '[hide]'
        }}</span>
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
import { ref, defineProps, withDefaults, computed } from 'vue';

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
const showHidden = ref(false);

const artistsWithId = computed(() =>
  results.value.filter((x: any) => !!x.mbid || !!x.id)
);

const replaceArtist = (index: number, artist: any) => {
  results.value[index] = artist;
  editArtist.value = null;
};

const deleteArtist = (index: number) => {
  results.value.splice(index, 1);
  editArtist.value = null;
};

const save = () => {
  emit(
    'save',
    results.value.map((x: any) => ({ name: x.name, mbid: x.mbid }))
  );
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
    const artists = response.data?.data?.outputs?.artists;
    if (artists && artists?.length > 0) {
      results.value = artists.map((x) => ({ name: x }));
      triggerMbidAutoLookups();
      // emit('result', parsedJson);
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
        results.value[index].name = matches[0].name;
      } else {
        results.value[index].results = searchResults;
      }
    } catch (e) {}
    gettingMbidForIndex.value = null;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

const cancel = () => {
  abortController.value.abort();
  loading.value = false;
};
</script>
