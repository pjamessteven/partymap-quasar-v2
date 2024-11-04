// yes this is unsightly, but due to this bug in vite
// this is necessary for now: https://github.com/vitejs/vite/issues/14102

export default async function getTranslations(locale) {
  switch (locale) {
    case 'en':
      return (await import('src/i18n/locales/en.js')).default;
    case 'zh-tw':
      return (await import('src/i18n/locales/zh-tw.js')).default;
    case 'zh-cn':
      return (await import('src/i18n/locales/zh-cn.js')).default;
    case 'ru':
      return (await import('src/i18n/locales/ru.js')).default;
    case 'ja':
      return (await import('src/i18n/locales/ja.js')).default;
    case 'fr':
      return (await import('src/i18n/locales/fr.js')).default;
    case 'es':
      return (await import('src/i18n/locales/es.js')).default;
    case 'it':
      return (await import('src/i18n/locales/it.js')).default;
    case 'de':
      return (await import('src/i18n/locales/de.js')).default;
    case 'pt':
      return (await import('src/i18n/locales/pt.js')).default;
    case 'nl':
      return (await import('src/i18n/locales/nl.js')).default;
    case 'pl':
      return (await import('src/i18n/locales/pl.js')).default;
    case 'ar':
      return (await import('src/i18n/locales/ar.js')).default;
    case 'fa':
      return (await import('src/i18n/locales/fa.js')).default;
    case 'sv':
      return (await import('src/i18n/locales/sv.js')).default;
    case 'uk':
      return (await import('src/i18n/locales/uk.js')).default;
    case 'vi':
      return (await import('src/i18n/locales/vi.js')).default;
    case 'af':
      return (await import('src/i18n/locales/af.js')).default;
    case 'az':
      return (await import('src/i18n/locales/az.js')).default;
    case 'bg':
      return (await import('src/i18n/locales/bg.js')).default;
    case 'bn':
      return (await import('src/i18n/locales/bn.js')).default;
    case 'be':
      return (await import('src/i18n/locales/be.js')).default;
    case 'ca':
      return (await import('src/i18n/locales/ca.js')).default;
    case 'cs':
      return (await import('src/i18n/locales/cs.js')).default;
    case 'cy':
      return (await import('src/i18n/locales/cy.js')).default;
    case 'da':
      return (await import('src/i18n/locales/da.js')).default;
    case 'et':
      return (await import('src/i18n/locales/et.js')).default;
    case 'el':
      return (await import('src/i18n/locales/el.js')).default;
    case 'eo':
      return (await import('src/i18n/locales/eo.js')).default;
    case 'eu':
      return (await import('src/i18n/locales/eu.js')).default;
    case 'gl':
      return (await import('src/i18n/locales/gl.js')).default;
    case 'ko':
      return (await import('src/i18n/locales/ko.js')).default;
    case 'hy-am':
      return (await import('src/i18n/locales/hy-am.js')).default;
    case 'hi':
      return (await import('src/i18n/locales/hi.js')).default;
    case 'hr':
      return (await import('src/i18n/locales/hr.js')).default;
    case 'id':
      return (await import('src/i18n/locales/id.js')).default;
    case 'he':
      return (await import('src/i18n/locales/he.js')).default;
    case 'ka':
      return (await import('src/i18n/locales/ka.js')).default;
    case 'lv':
      return (await import('src/i18n/locales/lv.js')).default;
    case 'lt':
      return (await import('src/i18n/locales/lt.js')).default;
    case 'hu':
      return (await import('src/i18n/locales/hu.js')).default;
    case 'mk':
      return (await import('src/i18n/locales/mk.js')).default;
    case 'ms':
      return (await import('src/i18n/locales/ms.js')).default;
    case 'my':
      return (await import('src/i18n/locales/my.js')).default;
    case 'nb':
      return (await import('src/i18n/locales/nb.js')).default;
    case 'uz':
      return (await import('src/i18n/locales/uz.js')).default;
    case 'kk':
      return (await import('src/i18n/locales/kk.js')).default;
    case 'ro':
      return (await import('src/i18n/locales/ro.js')).default;
    case 'sq':
      return (await import('src/i18n/locales/sq.js')).default;
    case 'sk':
      return (await import('src/i18n/locales/sk.js')).default;
    case 'sl':
      return (await import('src/i18n/locales/sl.js')).default;
    case 'sr':
      return (await import('src/i18n/locales/sr.js')).default;
    case 'fi':
      return (await import('src/i18n/locales/fi.js')).default;
    case 'ta':
      return (await import('src/i18n/locales/ta.js')).default;
    case 'te':
      return (await import('src/i18n/locales/te.js')).default;
    case 'th':
      return (await import('src/i18n/locales/th.js')).default;
    case 'tg':
      return (await import('src/i18n/locales/tg.js')).default;
    case 'tk':
      return (await import('src/i18n/locales/tk.js')).default;
    case 'tr':
      return (await import('src/i18n/locales/tr.js')).default;
    case 'mi':
      return (await import('src/i18n/locales/mi.js')).default;
    default:
      return (await import('src/i18n/locales/en.js')).default; // Default to English if locale not found
  }
}
