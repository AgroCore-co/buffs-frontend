import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import DashboardContainer from '../../ui/DashboardContainer';
import { Dna, User, Crown, Info, AlertTriangle } from 'lucide-react';
import useSWR from 'swr';
import bufaloService from '@/services/bufalo.service';
import coberturaService from '@/services/cobertura.service';
import Loading from '@/components/loading/Loading';

// --- DADOS MOCKADOS ESTRUTURA BASE ---
const BASE_STRUCT = {
  id: null,
  nome: 'Carregando...',
  registro: '',
  sexo: '',
};

// --- CONSTANTES DE LAYOUT ---
const CARD_WIDTH = 180;
const CARD_HEIGHT = 90;
const LEVEL_HEIGHT = 120; // Distância vertical entre gerações
const LEAF_WIDTH = 130; // Largura horizontal reservada para nós folha
const MAX_GENERATIONS = 4; // Limite de recursão

// --- FUNÇÕES AUXILIARES ---
const getRoleLabel = (sexo, generation) => {
  if (generation === 0) return 'Animal';
  if (generation === 1) return sexo === 'M' ? 'Pai' : 'Mãe';
  if (generation === 2) return sexo === 'M' ? 'Avô' : 'Avó';
  if (generation === 3) return sexo === 'M' ? 'Bisavô' : 'Bisavó';
  return 'Ancestral';
};

// --- MOTOR DE LAYOUT (VERTICAL ASCENDENTE) ---
const calculatePedigreeLayout = (node, generation = 0, xCenter, totalWidth) => {
  if (!node) return { nodes: [], links: [] };

  // Y negativo para crescer para cima
  const x = xCenter;
  const y = -(generation * LEVEL_HEIGHT);

  const nodeData = {
    ...node,
    x,
    y,
    generation,
    role: getRoleLabel(node.sexo, generation),
  };

  let nodes = [nodeData];
  let links = [];

  const nextGenOffset = totalWidth / Math.pow(2, generation + 2);

  if (node.pai) {
    const { nodes: pNodes, links: pLinks } = calculatePedigreeLayout(
      node.pai,
      generation + 1,
      xCenter - nextGenOffset, // Pai Esq
      totalWidth
    );
    nodes = [...nodes, ...pNodes];
    links = [
      ...links,
      ...pLinks,
      {
        source: { x: nodeData.x, y: nodeData.y },
        target: { x: pNodes[0].x, y: pNodes[0].y },
      },
    ];
  }

  if (node.mae) {
    const { nodes: mNodes, links: mLinks } = calculatePedigreeLayout(
      node.mae,
      generation + 1,
      xCenter + nextGenOffset, // Mãe Dir
      totalWidth
    );
    nodes = [...nodes, ...mNodes];
    links = [
      ...links,
      ...mLinks,
      {
        source: { x: nodeData.x, y: nodeData.y },
        target: { x: mNodes[0].x, y: mNodes[0].y },
      },
    ];
  }

  return { nodes, links };
};

// --- COMPONENTES VISUAIS ---
import Card from '../../ui/Card';

import SectionTitle from '../../ui/SectionTitle';

const NodeCard = ({ node }) => {
  const isMale = node.sexo === 'M';
  const generation = node.generation;
  const isPlaceholder = node.id === 'loading' || !node.id;

  if (isPlaceholder) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full rounded-xl border-2 border-slate-100 border-dashed bg-slate-50">
        <p className="text-[10px] text-slate-400 font-medium">Não informado</p>
      </div>
    );
  }

  const borderColor = isMale
    ? 'border-blue-200 hover:border-blue-400'
    : 'border-pink-200 hover:border-pink-400';
  const labelBg = isMale
    ? 'bg-blue-100 text-blue-700'
    : 'bg-pink-100 text-pink-700';
  const iconColor = isMale ? 'text-blue-400' : 'text-pink-400';

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full h-full rounded-xl border-2 bg-white shadow-sm transition-all hover:shadow-md cursor-pointer ${borderColor}`}
    >
      <div
        className={`absolute -top-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white shadow-sm ${labelBg}`}
      >
        {node.role}
      </div>
      <div className="mb-1 mt-1">
        {generation === 0 ? (
          <Crown className="w-5 h-5 text-amber-500" />
        ) : (
          <User className={`w-4 h-4 ${iconColor}`} />
        )}
      </div>
      <div className="text-center w-full px-2">
        <p
          className="text-xs font-bold text-slate-800 truncate leading-tight"
          title={node.nome}
        >
          {node.nome}
        </p>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
          {node.registro || 'S/ Reg'}
        </p>
      </div>
    </div>
  );
};

export default function GenealogiaTab({ bufalo }) {
  const containerRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [analiseGenetica, setAnaliseGenetica] = useState(null);

  // --- FETCHERS ---
  const fetchGenealogy = async (rootId) => {
    const cache = new Map();

    // Helper para delay entre requisições
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Função para buscar detalhes de um búfalo por ID (com ancestrais opcionais)
    const fetchBufaloWithAncestors = async (id, depth = 0, maxDepth = 2) => {
      if (!id || depth >= maxDepth) return null;
      if (cache.has(id)) return cache.get(id);

      try {
        await delay(100); // Pequeno delay para evitar rate limiting
        const data = await bufaloService.getBufaloById(id);
        if (data) {
          // Buscar ancestrais se não atingimos a profundidade máxima
          const pai =
            depth < maxDepth - 1
              ? await fetchBufaloWithAncestors(data.idPai, depth + 1, maxDepth)
              : null;
          const mae =
            depth < maxDepth - 1
              ? await fetchBufaloWithAncestors(data.idMae, depth + 1, maxDepth)
              : null;

          const node = {
            id: data.idBufalo,
            nome: data.nome,
            registro: data.registroDef || data.registroProv || data.brinco,
            sexo: data.sexo,
            pai,
            mae,
          };
          cache.set(id, node);
          return node;
        }
        return null;
      } catch (error) {
        if (error.response?.status === 429) {
          console.warn('Rate limit atingido, aguardando...');
          await delay(2000);
          return fetchBufaloWithAncestors(id, depth, maxDepth);
        }
        console.error(`Erro ao buscar búfalo ${id}:`, error);
        return null;
      }
    };

    // Função para buscar apenas detalhes básicos (sem ancestrais)
    const fetchBufaloDetails = async (id) => {
      if (!id) return null;
      if (cache.has(id)) return cache.get(id);

      try {
        await delay(50);
        const data = await bufaloService.getBufaloById(id);
        if (data) {
          const node = {
            id: data.idBufalo,
            nome: data.nome,
            registro: data.registroDef || data.registroProv || data.brinco,
            sexo: data.sexo,
          };
          cache.set(id, node);
          return node;
        }
        return null;
      } catch (error) {
        console.error(`Erro ao buscar búfalo ${id}:`, error);
        return null;
      }
    };

    // Tentar usar a API de análise genealógica primeiro
    try {
      const analise = await coberturaService.getAnaliseGenealogica(rootId);
      setAnaliseGenetica(analise);

      // Se a API funcionou, usar os IDs retornados
      const rootData = await bufaloService.getBufaloById(rootId);
      if (!rootData) throw new Error('Bufalo não encontrado');

      const paiId = analise?.pais?.pai_id;
      const maeId = analise?.pais?.mae_id;

      const [paiData, maeData] = await Promise.all([
        fetchBufaloDetails(paiId),
        fetchBufaloDetails(maeId),
      ]);

      // Buscar avós
      let avoPaterno = null,
        avoaPaterna = null,
        avoMaterno = null,
        avoaMaterna = null;

      if (paiId) {
        try {
          const analisePai =
            await coberturaService.getAnaliseGenealogica(paiId);
          if (analisePai?.pais) {
            [avoPaterno, avoaPaterna] = await Promise.all([
              fetchBufaloDetails(analisePai.pais.pai_id),
              fetchBufaloDetails(analisePai.pais.mae_id),
            ]);
          }
        } catch (err) {
          // Fallback: buscar via idPai/idMae do búfalo
          if (paiData) {
            const paiCompleto = await bufaloService.getBufaloById(paiId);
            if (paiCompleto) {
              [avoPaterno, avoaPaterna] = await Promise.all([
                fetchBufaloDetails(paiCompleto.idPai),
                fetchBufaloDetails(paiCompleto.idMae),
              ]);
            }
          }
        }
      }

      if (maeId) {
        try {
          const analiseMae =
            await coberturaService.getAnaliseGenealogica(maeId);
          if (analiseMae?.pais) {
            [avoMaterno, avoaMaterna] = await Promise.all([
              fetchBufaloDetails(analiseMae.pais.pai_id),
              fetchBufaloDetails(analiseMae.pais.mae_id),
            ]);
          }
        } catch (err) {
          // Fallback: buscar via idPai/idMae do búfalo
          if (maeData) {
            const maeCompleta = await bufaloService.getBufaloById(maeId);
            if (maeCompleta) {
              [avoMaterno, avoaMaterna] = await Promise.all([
                fetchBufaloDetails(maeCompleta.idPai),
                fetchBufaloDetails(maeCompleta.idMae),
              ]);
            }
          }
        }
      }

      return {
        id: rootData.idBufalo,
        nome: rootData.nome,
        registro:
          rootData.registroDef || rootData.registroProv || rootData.brinco,
        sexo: rootData.sexo,
        pai: paiData ? { ...paiData, pai: avoPaterno, mae: avoaPaterna } : null,
        mae: maeData ? { ...maeData, pai: avoMaterno, mae: avoaMaterna } : null,
      };
    } catch (error) {
      console.warn(
        'API de análise genealógica indisponível, usando fallback:',
        error.message
      );
      setAnaliseGenetica(null);

      // FALLBACK: Buscar genealogia diretamente via idPai/idMae dos búfalos
      const rootData = await bufaloService.getBufaloById(rootId);
      if (!rootData) throw new Error('Bufalo não encontrado');

      // Buscar pai e mãe com seus ancestrais
      const [pai, mae] = await Promise.all([
        fetchBufaloWithAncestors(rootData.idPai, 0, 2),
        fetchBufaloWithAncestors(rootData.idMae, 0, 2),
      ]);

      return {
        id: rootData.idBufalo,
        nome: rootData.nome,
        registro:
          rootData.registroDef || rootData.registroProv || rootData.brinco,
        sexo: rootData.sexo,
        pai,
        mae,
      };
    }
  };

  const { data: treeData, isLoading: loading } = useSWR(
    bufalo?.idBufalo ? ['genealogia', bufalo.idBufalo] : null,
    ([, id]) => fetchGenealogy(id),
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // Cache longo (10 min) pois genealogia muda pouco
    }
  );

  // 2. Gera Layout da Árvore
  const { nodes, links, bounds } = useMemo(() => {
    if (!treeData)
      return {
        nodes: [],
        links: [],
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 100, height: 100 },
      };

    // Correção: Usar MAX_GENERATIONS - 1, pois só temos 3 gerações de ancestrais (pais, avós, bisavós)
    const totalWidth = Math.pow(2, MAX_GENERATIONS - 1) * LEAF_WIDTH;
    const layout = calculatePedigreeLayout(treeData, 0, 0, totalWidth);

    // Calcula Bounding Box para centralização
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    if (layout.nodes.length === 0) {
      return {
        nodes: [],
        links: [],
        bounds: {
          minX: 0,
          maxX: 100,
          minY: 0,
          maxY: 100,
          width: 100,
          height: 100,
        },
      };
    }

    layout.nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    // Adiciona margem do tamanho do card
    const paddingX = CARD_WIDTH / 2 + 40;
    const paddingY = CARD_HEIGHT / 2 + 40;

    return {
      ...layout,
      bounds: {
        minX: minX - paddingX,
        maxX: maxX + paddingX,
        minY: minY - paddingY,
        maxY: maxY + paddingY,
        width: maxX - minX + paddingX * 2,
        height: maxY - minY + paddingY * 2,
      },
    };
  }, [treeData]);

  // 3. Função de Auto-Fit (Centralizar)
  const centerTree = useCallback(() => {
    if (!containerRef.current || !bounds) return;

    const { width: containerW, height: containerH } =
      containerRef.current.getBoundingClientRect();

    // Calcula escala para caber
    // Previne divisão por zero
    const bWidth = bounds.width || 100;
    const bHeight = bounds.height || 100;

    const scaleX = containerW / bWidth;
    const scaleY = containerH / bHeight;
    // Permitir zoom maior que 1.0 (até 1.5x) se a árvore for pequena
    const scale = Math.min(scaleX, scaleY, 1.5) * 0.95;

    // Calcula posição para centralizar
    // O centro da árvore (bounds center) deve ir para o centro do container
    const treeCenterX = (bounds.minX + bounds.maxX) / 2;
    const treeCenterY = (bounds.minY + bounds.maxY) / 2;

    const x = containerW / 2 - treeCenterX * scale;
    const y = containerH / 2 - treeCenterY * scale;

    setTransform({ x, y, k: scale });
  }, [bounds]);

  // Centraliza ao montar ou redimensionar e quando mudar dados
  useEffect(() => {
    // Delay pequeno para garantir que o DOM renderizou
    const timer = setTimeout(centerTree, 100);
    window.addEventListener('resize', centerTree);
    return () => {
      window.removeEventListener('resize', centerTree);
      clearTimeout(timer);
    };
  }, [centerTree, loading]);

  // Renderiza Linhas
  const renderLink = (link, idx) => {
    const { source, target } = link;
    const halfH = CARD_HEIGHT / 2;

    const sX = source.x;
    const sY = source.y - halfH; // Sai do topo do filho
    const tX = target.x;
    const tY = target.y + halfH; // Entra na base do pai
    const midY = (sY + tY) / 2;

    const d = `M ${sX} ${sY} L ${sX} ${midY} L ${tX} ${midY} L ${tX} ${tY}`;

    return (
      <path key={idx} d={d} fill="none" stroke="#cbd5e1" strokeWidth="2" />
    );
  };

  if (!bufalo) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
          <div className="p-3 bg-amber-50 rounded-xl">
            <Dna className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Grau de Sangue
            </p>
            <p className="text-lg font-bold text-slate-800">
              {bufalo?.categoria || 'SRD'}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
          <div className="p-3 bg-blue-50 rounded-xl">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Pai
            </p>
            <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">
              {treeData?.pai?.nome ||
                (loading ? 'Carregando...' : 'Não informado')}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
          <div className="p-3 bg-pink-50 rounded-xl">
            <User className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Mãe
            </p>
            <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">
              {treeData?.mae?.nome ||
                (loading ? 'Carregando...' : 'Não informado')}
            </p>
          </div>
        </Card>
        <Card
          className={`flex items-center gap-4 bg-gradient-to-br ${
            analiseGenetica?.risco_genetico === 'Alto' ||
            analiseGenetica?.risco_genetico === 'Crítico'
              ? 'from-red-50 to-red-100 border-red-200'
              : analiseGenetica?.risco_genetico === 'Moderado'
                ? 'from-amber-50 to-amber-100 border-amber-200'
                : 'from-green-50 to-slate-50 border-green-200'
          }`}
        >
          <div
            className={`p-3 rounded-xl ${
              analiseGenetica?.risco_genetico === 'Alto' ||
              analiseGenetica?.risco_genetico === 'Crítico'
                ? 'bg-red-100'
                : analiseGenetica?.risco_genetico === 'Moderado'
                  ? 'bg-amber-100'
                  : 'bg-green-100'
            }`}
          >
            {analiseGenetica?.risco_genetico === 'Alto' ||
            analiseGenetica?.risco_genetico === 'Crítico' ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : analiseGenetica?.risco_genetico === 'Moderado' ? (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            ) : (
              <Dna className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Consanguinidade
            </p>
            <p
              className={`text-lg font-bold ${
                analiseGenetica?.risco_genetico === 'Alto' ||
                analiseGenetica?.risco_genetico === 'Crítico'
                  ? 'text-red-700'
                  : analiseGenetica?.risco_genetico === 'Moderado'
                    ? 'text-amber-700'
                    : 'text-green-700'
              }`}
            >
              {analiseGenetica
                ? `${analiseGenetica.consanguinidade}%`
                : loading
                  ? '...'
                  : 'N/A'}
            </p>
            {analiseGenetica?.risco_genetico && (
              <p className="text-[10px] text-slate-500">
                Risco: {analiseGenetica.risco_genetico}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Árvore Genealógica com container padrão */}
      <DashboardContainer className="relative overflow-hidden h-[600px] p-0 flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 rounded-xl">
            <Loading text="Construindo árvore genealógica..." />
          </div>
        )}

        <div ref={containerRef} className="w-full h-full overflow-hidden">
          <svg width="100%" height="100%">
            <g
              transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
            >
              {links.map((link, idx) => renderLink(link, idx))}
              {nodes.map((node) => (
                <foreignObject
                  key={node.id || `placeholder-${node.x}-${node.y}`}
                  x={node.x - CARD_WIDTH / 2}
                  y={node.y - CARD_HEIGHT / 2}
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  className="overflow-visible"
                >
                  <NodeCard node={node} />
                </foreignObject>
              ))}
            </g>
          </svg>
        </div>
      </DashboardContainer>
    </div>
  );
}
