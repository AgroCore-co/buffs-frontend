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

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buffs",
  description: "Gerenciamento inteligente",
};

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  
  // Busca os dicionários de tradução (JSONs) no servidor antes de renderizar a página
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        {/* Provedor de idiomas que distribui as traduções para os Client Components */}
        <NextIntlClientProvider messages={messages}>
          {/* O QueryProvider inicializa o cache do TanStack Query */}
          <QueryProvider>
            {/* O AuthProvider intercepta rotas e gerencia a sessão */}
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}