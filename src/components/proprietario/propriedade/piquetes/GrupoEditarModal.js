import React, { useState, useEffect } from 'react';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import grupoService from '../../../../services/grupo.service';
import { FiSave, FiX, FiInfo } from 'react-icons/fi';

// Cores predefinidas para seleção
const PRESET_COLORS = [
    '#fe5d5d', '#feef48', '#4ade80', '#60a5fa', '#a78bfa',
    '#f472b6', '#fb923c', '#38bdf8', '#34d399', '#fbbf24',
];

/**
 * Modal para editar um grupo de manejo
 */
export default function GrupoEditarModal({
    isOpen,
    onClose,
    onSuccess,
    grupo,
}) {
    const [formData, setFormData] = useState({
        nome_grupo: '',
        color: PRESET_COLORS[0],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Carregar dados do grupo ao abrir
    useEffect(() => {
        if (isOpen && grupo) {
            setFormData({
                nome_grupo: grupo.nome_grupo || '',
                color: grupo.color || PRESET_COLORS[0],
            });
            setError('');
        }
    }, [isOpen, grupo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleColorSelect = (color) => {
        setFormData((prev) => ({ ...prev, color }));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setError('');

        if (!formData.nome_grupo.trim()) {
            setError('Nome do grupo é obrigatório');
            return;
        }

        setLoading(true);
        try {
            await grupoService.updateGrupo(grupo.id_grupo, {
                nome_grupo: formData.nome_grupo,
                color: formData.color,
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Erro ao atualizar grupo:', err);
            setError(err.message || 'Erro ao atualizar grupo. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!grupo) return null;

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Editar: ${grupo.nome_grupo}`}
            description="Atualize as informações do grupo"
            size="md"
            footer={footer}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                        <FiInfo className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <Input
                    label="Nome do Grupo"
                    name="nome_grupo"
                    value={formData.nome_grupo}
                    onChange={handleInputChange}
                    placeholder="Ex: Recria, Lactação, Secagem..."
                    required
                />

                {/* Seletor de cor */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cor do Grupo
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => handleColorSelect(color)}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${formData.color === color
                                        ? 'border-slate-800 scale-110 shadow-lg'
                                        : 'border-slate-200 hover:border-slate-400'
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Cor selecionada: <span className="font-mono">{formData.color}</span>
                    </p>
                </div>

                {/* Preview */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-400 uppercase font-medium mb-2">
                        Prévia
                    </p>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: formData.color }}
                        />
                        <span className="font-medium text-slate-800">
                            {formData.nome_grupo || 'Nome do grupo'}
                        </span>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
