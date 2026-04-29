import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

export interface DataIngestionError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface DataIngestionWarning {
  row: number;
  field: string;
  value: string;
  message: string;
}

/**
 * Resposta padrão após o envio de uma planilha para processamento ETL.
 */
export interface ImportResponse {
  jobId: string;
  totalRows: number;
  imported: number;
  skipped: number;
  errors: DataIngestionError[];
  warnings: DataIngestionWarning[];
}

/**
 * Filtros opcionais para exportação de dados via planilha Excel.
 */
export interface ExportFiltersDTO {
  grupoId?: string;
  maturidade?: 'novilha' | 'primipara' | 'multipara';
  sexo?: 'M' | 'F';
  tipo?: 'MN' | 'IA' | 'IATF' | 'TE';
  de?: string; // Formato ISO 8601
  ate?: string; // Formato ISO 8601
}

/**
 * Resposta de consulta de status de um Job assíncrono.
 */
export interface JobStatusResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: ImportResponse;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// SERVIÇO DE DATA INGESTION (ETL)
// ==========================================

export const dataIngestionService = {
  // ------------------------------------------
  // LEITE
  // ------------------------------------------

  /**
   * Importar planilha de pesagem de leite (.xlsx).
   * @param propriedadeId UUID da propriedade
   * @param file Arquivo Excel a ser enviado
   */
  async importLeite(propriedadeId: string, file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ImportResponse>(
      `/propriedades/${propriedadeId}/data-ingestion/leite`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Exportar planilha de leite (.xlsx).
   * @param propriedadeId UUID da propriedade
   * @param filters Filtros opcionais (datas, grupo, etc.)
   * @returns Blob com o conteúdo binário do arquivo Excel
   */
  async exportLeite(propriedadeId: string, filters?: ExportFiltersDTO): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      `/propriedades/${propriedadeId}/data-ingestion/leite/export`,
      {
        params: filters,
        responseType: 'blob', // Crítico para lidar com arquivos binários
      }
    );
    return response.data;
  },

  // ------------------------------------------
  // PESAGEM ANIMAL
  // ------------------------------------------

  /**
   * Importar planilha de pesagem animal (.xlsx).
   * @param propriedadeId UUID da propriedade
   * @param file Arquivo Excel a ser enviado
   */
  async importPesagem(propriedadeId: string, file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ImportResponse>(
      `/propriedades/${propriedadeId}/data-ingestion/pesagem`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Exportar planilha de pesagem animal (.xlsx).
   * @param propriedadeId UUID da propriedade
   * @param filters Filtros opcionais (datas, sexo, grupo, etc.)
   * @returns Blob com o conteúdo binário do arquivo Excel
   */
  async exportPesagem(propriedadeId: string, filters?: ExportFiltersDTO): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      `/propriedades/${propriedadeId}/data-ingestion/pesagem/export`,
      {
        params: filters,
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // ------------------------------------------
  // REPRODUÇÃO
  // ------------------------------------------

  /**
   * Importar planilha de reprodução (.xlsx).
   * @param propriedadeId UUID da propriedade
   * @param file Arquivo Excel a ser enviado
   */
  async importReproducao(propriedadeId: string, file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ImportResponse>(
      `/propriedades/${propriedadeId}/data-ingestion/reproducao`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Exportar planilha de reprodução (.xlsx).
   * @param propriedadeId UUID da propriedade
   * @param filters Filtros opcionais (datas, tipo inseminação, maturidade, etc.)
   * @returns Blob com o conteúdo binário do arquivo Excel
   */
  async exportReproducao(propriedadeId: string, filters?: ExportFiltersDTO): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      `/propriedades/${propriedadeId}/data-ingestion/reproducao/export`,
      {
        params: filters,
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // ------------------------------------------
  // ACOMPANHAMENTO DE JOBS
  // ------------------------------------------

  /**
   * Consulta o status de um Job de processamento assíncrono.
   * @param jobId ID do Job retornado na requisição de importação
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await apiClient.get<JobStatusResponse>(`/data-ingestion/jobs/${jobId}`);
    return response.data;
  },
};