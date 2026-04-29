// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  dataIngestionService,
  ExportFiltersDTO,
} from '@/services/dataIngestion.service';

export const DATA_INGESTION_QUERY_KEYS = {
  job: (jobId: string) => ['data-ingestion', 'job', jobId] as const,
};

// ==========================================================
// HOOK 1: MUTAÇÕES DE IMPORTAÇÃO E EXPORTAÇÃO
// ==========================================================

export function useDataIngestion() {
  // ------------------------------------------
  // IMPORTAÇÕES (Upload de Arquivos)
  // ------------------------------------------

  const importLeiteMutation = useMutation({
    mutationFn: ({ propriedadeId, file }: { propriedadeId: string; file: File }) =>
      dataIngestionService.importLeite(propriedadeId, file),
  });

  const importPesagemMutation = useMutation({
    mutationFn: ({ propriedadeId, file }: { propriedadeId: string; file: File }) =>
      dataIngestionService.importPesagem(propriedadeId, file),
  });

  const importReproducaoMutation = useMutation({
    mutationFn: ({ propriedadeId, file }: { propriedadeId: string; file: File }) =>
      dataIngestionService.importReproducao(propriedadeId, file),
  });

  // ------------------------------------------
  // EXPORTAÇÕES (Download de Arquivos)
  // ------------------------------------------

  const exportLeiteMutation = useMutation({
    mutationFn: ({ propriedadeId, filters }: { propriedadeId: string; filters?: ExportFiltersDTO }) =>
      dataIngestionService.exportLeite(propriedadeId, filters),
  });

  const exportPesagemMutation = useMutation({
    mutationFn: ({ propriedadeId, filters }: { propriedadeId: string; filters?: ExportFiltersDTO }) =>
      dataIngestionService.exportPesagem(propriedadeId, filters),
  });

  const exportReproducaoMutation = useMutation({
    mutationFn: ({ propriedadeId, filters }: { propriedadeId: string; filters?: ExportFiltersDTO }) =>
      dataIngestionService.exportReproducao(propriedadeId, filters),
  });

  return {
    // Ações de Importação
    importLeite: importLeiteMutation.mutateAsync,
    isImportingLeite: importLeiteMutation.isPending,

    importPesagem: importPesagemMutation.mutateAsync,
    isImportingPesagem: importPesagemMutation.isPending,

    importReproducao: importReproducaoMutation.mutateAsync,
    isImportingReproducao: importReproducaoMutation.isPending,

    // Ações de Exportação
    exportLeite: exportLeiteMutation.mutateAsync,
    isExportingLeite: exportLeiteMutation.isPending,

    exportPesagem: exportPesagemMutation.mutateAsync,
    isExportingPesagem: exportPesagemMutation.isPending,

    exportReproducao: exportReproducaoMutation.mutateAsync,
    isExportingReproducao: exportReproducaoMutation.isPending,
  };
}

// ==========================================================
// HOOK 2: POLLING DE STATUS DO JOB (ETL)
// ==========================================================

/**
 * Hook para consultar e atualizar automaticamente o status de um Job de Ingestão.
 * @param jobId O ID do job retornado após iniciar uma importação
 * @param intervalMs Tempo em milissegundos entre cada requisição (padrão: 3000ms / 3 segundos)
 */
export function useJobStatus(jobId?: string | null, intervalMs: number = 3000) {
  return useQuery({
    queryKey: jobId ? DATA_INGESTION_QUERY_KEYS.job(jobId) : ['data-ingestion', 'job', 'idle'],
    queryFn: () => dataIngestionService.getJobStatus(jobId!),
    // Só ativa a query se tivermos um jobId válido
    enabled: !!jobId,
    // Faz o polling automaticamente (refetchInterval), parando assim que o job for finalizado ou falhar
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') {
        return false; // Para o polling
      }
      return intervalMs; // Continua checando
    },
    // Garante que o cache não limpe o status antigo enquanto a nova requisição está em andamento
    staleTime: 0, 
  });
}