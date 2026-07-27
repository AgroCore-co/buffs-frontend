interface ChartSkeletonProps {
  /** Altura do placeholder, em px — deve casar com a altura real do gráfico carregado. */
  height?: number;
  className?: string;
}

/**
 * Placeholder exibido enquanto o chunk do Recharts (lazy-loaded via next/dynamic)
 * ainda está sendo baixado. Mesma linguagem visual do LoadingSkeleton de RacaChart.
 */
export default function ChartSkeleton({ height = 250, className = "" }: ChartSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={`w-full flex items-end gap-3 px-2 pb-1 ${className}`}
      style={{ height }}
    >
      {[55, 85, 40, 70, 60, 90, 45].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-lg bg-gray-100 animate-pulse"
          style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}
