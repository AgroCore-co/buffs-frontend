
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

const messagesMap = {
  pt: () => import('../messages/pt.json').then((mod) => mod.default),
  en: () => import('../messages/en.json').then((mod) => mod.default),
  // Adicione outros idiomas aqui se necessário
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await messagesMap[locale as keyof typeof messagesMap](),
  };
});