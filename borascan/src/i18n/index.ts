import { id } from './id.ts';
import { en } from './en.ts';

export type Language = 'id' | 'en';
export type TranslationKey = keyof typeof id;

export const translations = {
  id,
  en,
};

export function t(key: TranslationKey, lang: Language = 'id'): string {
  const dict = translations[lang] || translations.id;
  return dict[key] || translations.id[key] || (key as string);
}
