import { redirect } from '@/i18n/routing';

export default async function Home(
  props: Readonly<{ params: Promise<{ locale: string }> }>
) {
  // No Next.js 15+, params é async e precisa ser await
  const { locale } = await props.params;

  // redirect do next-intl (não o de next/navigation): já injeta o prefixo do
  // idioma. Um caminho relativo como './auth/login' resolveria contra '/pt'
  // (sem barra final) e viraria '/auth/login', perdendo o locale — quem
  // entrasse em '/en' acabava no login em português.
  redirect({ href: '/auth/login', locale });
}
