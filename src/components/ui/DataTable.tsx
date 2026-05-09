// src/components/ui/DataTable.tsx
import React from "react";
import { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
}

interface DataTableProps {
  isEmpty: boolean;
  emptyState: React.ReactNode;
  children: React.ReactNode;
  pagination?: PaginationProps;
}

export function DataTable({ isEmpty, emptyState, children, pagination }: DataTableProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      {isEmpty ? (
        emptyState
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {children}
          </table>
        </div>
      )}

      {/* Paginação Integrada */}
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-zinc-200 p-4 flex items-center justify-between bg-zinc-50/30">
          <span className="text-xs font-medium text-zinc-500">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
              disabled={!pagination.hasPrevPage}
              className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTES DE COMPOSIÇÃO DA TABELA
// ============================================================================

interface TableEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function TableEmptyState({ icon: Icon, title, description, action }: TableEmptyStateProps) {
  return (
    <div className="p-12 flex flex-col items-center justify-center text-center">
      {Icon && (
        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-zinc-400" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead><tr className="border-b border-zinc-300 bg-zinc-100">{children}</tr></thead>;
}

export function TableHead({ children, align = "left" }: { children: React.ReactNode, align?: "left" | "center" | "right" }) {
  const alignClasses = { left: "text-left", center: "text-center", right: "text-right" };
  return <th className={`py-3 px-4 text-xs font-bold text-zinc-600 uppercase tracking-wider ${alignClasses[align]}`}>{children}</th>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-zinc-100">{children}</tbody>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="odd:bg-white even:bg-zinc-50 hover:bg-zinc-100 transition-colors group">{children}</tr>;
}

export function TableCell({ children, align = "left" }: { children: React.ReactNode, align?: "left" | "center" | "right" }) {
  const alignClasses = { left: "text-left", center: "text-center", right: "text-right" };
  return <td className={`py-3 px-4 ${alignClasses[align]}`}>{children}</td>;
}