import { AuthProvider } from '@/contexts/AuthContext';
import { PropriedadeProvider } from '@/contexts/PropriedadeContext';
import '@/styles/globals.css';
import Layout from '@/layout/Layout';

// Rotas públicas que não usam layout
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/acesso-negado',
];

export default function App({ Component, pageProps, router }) {
  const isPublic = publicRoutes.includes(router?.pathname);
  return (
    <AuthProvider>
      <PropriedadeProvider>
        {isPublic ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </PropriedadeProvider>
    </AuthProvider>
  );
}
