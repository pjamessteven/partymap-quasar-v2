const supportedLocales = {
  en: {
    label: 'English',
    value: 'en',
  },
  'zh-tw': {
    label: '繁體中文',
    value: 'zh-tw',
  },
  'zh-cn': {
    label: '简体中文',
    value: 'zh-cn',
  },
  ru: {
    label: 'Русский',
    value: 'ru',
  },
  ja: {
    label: '日本語',
    value: 'ja',
  },
  fr: {
    label: 'Français',
    value: 'fr',
  },
  es: {
    label: 'Español',
    value: 'es',
  },
  it: {
    label: 'Italiano',
    value: 'it',
  },
  de: {
    label: 'Deutsch',
    value: 'de',
  },
  pt: {
    label: 'Português',
    value: 'pt',
  },
  nl: {
    label: 'Nederlands',
    value: 'nl',
  },
  pl: {
    label: 'Polski',
    value: 'pl',
  },
  ar: {
    label: 'العربية',
    value: 'ar',
  },
  fa: {
    label: 'فارسی',
    value: 'fa',
  },
  ceb: {
    label: 'Sinugboanong Binisaya',
    value: 'ceb',
  },
  war: {
    label: 'Winaray',
    value: 'war',
  },
  sv: {
    label: 'Svenska',
    value: 'sv',
  },
  uk: {
    label: 'Українська',
    value: 'uk',
  },
  vi: {
    label: 'Tiếng Việt',
    value: 'vi',
  },
  af: {
    label: 'Afrikaans',
    fallbackLocale: 'nl',
    value: 'af',
  },
  az: {
    label: 'Azərbaycanca',
    value: 'az',
  },
  bg: {
    label: 'Български',
    value: 'bg',
  },
  bn: {
    label: 'বাংলা',
    value: 'bn',
  },
  be: {
    label: 'Беларуская',
    value: 'be',
  },
  ca: {
    label: 'Català',
    value: 'ca',
  },
  cs: {
    label: 'Čeština',
    value: 'cs',
  },
  cy: {
    label: 'Cymraeg',
    value: 'cy',
  },
  da: {
    label: 'Dansk',
    value: 'da',
  },
  et: {
    label: 'Eesti',
    value: 'et',
  },
  el: {
    label: 'Ελληνικά',
    value: 'el',
  },
  eo: {
    label: 'Esperanto',
    value: 'eo',
  },
  eu: {
    label: 'Euskara',
    value: 'eu',
  },
  gl: {
    label: 'Galego',
    value: 'gl',
  },
  ko: {
    label: '한국어',
    value: 'ko',
  },
  hy: {
    label: 'Հայերեն',
    value: 'hy',
  },
  hi: {
    label: 'हिन्दी',
    value: 'hi',
  },
  hr: {
    label: 'Hrvatski',
    value: 'hr',
  },
  id: {
    label: 'Bahasa Indonesia',
    value: 'id',
  },
  he: {
    label: 'עברית',
    value: 'he',
  },
  ka: {
    label: 'ქართული',
    value: 'ka',
  },
  lv: {
    label: 'Latviešu',
    value: 'lv',
  },
  lt: {
    label: 'Lietuvių',
    value: 'lt',
  },
  hu: {
    label: 'Magyar',
    value: 'hu',
  },
  mk: {
    label: 'Македонски',
    value: 'mk',
  },
  ms: {
    label: 'Bahasa Melayu',
    value: 'ms',
  },
  my: {
    label: 'မြန်မာဘာသာ',
    value: 'my',
  },
  nb: {
    label: 'Norsk',
    value: 'nb',
  },
  uz: {
    label: 'Oʻzbekcha / Ўзбекча',
    value: 'uz',
  },
  kk: {
    label: 'Қазақша / Qazaqşa / قازاقشا',
    value: 'kk',
  },
  ro: {
    label: 'Română',
    value: 'ro',
  },
  sq: {
    label: 'Shqip',
    value: 'sq',
  },
  sk: {
    label: 'Slovenčina',
    value: 'sk',
  },
  sl: {
    label: 'Slovenščina',
    value: 'sl',
  },
  sr: {
    label: 'Српски / Srpski',
    value: 'sr',
  },
  fi: {
    label: 'Suomi',
    value: 'fi',
  },
  ta: {
    label: 'தமிழ்',
    value: 'ta',
  },
  te: {
    label: 'తెలుగు',
    value: 'te',
  },
  th: {
    label: 'ภาษาไทย',
    value: 'th',
  },
  tg: {
    label: 'Тоҷикӣ',
    value: 'tg',
  },
  tk: {
    label: 'تۆرکجه',
    value: 'tk',
  },
  tr: {
    label: 'Türkçe',
    value: 'tr',
  },
  mi: {
    label: 'Māori',
    value: 'mi',
  },
};

const supportedLocaleCodes = Object.keys(supportedLocales);

export { supportedLocales, supportedLocaleCodes };
