// ==========================================
// Página de Não Autorizado (Exemplo)
// ==========================================

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
      <h1 style={{ fontSize: 48, marginBottom: 16 }}>Não autorizado</h1>
      <p style={{ fontSize: 20, color: '#404040', marginBottom: 32 }}>
        Você não tem permissão para acessar esta página.
      </p>
      <span style={{ fontSize: 14, color: '#999' }}>
        (Esta tela é apenas um exemplo. Personalize como desejar.)
      </span>
    </div>
  );
}
