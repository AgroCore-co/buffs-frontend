// ==========================================
// Página de Não Autorizado
// ==========================================

import Link from 'next/link';

export default function NotAuthorizedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#fff5f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#e90000',
      fontFamily: 'sans-serif',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 16 }}>403</h1>
      <p style={{ fontSize: 20, color: '#404040', marginBottom: 32 }}>
        Not authorized / Não autorizado
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
