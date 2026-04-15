import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

// Container padrão para elementos visuais
export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}