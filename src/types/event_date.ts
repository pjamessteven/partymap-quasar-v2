export interface EventDateUpdate {
  date_time?: {
    start: string;
    end: string;
  };
  location?: {
    name: string;
    description: string;
    place_id: string; // google maps place_id
    types: string[];
    geometry: {
      location: {
        lat: string;
        lng: string;
      };
    };
    addressComponents: object;
  };
  description?: string;
  description_attribute?: string;
  url?: string;
  ticket_url?: string;
  add_tags?: string[];
  size: number;
  artists: {
    name: string;
    mbid: string;
  }[];
  message?: string;
  hcaptcha_token?: string;
}
