export interface IpInfo {
  ip: string;
  hostname: string;
  type: string;
  continent_code: string;
  continent_name: string;
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  location: IpInfo_Location;
  time_zone: IpInfo_TimeZone;
  currency: IpInfo_Currency;
  connection: IpInfo_Connection;
  security: IpInfo_Security;
}

export interface IpInfo_Connection {
  asn: number;
  isp: string;
}

export interface IpInfo_Currency {
  code: string;
  name: string;
  plural: string;
  symbol: string;
  symbol_native: string;
}

export interface IpInfo_Location {
  geoname_id: number;
  capital: string;
  languages: IpInfo_Language[];
  country_flag: string;
  country_flag_emoji: string;
  country_flag_emoji_unicode: string;
  calling_code: string;
  is_eu: boolean;
}

export interface IpInfo_Language {
  code: string;
  name: string;
  native: string;
}

export interface IpInfo_Security {
  is_proxy: boolean;
  proxy_type: null;
  is_crawler: boolean;
  crawler_name: null;
  crawler_type: null;
  is_tor: boolean;
  threat_level: string;
  threat_types: null;
}

export interface IpInfo_TimeZone {
  id: string;
  current_time: Date;
  gmt_offset: number;
  code: string;
  is_daylight_saving: boolean;
}
