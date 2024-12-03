// src/boot/locale.js
import { createI18n } from 'vue-i18n';
import { defineBoot } from '#q-app/wrappers';
import getTranslations from 'src/import-translation';

let locale;

if (process.env.CLIENT) {
  // Client-side: Get the user's language preference from localStorage
  const userLangPref = localStorage.getItem('languagePref');
  locale = userLangPref || getBestMatchingLocale(); // `getBestMatchingLocale()` is your custom function
} else {
  locale = 'en';
}

// Initialize the i18n instance
const i18n = createI18n({
  locale,
  legacy: false, // Enable composition API mode
});

export default defineBoot(async ({ app, ssrContext }) => {
  // Use i18n in the app
  app.use(i18n);

  if (process.env.CLIENT && ssrContext) {
    // Server-side (SSR): Get the Accept-Language header from the request
    const acceptLanguage = ssrContext.req.headers['accept-language'];
    locale = acceptLanguage ? acceptLanguage.split(',')[0] : 'en'; // Default to 'en' if no language is found
    i18n.global.locale.value = locale;
  }

  // Dynamically load the locale messages
  await loadLocaleMessages(i18n, locale);
});

// Export the i18n instance for later use
export { i18n };

// Dynamically load locale messages
export async function loadLocaleMessages(i18n, locale) {
  try {
    const messages = await getTranslations(locale);
    i18n.global.setLocaleMessage(locale, messages);
  } catch (error) {
    console.error(`Failed to load locale messages for "${locale}"`, error);
    const messages = await import('/src/i18n/locales/en.js');
    // set locale and locale message
    i18n.global.setLocaleMessage('en', messages);
  }
}

export const setI18nLanguage = (i18n, locale) => {
  console.log(i18n.global, i18n.mode, 'global');
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

// Function to get the best matching locale from the browser
function getBestMatchingLocale() {
  const browserLang = navigator.language || navigator.userLanguage; // Get the browser's language
  // Check for 'en', 'fr', etc. and return a matching locale
  if (browserLang.startsWith('fr')) return 'fr';
  return 'en'; // Default to 'en'
}
