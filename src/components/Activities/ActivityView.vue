<template>
  <div class="flex column">
    <Transaction
      class="q-mt-md"
      v-for="(transaction, index) of transactions"
      :key="index"
      :transaction="transaction"
      :showUsername="!username"
    />
    <div
      v-if="isLoadingInitial"
      class="flex grow justify-center"
      style="height: 100%; position: absolute; width: 100%; top: 0px"
    >
      <InnerLoading :solid="false" :fixed="true" />
    </div>
    <div class="row justify-center" v-if="transactions">
      <q-linear-progress
        class="q-my-xl q-mb-xl"
        v-if="hasNext"
        indeterminate
        size="2px"
        :color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
        rounded
        :style="$q.screen.gt.xs ? 'max-width: 200px' : 'max-width: 120px'"
      />
      <div v-else class="q-my-lg q-mb-xl">
        <div v-if="transactions.length > 0" class="t4 inter semibold q-mt-md">
          {{ $t('general.end_of_results') }}
        </div>
        <div
          v-else-if="transactions.length === 0 && !isLoading"
          :class="$q.screen.lt.sm ? 'q-mt-lg t4 semibold' : 'q-mt-lg'"
          class="t4 inter"
        >
          {{ $t('general.no_results') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onMounted } from 'vue';
import { getActivitiesRequest } from 'src/api';
import Transaction from './Transaction.vue';
import InnerLoading from 'src/components/InnerLoading.vue';

interface Props {
  username: string;
  scrollPercentage: number;
}

const props = withDefaults(defineProps<Props>(), {
  username: null,
  scrollPercentage: 0,
});

const isLoadingInitial = ref(false);
const isLoading = ref(false);
const transactions = ref(null);
const page = ref(1);
const hasNext = ref(false);

watch(
  () => props.scrollPercentage,
  (newv) => {
    if (newv === 1) loadMore();
  }
);

onMounted(async () => {
  isLoadingInitial.value = true;
  const response = await getActivitiesRequest({
    sort: 'id',
    desc: true,
    username: props.username,
  });
  transactions.value = response.data.items;
  hasNext.value = response.data.has_next;
  isLoadingInitial.value = false;
});

const loadMore = async () => {
  if (hasNext.value) {
    page.value += 1;
    isLoading.value = true;
    const response = await getActivitiesRequest({
      sort: 'id',
      desc: true,
      page: page.value,
      username: props.username,
    });
    transactions.value = [...transactions.value, ...response.data.items];
    hasNext.value = response.data.has_next;
    isLoading.value = false;
  }
};
</script>
