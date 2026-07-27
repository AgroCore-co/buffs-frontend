import { memo } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  /** Obrigatório apenas no variant 'badge' (default). */
  subtitle?: string;
  icon: React.ReactNode;
  /**
   * 'badge' (default): ícone em badge quadrado, cabeçalho + valor + subtítulo empilhados.
   * 'plain': ícone solto à esquerda, label + valor em coluna ao lado — layout usado
   * nas abas de detalhe do búfalo (rebanho/*Tab.tsx).
   */
  variant?: 'badge' | 'plain';
  /** Sufixo exibido inline ao lado do valor (ex: "L", "/ 5.0"). Só no variant 'plain'. */
  sub?: string;
  /** Classe de cor do valor, para destacar estado (ex: atenção/alerta). Só no variant 'plain'. */
  valueClass?: string;
  /** Trunca o valor com "..." quando ultrapassa a largura do card. Só no variant 'plain'. */
  truncateValue?: boolean;
}

const MetricCard = memo(function MetricCard({
  title, value, subtitle, icon, variant = 'badge', sub, valueClass, truncateValue,
}: MetricCardProps) {
  if (variant === 'plain') {
    return (
      <div className="flex items-center gap-4 bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex-shrink-0">{icon}</div>
        <div className={truncateValue ? 'min-w-0' : undefined}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{title}</p>
          <p className={`text-lg font-bold leading-tight ${truncateValue ? 'truncate' : ''} ${valueClass ?? 'text-zinc-800'}`}>
            {value}
            {sub && <span className="text-sm font-normal text-zinc-400 ml-1">{sub}</span>}
          </p>
        </div>
      </div>
    );
  }

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

      {subtitle && (
        <p className="text-[10px] text-[#404040]/50 mt-1.5 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
});

export default MetricCard;