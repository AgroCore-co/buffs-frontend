import { getTranslations } from 'next-intl/server';

export default async function BuffsLoading() {
  const t = await getTranslations('General');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('loading')}
      className="flex-1 flex flex-col gap-4 animate-pulse"
    >
      <div className="h-8 w-48 rounded-lg bg-[#ffcf78]/30" />
      <div className="rounded-2xl border border-[#ce7d0a]/10 bg-white/60 p-6 flex flex-col gap-4">
        <div className="h-4 w-full max-w-sm rounded bg-[#ffcf78]/30" />
        <div className="h-4 w-full max-w-xs rounded bg-[#ffcf78]/20" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          <div className="h-24 rounded-xl bg-[#ffcf78]/20" />
          <div className="h-24 rounded-xl bg-[#ffcf78]/20" />
          <div className="h-24 rounded-xl bg-[#ffcf78]/20" />
        </div>
      </div>
    </div>
  );
}
