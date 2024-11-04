import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import getTranslations from 'src/import-translation';

import { supportedLocaleCodes } from 'src/i18n';

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

export const getBestMatchingLocale = () => {
  // Get browser languages
  const browserLangs = navigator.languages || [
    navigator.language || navigator.userLanguage,
  ];

  // attempt to find first the exact matching locale
  // (for Brazilian Portguese as an example)
  for (const lang of browserLangs) {
    if (supportedLocaleCodes.includes(lang)) {
      return lang;
    }
  }

  // otherwise find general locale
  for (const lang of browserLangs) {
    const shortLang = lang.split('-')[0]; // Get language code without region
    if (supportedLocaleCodes.includes(shortLang)) {
      return shortLang;
    }
  }

  // Return default locale if no match found
  return 'en';
};

export async function loadLocaleMessages(i18n, locale) {
  // load locale messages with dynamic import
  try {
    const messages = await getTranslations(locale);
    // set locale and locale message)
    i18n.global.setLocaleMessage(locale, messages);
  } catch (e) {
    const messages = await import('/src/i18n/locales/en.js');
    // set locale and locale message
    i18n.global.setLocaleMessage('en', messages);
  }

  return nextTick();
}

export const setI18nLanguage = (i18n, locale) => {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale;
  } else {
    i18n.global.locale.value = locale;
  }
  /**
   * NOTE:
   * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
   * The following is an example for axios.
   *
   * axios.defaults.headers.common['Accept-Language'] = locale
   */
  document.querySelector('html').setAttribute('lang', locale);
};

const userLangPref = localStorage.getItem('languagePref');
const locale = userLangPref || getBestMatchingLocale();

const i18n = createI18n({
  locale,
  legacy: false,
});

export default boot(async ({ app }) => {
  // Set i18n instance on app
  app.use(i18n);
  await loadLocaleMessages(i18n, locale);
});

export { i18n };
