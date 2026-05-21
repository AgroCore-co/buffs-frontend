import type { Metadata } from "next";
import { Inter } from "next/font/google";
// Importante: Note o '../' pois agora o layout está dentro de app/[locale]
import "@/app/[locale]/globals.css"; 

// Imports do next-intl
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

// Imports dos providers
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buffs",
  description: "Gerenciamento inteligente",
};

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }>
) {
  // No Next.js 15+, params é async e precisa ser await
  const { locale } = await props.params;
  const { children } = props;
  
  // Busca os dicionários de tradução (JSONs) no servidor antes de renderizar a página
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        {/* Provedor de idiomas que distribui as traduções para os Client Components */}
        <ErrorBoundary>
          <NextIntlClientProvider messages={messages}>
            {/* O QueryProvider inicializa o cache do TanStack Query */}
            <QueryProvider>
              {/* O AuthProvider intercepta rotas e gerencia a sessão */}
              <AuthProvider>
                {children}
              </AuthProvider>
              <Toaster richColors position="top-right" />
            </QueryProvider>
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}