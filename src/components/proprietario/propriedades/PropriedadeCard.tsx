"use client";

import { Link } from '@/i18n/routing';
import { memo, MouseEvent } from 'react';
import { Pencil, Trash2, MapPin, User, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Badge from '@/components/ui/Badge';
import { Propriedade as ServicePropriedade } from '@/services/propriedades.service';

export interface Endereco {
  cidade?: string;
  estado?: string;
  bairro?: string;
}

export interface Dono {
  nome?: string;
}

export type Propriedade = ServicePropriedade & {
  endereco?: Endereco;
  dono?: Dono;
};

interface PropriedadeCardProps {
  propriedade: Propriedade;
  onEditar?: (e: MouseEvent<HTMLButtonElement>, propriedade: Propriedade) => void;
  onDeletar?: (propriedade: Propriedade) => void;
}

const PropriedadeCard = memo(function PropriedadeCard({ propriedade, onEditar, onDeletar }: PropriedadeCardProps) {
  const t = useTranslations('Proprietario.propriedades');
  const tGeneral = useTranslations('General');
  
  const formatCNPJ = (cnpj?: string) => cnpj || 'N/A';
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      if (typeof dateString === 'string' && dateString.includes('/')) {
        return dateString.split(',')[0].trim();
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const getManejoLabel = (tipo?: string) => {
    if (tipo && ['P', 'E', 'I'].includes(tipo)) {
      return t(`managementTypes.${tipo}`);
    }
    return tipo || t('notInformed');
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl hover:border-[#ffcf78] hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ce7d0a] to-[#ffdb99] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <Link
        href={`/proprietario/propriedade/${propriedade.idPropriedade}`}
        className="flex flex-col h-full p-5 no-underline"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2 flex-wrap">
            <Badge type={propriedade.status === 'Inativa' ? 'inactive' : 'active'}>
              {propriedade.status || tGeneral('status.active')}
            </Badge>
            {propriedade.pAbcb && <Badge type="info">ABCB</Badge>}
          </div>
        </div>
        <div className="mb-5">
          <h3
            className="text-lg font-bold text-[#404040] mb-1 group-hover:text-[#ce7d0a] transition-colors line-clamp-1"
            title={propriedade.nome}
          >
            {propriedade.nome}
          </h3>
          <p className="text-xs text-gray-400 font-mono tracking-wide">
            CNPJ: {formatCNPJ(propriedade.cnpj)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5 mt-auto">
          <div className="bg-[#f8fcfa] p-2.5 rounded-lg border border-gray-100 group-hover:border-[#ffcf78]/30 transition-colors">
            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
              {t('management')}
            </span>
            <span className="text-xs font-semibold text-[#404040] block truncate">
              {getManejoLabel(propriedade.tipoManejo)}
            </span>
          </div>
          <div className="bg-[#f8fcfa] p-2.5 rounded-lg border border-gray-100 group-hover:border-[#ffcf78]/30 transition-colors">
            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
              {t('update')}
            </span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#ce7d0a]/70" />
              <span className="text-xs font-semibold text-[#404040]">
                {formatDate(propriedade.updatedAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 min-w-[14px] flex justify-center">
              <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#ce7d0a] transition-colors" />
            </div>
            <span className="text-xs text-gray-600 leading-snug line-clamp-2">
              {propriedade.endereco && propriedade.endereco.cidade
                ? `${propriedade.endereco.bairro || ''}, ${propriedade.endereco.cidade} - ${propriedade.endereco.estado || ''}`
                : t('address')}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="min-w-[14px] flex justify-center">
              <User className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#ce7d0a] transition-colors" />
            </div>
            <span className="text-xs text-gray-600 font-medium truncate">
              {propriedade.dono?.nome || t('noOwner')}
            </span>
          </div>
        </div>
      </Link>
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <button
          onClick={(e) => {
            e.preventDefault();
            if (onEditar) onEditar(e, propriedade);
          }}
          className="p-2 bg-white text-[#ce7d0a] border border-[#ce7d0a]/20 rounded-lg shadow-sm hover:bg-[#FFCF78] hover:text-[#404040] hover:border-[#FFCF78] transition-colors"
          title={t('edit')}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onDeletar) onDeletar(propriedade);
          }}
          className="p-2 bg-white text-gray-400 border border-gray-200 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
          title={t('delete')}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
});

export default PropriedadeCard;