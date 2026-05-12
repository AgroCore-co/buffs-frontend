export interface Grupo {
  idGrupo: string;
  nomeGrupo: string;
  color: string;
  idPropriedade: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrupoFormData {
  nomeGrupo: string;
  color: string;
}

export interface GrupoMoveData {
  idLoteAtual: string;
  dtEntrada: string;
}
