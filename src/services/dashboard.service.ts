import apiClient from '@/lib/apiClient';
import { toCamelCase } from '@/lib/toCamelCase';

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

export interface RacaQuantidade {
  raca: string;
  quantidade: number;
}

export interface DashboardGeralResponse {
  qtdMachoAtivos: number;
  qtdFemeasAtivas: number;
  qtdBufalosRegistradas: number;
  qtdBufalosBezerro: number;
  qtdBufalosNovilha: number;
  qtdBufalosVaca: number;
  qtdBufalosTouro: number;
  qtdBufalasLactando: number;
  qtdLotes: number;
  qtdUsuarios: number;
  bufalosPorRaca: RacaQuantidade[];
}

export interface CicloLactacao {
  idCicloLactacao: string;
  idBufala: string;
  nomeBufala: string;
  numeroParto: number;
  dtParto: string; // YYYY-MM-DD
  dtSecagemReal: string | null; // YYYY-MM-DD
  diasEmLactacao: number;
  mediaLactacao: number;
  lactacaoTotal: number;
  classificacao: 'Ótima' | 'Boa' | 'Mediana' | 'Ruim' | string;
}

export interface DashboardLactacaoResponse {
  ano: number;
  mediaRebanhoAno: number;
  ciclos: CicloLactacao[];
}

export interface SerieHistoricaMensal {
  mes: string; // YYYY-MM
  totalLitros: number;
  qtdBufalas: number;
  mediaDiaria: number;
}

export interface DashboardProducaoMensalResponse {
  ano: number;
  mesAtualLitros: number;
  mesAnteriorLitros: number;
  variacaoPercentual: number;
  bufalasLactantesAtual: number;
  serieHistorica: SerieHistoricaMensal[];
}

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
  async getGeral(idPropriedade: string): Promise<DashboardGeralResponse> {
    const response = await apiClient.get<DashboardGeralResponse>(`/dashboard/${idPropriedade}`);
    return toCamelCase<DashboardGeralResponse>(response.data);
  },

  async getLactacao(idPropriedade: string, ano?: number): Promise<DashboardLactacaoResponse> {
    const response = await apiClient.get<DashboardLactacaoResponse>(`/dashboard/lactacao/${idPropriedade}`, {
      params: ano ? { ano } : undefined,
    });
    return toCamelCase<DashboardLactacaoResponse>(response.data);
  },

  async getProducaoMensal(idPropriedade: string, ano?: number): Promise<DashboardProducaoMensalResponse> {
    const response = await apiClient.get<DashboardProducaoMensalResponse>(`/dashboard/producao-mensal/${idPropriedade}`, {
      params: ano ? { ano } : undefined,
    });
    return toCamelCase<DashboardProducaoMensalResponse>(response.data);
  },

  async getReproducao(idPropriedade: string): Promise<DashboardReproducaoResponse> {
    const response = await apiClient.get<DashboardReproducaoResponse>(`/dashboard/reproducao/${idPropriedade}`);
    return toCamelCase<DashboardReproducaoResponse>(response.data);
  },
};
