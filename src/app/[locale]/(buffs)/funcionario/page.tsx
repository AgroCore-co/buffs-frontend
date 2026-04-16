"use client";

import { useTranslations } from 'next-intl';

// ==========================================
// Página de Teste para Funcionário
// ==========================================

export default function TesteFuncionarioPage() {
  const t = useTranslations('Funcionario');

  return (
    <main>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>{t('testPage')}</h1>
      <p style={{ fontSize: 18, color: '#666' }}>
        {t('testDescription')}
      </p>
      <div style={{ marginTop: 32, padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
        <strong>{t('environment')}:</strong> <span style={{ color: '#0070f3' }}>{t('role')}</span>
        <br />
        <span style={{ fontSize: 14, color: '#999' }}>
          {t('editHint')}
        </span>
      </div>
    </main>
  );
}
