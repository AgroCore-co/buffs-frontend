// src/components/ui/DataTable.tsx
import React from "react";
import { LucideIcon } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import type { PaginationProps } from "@/components/ui/Pagination";

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
          <table role="table" aria-label="Tabela de dados" className="w-full text-left border-collapse">
            {children}
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          {...pagination}
          className="border-t border-zinc-200 p-4 bg-zinc-50/30"
        />
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
  return <th scope="col" className={`py-3 px-4 text-xs font-bold text-zinc-600 uppercase tracking-wider ${alignClasses[align]}`}>{children}</th>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-zinc-100">{children}</tbody>;
}

export function TableRow({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr
      className={`odd:bg-white even:bg-zinc-50 hover:bg-zinc-100 transition-colors group ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, align = "left" }: { children: React.ReactNode, align?: "left" | "center" | "right" }) {
  const alignClasses = { left: "text-left", center: "text-center", right: "text-right" };
  return <td className={`py-3 px-4 ${alignClasses[align]}`}>{children}</td>;
}