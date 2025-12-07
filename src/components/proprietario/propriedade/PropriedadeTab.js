import React, { useState, useEffect } from 'react';
import { enderecoService } from '@/services/endereco.service';
import { usuarioService } from '@/services/usuario.service';
import { dashboardService } from '@/services/dashboard.service';
import Card from '@/components/ui/Card';
import SectionTitle from '@/components/ui/SectionTitle';
import DashboardContainer from '@/components/ui/DashboardContainer';
import Badge from '@/components/ui/Badge';
import {
  Building2,
  MapPin,
  Users,
  Printer,
  Edit,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Tractor,
  FileText,
  Fingerprint,
  Milk,
  TrendingUp,
  TrendingDown,
  Heart,
} from 'lucide-react';

// --- Helpers e Sub-componentes ---

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    if (dateString.includes('/')) return dateString.split(',')[0];
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateString;
  }
};

const getManejoLabel = (tipo) => {
  const map = {
    P: 'Pastagem / Extensivo',
    C: 'Confinamento',
    S: 'Semi-confinamento',
  };
  return map[tipo] || tipo || 'Não informado';
};

const InfoItem = ({ icon: Icon, label, value, subValue }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-[#404040]">
        {value || <span className="text-gray-300 italic">Não informado</span>}
      </p>
      {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
    </div>
  </div>
);

const StatWidget = ({
  title,
  value,
  icon: Icon,
  badgeType = 'active',
  iconColor = 'text-[#ce7d0a]',
  iconBg = 'bg-amber-50',
}) => {
  return (
    <div className="flex flex-col p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <Badge type={badgeType}>Ativos</Badge>
      </div>
      <div>
        <span className="text-2xl font-bold text-[#404040] tracking-tight">
          {value}
        </span>
        <p className="text-xs text-gray-500 font-medium uppercase mt-1">
          {title}
        </p>
      </div>
    </div>
  );
};

// --- Componente Principal ---

export default function PropriedadeTab({ propriedade, idPropriedade }) {
  const [endereco, setEndereco] = useState(null);
  const [dono, setDono] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Dashboard states
  const [producaoMensal, setProducaoMensal] = useState(null);
  const [reproducao, setReproducao] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Stats fallback
  const stats = dashboardStats || {
    qtd_macho_ativos: 0,
    qtd_femeas_ativas: 0,
    qtd_lotes: 0,
    qtd_usuarios: 0,
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!propriedade?.id_endereco && !propriedade?.id_dono) return;
      setLoadingDetails(true);
      try {
        if (propriedade.id_endereco) {
          const end = await enderecoService.getEnderecoById(
            propriedade.id_endereco
          );
          setEndereco(end);
        }
        if (propriedade.id_dono) {
          const usr = await usuarioService.getUsuarioById(propriedade.id_dono);
          setDono(usr);
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [propriedade?.id_endereco, propriedade?.id_dono]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!idPropriedade) return;
      setLoadingDashboard(true);
      try {
        const [statsData, producaoData, reproducaoData] = await Promise.all([
          dashboardService.getDashboardStats(idPropriedade),
          dashboardService.getProducaoMensal(idPropriedade),
          dashboardService.getReproducao(idPropriedade),
        ]);
        setDashboardStats(statsData);
        setProducaoMensal(producaoData);
        setReproducao(reproducaoData);
      } catch (error) {
        console.error('Erro ao buscar dados dashboard:', error);
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchDashboardData();
  }, [idPropriedade]);

  if (!propriedade) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <Building2 className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">
          Nenhuma propriedade selecionada
        </p>
      </div>
    );
  }

  return (
    <DashboardContainer className="animate-in fade-in duration-500">
      {/* Header */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center border-4 border-white shadow-sm shrink-0">
              <Building2 className="w-8 h-8 text-[#ce7d0a]" />
            </div>
            <div>
              <SectionTitle>
                {propriedade.nome || 'Propriedade Sem Nome'}
              </SectionTitle>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                {propriedade.p_abcb && (
                  <Badge type="active">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Associado ABCB
                    </span>
                  </Badge>
                )}
                <Badge type="inactive">
                  {getManejoLabel(propriedade.tipo_manejo)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {loadingDetails
                    ? 'Carregando...'
                    : endereco
                      ? `${endereco.cidade} - ${endereco.estado}`
                      : 'Localização n/d'}
                </span>
                <span className="hidden md:inline text-gray-300">|</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Atualizado em: {formatDate(propriedade.updated_at)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
              <Printer className="w-4 h-4" />{' '}
              <span className="hidden sm:inline">Relatório</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#ce7d0a] rounded-lg text-white text-sm font-medium hover:bg-[#b06a08] transition-colors shadow-sm shadow-amber-100">
              <Edit className="w-4 h-4" />{' '}
              <span className="hidden sm:inline">Editar Dados</span>
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Esquerda */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <SectionTitle>Dados Cadastrais</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InfoItem
                icon={FileText}
                label="CNPJ / Documento"
                value={propriedade.cnpj}
              />
              <InfoItem
                icon={Tractor}
                label="Sistema de Produção"
                value={getManejoLabel(propriedade.tipo_manejo)}
              />
              <InfoItem
                icon={Fingerprint}
                label="Responsável Técnico"
                value={loadingDetails ? '...' : dono?.nome}
                subValue={dono?.email}
              />
              <InfoItem
                icon={MapPin}
                label="Endereço Completo"
                value={
                  loadingDetails
                    ? '...'
                    : endereco
                      ? `${endereco.rua}, ${endereco.bairro}`
                      : null
                }
                subValue={endereco?.cep}
              />
            </div>
          </Card>

          <Card>
            <SectionTitle>Indicadores do Rebanho</SectionTitle>
            {loadingDashboard ? (
              <div className="h-32 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center border border-gray-200">
                <span className="text-gray-400 text-sm">
                  Carregando indicadores...
                </span>
              </div>
            ) : !dashboardStats ? (
              <div className="h-32 flex flex-col items-center justify-center bg-red-50 border border-red-100 rounded-xl text-red-500">
                <AlertCircle className="w-6 h-6 mb-2" />
                <span className="font-semibold text-sm">
                  Dados indisponíveis
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatWidget
                  title="Fêmeas"
                  value={stats.qtd_femeas_ativas}
                  icon={Activity}
                  badgeType="active"
                  iconColor="text-[#ce7d0a]"
                  iconBg="bg-amber-100"
                />
                <StatWidget
                  title="Machos"
                  value={stats.qtd_macho_ativos}
                  icon={Activity}
                  badgeType="info"
                  iconColor="text-blue-600"
                  iconBg="bg-blue-100"
                />
                <StatWidget
                  title="Lotes"
                  value={stats.qtd_lotes}
                  icon={Layers}
                  badgeType="inactive"
                  iconColor="text-gray-600"
                  iconBg="bg-gray-100"
                />
                <StatWidget
                  title="Usuários"
                  value={stats.qtd_usuarios}
                  icon={Users}
                  badgeType="active"
                  iconColor="text-green-600"
                  iconBg="bg-green-100"
                />
              </div>
            )}
          </Card>

          {dashboardStats?.bufalosPorRaca?.length > 0 && (
            <Card>
              <SectionTitle>Composição Racial</SectionTitle>
              <div className="space-y-4 mt-4">
                {dashboardStats.bufalosPorRaca.map((raca, idx) => {
                  const total = dashboardStats.bufalosPorRaca.reduce(
                    (a, b) => a + b.quantidade,
                    0
                  );
                  const pct =
                    total > 0
                      ? ((raca.quantidade / total) * 100).toFixed(1)
                      : 0;
                  return (
                    <div key={idx} className="group">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700">
                          {raca.raca}
                        </span>
                        <span className="text-gray-500">
                          {raca.quantidade} animais{' '}
                          <Badge type="info">{pct}%</Badge>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#ce7d0a] h-full rounded-full transition-all duration-500 group-hover:bg-[#b06a08]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Direita */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-amber-100">
            <SectionTitle>Produção Leiteira</SectionTitle>
            <div className="flex items-center gap-2 mb-2">
              <Milk className="w-5 h-5 text-[#ce7d0a]" />
              <Badge type="info">Ciclo Atual</Badge>
            </div>
            {producaoMensal ? (
              <>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-[#404040]">
                    {producaoMensal.mes_atual_litros.toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-gray-400">
                    Litros
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 mb-6">
                  <Badge
                    type={
                      producaoMensal.variacao_percentual >= 0
                        ? 'active'
                        : 'inactive'
                    }
                  >
                    {producaoMensal.variacao_percentual >= 0 ? (
                      <TrendingUp className="w-3 h-3 inline" />
                    ) : (
                      <TrendingDown className="w-3 h-3 inline" />
                    )}
                    {Math.abs(producaoMensal.variacao_percentual).toFixed(1)}%
                    vs. mês anterior
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                      Lactantes
                    </p>
                    <p className="text-lg font-bold text-gray-700">
                      {producaoMensal.bufalas_lactantes_atual}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p
                      className="text-[10px] text-gray-400 uppercase font-bold mb-1"
                      title="Produção total do mês anterior em litros"
                    >
                      Litros mês anterior
                    </p>
                    <p className="text-lg font-bold text-gray-700">
                      {producaoMensal.mes_anterior_litros.toFixed(0)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                Sem dados recentes
              </div>
            )}
          </Card>

          {reproducao && (
            <Card>
              <SectionTitle>Reprodução</SectionTitle>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100">
                  <span className="text-sm font-medium text-green-800">
                    Confirmadas
                  </span>
                  <span className="text-lg font-bold text-green-900">
                    {reproducao.totalConfirmada}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="text-sm font-medium text-amber-800">
                    Em Andamento
                  </span>
                  <span className="text-lg font-bold text-amber-900">
                    {reproducao.totalEmAndamento}
                  </span>
                </div>
                {reproducao.totalFalha > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                    <span className="text-sm font-medium text-red-800">
                      Falhas
                    </span>
                    <span className="text-lg font-bold text-red-900">
                      {reproducao.totalFalha}
                    </span>
                  </div>
                )}
                {reproducao.ultimaDataReproducao && (
                  <div className="pt-2 mt-2 border-t border-gray-100 text-right">
                    <span className="text-xs text-gray-400">
                      Último evento:{' '}
                      {formatDate(reproducao.ultimaDataReproducao)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card className="px-4 py-3 bg-gray-50 text-xs text-gray-400 space-y-1 border border-gray-200">
            <div className="flex justify-between">
              <span>Criado em:</span>
              <span className="font-mono text-gray-500">
                {formatDate(propriedade.created_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ID:</span>
              <span className="font-mono text-gray-500">
                {idPropriedade?.split('-')[0]}...
              </span>
            </div>
          </Card>
        </div>
      </div>
    </DashboardContainer>
  );
}
