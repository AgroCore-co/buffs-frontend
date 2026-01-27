import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import DashboardContainer from '../../ui/DashboardContainer';
import { Dna, User, Crown, Info } from 'lucide-react';
import useSWR from 'swr';
import bufaloService from '@/services/bufalo.service';
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

  // --- FETCHERS ---
  const fetchGenealogy = async (rootId) => {
    const cache = new Map();

    // Função recursiva interna
    const fetchAncestor = async (id, depth) => {
      if (!id || depth >= MAX_GENERATIONS) return null;
      if (cache.has(id)) return cache.get(id);

      try {
        const data = (await bufaloService.getBufaloById(id)) || {};

        const [pai, mae] = await Promise.all([
          fetchAncestor(data.id_pai, depth + 1),
          fetchAncestor(data.id_mae, depth + 1),
        ]);

        const node = {
          id: data.id_bufalo,
          nome: data.nome,
          registro: data.registro_def || data.registro_prov || data.brinco,
          sexo: data.sexo,
          pai,
          mae,
        };

        cache.set(id, node);
        return node;
      } catch (error) {
        console.error(`Erro ao buscar ancestral ${id}:`, error);
        return null;
      }
    };

    // Constroi a partir dos pais do root
    // Precisamos buscar os dados do rootId novamente?
    // O componente recebe 'bufalo' prop, mas o fetcher precisa ser autônomo ou receber o objeto inicial.
    // Para simplificar e garantir consistência (e cache key simples), vamos buscar o root novamente ou aceitar que o fetcher busca tudo.

    // Na implementação anterior, ele usava 'bufalo' prop para criar o rootNode e buscava só os pais (linha 212).
    // Para o SWR ficar limpo, o fetcher pode receber o objecto bufalo ou ID.
    // Se receber ID, ele busca o root. Se receber objeto, usa.
    // Mas a key do SWR é melhor ser o ID. Entao vamos buscar o root também para garantir (ou passar os dados iniciais).

    // Vamos replicar a logica original: recebe ID, busca pais. O root node é montado fora?
    // Melhor: O fetcher retorna a arvore completa.
    // Vamos passar o objeto bufalo inteiro para o fetcher? Não, o fetcher key deve ser serializavel.

    // Vamos fazer o fetcher buscar tudo baseado no ID do bufalo principal.

    const rootData = await bufaloService.getBufaloById(rootId);
    if (!rootData) throw new Error('Bufalo não encontrado');

    const [pai, mae] = await Promise.all([
      fetchAncestor(rootData.id_pai, 1),
      fetchAncestor(rootData.id_mae, 1),
    ]);

    return {
      id: rootData.id_bufalo,
      nome: rootData.nome,
      registro:
        rootData.registro_def || rootData.registro_prov || rootData.brinco,
      sexo: rootData.sexo,
      pai,
      mae,
    };
  };

  const { data: treeData, isLoading: loading } = useSWR(
    bufalo?.id_bufalo ? ['genealogia', bufalo.id_bufalo] : null,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
