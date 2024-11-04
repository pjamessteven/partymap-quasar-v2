// yes this is unsightly, but due to this bug in vite
// this is necessary for now: https://github.com/vitejs/vite/issues/14102

export default async function getLocale(locale) {
  switch (locale) {
    case 'en':
      return (await import('dayjs/locale/en.js')).default;
    case 'zh-tw':
      return (await import('dayjs/locale/zh-tw.js')).default;
    case 'zh-cn':
      return (await import('dayjs/locale/zh-cn.js')).default;
    case 'ru':
      return (await import('dayjs/locale/ru.js')).default;
    case 'ja':
      return (await import('dayjs/locale/ja.js')).default;
    case 'fr':
      return (await import('dayjs/locale/fr.js')).default;
    case 'es':
      return (await import('dayjs/locale/es.js')).default;
    case 'it':
      return (await import('dayjs/locale/it.js')).default;
    case 'de':
      return (await import('dayjs/locale/de.js')).default;
    case 'pt':
      return (await import('dayjs/locale/pt.js')).default;
    case 'nl':
      return (await import('dayjs/locale/nl.js')).default;
    case 'pl':
      return (await import('dayjs/locale/pl.js')).default;
    case 'ar':
      return (await import('dayjs/locale/ar.js')).default;
    case 'fa':
      return (await import('dayjs/locale/fa.js')).default;
    case 'sv':
      return (await import('dayjs/locale/sv.js')).default;
    case 'uk':
      return (await import('dayjs/locale/uk.js')).default;
    case 'vi':
      return (await import('dayjs/locale/vi.js')).default;
    case 'af':
      return (await import('dayjs/locale/nl.js')).default; // use NL for afrikaan
    case 'az':
      return (await import('dayjs/locale/az.js')).default;
    case 'bg':
      return (await import('dayjs/locale/bg.js')).default;
    case 'bn':
      return (await import('dayjs/locale/bn.js')).default;
    case 'be':
      return (await import('dayjs/locale/be.js')).default;
    case 'ca':
      return (await import('dayjs/locale/ca.js')).default;
    case 'cs':
      return (await import('dayjs/locale/cs.js')).default;
    case 'cy':
      return (await import('dayjs/locale/cy.js')).default;
    case 'da':
      return (await import('dayjs/locale/da.js')).default;
    case 'et':
      return (await import('dayjs/locale/et.js')).default;
    case 'el':
      return (await import('dayjs/locale/el.js')).default;
    case 'eo':
      return (await import('dayjs/locale/eo.js')).default;
    case 'eu':
      return (await import('dayjs/locale/eu.js')).default;
    case 'gl':
      return (await import('dayjs/locale/gl.js')).default;
    case 'ko':
      return (await import('dayjs/locale/ko.js')).default;
    case 'hy-am':
      return (await import('dayjs/locale/hy-am.js')).default;
    case 'hi':
      return (await import('dayjs/locale/hi.js')).default;
    case 'hr':
      return (await import('dayjs/locale/hr.js')).default;
    case 'id':
      return (await import('dayjs/locale/id.js')).default;
    case 'he':
      return (await import('dayjs/locale/he.js')).default;
    case 'ka':
      return (await import('dayjs/locale/ka.js')).default;
    case 'lv':
      return (await import('dayjs/locale/lv.js')).default;
    case 'lt':
      return (await import('dayjs/locale/lt.js')).default;
    case 'hu':
      return (await import('dayjs/locale/hu.js')).default;
    case 'mk':
      return (await import('dayjs/locale/mk.js')).default;
    case 'ms':
      return (await import('dayjs/locale/ms.js')).default;
    case 'my':
      return (await import('dayjs/locale/my.js')).default;
    case 'nb':
      return (await import('dayjs/locale/nb.js')).default;
    case 'uz':
      return (await import('dayjs/locale/uz.js')).default;
    case 'kk':
      return (await import('dayjs/locale/kk.js')).default;
    case 'ro':
      return (await import('dayjs/locale/ro.js')).default;
    case 'sq':
      return (await import('dayjs/locale/sq.js')).default;
    case 'sk':
      return (await import('dayjs/locale/sk.js')).default;
    case 'sl':
      return (await import('dayjs/locale/sl.js')).default;
    case 'sr':
      return (await import('dayjs/locale/sr.js')).default;
    case 'fi':
      return (await import('dayjs/locale/fi.js')).default;
    case 'ta':
      return (await import('dayjs/locale/ta.js')).default;
    case 'te':
      return (await import('dayjs/locale/te.js')).default;
    case 'th':
      return (await import('dayjs/locale/th.js')).default;
    case 'tg':
      return (await import('dayjs/locale/tg.js')).default;
    case 'tk':
      return (await import('dayjs/locale/tk.js')).default;
    case 'tr':
      return (await import('dayjs/locale/tr.js')).default;
    case 'mi':
      return (await import('dayjs/locale/mi.js')).default;
    default:
      return (await import('dayjs/locale/en.js')).default; // Default to English if locale not found
  }
}
