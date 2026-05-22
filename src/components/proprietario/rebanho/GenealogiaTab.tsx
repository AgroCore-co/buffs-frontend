"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dna, User, Crown } from "lucide-react";

import { bufalosService, Bufalo } from "@/services/bufalos.service";

// ─── Constantes de layout ──────────────────────────────────────────────────────

const CARD_W = 180;
const CARD_H = 90;
const LEVEL_H = 140;
const LEAF_W = 130;

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface TreeNode {
  id: string | null;
  nome: string;
  registro: string;
  sexo: string;
  pai?: TreeNode | null;
  mae?: TreeNode | null;
}

interface LayoutNode extends TreeNode {
  x: number;
  y: number;
  generation: number;
  role: string;
}

interface Link {
  source: { x: number; y: number };
  target: { x: number; y: number };
}

// ─── Helpers de layout ────────────────────────────────────────────────────────

function getRoleLabel(sexo: string, generation: number): string {
  if (generation === 0) return "Animal";
  if (generation === 1) return sexo === "M" ? "Pai" : "Mãe";
  if (generation === 2) return sexo === "M" ? "Avô" : "Avó";
  if (generation === 3) return sexo === "M" ? "Bisavô" : "Bisavó";
  return "Ancestral";
}

function calcLayout(
  node: TreeNode,
  generation: number,
  xCenter: number,
  totalWidth: number,
): { nodes: LayoutNode[]; links: Link[] } {
  const x = xCenter;
  const y = -(generation * LEVEL_H);
  const nodeData: LayoutNode = {
    ...node,
    x,
    y,
    generation,
    role: getRoleLabel(node.sexo ?? "", generation),
  };

  let nodes: LayoutNode[] = [nodeData];
  let links: Link[] = [];
  const offset = totalWidth / Math.pow(2, generation + 2);

  if (node.pai) {
    const r = calcLayout(node.pai, generation + 1, xCenter - offset, totalWidth);
    nodes = [...nodes, ...r.nodes];
    links = [...links, ...r.links, { source: { x, y }, target: { x: r.nodes[0].x, y: r.nodes[0].y } }];
  }
  if (node.mae) {
    const r = calcLayout(node.mae, generation + 1, xCenter + offset, totalWidth);
    nodes = [...nodes, ...r.nodes];
    links = [...links, ...r.links, { source: { x, y }, target: { x: r.nodes[0].x, y: r.nodes[0].y } }];
  }

  return { nodes, links };
}

// ─── Fetch recursivo fora do componente ──────────────────────────────────────

async function fetchGenealogyTree(rootId: string): Promise<TreeNode> {
  const cache = new Map<string, TreeNode | null>();

  async function fetchNode(id: string | null | undefined, depth: number): Promise<TreeNode | null> {
    if (!id || depth >= 2) return null;
    if (cache.has(id)) return cache.get(id)!;

    try {
      const data = await bufalosService.getById(id);
      if (!data) { cache.set(id, null); return null; }

      const pai = await fetchNode(data.idPai, depth + 1);
      const mae = await fetchNode(data.idMae, depth + 1);

      const node: TreeNode = {
        id: data.idBufalo,
        nome: data.nome,
        registro: data.registroDef ?? data.registroProv ?? data.brinco,
        sexo: data.sexo,
        pai,
        mae,
      };
      cache.set(id, node);
      return node;
    } catch {
      cache.set(id, null);
      return null;
    }
  }

  const root = await bufalosService.getById(rootId);
  if (!root) throw new Error("Búfalo não encontrado");

  const [pai, mae] = await Promise.all([
    fetchNode(root.idPai, 0),
    fetchNode(root.idMae, 0),
  ]);

  return {
    id: root.idBufalo,
    nome: root.nome,
    registro: root.registroDef ?? root.registroProv ?? root.brinco,
    sexo: root.sexo,
    pai,
    mae,
  };
}

// ─── NodeCard ─────────────────────────────────────────────────────────────────

function NodeCard({ node }: { node: LayoutNode }) {
  const isMale = node.sexo === "M";

  if (!node.id) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full rounded-xl border-2 border-dashed border-slate-100 bg-slate-50">
        <p className="text-[10px] text-slate-400 font-medium">Não informado</p>
      </div>
    );
  }

  const border    = isMale ? "border-blue-200 hover:border-blue-400" : "border-pink-200 hover:border-pink-400";
  const labelBg   = isMale ? "bg-blue-100 text-blue-700"             : "bg-pink-100 text-pink-700";
  const iconColor = isMale ? "text-blue-400"                          : "text-pink-400";

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full h-full rounded-xl border-2 bg-white shadow-sm transition-all hover:shadow-md cursor-pointer ${border}`}
    >
      <div className={`absolute -top-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white shadow-sm ${labelBg}`}>
        {node.role}
      </div>

      <div className="mb-1 mt-1">
        {node.generation === 0 ? (
          <Crown className="w-5 h-5 text-amber-500" />
        ) : (
          <User className={`w-4 h-4 ${iconColor}`} />
        )}
      </div>

      <div className="text-center w-full px-2">
        <p className="text-xs font-bold text-slate-800 truncate leading-tight" title={node.nome}>
          {node.nome}
        </p>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
          {node.registro || "S/ Reg"}
        </p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function GenealogiaTab({ bufalo }: { bufalo: Bufalo }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });

  const { data: treeData, isLoading } = useQuery({
    queryKey: ["genealogia-tree", bufalo.idBufalo],
    queryFn: () => fetchGenealogyTree(bufalo.idBufalo),
    staleTime: 10 * 60 * 1000,
    enabled: !!bufalo.idBufalo,
  });

  // Calcula o layout da árvore
  const { nodes, links, bounds } = useMemo(() => {
    if (!treeData) return { nodes: [] as LayoutNode[], links: [] as Link[], bounds: null };

    const totalWidth = Math.pow(2, 3) * LEAF_W;
    const layout = calcLayout(treeData, 0, 0, totalWidth);
    if (!layout.nodes.length) return { nodes: [] as LayoutNode[], links: [] as Link[], bounds: null };

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    layout.nodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const px = CARD_W / 2 + 40;
    const py = CARD_H / 2 + 40;

    return {
      ...layout,
      bounds: {
        minX: minX - px, maxX: maxX + px,
        minY: minY - py, maxY: maxY + py,
        width:  maxX - minX + px * 2,
        height: maxY - minY + py * 2,
      },
    };
  }, [treeData]);

  // Auto-centra a árvore no container
  const centerTree = useCallback(() => {
    if (!containerRef.current || !bounds) return;
    const { width: cW, height: cH } = containerRef.current.getBoundingClientRect();
    const scale = Math.min(cW / (bounds.width || 100), cH / (bounds.height || 100), 1.5) * 0.95;
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    setTransform({ x: cW / 2 - cx * scale, y: cH / 2 - cy * scale, k: scale });
  }, [bounds]);

  useEffect(() => {
    const t = setTimeout(centerTree, 100);
    window.addEventListener("resize", centerTree);
    return () => { clearTimeout(t); window.removeEventListener("resize", centerTree); };
  }, [centerTree, isLoading]);

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">

      {/* ── Cards de resumo ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-4">
          <div className="p-2.5 bg-amber-50 rounded-xl flex-shrink-0">
            <Dna className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Grau de Sangue</p>
            <p className="text-sm font-bold text-zinc-800">{bufalo.categoria ?? "SRD"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white border border-blue-100 rounded-xl p-4">
          <div className="p-2.5 bg-blue-50 rounded-xl flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Pai</p>
            <p className="text-sm font-bold text-zinc-800 truncate">
              {treeData?.pai?.nome ?? (isLoading ? "..." : "Não informado")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white border border-pink-100 rounded-xl p-4">
          <div className="p-2.5 bg-pink-50 rounded-xl flex-shrink-0">
            <User className="w-5 h-5 text-pink-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Mãe</p>
            <p className="text-sm font-bold text-zinc-800 truncate">
              {treeData?.mae?.nome ?? (isLoading ? "..." : "Não informado")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white border border-green-100 rounded-xl p-4">
          <div className="p-2.5 bg-green-50 rounded-xl flex-shrink-0">
            <Dna className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Consanguinidade</p>
            <p className="text-sm font-bold text-green-700">N/A</p>
          </div>
        </div>
      </div>

      {/* ── Árvore SVG ───────────────────────────────────────── */}
      <div
        className="relative bg-white border border-zinc-200 rounded-2xl overflow-hidden"
        style={{ height: 560 }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 rounded-2xl gap-2">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
            <span className="text-sm text-zinc-500 font-medium">Construindo árvore genealógica...</span>
          </div>
        )}

        <div ref={containerRef} className="w-full h-full">
          <svg width="100%" height="100%">
            <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>

              {/* Linhas de conexão */}
              {links.map((link, idx) => {
                const sX = link.source.x;
                const sY = link.source.y - CARD_H / 2;
                const tX = link.target.x;
                const tY = link.target.y + CARD_H / 2;
                const midY = (sY + tY) / 2;
                return (
                  <path
                    key={idx}
                    d={`M ${sX} ${sY} L ${sX} ${midY} L ${tX} ${midY} L ${tX} ${tY}`}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Nós (cards) */}
              {nodes.map((node) => (
                <foreignObject
                  key={node.id ?? `ph-${node.x}-${node.y}`}
                  x={node.x - CARD_W / 2}
                  y={node.y - CARD_H / 2}
                  width={CARD_W}
                  height={CARD_H}
                  className="overflow-visible"
                >
                  <NodeCard node={node} />
                </foreignObject>
              ))}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
