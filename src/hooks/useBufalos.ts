// ==========================================
// Imports e Query Keys
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bufalosService,
  CreateBufaloDTO,
  UpdateBufaloDTO,
  MoverGrupoDTO,
  InativarBufaloDTO,
  FiltroAvancadoParams,
  SexoBufalo,
  NivelMaturidade,
  CategoriaBufalo,
} from '@/services/bufalos.service';

// ==========================================
// CHAVES DE CACHE
// ==========================================

export const BUFALOS_QUERY_KEYS = {
  all: ['bufalos'] as const,
  lists: () => ['bufalos', 'list'] as const,
  list: (page: number, limit: number) =>
    [...BUFALOS_QUERY_KEYS.lists(), page, limit] as const,
  byPropriedade: (idPropriedade: string, page: number, limit: number) =>
    ['bufalos', 'propriedade', idPropriedade, page, limit] as const,
  byGrupo: (idGrupo: string, page: number, limit: number) =>
    ['bufalos', 'grupo', idGrupo, page, limit] as const,
  byCategoria: (categoria: CategoriaBufalo) =>
    ['bufalos', 'categoria', categoria] as const,
  byMicrochip: (microchip: string) =>
    ['bufalos', 'microchip', microchip] as const,
  byId: (id: string) => ['bufalos', id] as const,
  deleted: ['bufalos', 'deleted'] as const,
  filtroAvancado: (idPropriedade: string, params: FiltroAvancadoParams) =>
    ['bufalos', 'filtro', 'avancado', idPropriedade, params] as const,
  filtroRaca: (idRaca: string, idPropriedade: string, page: number, limit: number) =>
    ['bufalos', 'filtro', 'raca', idRaca, idPropriedade, page, limit] as const,
  filtroRacaBrinco: (idRaca: string, idPropriedade: string, brinco: string, page: number, limit: number) =>
    ['bufalos', 'filtro', 'raca', idRaca, idPropriedade, 'brinco', brinco, page, limit] as const,
  filtroRacaStatus: (idRaca: string, idPropriedade: string, status: boolean, page: number, limit: number) =>
    ['bufalos', 'filtro', 'raca', idRaca, idPropriedade, 'status', status, page, limit] as const,
  filtroSexo: (sexo: SexoBufalo, idPropriedade: string, page: number, limit: number) =>
    ['bufalos', 'filtro', 'sexo', sexo, idPropriedade, page, limit] as const,
  filtroSexoBrinco: (sexo: SexoBufalo, idPropriedade: string, brinco: string, page: number, limit: number) =>
    ['bufalos', 'filtro', 'sexo', sexo, idPropriedade, 'brinco', brinco, page, limit] as const,
  filtroSexoStatus: (sexo: SexoBufalo, idPropriedade: string, status: boolean, page: number, limit: number) =>
    ['bufalos', 'filtro', 'sexo', sexo, idPropriedade, 'status', status, page, limit] as const,
  filtroMaturidade: (nivel: NivelMaturidade, idPropriedade: string, page: number, limit: number) =>
    ['bufalos', 'filtro', 'maturidade', nivel, idPropriedade, page, limit] as const,
  filtroMaturidadeBrinco: (nivel: NivelMaturidade, idPropriedade: string, brinco: string, page: number, limit: number) =>
    ['bufalos', 'filtro', 'maturidade', nivel, idPropriedade, 'brinco', brinco, page, limit] as const,
  filtroMaturidadeStatus: (nivel: NivelMaturidade, idPropriedade: string, status: boolean, page: number, limit: number) =>
    ['bufalos', 'filtro', 'maturidade', nivel, idPropriedade, 'status', status, page, limit] as const,
  filtroStatus: (status: boolean, idPropriedade: string, page: number, limit: number) =>
    ['bufalos', 'filtro', 'status', status, idPropriedade, page, limit] as const,
  filtroStatusBrinco: (status: boolean, idPropriedade: string, brinco: string, page: number, limit: number) =>
    ['bufalos', 'filtro', 'status', status, idPropriedade, 'brinco', brinco, page, limit] as const,
};

// ==========================================
// HOOKS INDIVIDUAIS DE QUERY — BUSCAS
// ==========================================

export function useBufalosAll(page: number = 1, limit: number = 10, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.list(page, limit),
    queryFn: () => bufalosService.getAll(page, limit),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useBufalo(id?: string) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.byId(id!),
    queryFn: () => bufalosService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useBufalosbyMicrochip(microchip?: string) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.byMicrochip(microchip!),
    queryFn: () => bufalosService.getByMicrochip(microchip!),
    enabled: !!microchip,
    staleTime: 2 * 60 * 1000,
  });
}

export function useBufalosbyPropriedade(
  idPropriedade?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.byPropriedade(idPropriedade!, page, limit),
    queryFn: () => bufalosService.getByPropriedade(idPropriedade!, page, limit),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useBufalosbyGrupo(
  idGrupo?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.byGrupo(idGrupo!, page, limit),
    queryFn: () => bufalosService.getByGrupo(idGrupo!, page, limit),
    enabled: !!idGrupo && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useBufalosbyCategoria(categoria?: CategoriaBufalo, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.byCategoria(categoria!),
    queryFn: () => bufalosService.getByCategoria(categoria!),
    enabled: !!categoria && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBufalosAllDeleted(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.deleted,
    queryFn: () => bufalosService.getAllDeleted(),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

// ==========================================
// HOOKS INDIVIDUAIS DE QUERY — FILTROS
// ==========================================

export function useBufalosFilterAvancado(
  idPropriedade?: string,
  params: FiltroAvancadoParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroAvancado(idPropriedade!, params),
    queryFn: () => bufalosService.filterAvancado(idPropriedade!, params),
    enabled: !!idPropriedade && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useBufalosFilterByRaca(
  idRaca?: string,
  idPropriedade?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroRaca(idRaca!, idPropriedade!, page, limit),
    queryFn: () => bufalosService.filterByRaca(idRaca!, idPropriedade!, page, limit),
    enabled: !!idRaca && !!idPropriedade && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useBufalosFilterByRacaEBrinco(
  idRaca?: string,
  idPropriedade?: string,
  brinco?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroRacaBrinco(idRaca!, idPropriedade!, brinco!, page, limit),
    queryFn: () => bufalosService.filterByRacaEBrinco(idRaca!, idPropriedade!, brinco!, page, limit),
    enabled: !!idRaca && !!idPropriedade && !!brinco && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useBufalosFilterByRacaEStatus(
  idRaca?: string,
  idPropriedade?: string,
  status?: boolean,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroRacaStatus(idRaca!, idPropriedade!, status!, page, limit),
    queryFn: () => bufalosService.filterByRacaEStatus(idRaca!, idPropriedade!, status!, page, limit),
    enabled: !!idRaca && !!idPropriedade && status !== undefined && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useBufalosFilterBySexo(
  sexo?: SexoBufalo,
  idPropriedade?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroSexo(sexo!, idPropriedade!, page, limit),
    queryFn: () => bufalosService.filterBySexo(sexo!, idPropriedade!, page, limit),
    enabled: !!sexo && !!idPropriedade && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useBufalosFilterBySexoEBrinco(
  sexo?: SexoBufalo,
  idPropriedade?: string,
  brinco?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroSexoBrinco(sexo!, idPropriedade!, brinco!, page, limit),
    queryFn: () => bufalosService.filterBySexoEBrinco(sexo!, idPropriedade!, brinco!, page, limit),
    enabled: !!sexo && !!idPropriedade && !!brinco && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useBufalosFilterBySexoEStatus(
  sexo?: SexoBufalo,
  idPropriedade?: string,
  status?: boolean,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroSexoStatus(sexo!, idPropriedade!, status!, page, limit),
    queryFn: () => bufalosService.filterBySexoEStatus(sexo!, idPropriedade!, status!, page, limit),
    enabled: !!sexo && !!idPropriedade && status !== undefined && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useBufalosFilterByMaturidade(
  nivelMaturidade?: NivelMaturidade,
  idPropriedade?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroMaturidade(nivelMaturidade!, idPropriedade!, page, limit),
    queryFn: () => bufalosService.filterByMaturidade(nivelMaturidade!, idPropriedade!, page, limit),
    enabled: !!nivelMaturidade && !!idPropriedade && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useBufalosFilterByMaturidadeEBrinco(
  nivelMaturidade?: NivelMaturidade,
  idPropriedade?: string,
  brinco?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroMaturidadeBrinco(nivelMaturidade!, idPropriedade!, brinco!, page, limit),
    queryFn: () => bufalosService.filterByMaturidadeEBrinco(nivelMaturidade!, idPropriedade!, brinco!, page, limit),
    enabled: !!nivelMaturidade && !!idPropriedade && !!brinco && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useBufalosFilterByMaturidadeEStatus(
  nivelMaturidade?: NivelMaturidade,
  idPropriedade?: string,
  status?: boolean,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroMaturidadeStatus(nivelMaturidade!, idPropriedade!, status!, page, limit),
    queryFn: () => bufalosService.filterByMaturidadeEStatus(nivelMaturidade!, idPropriedade!, status!, page, limit),
    enabled: !!nivelMaturidade && !!idPropriedade && status !== undefined && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useBufalosFilterByStatus(
  status?: boolean,
  idPropriedade?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroStatus(status!, idPropriedade!, page, limit),
    queryFn: () => bufalosService.filterByStatus(status!, idPropriedade!, page, limit),
    enabled: !!idPropriedade && status !== undefined && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

export function useBufalosFilterByStatusEBrinco(
  status?: boolean,
  idPropriedade?: string,
  brinco?: string,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BUFALOS_QUERY_KEYS.filtroStatusBrinco(status!, idPropriedade!, brinco!, page, limit),
    queryFn: () => bufalosService.filterByStatusEBrinco(status!, idPropriedade!, brinco!, page, limit),
    enabled: !!idPropriedade && !!brinco && status !== undefined && options?.enabled !== false,
    staleTime: 1 * 60 * 1000,
  });
}

// ==========================================
// HOOK DE MUTAÇÕES DE BÚFALOS
// ==========================================

export function useBufalos() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateBufaloDTO) => bufalosService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bufalos', 'propriedade', variables.idPropriedade] });
      queryClient.invalidateQueries({ queryKey: BUFALOS_QUERY_KEYS.lists() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBufaloDTO }) =>
      bufalosService.update(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: BUFALOS_QUERY_KEYS.byId(id) });
      if (data.idPropriedade) {
        queryClient.invalidateQueries({ queryKey: ['bufalos', 'propriedade', data.idPropriedade] });
      }
      queryClient.invalidateQueries({ queryKey: ['bufalos', 'filtro'] });
      queryClient.invalidateQueries({ queryKey: BUFALOS_QUERY_KEYS.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bufalosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUFALOS_QUERY_KEYS.all });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => bufalosService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUFALOS_QUERY_KEYS.all });
    },
  });

  const moverGrupoMutation = useMutation({
    mutationFn: (data: MoverGrupoDTO) => bufalosService.moverGrupo(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bufalos', 'grupo'] });
      queryClient.invalidateQueries({ queryKey: ['bufalos', 'filtro'] });
      response.animais.forEach(({ idBufalo }) => {
        queryClient.invalidateQueries({ queryKey: BUFALOS_QUERY_KEYS.byId(idBufalo) });
      });
    },
  });

  const inativarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InativarBufaloDTO }) =>
      bufalosService.inativar(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BUFALOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: ['bufalos', 'filtro'] });
      queryClient.invalidateQueries({ queryKey: BUFALOS_QUERY_KEYS.lists() });
    },
  });

  const reativarMutation = useMutation({
    mutationFn: (id: string) => bufalosService.reativar(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: BUFALOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: ['bufalos', 'filtro'] });
      queryClient.invalidateQueries({ queryKey: BUFALOS_QUERY_KEYS.lists() });
    },
  });

  const processarCategoriaMutation = useMutation({
    mutationFn: (id: string) => bufalosService.processarCategoria(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: BUFALOS_QUERY_KEYS.byId(id) });
      queryClient.invalidateQueries({ queryKey: ['bufalos', 'categoria'] });
    },
  });

  const processarCategoriaPropriedadeMutation = useMutation({
    mutationFn: (idPropriedade: string) => bufalosService.processarCategoriaPropriedade(idPropriedade),
    onSuccess: (_, idPropriedade) => {
      queryClient.invalidateQueries({ queryKey: ['bufalos', 'propriedade', idPropriedade] });
      queryClient.invalidateQueries({ queryKey: ['bufalos', 'categoria'] });
      queryClient.invalidateQueries({ queryKey: ['bufalos', 'filtro'] });
    },
  });

  return {
    createBufalo: createMutation.mutateAsync,
    isCreatingBufalo: createMutation.isPending,

    updateBufalo: updateMutation.mutateAsync,
    isUpdatingBufalo: updateMutation.isPending,

    deleteBufalo: deleteMutation.mutateAsync,
    isDeletingBufalo: deleteMutation.isPending,

    restoreBufalo: restoreMutation.mutateAsync,
    isRestoringBufalo: restoreMutation.isPending,

    moverGrupo: moverGrupoMutation.mutateAsync,
    isMovendoGrupo: moverGrupoMutation.isPending,

    inativarBufalo: inativarMutation.mutateAsync,
    isInativandoBufalo: inativarMutation.isPending,

    reativarBufalo: reativarMutation.mutateAsync,
    isReativandoBufalo: reativarMutation.isPending,

    processarCategoria: processarCategoriaMutation.mutateAsync,
    isProcessandoCategoria: processarCategoriaMutation.isPending,

    processarCategoriaPropriedade: processarCategoriaPropriedadeMutation.mutateAsync,
    isProcessandoCategoriaPropriedade: processarCategoriaPropriedadeMutation.isPending,
  };
}
