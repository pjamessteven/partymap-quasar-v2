import { defineStore } from 'pinia';
import moment from 'moment';
import { getPointsRequest } from 'src/api';
import { Artist, EventDate, Location, Tag } from 'src/types/autogen_types';

interface MapQueryState {
  query: string;
  controlDateRange: { start: string; end: string | null };
  controlFavoritesSelected: boolean;
  controlDuration: string[];
  controlSize: string[];
  controlArtist: Artist[];
  controlTag: Tag[];

  controlArtistOptions: Artist[];
  controlArtistOptionsHasNext: boolean;
  controlArtistOptionsPage: number;
  controlArtistOptionsLoading: boolean;

  controlTagOptions: Tag[];
  controlTagOptionsHasNext: boolean;
  controlTagOptionsPage: number;
  controlTagOptionsLoading: boolean;

  points: Location[];
  loadingPoints: boolean;

  eventDates: EventDate[];
}
export const useMapQueryStore = defineStore('map-query', {
  state: (): MapQueryState => ({
    query: '',
    controlDateRange: { start: moment().toISOString(), end: null },
    controlFavoritesSelected: false,
    controlDuration: [],
    controlSize: [],
    controlArtist: [],
    controlTag: [],

    // filter control options
    controlArtistOptions: [],
    controlArtistOptionsHasNext: false,
    controlArtistOptionsPage: 1,
    controlArtistOptionsLoading: false,

    // filter control options
    controlTagOptions: [],
    controlTagOptionsHasNext: false,
    controlTagOptionsPage: 1,
    controlTagOptionsLoading: false,

    // results
    points: [],
    loadingPoints: false,

    eventDates: [],
  }),
  getters: {},
  actions: {
    async loadPoints() {
      try {
        this.loadingPoints = true;
        const pointsResponse = await getPointsRequest(
          this.controlDateRange.start,
          this.controlDateRange.end,
          this.query && this.query.length > 0 ? this.query : undefined,
          this.controlTag.length > 0
            ? this.controlTag.map((tag) => tag.tag)
            : undefined,
          this.controlArtist.length > 0
            ? this.controlArtist.map((artist) => artist.id)
            : undefined,
          this.controlDuration.length > 0 ? this.controlDuration : undefined,
          this.controlSize.length > 0 ? this.controlSize : undefined,

          this.controlFavoritesSelected ? true : undefined
        );
        this.points = pointsResponse.data;
        this.loadingPoints = false;
        return;
      } catch (error) {
        this.loadingPoints = false;
        return error;
      }
    },
  },
});
