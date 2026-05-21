import React from "react";

export type Step = {
  label: string;
  status?: "completed" | "active" | "upcoming";
};

export interface StepperProps {
  steps: Step[];
  current: number; // índice do passo atual (0-based)
  className?: string;
}

export function Stepper({ steps, current, className = "" }: StepperProps) {
  return (
    <div role="list" className={`flex items-center ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = idx < current;
        const isActive = idx === current;
        const isUpcoming = idx > current;

        // Base do círculo
        const circleBase =
          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 border-2 transition-all duration-500 ease-in-out shrink-0";

        // Estilos do Círculo
        let circleState = "";
        if (isActive) {
          // ATUAL: Fundo escuro da paleta, texto claro, tamanho maior e sombra
          circleState =
            "bg-[var(--color-primary-dark)] text-[var(--color-text-light)] border-[var(--color-primary-dark)] scale-110 shadow-md";
        } else if (isCompleted) {
          // CONCLUÍDO: Fundo transparente, borda/texto na cor principal, opacidade reduzida
          circleState =
            "bg-background text-[var(--color-primary-dark)] border-[var(--color-primary-dark)] opacity-50";
        } else if (isUpcoming) {
          // FUTURO: Cor da borda padrão, texto apagado
          circleState =
            "bg-background text-muted-foreground border-border opacity-40";
        }

        // Estilos do Texto
        let textState =
          "ml-2 text-sm transition-all duration-300 whitespace-nowrap ";
        if (isActive) {
          textState += "text-[var(--color-primary-dark)] font-bold scale-105 origin-left";
        } else if (isCompleted) {
          textState += "text-muted-foreground font-medium opacity-60";
        } else {
          textState += "text-muted-foreground font-medium opacity-40";
        }

        // Estilos da Linha Conectora
        const lineBase =
          "flex-1 h-[2px] mx-4 transition-colors duration-500 ease-in-out min-w-[20px]";
        const lineState = isCompleted
          ? "bg-[var(--color-primary-dark)] opacity-40"
          : "bg-border opacity-30";

        return (
          <React.Fragment key={step.label}>
            <div role="listitem" aria-current={isActive ? "step" : undefined} className="flex items-center">
              <div className={`${circleBase} ${circleState}`}>
                {idx + 1}
              </div>
              <span className={textState}>{step.label}</span>
            </div>

            {/* Linha de conexão (exceto no último item) */}
            {idx < steps.length - 1 && (
              <div className={`${lineBase} ${lineState}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}