import api from '../lib/api';

/**
 * Serviço para operações com búfalos
 */
const bufaloService = {
    /**
     * Lista todos os búfalos de uma propriedade
     * @param {string} idPropriedade - ID da propriedade
     * @param {number} page - Número da página
     * @param {number} limit - Limite por página
     */
    async getBufalosByPropriedade(idPropriedade, page = 1, limit = 100) {
        try {
            const response = await api.get(
                `/bufalos/propriedade/${idPropriedade}?page=${page}&limit=${limit}`
            );
            return response;
        } catch (error) {
            if (error.response?.status === 404) {
                return { data: [], meta: { total: 0 } };
            }
            throw error;
        }
    },

    /**
     * Lista búfalos de um grupo específico
     * @param {string} idPropriedade - ID da propriedade
     * @param {string} idGrupo - ID do grupo
     * @param {number} page - Número da página
     * @param {number} limit - Limite por página
     */
    async getBufalosByGrupo(idPropriedade, idGrupo, page = 1, limit = 100) {
        try {
            const response = await api.get(
                `/bufalos/propriedade/${idPropriedade}?page=${page}&limit=${limit}`
            );

            // Filtra localmente por grupo
            if (response?.data) {
                const bufalosDoGrupo = response.data.filter(
                    (bufalo) => bufalo.id_grupo === idGrupo
                );
                return {
                    data: bufalosDoGrupo,
                    meta: {
                        ...response.meta,
                        total: bufalosDoGrupo.length,
                    },
                };
            }

            return { data: [], meta: { total: 0 } };
        } catch (error) {
            if (error.response?.status === 404) {
                return { data: [], meta: { total: 0 } };
            }
            throw error;
        }
    },
};

export default bufaloService;
