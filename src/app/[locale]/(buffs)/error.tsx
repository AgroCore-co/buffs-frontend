'use client';

import { useTranslations } from 'next-intl';

interface BuffsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BuffsError({ error, reset }: BuffsErrorProps) {
  const t = useTranslations('ErrorBoundary');

  return (
    <div className="flex-1 rounded-2xl border-2 border-dashed border-red-200 bg-white/50 p-12 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
        <svg
          className="w-7 h-7 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-[#404040]">{t('title')}</h2>
      <p className="text-[#404040]/60 mt-2 max-w-md">{t('description')}</p>
      {process.env.NODE_ENV !== 'production' && (
        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mt-4 max-w-md font-mono break-all">
          {error.message}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-6 px-5 py-2 rounded-lg bg-[#ce7d0a] text-white text-sm font-medium hover:bg-[#b06a08] transition-colors"
      >
        {t('tryAgain')}
      </button>
    </div>
  );
}
