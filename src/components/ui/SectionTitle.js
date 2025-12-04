// Título de seção padrão
export default function SectionTitle({ children }) {
  return (
    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
      {children}
    </h3>
  );
}
