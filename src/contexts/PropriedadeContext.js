'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { propriedadeService } from '@/services/propriedade.service';
import { useAuth } from './AuthContext';

const PropriedadeContext = createContext({});

export function PropriedadeProvider({ children }) {
  const { user } = useAuth();
  const [propriedades, setPropriedades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Opcional: manter estado da propriedade selecionada globalmente
  const [propriedadeSelecionada, setPropriedadeSelecionada] = useState(null);

  const fetchPropriedades = useCallback(async () => {
    if (!user) {
      setPropriedades([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Ajuste conforme a resposta da sua API
      // O user-request mostrou que retorna um objeto { message, total, propriedades: [] }
      const res = await propriedadeService.getAllPropriedades();

      // Tratamento robusto para diferentes formatos de resposta
      const lista =
        res.propriedades || res.data || (Array.isArray(res) ? res : []);

      setPropriedades(lista);
    } catch (err) {
      console.error('Erro ao buscar propriedades:', err);
      setError('Falha ao carregar propriedades.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carrega propriedades sempre que o usuário mudar (login/logout)
  useEffect(() => {
    fetchPropriedades();
  }, [fetchPropriedades]);

  // Recupera seleção salva ou seleciona a primeira automaticamente
  useEffect(() => {
    if (propriedades.length > 0 && !propriedadeSelecionada) {
      const savedId = localStorage.getItem('propriedadeSelecionadaId');
      const savedProp = savedId
        ? propriedades.find(
            (p) => (p.idPropriedade || p.id_propriedade) === savedId
          )
        : null;

      if (savedProp) {
        setPropriedadeSelecionada(savedProp);
      } else {
        setPropriedadeSelecionada(propriedades[0]);
      }
    }
  }, [propriedades, propriedadeSelecionada]);

  // Função para selecionar uma propriedade (útil para persistir navegação)
  const selecionarPropriedade = (id) => {
    const prop = propriedades.find(
      (p) => (p.idPropriedade || p.id_propriedade) === id
    );
    setPropriedadeSelecionada(prop || null);
    if (prop) {
      localStorage.setItem('propriedadeSelecionadaId', id);
    }
  };

  return (
    <PropriedadeContext.Provider
      value={{
        propriedades,
        propriedadeSelecionada,
        loading,
        error,
        fetchPropriedades,
        selecionarPropriedade,
        setPropriedadeSelecionada,
      }}
    >
      {children}
    </PropriedadeContext.Provider>
  );
}

export const usePropriedade = () => {
  const context = useContext(PropriedadeContext);
  if (!context) {
    throw new Error(
      'usePropriedade deve ser usado dentro de um PropriedadeProvider'
    );
  }
  return context;
};
