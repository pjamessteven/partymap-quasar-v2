import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    darkMode: false,
  }),
  actions: {
    darkModeToggle() {
      this.darkMode = !this.darkMode;
    },
  },
});
