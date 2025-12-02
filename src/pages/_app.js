import { AuthProvider } from '@/contexts/AuthContext';
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
      {isPublic ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </AuthProvider>
  );
}
