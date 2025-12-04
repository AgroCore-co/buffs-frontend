import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

export default function BackButton({ onClick, children }) {
  const router = useRouter();
  const handleClick = onClick || (() => router.back());
  return (
    <button
      className="flex items-center text-slate-500 hover:text-slate-800 mb-4 text-sm font-medium transition-colors"
      onClick={handleClick}
    >
      <ArrowLeft className="w-4 h-4 mr-1" />
      {children || 'Voltar para o Rebanho'}
    </button>
  );
}
