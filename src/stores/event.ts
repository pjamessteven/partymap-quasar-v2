import { defineStore } from 'pinia';
import {
  getEventRequest,
  getEventDateRequest,
  deleteEventDateRequest,
  editEventRequest,
  suggestEventEditRequest,
  addEventDateRequest,
  suggestEventDateEditRequest,
  editEventDateRequest,
  updateMediaItemRequest,
  deleteMediaItemRequest,
  submitContributionRequest,
  toggleEventDateInterestedRequest,
  toggleEventDateGoingRequest,
} from 'src/api';

import {
  EventDate,
  MiniEventDate,
  Event,
  MediaItem,
  EventContribution,
} from 'src/types/autogen_types';

import { EventUpdate } from 'src/types/event';
import { EventDateUpdate } from 'src/types/event_date';
import { useAuthStore } from './auth';

interface EventState {
  event: Event | null;
  loadingEvent: boolean;
  selectedEventDate: EventDate | null;
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
        (!!state.event?.host?.username &&
          !!authStore.currentUser?.username &&
          state.event?.host?.username === authStore.currentUser?.username) ||
        (authStore.currentUser?.role && authStore.currentUser.role >= 20)
      );
    },
    currentUserIsHost: (state) => {
      const authStore = useAuthStore();
      return (
        !!state.event?.host?.username &&
        !!authStore.currentUser?.username &&
        state.event?.host?.username === authStore.currentUser?.username
      );
    },
  },
  actions: {
    reloadEvent() {
      if (this.event) return this.loadEvent(this.event?.id);
      else throw new Error('No current event.');
    },
    async loadEvent(id: number) {
      const authStore = useAuthStore();

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
          if (authStore.currentUser && this.selectedEventDate)
            // bit of a hack, reload date to get going/interested status
            this.loadEventDate(this.selectedEventDate.id + '');
        } else if (
          this.event?.event_dates &&
          this.event?.event_dates.length > 0
        ) {
          // no upcoming event, set current event to be the most recent event
          const lastIndex = this.event.event_dates.length - 1;
          this.selectedEventDateIndex = lastIndex;
          this.loadEventDate(this.event?.event_dates?.[lastIndex]?.id + '');
        }
        return response;
      } catch (error) {
        this.loadingEvent = false;
        throw error;
      }
    },
    async updateEvent(payload: EventUpdate) {
      try {
        const response = await editEventRequest(this.event?.id, payload);
        this.event = response.data;
        return response;
      } catch (e) {
        throw e;
      }
    },

    async suggestEventEdit(payload: EventUpdate) {
      try {
        console.log(this.event);
        const response = suggestEventEditRequest(this.event?.id, payload);
        return response;
      } catch (e) {
        throw e;
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
      if (index !== undefined && index > -1) {
        this.selectedEventDateIndex = index;
      }
      try {
        const response = await getEventDateRequest(id);
        console.log(index, this.selectedEventDateIndex);
        if (index === this.selectedEventDateIndex) {
          // check that this is the most recent request before setting state
          this.selectedEventDate = response.data;
          this.loadingEventDate = false;
        }
        return response;
      } catch (e) {
        this.loadingEventDate = false;
        throw e;
      }
    },
    async deleteEventDate(id: string) {
      try {
        let index = this.selectedEventDateIndex;
        if (this.event && index === this.event?.event_dates?.length - 1) {
          // if we're deleting the last event date, select the previous one after deletion
          index -= 1;
        }

        const response = await deleteEventDateRequest(id);
        this.event = response.data;
        this.loadEventDate(this.event?.event_dates?.[index]?.id + '');
        return response;
      } catch (e) {
        throw e;
      }
    },

    async updateEventDate(payload: EventDateUpdate) {
      try {
        const response = await editEventDateRequest(
          this.selectedEventDate?.id,
          payload
        );
        this.selectedEventDate = response.data;

        return response;
      } catch (e) {
        throw e;
      }
    },
    async addEventDate(payload: EventDateUpdate) {
      try {
        const response = await addEventDateRequest(this.event?.id, payload);
        this.event = response.data;
        return response;
      } catch (e) {
        throw e;
      }
    },
    async suggestEventDateEdit(payload: EventDateUpdate) {
      try {
        const response = suggestEventDateEditRequest(
          this.selectedEventDate?.id,
          payload
        );
        return response;
      } catch (e) {
        throw e;
      }
    },
    async updateMediaItem(id: string, payload: { caption: string }) {
      try {
        const response = updateMediaItemRequest(id, payload);
        return response;
      } catch (e) {
        throw e;
      }
    },
    async deleteMediaItem(id: string) {
      try {
        const response = deleteMediaItemRequest(id);
        return response;
      } catch (e) {
        throw e;
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
          throw e;
        }
      } else {
        throw new Error('Media item index not found');
      }
    },
    async addReview(payload: EventContribution) {
      try {
        const response = await submitContributionRequest(
          this.event?.id,
          payload
        );
        this.reloadEvent();
        return response;
      } catch (e) {
        throw e;
      }
    },

    async toggleInterested() {
      try {
        if (this.selectedEventDate) {
          if (this.selectedEventDate.user_going) {
            this.selectedEventDate.user_going = false;
          }

          if (this.selectedEventDate.user_interested) {
            this.selectedEventDate.user_interested = false;
          } else {
            this.selectedEventDate.user_interested = true;
          }
          await toggleEventDateInterestedRequest(this.selectedEventDate.id);
        } else {
          throw new Error('toggleInterested: No event date selected');
        }
      } catch (e) {
        if (this.selectedEventDate)
          this.selectedEventDate.user_interested = false;
        throw e;
      }
    },
    async toggleGoing() {
      try {
        if (this.selectedEventDate) {
          if (this.selectedEventDate.user_interested) {
            this.selectedEventDate.user_interested = false;
          }

          if (this.selectedEventDate.user_going) {
            this.selectedEventDate.user_going = false;
          } else {
            this.selectedEventDate.user_going = true;
          }

          await toggleEventDateGoingRequest(this.selectedEventDate.id);
        } else {
          throw new Error('toggleGoing: No event date selected');
        }
      } catch (e) {
        if (this.selectedEventDate) this.selectedEventDate.user_going = false;
        throw e;
      }
    },
  },
});
