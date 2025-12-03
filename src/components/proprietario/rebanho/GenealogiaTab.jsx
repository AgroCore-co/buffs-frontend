import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import DashboardContainer from '../../ui/DashboardContainer';
import {
  Dna,
  User,
  Crown,
  Info,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize,
} from 'lucide-react';

// --- DADOS MOCKADOS (4 GERAÇÕES) ---
const createAncestor = (id, nome, sexo, reg) => ({
  id,
  nome,
  registro: reg,
  sexo,
});

const MOCK_TREE_FULL = {
  self: {
    id: 'af6a6ae3',
    nome: 'Búfalo Principal',
    registro: 'B-12345',
    sexo: 'M',
    pai: {
      id: 'pai-001',
      nome: 'Touro Campeão',
      registro: 'T-99887',
      sexo: 'M',
      pai: {
        id: 'avo-p-001',
        nome: 'Avô Paterno',
        registro: 'AP-1122',
        sexo: 'M',
        pai: createAncestor('bisa-pp-01', 'Bisavô Paterno', 'M', 'BP-10'),
        mae: createAncestor('bisa-pm-01', 'Bisavó Paterna', 'F', 'BP-11'),
      },
      mae: {
        id: 'avo-p-002',
        nome: 'Avó Paterna',
        registro: 'AP-3344',
        sexo: 'F',
        pai: createAncestor('bisa-mp-01', 'Bisavô Materno', 'M', 'BM-20'),
        mae: createAncestor('bisa-mm-01', 'Bisavó Materna', 'F', 'BM-21'),
      },
    },
    mae: {
      id: 'mae-001',
      nome: 'Matriz Leiteira',
      registro: 'M-55443',
      sexo: 'F',
      pai: {
        id: 'avo-m-001',
        nome: 'Avô Materno',
        registro: 'AM-5566',
        sexo: 'M',
        pai: createAncestor('bisa-mp-02', 'Bisavô Paterno', 'M', 'BP-30'),
        mae: createAncestor('bisa-mm-02', 'Bisavó Paterna', 'F', 'BP-31'),
      },
      mae: {
        id: 'avo-m-002',
        nome: 'Avó Materna',
        registro: 'AM-7788',
        sexo: 'F',
        pai: createAncestor('bisa-mm-03', 'Bisavô Materno', 'M', 'BM-40'),
        mae: createAncestor('bisa-mm-04', 'Bisavó Materna', 'F', 'BM-41'),
      },
    },
  },
};

// --- CONSTANTES DE LAYOUT ---
const CARD_WIDTH = 200;
const CARD_HEIGHT = 90;
const LEVEL_HEIGHT = 180; // Distância vertical entre gerações
const LEAF_WIDTH = 260; // Largura horizontal reservada para nós folha

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
const Card = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}
  >
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
    {children}
  </h3>
);

const NodeCard = ({ node }) => {
  const isMale = node.sexo === 'M';
  const generation = node.generation;

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 1. Prepara dados
  const rawTreeData = useMemo(
    () => ({
      ...MOCK_TREE_FULL.self,
      id: bufalo?.id_bufalo || MOCK_TREE_FULL.self.id,
      registro: bufalo?.brinco || MOCK_TREE_FULL.self.registro,
      sexo: bufalo?.sexo || MOCK_TREE_FULL.self.sexo,
    }),
    [bufalo]
  );

  // 2. Gera Layout da Árvore
  const { nodes, links, bounds } = useMemo(() => {
    const maxGen = 3;
    const totalWidth = Math.pow(2, maxGen) * LEAF_WIDTH;
    const layout = calculatePedigreeLayout(rawTreeData, 0, 0, totalWidth);

    // Calcula Bounding Box para centralização
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
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
  }, [rawTreeData]);

  // 3. Função de Auto-Fit (Centralizar)
  const centerTree = useCallback(() => {
    if (!containerRef.current) return;

    const { width: containerW, height: containerH } =
      containerRef.current.getBoundingClientRect();

    // Calcula escala para caber
    const scaleX = containerW / bounds.width;
    const scaleY = containerH / bounds.height;
    const scale = Math.min(scaleX, scaleY, 1) * 0.9; // 90% do tamanho para margem de respiro

    // Calcula posição para centralizar
    // O centro da árvore (bounds center) deve ir para o centro do container
    const treeCenterX = (bounds.minX + bounds.maxX) / 2;
    const treeCenterY = (bounds.minY + bounds.maxY) / 2;

    const x = containerW / 2 - treeCenterX * scale;
    const y = containerH / 2 - treeCenterY * scale;

    setTransform({ x, y, k: scale });
  }, [bounds]);

  // Centraliza ao montar ou redimensionar
  useEffect(() => {
    centerTree();
    window.addEventListener('resize', centerTree);
    return () => window.removeEventListener('resize', centerTree);
  }, [centerTree]);

  // Controles de Mouse
  const handleWheel = (e) => {
    e.preventDefault();
    const scaleFactor = 1.1;
    const newScale =
      e.deltaY < 0 ? transform.k * scaleFactor : transform.k / scaleFactor;
    setTransform((prev) => ({
      ...prev,
      k: Math.max(0.1, Math.min(newScale, 3)),
    }));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

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
              {MOCK_TREE_FULL.self.pai.nome}
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
              {MOCK_TREE_FULL.self.mae.nome}
            </p>
          </div>
        </Card>
      </div>

      {/* Árvore Genealógica com container padrão */}
      <DashboardContainer className="relative overflow-hidden h-[600px] p-0">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1">
            <button
              onClick={() => setTransform((p) => ({ ...p, k: p.k * 0.8 }))}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={centerTree}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTransform((p) => ({ ...p, k: p.k * 1.2 }))}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <svg width="100%" height="100%">
            <g
              transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
            >
              {links.map((link, idx) => renderLink(link, idx))}
              {nodes.map((node) => (
                <foreignObject
                  key={node.id}
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

      <Card>
        <SectionTitle>Análise de Linhagem</SectionTitle>
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 text-sm">
              Estrutura Genealógica
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Visualização vertical ascendente completa. A árvore foi ajustada
              para centralizar automaticamente e exibir até a 4ª geração de
              ancestrais.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
