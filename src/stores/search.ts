import { defineStore } from 'pinia';

interface SearchState {
  query: string | null;
  searchResults: [];
  locationSearchResults: [];
}
export const useSearchStore = defineStore('search', {
  state: (): SearchState => ({
    query: null,
    searchResults: [],
    locationSearchResults: [],
  }),
  getters: {},
  actions: {},
});
