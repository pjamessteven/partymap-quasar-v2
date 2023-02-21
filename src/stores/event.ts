import { defineStore } from 'pinia';
import {
  getEventRequest,
  getEventDateRequest,
  toggleFavoriteEventRequest,
  deleteEventDateRequest,
  editEventRequest,
  suggestEventEditRequest,
  addEventDateRequest,
  suggestEventDateEditRequest,
  editEventDateRequest,
  updateMediaItemRequest,
  deleteMediaItemRequest,
} from 'src/api';

import {
  EventDate,
  MiniEventDate,
  Event,
  MediaItem,
} from 'src/types/autogen_types';

import { EventUpdate } from 'src/types/event';
import { EventDateUpdate } from 'src/types/event_date';
import { useAuthStore } from './auth';

interface EventState {
  event: Event | null;
  loadingEvent: boolean;
  selectedEventDate: EventDate | MiniEventDate | null;
  selectedEventDateIndex: number;
  loadingEventDate: boolean;
  editing: boolean;
  backgroundMediaIndex: number;
}

export const useEventStore = defineStore('event', {
  state: (): EventState => ({
    event: null,
    loadingEvent: false,
    selectedEventDate: null,
    selectedEventDateIndex: 0,
    loadingEventDate: false,
    editing: false,
    backgroundMediaIndex: 0,
  }),
  getters: {
    currentUserCanEdit: (state) => {
      const authStore = useAuthStore();
      return (
        state.event?.host?.username === authStore.currentUser?.username ||
        (authStore.currentUser?.role && authStore.currentUser.role >= 2)
      );
    },
    currentUserIsHost: (state) => {
      const authStore = useAuthStore();
      return (
        state.event?.host?.username &&
        authStore.currentUser?.username === state.event.host.username
      );
    },
  },
  actions: {
    async loadEvent(id: string) {
      try {
        this.event = null;
        this.loadingEvent = true;
        const response = await getEventRequest(id);
        this.event = response.data;
        if (this.event?.next_date) {
          const index = this.event?.event_dates.findIndex(
            (x) => x.id === response.data.next_date.id
          );
          this.selectedEventDate = this.event?.next_date;
          this.selectedEventDateIndex = index;
        } else if (
          this.event?.event_dates &&
          this.event?.event_dates.length > 0
        ) {
          // no upcoming event, set current event to be the most recent event
          const lastIndex = this.event.event_dates.length - 1;
          this.selectedEventDateIndex = lastIndex;
          this.selectedEventDate = this.event?.event_dates?.[lastIndex];
        }
        return response;
      } catch (error) {
        this.loadingEvent = false;
        return error;
      }
    },
    async updateEvent(payload: EventUpdate) {
      try {
        const response = await editEventRequest(this.event?.id, payload);
        this.event = response.data;
        return response;
      } catch (e) {
        return e;
      }
    },

    async suggestEventEdit(payload: EventUpdate) {
      try {
        const response = suggestEventEditRequest(this.event?.id, payload);
        return response;
      } catch (e) {
        return e;
      }
    },
    async toggleFavorite() {
      if (this.event) {
        this.event.is_favorited = !this.event.is_favorited;
        try {
          await toggleFavoriteEventRequest(this.event.id, {
            favorited: this.event.is_favorited,
          });
        } catch (e) {
          // revert
          this.event.is_favorited = !this.event.is_favorited;
        }
      }
    },

    /*
     * EVENT DATES
     */

    async loadEventDate(id: string) {
      this.loadingEventDate = true;
      const index = this.event?.event_dates?.findIndex(
        (x) => x.id + '' === id + ''
      );
      if (index && index > -1) {
        this.selectedEventDateIndex = index;
      }
      try {
        const response = await getEventDateRequest(id);

        if (index === this.selectedEventDateIndex) {
          // check that this is the most recent request before setting state
          this.selectedEventDate = response.data;
          this.loadingEventDate = false;
        }
        return response;
      } catch (e) {
        this.loadingEventDate = false;
        return e;
      }
    },
    async deleteEventDate(id: string) {
      try {
        const response = await deleteEventDateRequest(id);
        this.event = response.data;
        return response;
      } catch (e) {
        return e;
      }
    },

    async updateEventDate(payload: EventDateUpdate) {
      try {
        const response = await editEventDateRequest(
          this.selectedEventDate?.id,
          payload
        );
        this.event = response.data;
        return response;
      } catch (e) {
        return e;
      }
    },
    async addEventDate(payload: EventDateUpdate) {
      try {
        const response = await addEventDateRequest(this.event?.id, payload);
        this.event = response.data;
        return response;
      } catch (e) {
        return e;
      }
    },
    async suggestEventDateEdit(payload: EventDateUpdate) {
      try {
        const response = suggestEventDateEditRequest(this.event?.id, payload);
        return response;
      } catch (e) {
        return e;
      }
    },
    async updateMediaItem(id: string, payload: { caption: string }) {
      try {
        const response = updateMediaItemRequest(id, payload);
        return response;
      } catch (e) {
        return e;
      }
    },
    async deleteMediaItem(id: string) {
      try {
        const response = deleteMediaItemRequest(id);
        return response;
      } catch (e) {
        return e;
      }
    },
    async setMediaItemPosition(
      id: string,
      position: 'start' | 'end' | 'up' | 'down'
    ) {
      const mediaItems: MediaItem[] | undefined = this.event?.media_items;
      const index = mediaItems?.findIndex((x) => x.id === id);
      let toIndex = 0;

      function arrayMove(arr: MediaItem[], fromIndex: number, toIndex: number) {
        const element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
      }

      // update local position
      if (index != undefined && !!mediaItems) {
        if (position === 'up') {
          toIndex = index - 1;
          if (toIndex >= 0) {
            // only move if not already at start of array
            arrayMove(mediaItems, index, toIndex);
          }
        } else if (position === 'down') {
          toIndex = index + 1;
          if (toIndex < mediaItems.length) {
            // only move if not already at end of array
            arrayMove(mediaItems, index, toIndex);
          }
        } else if (position === 'start') {
          toIndex = 0;
          arrayMove(mediaItems, index, 0);
        } else if (position === 'end') {
          toIndex = mediaItems.length - 1;
          arrayMove(mediaItems, index, mediaItems.length - 1);
        }

        try {
          const response = updateMediaItemRequest(id, { position: toIndex });
          return response;
        } catch (e) {
          return e;
        }
      } else {
        throw new Error('Media item index not found');
      }
    },
  },
});
