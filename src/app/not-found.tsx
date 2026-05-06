// ==========================================
// Página de Não Encontrado (404)
// ==========================================

import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ce7d0a',
      fontFamily: 'sans-serif',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 16 }}>404</h1>
      <p style={{ fontSize: 20, color: '#404040', marginBottom: 32 }}>
        Page not found / Página não encontrada
      </p>
      <Link
        href="/"
        style={{
          fontSize: 14,
          color: '#ce7d0a',
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        ← Home
      </Link>
    </div>
  );
}
