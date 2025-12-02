export default function MetricCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-[#f8fcfa] p-4 rounded-xl border border-[#ce7d0a]/10 hover:border-[#ffcf78] transition-all hover:shadow-sm group">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[#404040]/60">
          {title}
        </h2>
        <div className="w-6 h-6 rounded-full bg-[#ffcf78]/10 flex items-center justify-center group-hover:bg-[#ffcf78]/30 transition-colors text-sm">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-extrabold text-[#404040] leading-none">
          {value}
        </p>
      </div>
      <p className="text-[11px] text-[#404040]/50 mt-2 font-medium bg-white/50 inline-block px-1.5 py-0.5 rounded border border-gray-100">
        {subtitle}
      </p>
    </div>
  );
}
