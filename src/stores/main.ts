import { defineStore } from 'pinia';
import { Coordinates } from './map';

interface MainStoreState {
  darkMode: boolean;
  mapStyle: 'satellite' | 'transport' | 'high_contrast';
  showSidebar: boolean;
  showSearchBox: boolean;
  sidebarExpanded: boolean;
  sidebarPanel: string;
  showPanelMobile: boolean;
  menubarOpacity: number;
  userLocation: Coordinates | null;
  userLocationName: string | null;
}
export const useMainStore = defineStore('main', {
  state: (): MainStoreState => ({
    darkMode: false,
    mapStyle: 'satellite',
    showSidebar: true,
    showSearchBox: false, // for menubar search
    sidebarExpanded: false,
    sidebarPanel: 'nearby',
    showPanelMobile: true,
    menubarOpacity: 1,
    userLocation: null,
    userLocationName: null,
  }),
  actions: {
    darkModeToggle() {
      this.darkMode = !this.darkMode;
    },
  },
});
