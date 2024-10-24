import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json'
import th from './th.json'

export const languageResources = {
  en: { translation: en },
  th: { translation: th },
}

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'th',
  resources: languageResources,
});

export default i18n;
