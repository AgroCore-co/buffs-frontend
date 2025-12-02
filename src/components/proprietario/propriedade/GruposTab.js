import DashboardContainer from "@/components/ui/DashboardContainer";
import Table from "@/components/table/Table";

export default function GruposTab({ grupos, nivelLabel }) {
  const columns = [
    { key: "id_grupo", label: "ID", className: "text-center" },
    { key: "nome_grupo", label: "Nome", className: "text-center" },
    { key: "color", label: "Cor", className: "text-center" },
    { key: "nivel_maturidade", label: "Nível", className: "text-center" },
    { key: "created_at", label: "Desde", className: "text-center" },
    { key: "dias_no_local", label: "Dias no Local", className: "text-center" },
  ];

  return (
    <DashboardContainer>
      <Table
        columns={columns}
        data={grupos}
        minWidth="700px"
        renderCell={(grupo, key) => {
          if (key === "color") {
            return (
              <span
                className="inline-block w-4 h-4 rounded-full border border-gray-300 mx-auto"
                style={{ backgroundColor: grupo.color || "#444444" }}
              ></span>
            );
          }
          if (key === "nivel_maturidade") {
            return nivelLabel(grupo.nivel_maturidade);
          }
          if (key === "created_at") {
            return grupo.created_at ? new Date(grupo.created_at).toLocaleDateString("pt-BR") : "-";
          }
          if (key === "dias_no_local") {
            return grupo.dias_no_local ?? "-";
          }
          return grupo[key];
        }}
      />
    </DashboardContainer>
  );
}
