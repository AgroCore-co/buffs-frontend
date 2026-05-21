"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { usePropriedades } from '@/hooks/usePropriedades';
import { useEndereco } from '@/hooks/useEnderecos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Propriedade } from '@/services/propriedades.service';
import { Usuario } from '@/services/usuarios.service';
import Container from "@/components/ui/Container";
import MetricCard from "@/components/ui/MetricCard";
import PropriedadeCard from "@/components/proprietario/propriedades/PropriedadeCard";

import CreatePropriedadeModal from "@/components/proprietario/propriedades/CreatePropriedadeModal";
import DeletePropriedadeModal from "@/components/proprietario/propriedades/DeletePropriedadeModal";
import EditPropriedadeModal from "@/components/proprietario/propriedades/EditPropriedadeModal";

import { Map, CheckCircle, Tractor, Award, Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";


interface PropriedadeCardWithEnderecoProps {
  propriedade: Propriedade;
  me: Usuario | null | undefined;
  onEditar: (e: React.MouseEvent<HTMLButtonElement>, propriedade: Propriedade) => void;
  onDeletar: (propriedade: Propriedade) => void;
}

function PropriedadeCardWithEndereco({ propriedade, me, onEditar, onDeletar }: PropriedadeCardWithEnderecoProps) {
  const router = useRouter();
  // Usa o hook específico passando o ID diretamente
  const { data: endereco, isLoading: isLoadingEndereco } = useEndereco(propriedade.idEndereco);
  
  return (
    <div
      key={propriedade.idPropriedade}
      onClick={() => router.push(`/proprietario/propriedade/${propriedade.idPropriedade}`)}
      className="cursor-pointer transition-transform active:scale-[0.98]"
    >
      <PropriedadeCard
        propriedade={{
          ...propriedade,
          endereco: endereco || undefined,
          dono: { nome: me?.nome },
        }}
        onEditar={onEditar}
        onDeletar={onDeletar}
      />
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function PropriedadesPageProprietario() {
  const t = useTranslations('Proprietario.propriedades');

  // Estados dos Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [propriedadeSelecionada, setPropriedadeSelecionada] = useState<Propriedade | null>(null);

  // Busca as propriedades
  const {
    propriedades,
    totalPropriedades,
    isLoadingPropriedades,
    isErrorPropriedades,
  } = usePropriedades();

  // Busca o perfil do usuário logado
  const { me } = useUsuarios();

  // REMOVIDO: const { getById: getEnderecoById } = useEnderecos({ enabled: false });

  // Métricas derivadas
  const totalAtivas = propriedades.filter((p) => !p.deletedAt).length;
  const totalPecuaria = propriedades.filter((p) => p.tipoManejo === 'P').length;
  const totalAbcb = propriedades.filter((p) => p.pAbcb).length;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Container das Métricas */}
      <Container className="p-5">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#404040]">
              {t('title')}
            </h1>
            <p className="text-sm text-[#404040]/60 mt-1">
              {t('subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            <MetricCard
              title={t('total')}
              value={isLoadingPropriedades ? '—' : String(totalPropriedades)}
              subtitle={t('totalDesc')}
              icon={<Map className="w-4 h-4" />}
            />
            <MetricCard
              title={t('active')}
              value={isLoadingPropriedades ? '—' : String(totalAtivas)}
              subtitle={t('activeDesc')}
              icon={<CheckCircle className="w-4 h-4" />}
            />
            <MetricCard
              title={t('livestock')}
              value={isLoadingPropriedades ? '—' : String(totalPecuaria)}
              subtitle={t('livestockDesc')}
              icon={<Tractor className="w-4 h-4" />}
            />
            <MetricCard
              title={t('certified')}
              value={isLoadingPropriedades ? '—' : String(totalAbcb)}
              subtitle={t('certifiedDesc')}
              icon={<Award className="w-4 h-4" />}
            />
          </div>
        </div>
      </Container>

      {/* Container da Lista de Propriedades */}
      <Container className="p-5">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#404040]">
              {t('registered')}
            </h2>
            <p className="text-sm text-[#404040]/60 mt-1">
              {isLoadingPropriedades
                ? '...'
                : t('unitsFound', { count: totalPropriedades })
              }
            </p>
          </div>

          <div className="shrink-0">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              icon={Plus}
              size="md"
              className="w-full sm:w-fit"
            >
              Nova Propriedade
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingPropriedades && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#ffcf78] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-[#404040]/60">{t('loading')}</p>
          </div>
        )}

        {/* Error State */}
        {isErrorPropriedades && !isLoadingPropriedades && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Building2 size={24} className="text-red-400" />
            </div>
            <p className="text-sm font-medium text-[#404040]">{t('errorLoading')}</p>
            <p className="text-xs text-[#404040]/60 mt-1">{t('errorLoadingDesc')}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingPropriedades && !isErrorPropriedades && propriedades.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-full bg-[#ffcf78]/20 flex items-center justify-center mb-4">
              <Building2 size={24} className="text-[#ce7d0a]" />
            </div>
            <p className="text-sm font-medium text-[#404040]">{t('noProperties')}</p>
            <p className="text-xs text-[#404040]/60 mt-1">{t('noPropertiesDesc')}</p>
          </div>
        )}

        {/* Propriedades Grid */}
        {!isLoadingPropriedades && !isErrorPropriedades && propriedades.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propriedades.map((propriedade) => (
              <PropriedadeCardWithEndereco
                key={propriedade.idPropriedade}
                propriedade={propriedade}
                me={me}
                onEditar={(e, prop) => {
                  e.stopPropagation();
                  setPropriedadeSelecionada(prop);
                  setIsEditModalOpen(true);
                }}
                onDeletar={(prop) => {
                  setPropriedadeSelecionada(prop);
                  setIsDeleteModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </Container>

      {isCreateModalOpen && (
        <CreatePropriedadeModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}

      {isDeleteModalOpen && (
        <DeletePropriedadeModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          propriedade={propriedadeSelecionada}
        />
      )}

      {isEditModalOpen && (
        <EditPropriedadeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          propriedade={propriedadeSelecionada}
        />
      )}
    </div>
  );
}