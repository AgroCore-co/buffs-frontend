import React from 'react';
import { FiUsers } from 'react-icons/fi';

export default function BufalosTab({ grupo }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          Búfalos do Grupo
        </h3>

        {/* Em desenvolvimento */}
        <div className="text-center py-12 text-slate-400">
          <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-2">Funcionalidade em desenvolvimento</p>
          <p className="text-sm">
            A listagem de búfalos pertencentes a este grupo será exibida aqui
          </p>
        </div>
      </div>
    </div>
  );
}
