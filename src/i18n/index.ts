import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
import enCommon from './locales/en/common.json';
import enForm from './locales/en/form.json';
import enAuth from './locales/en/auth.json';
import enTrips from './locales/en/trips.json';
import enErrors from './locales/en/errors.json';

// Korean translations
import koCommon from './locales/ko/common.json';
import koForm from './locales/ko/form.json';
import koAuth from './locales/ko/auth.json';
import koTrips from './locales/ko/trips.json';
import koErrors from './locales/ko/errors.json';

// Japanese translations
import jaCommon from './locales/ja/common.json';
import jaForm from './locales/ja/form.json';
import jaAuth from './locales/ja/auth.json';
import jaTrips from './locales/ja/trips.json';
import jaErrors from './locales/ja/errors.json';

// Chinese translations
import zhCommon from './locales/zh/common.json';
import zhForm from './locales/zh/form.json';
import zhAuth from './locales/zh/auth.json';
import zhTrips from './locales/zh/trips.json';
import zhErrors from './locales/zh/errors.json';

const resources = {
  en: {
    common: enCommon,
    form: enForm,
    auth: enAuth,
    trips: enTrips,
    errors: enErrors,
  },
  ko: {
    common: koCommon,
    form: koForm,
    auth: koAuth,
    trips: koTrips,
    errors: koErrors,
  },
  ja: {
    common: jaCommon,
    form: jaForm,
    auth: jaAuth,
    trips: jaTrips,
    errors: jaErrors,
  },
  zh: {
    common: zhCommon,
    form: zhForm,
    auth: zhAuth,
    trips: zhTrips,
    errors: zhErrors,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'form', 'auth', 'trips', 'errors'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
