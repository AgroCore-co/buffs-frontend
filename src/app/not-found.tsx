// ==========================================
// Página de Não Encontrado (404) - Exemplo
// ==========================================

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
      <h1 style={{ fontSize: 48, marginBottom: 16 }}>Página não encontrada</h1>
      <p style={{ fontSize: 20, color: '#404040', marginBottom: 32 }}>
        A página que você procura não existe ou foi removida.
      </p>
      <span style={{ fontSize: 14, color: '#999' }}>
        (Esta tela é apenas um exemplo. Personalize como desejar.)
      </span>
    </div>
  );
}
