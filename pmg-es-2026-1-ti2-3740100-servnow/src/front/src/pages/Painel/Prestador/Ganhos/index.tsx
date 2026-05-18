import { useMemo, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";

type PeriodoGanhos = "mes" | "semana";

type PontoGanho = {
  label: string;
  valor: number;
};

const GANHOS_MES: PontoGanho[] = [
  { label: "Jan", valor: 2100 },
  { label: "Fev", valor: 2450 },
  { label: "Mar", valor: 2880 },
  { label: "Abr", valor: 3120 },
  { label: "Mai", valor: 3840 },
];

const GANHOS_SEMANA: PontoGanho[] = [
  { label: "Seg", valor: 420 },
  { label: "Ter", valor: 680 },
  { label: "Qua", valor: 540 },
  { label: "Qui", valor: 910 },
  { label: "Sex", valor: 760 },
  { label: "Sab", valor: 1120 },
  { label: "Dom", valor: 410 },
];

export function Ganhos() {
  const [periodo, setPeriodo] = useState<PeriodoGanhos>("mes");

  const dados = periodo === "mes" ? GANHOS_MES : GANHOS_SEMANA;
  const total = useMemo(() => dados.reduce((soma, item) => soma + item.valor, 0), [dados]);
  const maxValor = useMemo(() => Math.max(...dados.map((item) => item.valor), 1), [dados]);

  return (
    <>
      <PainelSectionHeader
        eyebrow="Financeiro"
        title="Ganhos"
        description="Visualize seus ganhos por mes e por semana."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Resumo do periodo</h2>
          <div className="painel-filtros">
            <button
              type="button"
              className={`painel-filtro ${periodo === "mes" ? "ativo" : ""}`}
              onClick={() => setPeriodo("mes")}
            >
              Por mes
            </button>
            <button
              type="button"
              className={`painel-filtro ${periodo === "semana" ? "ativo" : ""}`}
              onClick={() => setPeriodo("semana")}
            >
              Por semana
            </button>
          </div>
        </div>

        <div className="painel-stats-grid painel-stats-grid-compacto">
          <div className="painel-stat-card">
            <div className="painel-stat-icone">
              <TrendingUp size={22} />
            </div>
            <span className="painel-stat-label">Total no periodo</span>
            <strong className="painel-stat-valor">
              {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </strong>
            <span className="painel-stat-detalhe">
              {periodo === "mes" ? "Ultimos 5 meses" : "Ultimos 7 dias"}
            </span>
          </div>
          <div className="painel-stat-card">
            <div className="painel-stat-icone">
              <BarChart3 size={22} />
            </div>
            <span className="painel-stat-label">Media</span>
            <strong className="painel-stat-valor">
              {(total / dados.length).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </strong>
            <span className="painel-stat-detalhe">Por {periodo === "mes" ? "mes" : "dia"}</span>
          </div>
        </div>

        <div className="painel-grafico" aria-label="Grafico de ganhos">
          {dados.map((item) => {
            const altura = Math.round((item.valor / maxValor) * 100);
            return (
              <div key={item.label} className="painel-grafico-coluna">
                <span className="painel-grafico-valor">
                  {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                </span>
                <div
                  className="painel-grafico-barra"
                  style={{ height: `${altura}%` }}
                  title={`${item.label}: ${item.valor}`}
                />
                <span className="painel-grafico-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default Ganhos;
