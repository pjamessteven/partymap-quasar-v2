export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapView {
  latlng: Coordinates;
  zoom: number;
}

export interface HoverMarker extends Coordinates {
  name: string;
}
