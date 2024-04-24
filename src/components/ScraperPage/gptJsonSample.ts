export default `
Please give me an array of JSON objects in the following format for the next psytrance festivals in spain may 2024
{
  host: false, // always false!
  name: "", // festival name
  description: "", // 300 character summary
  description_attribute: "", // summary source url
  full_description: "", // full description of event, 1000 characters max
  full_description_attribute: "", // description source url
  images: [], // array with url string to event image logo or poster if found
  dates: {
    start: {
      localDate: "", // ISO start date
      localTime: "", // start time in format like 12:00:00 (optional)
    },
    end: {
      localDate: "", // ISO end date (optional)
      localTime: "" // end time in format like 12:00:00 (optional)
    }
  },
  location: "", // location string
  url: "", // event page url
  youtube_url: "", // url to youtube video/aftermovie if available
  tags: [], // up to five tags that describe this festival
  artists: [
    {
      name: "", // artist name
    }
  ], // DO NOT OMIT ARTISTS FOR BREVITY
  size: 0, // numerical value of estimated atendees rounded to nearest 100 or 1000. if not available, leave as 0.
  rrule: {
    recurringType: 3,
    separationCount: 1, // 0 if it happens once, 1 if it happens every year
    weekOfMonth: null, // leave null
    dayOfMonth: null, // leave null
    dayOfWeek: null, // leave null
    monthOfYear: null, // 0-11 for the month of the year this event happens
  },
}
`;
