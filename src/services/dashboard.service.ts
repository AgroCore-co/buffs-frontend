import apiClient from '@/lib/apiClient';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

// ------------------------------------------
// 1. Dashboard Geral (Estatísticas)
// ------------------------------------------

export interface RacaQuantidade {
  raca: string;
  quantidade: number;
}

export interface DashboardGeralResponse {
  qtd_macho_ativos: number;
  qtd_femeas_ativas: number;
  qtd_bufalos_registradas: number;
  qtd_bufalos_bezerro: number;
  qtd_bufalos_novilha: number;
  qtd_bufalos_vaca: number;
  qtd_bufalos_touro: number;
  qtd_bufalas_lactando: number;
  qtd_lotes: number;
  qtd_usuarios: number;
  bufalosPorRaca: RacaQuantidade[];
}

// ------------------------------------------
// 2. Dashboard de Lactação
// ------------------------------------------

export interface CicloLactacao {
  id_ciclo_lactacao: string;
  id_bufala: string;
  nome_bufala: string;
  numero_parto: number;
  dt_parto: string; // YYYY-MM-DD
  dt_secagem_real: string | null; // YYYY-MM-DD
  dias_em_lactacao: number;
  media_lactacao: number;
  lactacao_total: number;
  classificacao: 'Ótima' | 'Boa' | 'Mediana' | 'Ruim' | string;
}

export interface DashboardLactacaoResponse {
  ano: number;
  media_rebanho_ano: number;
  ciclos: CicloLactacao[];
}

// ------------------------------------------
// 3. Dashboard de Produção Mensal
// ------------------------------------------

export interface SerieHistoricaMensal {
  mes: string; // YYYY-MM
  total_litros: number;
  qtd_bufalas: number;
  media_diaria: number;
}

export interface DashboardProducaoMensalResponse {
  ano: number;
  mes_atual_litros: number;
  mes_anterior_litros: number;
  variacao_percentual: number;
  bufalas_lactantes_atual: number;
  serie_historica: SerieHistoricaMensal[];
}

// ------------------------------------------
// 4. Dashboard de Reprodução
// ------------------------------------------

export interface DashboardReproducaoResponse {
  totalEmAndamento: number;
  totalConfirmada: number;
  totalFalha: number;
  ultimaDataReproducao: string | null; // YYYY-MM-DD
}

// ==========================================
// SERVIÇO DE DASHBOARDS
// ==========================================

export const dashboardService = {
  /**
   * Obtém estatísticas completas consolidadas de uma propriedade específica.
   * Inclui contagens de animais, lotes, usuários e distribuição por raça.
   * @param idPropriedade UUID da propriedade
   */
  async getGeral(idPropriedade: string): Promise<DashboardGeralResponse> {
    const response = await apiClient.get<DashboardGeralResponse>(`/dashboard/${idPropriedade}`);
    return response.data;
  },

  /**
   * Obtém métricas de lactação por ciclo de uma propriedade.
   * Retorna ciclos de todas as búfalas fêmeas com sua respectiva classificação.
   * @param idPropriedade UUID da propriedade
   * @param ano Ano de referência (padrão: ano atual no backend se não enviado)
   */
  async getLactacao(idPropriedade: string, ano?: number): Promise<DashboardLactacaoResponse> {
    const response = await apiClient.get<DashboardLactacaoResponse>(`/dashboard/lactacao/${idPropriedade}`, {
      params: ano ? { ano } : undefined,
    });
    return response.data;
  },

  /**
   * Obtém métricas de produção mensal de leite.
   * Retorna produção total, comparativo com mês anterior e série histórica anual.
   * @param idPropriedade UUID da propriedade
   * @param ano Ano de referência (padrão: ano atual no backend se não enviado)
   */
  async getProducaoMensal(idPropriedade: string, ano?: number): Promise<DashboardProducaoMensalResponse> {
    const response = await apiClient.get<DashboardProducaoMensalResponse>(`/dashboard/producao-mensal/${idPropriedade}`, {
      params: ano ? { ano } : undefined,
    });
    return response.data;
  },

  /**
   * Obtém métricas de reprodução de uma propriedade.
   * Retorna totais de reproduções por status (Em andamento, Confirmada, Falha).
   * @param idPropriedade UUID da propriedade
   */
  async getReproducao(idPropriedade: string): Promise<DashboardReproducaoResponse> {
    const response = await apiClient.get<DashboardReproducaoResponse>(`/dashboard/reproducao/${idPropriedade}`);
    return response.data;
  },
};