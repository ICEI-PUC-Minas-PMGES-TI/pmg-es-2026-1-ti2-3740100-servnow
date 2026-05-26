import { useState } from "react";
import { CheckCircle, DollarSign, History as HistoryIcon } from "lucide-react";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";

type FiltroHistorico = "mes" | "semana";

const FILTROS: Array<{ id: FiltroHistorico; label: string }> = [
  { id: "mes", label: "Este mes" },
  { id: "semana", label: "Esta semana" },
];

export function Historico() {
  const [filtro, setFiltro] = useState<FiltroHistorico>("mes");

  return (
    <>
      <PainelSectionHeader
        eyebrow="Resumo"
        title="Historico"
        description="Servicos concluidos e gastos do periodo selecionado."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Filtros</h2>
          <div className="painel-filtros">
            {FILTROS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`painel-filtro ${filtro === item.id ? "ativo" : ""}`}
                onClick={() => setFiltro(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="painel-stats-grid">
          <div className="painel-stat-card">
            <div className="painel-stat-icone">
              <CheckCircle size={22} />
            </div>
            <span className="painel-stat-label">Total de servicos</span>
            <strong className="painel-stat-valor">—</strong>
            <span className="painel-stat-detalhe">Em breve</span>
          </div>

          <div className="painel-stat-card">
            <div className="painel-stat-icone">
              <DollarSign size={22} />
            </div>
            <span className="painel-stat-label">Total de gasto</span>
            <strong className="painel-stat-valor">—</strong>
            <span className="painel-stat-detalhe">Em breve</span>
          </div>
        </div>
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Servicos concluidos</h2>
        </div>

        <div className="painel-vazio">
          <div className="painel-vazio-icone">
            <HistoryIcon size={32} />
          </div>
          <p>Nenhum servico concluido para exibir.</p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--workspace-muted)" }}>
            O historico e os totais serao calculados automaticamente quando houver servicos finalizados.
          </p>
        </div>
      </section>
    </>
  );
}

export default Historico;
