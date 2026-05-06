// ==========================================
// Página de Não Autenticado (401)
// ==========================================

import Link from 'next/link';

export default function NotAuthenticatedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#fffbeb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ce7d0a',
      fontFamily: 'sans-serif',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 16 }}>401</h1>
      <p style={{ fontSize: 20, color: '#404040', marginBottom: 32 }}>
        Not authenticated / Não autenticado
      </p>
      <Link
        href="/auth/login"
        style={{
          fontSize: 14,
          color: '#fff',
          background: '#ce7d0a',
          padding: '10px 24px',
          borderRadius: 8,
          textDecoration: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Login
      </Link>
    </div>
  );
}
