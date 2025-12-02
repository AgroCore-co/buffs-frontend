import React from "react";
import Button from "@/components/ui/Button";

/**
 * Componente de Paginação reutilizável
 * Props:
 * - currentPage: página atual (number)
 * - totalPages: total de páginas (number)
 * - onPageChange: função para mudar página (fn)
 * - className: classes extras (string)
 * - showNumbers: exibe botões numerados (boolean, default true)
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  className = "",
  showNumbers = true,
  navVariant = "report", // botões Anterior/Próximo: cor clara
  numberVariant = "report", // botões numerados: cinza claro
  activeNumberVariant = "primary", // página ativa: cor destacada
}) {
  // Gera array de páginas para botões numerados
  const getPages = () => {
    if (!showNumbers) return [];
    // Exibe até 5 páginas, com elipses se necessário
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <Button
        variant={navVariant}
        size="small"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </Button>
      {getPages().map((page, idx) =>
        typeof page === "number" ? (
          <Button
            key={page}
            variant={page === currentPage ? activeNumberVariant : numberVariant}
            size="small"
            className={`w-10 h-10 !p-0 font-bold${page === currentPage ? "" : " text-gray-700"}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ) : (
          <span key={"ellipsis-" + idx} className="px-2 text-gray-400 select-none">{page}</span>
        )
      )}
      <Button
        variant={navVariant}
        size="small"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Próximo
      </Button>
    </div>
  );
}
