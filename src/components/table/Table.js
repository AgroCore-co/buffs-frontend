import React from 'react';

/**
 * Componente de tabela moderno e reutilizável.
 *
 * Props:
 * - columns: [{ key: string, label: string, className?: string, align?: 'left' | 'center' | 'right' }]
 * - data: Array<Object>
 * - renderCell?: (row, colKey) => ReactNode
 * - className?: string
 * - minWidth?: string
 */
export default function Table({
  columns,
  data,
  renderCell,
  className = '',
  minWidth = '900px',
  onRowClick,
}) {
  return (
    <div
      className={`overflow-x-auto rounded-lg border border-gray-200 ${className}`}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-amber-50 transition-colors${onRowClick ? ' cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td
                    key={`${row.id || rowIndex}-${col.key}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                  >
                    {col.render
                      ? col.render(row)
                      : renderCell
                        ? renderCell(row, col.key)
                        : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            /* Estado Vazio */
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-10 text-center text-sm text-gray-500"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-gray-400 text-lg">∅</span>
                  <span>Nenhum dado encontrado</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
