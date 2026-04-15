export default function MetricCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-[#f8fcfa] p-3 rounded-xl border border-[#ce7d0a]/10 hover:border-[#ffcf78] transition-all hover:shadow-sm group">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#404040]/60">
          {title}
        </h2>
        <div className="w-6 h-6 rounded-lg bg-[#ffcf78]/10 flex items-center justify-center group-hover:bg-[#ffcf78]/30 transition-colors">
          {icon}
        </div>
      </div>
      
      <div className="flex items-end gap-2">
        <p className="text-2xl font-extrabold text-[#404040] leading-none">
          {value}
        </p>
      </div>
      
      <p className="text-[10px] text-[#404040]/50 mt-1.5 font-medium">
        {subtitle}
      </p>
    </div>
  );
}