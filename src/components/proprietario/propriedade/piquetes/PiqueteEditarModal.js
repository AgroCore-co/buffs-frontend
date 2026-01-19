import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import loteService from '../../../../services/lote.service';
import { FiSave, FiX, FiMapPin, FiInfo } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Importa o mapa com SSR desabilitado (Leaflet não funciona no server-side)
const MapaDesenhoLeaflet = dynamic(() => import('./MapaDesenhoLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center bg-slate-100 rounded-lg">
      <span className="text-slate-400">Carregando mapa...</span>
    </div>
  ),
});

/**
 * Modal para editar um piquete (lote) existente
 * @param {boolean} isOpen - Se o modal está aberto
 * @param {function} onClose - Função para fechar
 * @param {function} onSuccess - Callback após salvar com sucesso
 * @param {Array} grupos - Lista de grupos disponíveis
 * @param {Object} piquete - Piquete a ser editado
 * @param {Array} existingLotes - Lotes existentes para exibir como referência
 */
export default function PiqueteEditarModal({
  isOpen,
  onClose,
  onSuccess,
  grupos = [],
  piquete,
  existingLotes = [],
}) {
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome_lote: '',
    id_grupo: '',
    descricao: '',
    qtd_max: 50,
    status: 'ativo',
  });
  const [geoMapa, setGeoMapa] = useState(null);
  const [areaM2, setAreaM2] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carregar dados do piquete quando modal abre
  useEffect(() => {
    if (isOpen && piquete) {
      setFormData({
        nome_lote: piquete.nome_lote || '',
        id_grupo: piquete.id_grupo || '',
        descricao: piquete.descricao || '',
        qtd_max: piquete.qtd_max || 50,
        status: piquete.status || 'ativo',
      });
      setGeoMapa(piquete.geo_mapa || null);
      setAreaM2(piquete.area_m2 || 0);
      setError('');
    }
  }, [isOpen, piquete]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'qtd_max' ? parseInt(value) || 0 : value,
    }));
  };

  // Callback quando o polígono é editado no mapa
  const handlePolygonChange = useCallback((polygon, area) => {
    setGeoMapa(polygon);
    setAreaM2(area);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.nome_lote.trim()) {
      setError('Nome do piquete é obrigatório');
      return;
    }
    if (!formData.id_grupo) {
      setError('Selecione um grupo de manejo');
      return;
    }
    if (!geoMapa) {
      setError('Desenhe a área do piquete no mapa');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        geo_mapa: geoMapa,
        area_m2: areaM2,
      };

      await loteService.updateLote(piquete.id_lote, payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar piquete:', err);
      setError(err.message || 'Erro ao atualizar piquete. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Formata área para exibição
  const formatArea = (m2) => {
    if (m2 >= 10000) {
      return `${(m2 / 10000).toFixed(2)} ha`;
    }
    return `${m2.toLocaleString('pt-BR')} m²`;
  };

  // Opções de status
  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
    { value: 'manutencao', label: 'Em Manutenção' },
  ];

  // Opções de grupos
  const grupoOptions = grupos.map((g) => ({
    value: g.id_grupo,
    label: g.nome_grupo,
  }));

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={loading}>
        <FiX className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleSubmit} loading={loading}>
        <FiSave className="w-4 h-4 mr-2" />
        Salvar Alterações
      </Button>
    </>
  );

  if (!piquete) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar: ${piquete.nome_lote}`}
      description="Atualize as informações do piquete"
      size="xl"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mensagem de erro */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
            <FiInfo className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Grid de campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome do Piquete"
            name="nome_lote"
            value={formData.nome_lote}
            onChange={handleInputChange}
            placeholder="Ex: Pasto da Sede"
            required
          />

          <Select
            label="Grupo de Manejo"
            name="id_grupo"
            value={formData.id_grupo}
            onChange={handleInputChange}
            options={grupoOptions}
            placeholder="Selecione um grupo"
            required
          />

          <Input
            label="Descrição"
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            placeholder="Descrição opcional"
          />

          <Input
            label="Capacidade Máxima"
            name="qtd_max"
            type="number"
            min="1"
            value={formData.qtd_max}
            onChange={handleInputChange}
            placeholder="Qtd. de animais"
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={statusOptions}
          />

          {/* Área calculada */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Área do Piquete
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <FiMapPin className="w-4 h-4 text-[#ce7d0a]" />
              <span className="text-sm font-medium text-slate-700">
                {areaM2 > 0 ? formatArea(areaM2) : 'Desenhe no mapa'}
              </span>
            </div>
          </div>
        </div>

        {/* Mapa para editar o polígono */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Delimitação do Piquete
            <span className="text-slate-400 font-normal ml-2">
              (Clique para redesenhar a área)
            </span>
          </label>
          <div className="h-[400px] rounded-lg overflow-hidden border border-slate-200">
            <MapaDesenhoLeaflet
              initialPolygon={piquete.geo_mapa}
              onPolygonChange={handlePolygonChange}
              existingLotes={existingLotes}
              currentLoteId={piquete.id_lote}
              grupoColor={
                grupos.find((g) => g.id_grupo === formData.id_grupo)?.color ||
                '#ce7d0a'
              }
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
