import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
import enCommon from './locales/en/common.json';
import enForm from './locales/en/form.json';
import enAuth from './locales/en/auth.json';
import enTrips from './locales/en/trips.json';
import enErrors from './locales/en/errors.json';
import enTips from './locales/en/tips.json';
import enDestinations from './locales/en/destinations.json';
import enTours from './locales/en/tours.json';

// Korean translations
import koCommon from './locales/ko/common.json';
import koForm from './locales/ko/form.json';
import koAuth from './locales/ko/auth.json';
import koTrips from './locales/ko/trips.json';
import koErrors from './locales/ko/errors.json';
import koTips from './locales/ko/tips.json';
import koDestinations from './locales/ko/destinations.json';
import koTours from './locales/ko/tours.json';

// Japanese translations
import jaCommon from './locales/ja/common.json';
import jaForm from './locales/ja/form.json';
import jaAuth from './locales/ja/auth.json';
import jaTrips from './locales/ja/trips.json';
import jaErrors from './locales/ja/errors.json';
import jaTips from './locales/ja/tips.json';
import jaDestinations from './locales/ja/destinations.json';
import jaTours from './locales/ja/tours.json';

// Chinese translations
import zhCommon from './locales/zh/common.json';
import zhForm from './locales/zh/form.json';
import zhAuth from './locales/zh/auth.json';
import zhTrips from './locales/zh/trips.json';
import zhErrors from './locales/zh/errors.json';
import zhTips from './locales/zh/tips.json';
import zhDestinations from './locales/zh/destinations.json';
import zhTours from './locales/zh/tours.json';

const resources = {
  en: {
    common: enCommon,
    form: enForm,
    auth: enAuth,
    trips: enTrips,
    errors: enErrors,
    tips: enTips,
    destinations: enDestinations,
    tours: enTours,
  },
  ko: {
    common: koCommon,
    form: koForm,
    auth: koAuth,
    trips: koTrips,
    errors: koErrors,
    tips: koTips,
    destinations: koDestinations,
    tours: koTours,
  },
  ja: {
    common: jaCommon,
    form: jaForm,
    auth: jaAuth,
    trips: jaTrips,
    errors: jaErrors,
    tips: jaTips,
    destinations: jaDestinations,
    tours: jaTours,
  },
  zh: {
    common: zhCommon,
    form: zhForm,
    auth: zhAuth,
    trips: zhTrips,
    errors: zhErrors,
    tips: zhTips,
    destinations: zhDestinations,
    tours: zhTours,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'form', 'auth', 'trips', 'errors', 'tips', 'destinations', 'tours'],
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
