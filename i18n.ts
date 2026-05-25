import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './context/locales/en.json';
import es from './context/locales/es.json';

const resources = {
  es: { translation: es },
  en: { translation: en }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0].languageCode || 'es', 
    fallbackLng: 'es', 
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;