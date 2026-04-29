"use client";

import React, { useState, useRef } from "react";
import { useDataIngestion, useJobStatus } from "@/hooks/useDataIngestion";
import { ExportFiltersDTO } from "@/services/dataIngestion.service";
import { 
  UploadCloud, 
  DownloadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Milk,
  Scale,
  Dna
} from "lucide-react";

interface DataIngestionTabProps {
  idPropriedade: string;
}

type CategoryTab = "leite" | "pesagem" | "reproducao";

export default function DataIngestionTab({ idPropriedade }: DataIngestionTabProps) {
  // ==========================================================================
  // ESTADOS GERAIS
  // ==========================================================================
  const [activeTab, setActiveTab] = useState<CategoryTab>("leite");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filters, setFilters] = useState<ExportFiltersDTO>({});
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================================================
  // HOOKS E DADOS
  // ==========================================================================
  const {
    importLeite, isImportingLeite,
    importPesagem, isImportingPesagem,
    importReproducao, isImportingReproducao,
    exportLeite, isExportingLeite,
    exportPesagem, isExportingPesagem,
    exportReproducao, isExportingReproducao,
  } = useDataIngestion();

  // Polling automático do status do job (se existir um ativo)
  const { data: jobStatus, isLoading: isJobLoading } = useJobStatus(activeJobId);

  // ==========================================================================
  // HANDLERS DE IMPORTAÇÃO (UPLOAD)
  // ==========================================================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      // Limpa qualquer job anterior ao selecionar novo arquivo
      setActiveJobId(null); 
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      let res;
      if (activeTab === "leite") {
        res = await importLeite({ propriedadeId: idPropriedade, file: selectedFile });
      } else if (activeTab === "pesagem") {
        res = await importPesagem({ propriedadeId: idPropriedade, file: selectedFile });
      } else if (activeTab === "reproducao") {
        res = await importReproducao({ propriedadeId: idPropriedade, file: selectedFile });
      }
      
      if (res?.jobId) {
        setActiveJobId(res.jobId);
        setSelectedFile(null); // Limpa o input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erro ao importar planilha:", error);
    }
  };

  const isImporting = isImportingLeite || isImportingPesagem || isImportingReproducao;

  // ==========================================================================
  // HANDLERS DE EXPORTAÇÃO (DOWNLOAD)
  // ==========================================================================
  const handleExport = async () => {
    try {
      let blob: Blob | undefined;

      if (activeTab === "leite") {
        blob = await exportLeite({ propriedadeId: idPropriedade, filters });
      } else if (activeTab === "pesagem") {
        blob = await exportPesagem({ propriedadeId: idPropriedade, filters });
      } else if (activeTab === "reproducao") {
        blob = await exportReproducao({ propriedadeId: idPropriedade, filters });
      }

      if (blob) {
        // Força o download do arquivo binário no navegador
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `exportacao-${activeTab}-${new Date().toISOString().split("T")[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Erro ao exportar planilha:", error);
    }
  };

  const isExporting = isExportingLeite || isExportingPesagem || isExportingReproducao;

  // ==========================================================================
  // RENDERIZAÇÃO DE STATUS DO JOB
  // ==========================================================================
  const renderJobStatus = () => {
    if (!activeJobId || !jobStatus) return null;

    const { status, progress, result } = jobStatus;
    const isRunning = status === "pending" || status === "processing";

    return (
      <div className="mt-6 p-5 border border-zinc-200 rounded-xl bg-white shadow-sm animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isRunning && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
            {status === "completed" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {status === "failed" && <XCircle className="w-5 h-5 text-red-500" />}
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                {isRunning ? "Processando Planilha..." : status === "completed" ? "Importação Concluída" : "Falha na Importação"}
              </h3>
              <p className="text-xs text-zinc-500">ID da Tarefa: {activeJobId}</p>
            </div>
          </div>
          {isRunning && <span className="text-sm font-semibold text-blue-600">{(progress * 100).toFixed(0)}%</span>}
        </div>

        {isRunning && (
          <div className="w-full bg-zinc-100 rounded-full h-2 mb-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }}></div>
          </div>
        )}

        {status === "completed" && result && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-100">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Total de Linhas</span>
              <span className="text-lg font-semibold text-zinc-900">{result.totalRows}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-emerald-600 uppercase tracking-wider">Importados</span>
              <span className="text-lg font-semibold text-emerald-700">{result.imported}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-amber-600 uppercase tracking-wider">Ignorados / Alertas</span>
              <span className="text-lg font-semibold text-amber-700">{result.skipped}</span>
            </div>
          </div>
        )}

        {/* Lista de Erros e Alertas */}
        {result && (result.errors?.length > 0 || result.warnings?.length > 0) && (
          <div className="mt-4 flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {result.errors?.map((err, idx) => (
              <div key={`err-${idx}`} className="flex items-start gap-2 p-2 bg-red-50 text-red-700 rounded-lg text-xs">
                <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p><strong>Linha {err.row}</strong> ({err.field}): {err.message} <span className="opacity-70">[{err.value}]</span></p>
              </div>
            ))}
            {result.warnings?.map((warn, idx) => (
              <div key={`warn-${idx}`} className="flex items-start gap-2 p-2 bg-amber-50 text-amber-700 rounded-lg text-xs">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p><strong>Linha {warn.row}</strong> ({warn.field}): {warn.message} <span className="opacity-70">[{warn.value}]</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ==========================================================================
  // RENDERIZAÇÃO GERAL
  // ==========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER DA TAB */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Importação e Exportação de Dados</h2>
        <p className="text-sm text-zinc-500 mt-1">Carregue planilhas em lote ou baixe relatórios avançados em Excel (.xlsx).</p>
      </div>

      {/* SUB-TABS (Navegação Interna) */}
      <div className="flex items-center gap-6 border-b border-zinc-200">
        <button onClick={() => { setActiveTab("leite"); setActiveJobId(null); setFilters({}); }} className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === "leite" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}>
          <Milk className="w-4 h-4" /> Produção de Leite
          {activeTab === "leite" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 rounded-t-full" />}
        </button>
        <button onClick={() => { setActiveTab("pesagem"); setActiveJobId(null); setFilters({}); }} className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === "pesagem" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}>
          <Scale className="w-4 h-4" /> Pesagem Animal
          {activeTab === "pesagem" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 rounded-t-full" />}
        </button>
        <button onClick={() => { setActiveTab("reproducao"); setActiveJobId(null); setFilters({}); }} className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === "reproducao" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}>
          <Dna className="w-4 h-4" /> Reprodução
          {activeTab === "reproducao" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 rounded-t-full" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ========================================================================== */}
        {/* CARD DE IMPORTAÇÃO (UPLOAD) */}
        {/* ========================================================================== */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UploadCloud className="w-5 h-5 text-zinc-900" />
            <h3 className="text-base font-semibold text-zinc-900">Importar Planilha</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Envie um arquivo .xlsx de até 50MB seguindo o padrão de colunas da plataforma.</p>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${selectedFile ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'}`}
          >
            <FileSpreadsheet className={`w-8 h-8 mb-2 ${selectedFile ? 'text-emerald-500' : 'text-zinc-400'}`} />
            <span className="text-sm font-medium text-zinc-900">
              {selectedFile ? selectedFile.name : "Clique para selecionar um arquivo"}
            </span>
            <span className="text-xs text-zinc-500 mt-1">
              {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "ou arraste e solte aqui"}
            </span>
            <input 
              type="file" 
              accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <button
            onClick={handleImport}
            disabled={!selectedFile || isImporting || (activeJobId && jobStatus?.status !== 'completed' && jobStatus?.status !== 'failed')}
            className="w-full mt-4 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isImporting && <RefreshCw className="w-4 h-4 animate-spin" />}
            Iniciar Processamento ETL
          </button>

          {/* Renderização do Status do Job (Se houver) */}
          {renderJobStatus()}
        </div>

        {/* ========================================================================== */}
        {/* CARD DE EXPORTAÇÃO (DOWNLOAD) */}
        {/* ========================================================================== */}
        <div className="bg-zinc-50/50 border border-zinc-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DownloadCloud className="w-5 h-5 text-zinc-900" />
            <h3 className="text-base font-semibold text-zinc-900">Exportar Dados</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-6">Utilize os filtros abaixo para baixar um relatório consolidado em Excel.</p>

          <div className="space-y-4">
            {/* Filtro de Datas (Comum a todos) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700">Data Inicial</label>
                <input 
                  type="date" 
                  value={filters.de || ""}
                  onChange={(e) => setFilters({ ...filters, de: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700">Data Final</label>
                <input 
                  type="date" 
                  value={filters.ate || ""}
                  onChange={(e) => setFilters({ ...filters, ate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900" 
                />
              </div>
            </div>

            {/* Filtro de Maturidade (Comum a todos) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">Maturidade do Animal</label>
              <select 
                value={filters.maturidade || ""}
                onChange={(e) => setFilters({ ...filters, maturidade: e.target.value as ExportFiltersDTO['maturidade'] })}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
              >
                <option value="">Todas as maturidades</option>
                <option value="novilha">Novilha</option>
                <option value="primipara">Primípara</option>
                <option value="multipara">Multípara</option>
              </select>
            </div>

            {/* Filtros Específicos por Tab */}
            {activeTab === "pesagem" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700">Sexo</label>
                <select 
                  value={filters.sexo || ""}
                  onChange={(e) => setFilters({ ...filters, sexo: e.target.value as ExportFiltersDTO['sexo'] })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="">Ambos os sexos</option>
                  <option value="M">Macho (M)</option>
                  <option value="F">Fêmea (F)</option>
                </select>
              </div>
            )}

            {activeTab === "reproducao" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700">Tipo de Inseminação</label>
                <select 
                  value={filters.tipo || ""}
                  onChange={(e) => setFilters({ ...filters, tipo: e.target.value as ExportFiltersDTO['tipo'] })}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="">Todos os tipos</option>
                  <option value="MN">Monta Natural (MN)</option>
                  <option value="IA">Inseminação Artificial (IA)</option>
                  <option value="IATF">IATF</option>
                  <option value="TE">Transf. de Embrião (TE)</option>
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full mt-6 py-2.5 bg-white border border-zinc-300 text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-zinc-500" />
            ) : (
              <DownloadCloud className="w-4 h-4" />
            )}
            Gerar e Baixar Planilha
          </button>
        </div>

      </div>
    </div>
  );
}