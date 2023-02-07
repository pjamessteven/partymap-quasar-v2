import { defineStore } from 'pinia';

interface SearchState {
  query: string | null;
}
export const useSearchStore = defineStore('search', {
  state: (): SearchState => ({
    query: null,
  }),
  getters: {},
  actions: {},
});
