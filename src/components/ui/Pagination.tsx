import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  total?: number;
  limit?: number;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  hasPrevPage,
  hasNextPage,
  total,
  limit,
  className = "",
}: PaginationProps) {
  const canGoPrev = hasPrevPage ?? page > 1;
  const canGoNext = hasNextPage ?? page < totalPages;

  const inicio = total != null && limit ? (page - 1) * limit + 1 : null;
  const fim    = total != null && limit ? Math.min(page * limit, total) : null;

  const label =
    total != null && inicio != null && fim != null
      ? `Mostrando ${inicio}–${fim} de ${total} resultados`
      : `Página ${page} de ${totalPages}`;

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!canGoPrev}
          className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={!canGoNext}
          className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
