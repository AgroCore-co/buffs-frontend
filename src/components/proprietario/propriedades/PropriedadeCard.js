import Link from 'next/link';
import {
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiUser,
  FiCalendar,
} from 'react-icons/fi';
import Badge from '@/components/ui/Badge';

export default function PropriedadeCard({ propriedade, onEditar, onDeletar }) {
  const formatCNPJ = (cnpj) => cnpj || 'N/A';
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };
  const getManejoLabel = (tipo) => {
    const map = { P: 'Pecuária', E: 'Extensivo', I: 'Intensivo' };
    return map[tipo] || tipo || 'Não informado';
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl hover:border-[#ffcf78] hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ce7d0a] to-[#ffdb99] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <Link
        href={`/proprietario/propriedade/${propriedade.id_propriedade}`}
        className="flex flex-col h-full p-5 no-underline"
        passHref
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2 flex-wrap">
            <Badge
              type={propriedade.status === 'Inativa' ? 'inactive' : 'active'}
            >
              {propriedade.status || 'Ativa'}
            </Badge>
            {propriedade.p_abcb && <Badge type="info">ABCB</Badge>}
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
              Manejo
            </span>
            <span className="text-xs font-semibold text-[#404040] block truncate">
              {getManejoLabel(propriedade.tipo_manejo)}
            </span>
          </div>
          <div className="bg-[#f8fcfa] p-2.5 rounded-lg border border-gray-100 group-hover:border-[#ffcf78]/30 transition-colors">
            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
              Atualização
            </span>
            <div className="flex items-center gap-1.5">
              <FiCalendar className="w-3 h-3 text-[#ce7d0a]/70" />
              <span className="text-xs font-semibold text-[#404040]">
                {formatDate(propriedade.updated_at)}
              </span>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 min-w-[14px] flex justify-center">
              <FiMapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#ce7d0a] transition-colors" />
            </div>
            <span className="text-xs text-gray-600 leading-snug line-clamp-2">
              {propriedade.endereco
                ? `${propriedade.endereco.bairro}, ${propriedade.endereco.cidade} - ${propriedade.endereco.estado}`
                : 'Endereço não cadastrado'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="min-w-[14px] flex justify-center">
              <FiUser className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#ce7d0a] transition-colors" />
            </div>
            <span className="text-xs text-gray-600 font-medium truncate">
              {propriedade.dono?.nome || 'Sem proprietário'}
            </span>
          </div>
        </div>
      </Link>
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <button
          onClick={(e) => {
            e.preventDefault();
            onEditar && onEditar(e, propriedade);
          }}
          className="p-2 bg-white text-[#ce7d0a] border border-[#ce7d0a]/20 rounded-lg shadow-sm hover:bg-[#FFCF78] hover:text-[#404040] hover:border-[#FFCF78] transition-colors"
          title="Editar"
        >
          <FiEdit2 size={14} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeletar && onDeletar(propriedade);
          }}
          className="p-2 bg-white text-gray-400 border border-gray-200 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
          title="Excluir"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
}
