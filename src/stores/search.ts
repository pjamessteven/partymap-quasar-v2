import { defineStore } from 'pinia';

interface SearchState {
  query: string | null;
  searchbarShowing: boolean;
}
export const useSearchStore = defineStore('search', {
  state: (): SearchState => ({
    query: null,
    searchbarShowing: false,
  }),
  getters: {},
  actions: {},
});
