import { useMemo, useState } from "react";
import { Calendar, CheckCircle, DollarSign, History as HistoryIcon } from "lucide-react";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";

type FiltroHistorico = "mes" | "semana";

type ServicoHistorico = {
  id: number;
  titulo: string;
  categoria: string;
  prestador: string;
  data: string;
  valor: number;
  periodo: FiltroHistorico[];
};

const SERVICOS: ServicoHistorico[] = [
  {
    id: 1,
    titulo: "Vazamento na pia da cozinha",
    categoria: "Hidraulica",
    prestador: "Ana Paula",
    data: "06/05/2026",
    valor: 180,
    periodo: ["mes", "semana"],
  },
  {
    id: 2,
    titulo: "Troca de tomada da sala",
    categoria: "Eletrica",
    prestador: "Joao Pereira",
    data: "02/05/2026",
    valor: 90,
    periodo: ["mes"],
  },
  {
    id: 3,
    titulo: "Montagem de guarda-roupa",
    categoria: "Montagem de moveis",
    prestador: "Pedro Henrique",
    data: "28/04/2026",
    valor: 210,
    periodo: ["mes"],
  },
];

const FILTROS: Array<{ id: FiltroHistorico; label: string }> = [
  { id: "mes", label: "Este mes" },
  { id: "semana", label: "Esta semana" },
];

export function Historico() {
  const [filtro, setFiltro] = useState<FiltroHistorico>("mes");

  const lista = useMemo(
    () => SERVICOS.filter((item) => item.periodo.includes(filtro)),
    [filtro],
  );

  const totalServicos = lista.length;
  const totalGasto = lista.reduce((soma, item) => soma + item.valor, 0);

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
            <strong className="painel-stat-valor">{totalServicos}</strong>
          </div>

          <div className="painel-stat-card">
            <div className="painel-stat-icone">
              <DollarSign size={22} />
            </div>
            <span className="painel-stat-label">Total de gasto</span>
            <strong className="painel-stat-valor">
              {totalGasto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </strong>
          </div>
        </div>
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Servicos concluidos</h2>
        </div>

        {lista.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <HistoryIcon size={32} />
            </div>
            <p>Nenhum servico concluido no periodo selecionado.</p>
          </div>
        ) : (
          <div className="painel-lista">
            {lista.map((item) => (
              <div key={item.id} className="painel-lista-item">
                <div className="painel-lista-item-info">
                  <p className="painel-lista-item-titulo">{item.titulo}</p>
                  <div className="painel-lista-item-meta">
                    <span className="painel-lista-item-meta-detalhe">{item.categoria}</span>
                    <span className="painel-lista-item-meta-detalhe">{item.prestador}</span>
                    <span className="painel-lista-item-meta-detalhe">
                      <Calendar size={13} /> {item.data}
                    </span>
                    <span className="painel-lista-item-meta-detalhe">
                      {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>
                <div className="painel-lista-item-acoes">
                  <span className="painel-status concluido">Concluido</span>
                  <button type="button" className="painel-btn-ghost">Ver detalhes</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Historico;
