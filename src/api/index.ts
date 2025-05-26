import { defaults } from 'autoprefixer';
import { api } from 'src/boot/axios.ts';
import { config } from 'process';
//var qs = require('qs')
import 'qs';
import qs from 'qs';
import { Lang, Notify } from 'quasar';

// api.defaults.headers.common['Lang-Presf'] = 'cn';

export const DEV_SERVER = process.env.NODE_ENV === 'development';

export const API_URL =
  DEV_SERVER && process.env.CLIENT
    ? // ? 'http://localhost:5000/api'
      '/api'
    : 'https://api.partymap.com/api';

export const PLACE_AUTOCOMPLETE_API_URL =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';

export const MUSICBRAINZ_API_URL = 'https://musicbrainz.org/ws/2';

const USE_LOCAL_DIFY = true;

const DIFY_URL =
  process.env.NODE_ENV === 'development' || USE_LOCAL_DIFY
    ? 'http://localhost/v1'
    : 'http://dify.partymap.com/v1';

const DIFY_USER =
  process.env.NODE_ENV === 'development' || USE_LOCAL_DIFY
    ? 'pjamessteven'
    : 'partymap';

api.defaults.headers.common['Content-Type'] = 'application/json';
api.defaults.headers.common['Accept'] = 'application/json';

api.defaults.withCredentials = true;
api.interceptors.request.use((request) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line
    // console.log('Starting Request', request);
  }
  //request.headers.set('Lang-Pref', 'cn');
  return request;
});

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line
      // console.log('Response:', response);
    }
    return response;
  },
  async (error) => {
    const ignoreErrorsForEndpoints = ['ip_lookup'];

    for (const endpoint of ignoreErrorsForEndpoints) {
      if (error.config.url.indexOf(endpoint) > 0) {
        return Promise.reject(error);
      }
    }
    if (error.config.url.indexOf())
      if (error.response && error.response.data && error.response.data.error) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */

        // TODO: if user is not authenticated, return them to login page.
        // don't do this if the user is updating their password
        // because the password is checked with the /login method

        const errorMessage = error.response.data.error.message;
        const errorCode = error.response.data.error.code;

        const { i18n } = await import('src/boot/i18n');
        const { t } = i18n.global;

        if (errorCode) {
          Notify.create({
            message: t('error_codes.' + errorCode),
            icon: 'error',
          });
        } else if (errorMessage) {
          Notify.create({ message: errorMessage, icon: 'error' });
        }
      } else if (error.request) {
        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        // this.$q.notify(this.$t('errors.' + errorCode))
      } else {
        // Something happened in setting up the request and triggered an Error
      }
    return Promise.reject(error);
  },
);

// diffy

export function getFestivalInfo(
  params: {
    name: string;
    country: string;
    year: string;
  },
  abortSignal: AbortSignal,
) {
  return api.post(
    `${DIFY_URL}/workflows/run`,
    {
      inputs: {
        ...params,
      },
      response_mode: 'blocking',
      user: DIFY_USER,
    },
    {
      signal: abortSignal,
      withCredentials: false,
      headers: {
        Authorization: 'Bearer ' + process.env.DIFY_FESTIVAL_INFO_KEY,
        lang: undefined,
      },
    },
  );
}

export function getGptArtists(
  params: {
    name: string;
    country: string;
    year: string;
  },
  abortSignal: AbortSignal,
) {
  return api.post(
    `${DIFY_URL}/workflows/run`,
    {
      inputs: {
        ...params,
      },
      response_mode: 'blocking',
      user: DIFY_USER,
    },
    {
      signal: abortSignal,
      withCredentials: false,
      headers: {
        Authorization: 'Bearer ' + process.env.DIFY_ARTISTS_KEY,
        lang: undefined,
      },
    },
  );
}
export function getFestivalSummaries(
  params: {
    name: string;
    country: string;
    year: string;
  },
  abortSignal: AbortSignal,
) {
  return api.post(
    `${DIFY_URL}/workflows/run`,
    {
      inputs: {
        ...params,
      },
      response_mode: 'blocking',
      user: 'pjamessteven',
    },
    {
      signal: abortSignal,
      withCredentials: false,
      headers: {
        Authorization: 'Bearer ' + process.env.DIFY_SUMMARIES_KEY,
        lang: undefined,
      },
    },
  );
}

// serpapi

export function searchTicketmaster(params: any) {
  return api.get('https://app.ticketmaster.com/discovery/v2/events.json', {
    params: {
      ...params,
      apikey: process.env.TICKET_MASTER_KEY,
    },
    withCredentials: false,
  });
}

export function searchGoogleImages(query: string) {
  return api.get('https://serpapi.com/search.json', {
    params: {
      engine: 'google_images',
      hl: 'en',
      gl: 'us',
      q: query,
      api_key: process.env.SERP_API_KEY,
    },
    withCredentials: false,
  });
}

// musicbrainz

export function getMusicBrainzArtist(query) {
  return api.get(`${MUSICBRAINZ_API_URL}/artist`, {
    params: {
      query: query,
    },
    withCredentials: false,
    headers: {
      lang: undefined,
    },
  });
}

export function getMusicBrainzEvents(params) {
  return api.get(`${MUSICBRAINZ_API_URL}/event/`, {
    params,
    withCredentials: false,
    headers: {
      lang: undefined,
    },
  });
}

export function getMusicBrainzPlace(query) {
  return api.get(`${MUSICBRAINZ_API_URL}/place/`, {
    params: {
      query,
    },
    withCredentials: false,
    headers: {
      lang: undefined,
    },
  });
}

// google maps places autocomplete

export function getGooglePlacesAutocomplete(
  query,
  sessionToken = null,
  location = null,
) {
  return api.get(`${PLACE_AUTOCOMPLETE_API_URL}`, {
    params: {
      key: process.env.GMAPS_API_KEY,
      input: query,
      sessiontoken: sessionToken,
      location: location,
    },
    headers: {
      lang: undefined,
    },
  });
}

// query all events
export function getPointsRequest(
  dateMin: string,
  dateMax: string | null,
  query?: string,
  tags?: string[],
  artists?: number[],
  durationOptions?: string[],
  sizeOptions?: string[],
  favorites?: boolean,
  dateUnconfirmed?: boolean,
  emptyLineup?: boolean,
) {
  return api.get(`${API_URL}/location/points/`, {
    params: {
      query: query,
      tags: tags,
      artists: artists,
      duration_options: durationOptions,
      size_options: sizeOptions,
      date_min: dateMin,
      date_max: dateMax,
      favorites: favorites,
      distinct: emptyLineup || dateUnconfirmed,
      date_unconfirmed: dateUnconfirmed,
      empty_lineup: emptyLineup,
    },
    paramsSerializer: (params) =>
      qs.stringify(params, {
        arrayFormat: 'repeat',
        skipNulls: true,
      }),
  });
}

export function getClustersRequest(
  zoomLevel,
  bounds,
  tags = null,
  min = null,
  max = null,
) {
  return api.get(`${API_URL}/event/location/zoom_level/${zoomLevel}`, {
    params: {
      tags: tags,
      min: min,
      max: max,
      bounds: bounds,
    },
  });
}

export function getEventDatesRequest(params) {
  return api.get(`${API_URL}/date/`, {
    params: params,
    paramsSerializer: (params) =>
      qs.stringify(params, {
        arrayFormat: 'repeat',
        skipNulls: true,
      }),
  });
}

export function getEventDateRequest(id) {
  return api.get(`${API_URL}/date/${id}`);
}

// get single event

export function getEventRequest(id) {
  return api.get(`${API_URL}/event/${id}`);
}

export function getEventVersionsRequest(id, params) {
  return api.get(`${API_URL}/event/${id}/versions`, {
    params: params,
  });
}

export function getEventRevisionsRequest(id, params) {
  return api.get(`${API_URL}/event/${id}/revisions/`, {
    params: params,
  });
}

// get artist

export function refreshArtistRequest(id) {
  return api.get(`${API_URL}/artist/${id}/refresh`);
}

export function getArtistRequest(id) {
  return api.get(`${API_URL}/artist/${id}`);
}

export function getArtistsRequest(params) {
  return api.get(`${API_URL}/artist/`, {
    params: params,
  });
}

export function deleteArtistRequest(id) {
  return api.delete(`${API_URL}/artist/${id}`);
}

// activities

export function getEventContributorsRequest(id, params) {
  return api.get(`${API_URL}/event/${id}/contributors`, {
    params: params,
  });
}
export function getEventActivityRequest(id, params) {
  return api.get(`${API_URL}/event/${id}/activity`, {
    params: params,
  });
}

export function getActivitiesOfTransaction(id, params) {
  return api.get(`${API_URL}/activity/transaction/${id}/`, {
    params: params,
  });
}

export function revertEventActivityRequest(id) {
  return api.get(`${API_URL}/activity/${id}/revert/`);
}

// edit event

export function editEventRequest(id, payload) {
  return api.put(`${API_URL}/event/${id}`, payload);
}

export function deleteEventRequest(id) {
  return api.delete(`${API_URL}/event/${id}`);
}

// event suggestions
export function suggestEventEditRequest(id, payload) {
  return api.put(`${API_URL}/event/${id}/suggest`, payload);
}

export function suggestDeleteEventRequest(id) {
  return api.delete(`${API_URL}/event/${id}/suggest`);
}

// get single event date

export function getEventDateRevisionsRequest(id) {
  return api.get(`${API_URL}/date/${id}/revisions/`);
}

export function editEventDateRequest(id, payload) {
  return api.put(`${API_URL}/date/${id}`, payload);
}

export function deleteEventDateRequest(id) {
  return api.delete(`${API_URL}/date/${id}`);
}

export function addEventDateRequest(eventId, payload) {
  return api.post(`${API_URL}/date/event/${eventId}`, payload);
}

// event date suggestions

export function suggestSelectedEventDateEditRequest(id, payload) {
  return api.put(`${API_URL}/date/${id}/suggest`, payload);
}

export function suggestDeleteEventDateRequest(id, payload) {
  return api.delete(`${API_URL}/date/${id}/suggest`, { data: payload });
}

export function suggestAddEventDateRequest(eventId, payload) {
  return api.post(`${API_URL}/date/event/${eventId}/suggest`, payload);
}

export function getSuggestionsRequest(params) {
  return api.get(`${API_URL}/suggestions/`, { params: params });
}

export function updateSuggestionRequest(id, payload) {
  return api.put(`${API_URL}/suggestions/${id}/`, payload);
}

export function deleteSuggestionRequest(id) {
  return api.delete(`${API_URL}/suggestions/${id}/`);
}

// media items

export function updateMediaItemRequest(id, payload) {
  return api.put(`${API_URL}/media/${id}`, payload);
}

export function deleteMediaItemRequest(id) {
  return api.delete(`${API_URL}/media/${id}`);
}

// query things

export function getEventsRequest(params: {
  query?: string;
  sort?: 'created_at' | 'name' | 'id';
  desc?: boolean;
  hidden?: boolean;
  page?: number;
  per_page?: number;
}) {
  return api.get(`${API_URL}/event/`, {
    params,
  });
}

// tags

export function getTagRequest(params) {
  return api.get(`${API_URL}/tag/`, {
    params: params,
  });
}

export function deleteTagRequest(id) {
  return api.delete(`${API_URL}/tag/${id}`);
}

export function updateTagTranslationsRequest(id, translations) {
  return api.put(`${API_URL}/tag/${id}/translations`, translations);
}

// users

export function confirmEmailRequest(token) {
  return api.post(`${API_URL}/user/confirm_email/${token}`);
}

export function activateUserRequest(token) {
  return api.post(`${API_URL}/user/activate/${token}`);
}

export function registerRequest(userData) {
  return api.post(`${API_URL}/user/`, userData);
}

export function editUserRequest(username, userData) {
  return api.put(`${API_URL}/user/${username}`, userData);
}

export function deleteUserRequest(username) {
  return api.delete(`${API_URL}/user/${username}`);
}

export function getUserRequest(username) {
  return api.get(`${API_URL}/user/${username}`);
}

export function getUserFullProfileRequest(username) {
  return api.get(`${API_URL}/user/${username}/profile`);
}

export function getActivitiesRequest(params) {
  return api.get(`${API_URL}/activity`, {
    params: params,
  });
}
// authentication

export function logoutRequest() {
  return api.get(`${API_URL}/auth/logout/`);
}

export function loginRequest(payload) {
  return api.post(`${API_URL}/auth/login/`, payload);
}

export function appleLoginRequest(payload) {
  return api.post(`${API_URL}/auth/login/apple/`, payload);
}

export function checkAuthenticatedRequest() {
  return api.get(`${API_URL}/auth/login/`, {
    data: {},
  });
}

export function fetchEventDateRequest(eventId) {
  return api.get(`${API_URL}/date/${eventId}`);
}

export function fetchEventDateIcsRequest(eventId) {
  return api.get(`${API_URL}/date/${eventId}/ics`);
}

export function requestPasswordResetRequest(identifier) {
  return api.get(`${API_URL}/user/${identifier}/request_pw_reset`);
}

export function passwordResetRequest(token, body) {
  return api.post(`${API_URL}/user/reset_pw/${token}`, body);
}
// authentication required

export function toggleEventDateInterestedRequest(eventId) {
  return api.post(`${API_URL}/date/${eventId}/interested`);
}

export function toggleEventDateGoingRequest(eventId) {
  return api.post(`${API_URL}/date/${eventId}/going`);
}

export function updateEventRequest(eventId, payload) {
  return api.put(`${API_URL}/event/${eventId}`, payload);
}

export function suggestUpdateEventRequest(eventId, payload) {
  return api.put(`${API_URL}/event/${eventId}/suggest`, payload);
}

export function voteEventImageRequest(id, vote) {
  return api.put(`${API_URL}/contribution/image/${id}`, {
    vote: vote,
  });
}

export function voteEventTagRequest(eventId, tagId, vote) {
  return api.put(`${API_URL}/event/${eventId}/tag/${tagId}/`, {
    vote: vote,
  });
}

export function submitReviewRequest(eventId, payload) {
  return api.post(`${API_URL}/contribution/event/${eventId}/`, payload);
}

export function deleteReviewRequest(reviewId) {
  return api.delete(`${API_URL}/contribution/${reviewId}`);
}

export function voteReviewRequest(reviewId, vote) {
  return api.put(`${API_URL}/contribution/${reviewId}`, {
    vote: vote,
  });
}

export function addEventImageRequest(event, formData) {
  return api.put(`${API_URL}/event/${event.id}`, formData);
}

export function addEventRequest(event) {
  return api.post(`${API_URL}/event/`, event);
}

export function postFeedbackRequest(payload) {
  return api.post(`${API_URL}/feedback/`, payload);
}

// reports

export function postReportRequest(payload) {
  return api.post(`${API_URL}/report/`, payload);
}

export function getReportsRequest(params) {
  return api.get(`${API_URL}/report/`, {
    params: params,
  });
}

export function updateReportRequest(reportId, payload) {
  return api.put(`${API_URL}/report/${reportId}`, payload);
}

// localities

export function getLocalitiesRequest() {
  return api.get(`${API_URL}/location/localities`);
}

export function getCountriesRequest() {
  return api.get(`${API_URL}/location/countries`);
}

export function getCountryRegionsRequest(country_id) {
  return api.get(`${API_URL}/location/countries/${country_id}`);
}

export function getSearchSuggestionsRequest(params) {
  return api.get(`${API_URL}/search/`, {
    params,
  });
}
// ip lookup

export function getIpInfoRequest() {
  return api.get(`${API_URL}/services/ip_lookup`);
}

// metrics

// ip lookup

export function getUrlMetrics(params) {
  return api.get(`${API_URL}/metrics/urls`, {
    params,
  });
}

export function getCountryMetrics(params) {
  return api.get(`${API_URL}/metrics/countries`, {
    params,
  });
}
