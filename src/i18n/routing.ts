import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  locales: ['pt', 'en', 'es'], // Idiomas suportados
  defaultLocale: 'pt' // Idioma padrão
});
 
// Substitutos para os hooks nativos do Next.js (já injetam o idioma na URL)
export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);