import React from 'react';
import { FiInbox } from 'react-icons/fi';
import Button from './Button';

/**
 * Componente padrão para estados vazios
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Ícone a ser exibido (opcional, default: FiInbox)
 * @param {string} props.title - Título principal
 * @param {string} props.description - Descrição explicativa
 * @param {string} props.buttonText - Texto do botão de ação (opcional)
 * @param {Function} props.onButtonClick - Função chamada ao clicar no botão (opcional)
 * @param {string} props.buttonVariant - Variante do botão (default: 'primary')
 * @param {string} props.buttonSize - Tamanho do botão (default: 'small')
 * @param {string} props.className - Classes adicionais para o container
 * @param {boolean} props.compact - Se true, usa padding reduzido
 */
export default function EmptyState({
    icon: Icon = FiInbox,
    title = 'Nenhum dado encontrado',
    description = '',
    buttonText = '',
    onButtonClick,
    buttonVariant = 'primary',
    buttonSize = 'small',
    className = '',
    compact = false,
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-12'
                } ${className}`}
        >
            {/* Ícone */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center border-2 border-amber-100 mb-4">
                <Icon className="w-7 h-7 text-[#ce7d0a]" />
            </div>

            {/* Título */}
            <h3 className="text-base font-bold text-slate-700 mb-1">{title}</h3>

            {/* Descrição */}
            {description && (
                <p className="text-sm text-slate-400 max-w-sm mb-5">{description}</p>
            )}

            {/* Botão de ação (opcional) */}
            {buttonText && (
                <Button
                    variant={buttonVariant}
                    size={buttonSize}
                    onClick={onButtonClick}
                >
                    {buttonText}
                </Button>
            )}
        </div>
    );
}
