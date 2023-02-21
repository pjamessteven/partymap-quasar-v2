export interface RruleUpdate {
  recurringType: number;
  separationCount: number;
  dayOfWeek: number;
  weekOfMonth: number;
  monthOfYear: number;
  dayOfMonth: number;
}

export interface EventUpdate {
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
  name?: string;
  url?: string;
  add_tags?: string[];
  remove_tags?: string[];
  rrule?: RruleUpdate;
  remove_rrule?: boolean;
  media_items?: {
    base64File: string;
    caption: string;
  }[];
  message?: string;
  hcaptcha_token?: string;
}
