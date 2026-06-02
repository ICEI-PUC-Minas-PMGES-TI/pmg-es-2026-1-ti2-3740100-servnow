import { useEffect, useMemo, useState } from "react";
import { BarChart3, Percent, PieChart, Target, TrendingUp, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  buscarIndicadoresPrestador,
  type IndicadorPrestadorResponse,
  type IndicadorSeriePonto,
  type PeriodoIndicador,
} from "../../../../services/indicadores";
import { getValidAuthSession } from "../../../../services/auth";
import { formatarMoedaBrl } from "../../../../utils/formatarMoeda";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";

type TipoIndicador = "ganhos" | "efetividade" | "participacao_plataforma" | "participacao_categoria";

const CORES_CATEGORIA = ["#38bdf8", "#14b8a6", "#f59e0b", "#a78bfa", "#f472b6", "#94a3b8"];

const INDICADORES: Array<{ id: TipoIndicador; label: string }> = [
  { id: "ganhos", label: "Receita propria" },
  { id: "efetividade", label: "Serviços na plataforma" },
  { id: "participacao_plataforma", label: "Participacao na plataforma" },
  { id: "participacao_categoria", label: "Por tipo de serviço" },
];

function formatarPercentual(valor: number): string {
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function nomeTipoServico(tipo: string): string {
  return TIPOS_SERVICO_MAP[tipo]?.nome ?? tipo;
}

const ALTURA_AREA_BARRAS = 220;
const ESPACO_ROTULO_VALOR = 48;

function valorBarra(item: IndicadorSeriePonto, modo: "moeda" | "percentual"): number {
  return modo === "percentual" ? (item.percentual ?? 0) : item.valor;
}

function rotuloBarra(item: IndicadorSeriePonto, modo: "moeda" | "percentual"): string {
  const valor = valorBarra(item, modo);
  if (valor <= 0) {
    return "-";
  }
  return modo === "percentual"
    ? formatarPercentual(valor)
    : valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function alturaBarraPx(valor: number, maxValor: number): number {
  if (valor <= 0) {
    return 4;
  }
  const proporcao = valor / maxValor;
  return Math.max(Math.round(proporcao * ALTURA_AREA_BARRAS), 16);
}

function ganhoPlataformaDoPonto(item: IndicadorSeriePonto): number {
  const pct = item.percentual ?? 0;
  if (pct <= 0 || item.valor <= 0) {
    return 0;
  }
  return (item.valor / pct) * 100;
}

function totalPlataformaDoPonto(item: IndicadorSeriePonto): number {
  const pct = item.percentual ?? 0;
  if (pct <= 0 || item.valor <= 0) {
    return 0;
  }
  return Math.round((item.valor * 100) / pct);
}

function formatarQuantidade(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

function GraficoBarras({
  dados,
  modo,
  ariaLabel,
}: {
  dados: IndicadorSeriePonto[];
  modo: "moeda" | "percentual";
  ariaLabel: string;
}) {
  const maxValor = useMemo(() => {
    const valores = dados.map((item) => valorBarra(item, modo));
    return Math.max(...valores, 1);
  }, [dados, modo]);

  return (
    <div className="painel-gráfico" aria-label={ariaLabel}>
      {dados.map((item, indice) => {
        const valorExibido = valorBarra(item, modo);
        const rotuloValor = rotuloBarra(item, modo);
        const alturaPx = alturaBarraPx(valorExibido, maxValor);

        return (
          <div
            key={`${item.label}-${indice}`}
            className="painel-gráfico-coluna"
            style={{ minHeight: ALTURA_AREA_BARRAS + ESPACO_ROTULO_VALOR + 28 }}
          >
            <span className="painel-gráfico-valor">{rotuloValor}</span>
            <div className="painel-gráfico-area" style={{ height: ALTURA_AREA_BARRAS }}>
              <div
                className="painel-gráfico-barra"
                style={{ height: alturaPx }}
                title={`${item.label}: ${rotuloValor}`}
              />
            </div>
            <span className="painel-gráfico-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

type PontoComparativo = IndicadorSeriePonto & { totalPlataforma: number };

function GraficoComparativoDuplo({
  dados,
  valorVocePeriodo,
  valorPlataformaPeriodo,
  derivarTotalPlataforma,
  formatarValor,
  rotuloVoce,
  rotuloPlataforma,
  legendaVoce,
  legendaPlataforma,
  ariaLabel,
  tituloVoce,
  tituloPlataforma,
}: {
  dados: IndicadorSeriePonto[];
  valorVocePeriodo: number;
  valorPlataformaPeriodo: number;
  derivarTotalPlataforma: (item: IndicadorSeriePonto) => number;
  formatarValor: (valor: number) => string;
  rotuloVoce: string;
  rotuloPlataforma: string;
  legendaVoce: string;
  legendaPlataforma: string;
  ariaLabel: string;
  tituloVoce: string;
  tituloPlataforma: string;
}) {
  const pontos = useMemo<PontoComparativo[]>(
    () => dados.map((item) => ({
      ...item,
      totalPlataforma: derivarTotalPlataforma(item),
    })),
    [dados, derivarTotalPlataforma],
  );

  const maxValor = useMemo(() => {
    const valores = pontos.flatMap((item) => [item.valor, item.totalPlataforma]);
    return Math.max(...valores, 1);
  }, [pontos]);

  return (
    <div className="painel-gráfico-participacao">
      <div className="painel-gráfico-comparacao">
        <div className="painel-gráfico-comparacao-item painel-gráfico-comparacao-voce">
          <span className="painel-gráfico-comparacao-rótulo">{rotuloVoce}</span>
          <strong>{formatarValor(valorVocePeriodo)}</strong>
        </div>
        <div className="painel-gráfico-comparacao-item painel-gráfico-comparacao-plataforma">
          <span className="painel-gráfico-comparacao-rótulo">{rotuloPlataforma}</span>
          <strong>{formatarValor(valorPlataformaPeriodo)}</strong>
        </div>
      </div>

      <div className="painel-gráfico painel-gráfico-duplo" aria-label={ariaLabel}>
        {pontos.map((item, indice) => {
          const alturaVoce = alturaBarraPx(item.valor, maxValor);
          const alturaPlataforma = alturaBarraPx(item.totalPlataforma, maxValor);

          return (
            <div
              key={`${item.label}-${indice}`}
              className="painel-gráfico-coluna painel-gráfico-coluna-dupla"
              style={{ minHeight: ALTURA_AREA_BARRAS + ESPACO_ROTULO_VALOR + 32 }}
            >
              <div className="painel-gráfico-valores-duplos">
                <span className="painel-gráfico-valor">
                  {item.valor > 0 ? formatarValor(item.valor) : "-"}
                </span>
                <span className="painel-gráfico-valor">
                  {item.totalPlataforma > 0 ? formatarValor(item.totalPlataforma) : "-"}
                </span>
              </div>
              <div className="painel-gráfico-area-dupla" style={{ height: ALTURA_AREA_BARRAS }}>
                <div className="painel-gráfico-par">
                  <div className="painel-gráfico-area painel-gráfico-area-interna">
                    <div
                      className="painel-gráfico-barra painel-gráfico-barra-voce"
                      style={{ height: alturaVoce }}
                      title={`${tituloVoce}: ${formatarValor(item.valor)}`}
                    />
                  </div>
                </div>
                <div className="painel-gráfico-par">
                  <div className="painel-gráfico-area painel-gráfico-area-interna">
                    <div
                      className="painel-gráfico-barra painel-gráfico-barra-plataforma"
                      style={{ height: alturaPlataforma }}
                      title={`${tituloPlataforma}: ${formatarValor(item.totalPlataforma)}`}
                    />
                  </div>
                </div>
              </div>
              <span className="painel-gráfico-label">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="painel-gráfico-legenda" aria-hidden>
        <span className="painel-gráfico-legenda-item">
          <i className="painel-gráfico-legenda-cor painel-gráfico-barra-voce" />
          {legendaVoce}
        </span>
        <span className="painel-gráfico-legenda-item">
          <i className="painel-gráfico-legenda-cor painel-gráfico-barra-plataforma" />
          {legendaPlataforma}
        </span>
      </div>
    </div>
  );
}

function GraficoCategorias({
  categorias,
}: {
  categorias: IndicadorPrestadorResponse["participacaoPorCategoria"];
}) {
  const { fatiasRosca, maxReceita, totalReceita } = useMemo(() => {
    const total = categorias.reduce((soma, item) => soma + item.ganhoPrestador, 0);
    const max = Math.max(...categorias.map((item) => item.ganhoPrestador), 0);
    let acumulado = 0;
    const fatias = categorias.map((item, indice) => {
      const proporcao = total > 0 ? (item.ganhoPrestador / total) * 100 : 0;
      const inicio = acumulado;
      acumulado += proporcao;
      return `${CORES_CATEGORIA[indice % CORES_CATEGORIA.length]} ${inicio.toFixed(2)}% ${acumulado.toFixed(2)}%`;
    });
    return { fatiasRosca: fatias, maxReceita: max, totalReceita: total };
  }, [categorias]);

  if (categorias.length === 0) {
    return <p className="workspace-hint">Nenhuma receita por categoria no periodo atual.</p>;
  }

  const usarRosca = categorias.length <= 5 && totalReceita > 0;

  return (
    <div className="painel-indicadores-categoria">
      {usarRosca && (
        <div
          className="painel-indicadores-rosca"
          style={{ background: `conic-gradient(${fatiasRosca.join(", ")})` }}
          role="img"
          aria-label="Distribuicao da sua receita por tipo de serviço"
        />
      )}
      <ul className="painel-indicadores-categoria-lista">
        {categorias.map((item, indice) => {
          const fatiaReceita = totalReceita > 0 ? (item.ganhoPrestador / totalReceita) * 100 : 0;
          const larguraBarra = maxReceita > 0 ? (item.ganhoPrestador / maxReceita) * 100 : 0;

          return (
            <li key={item.tipoServico} className="painel-indicadores-categoria-item">
              <span
                className="painel-indicadores-categoria-cor"
                style={{ background: CORES_CATEGORIA[indice % CORES_CATEGORIA.length] }}
              />
              <div className="painel-indicadores-categoria-info">
                <strong>{nomeTipoServico(item.tipoServico)}</strong>
                <span>
                  {formatarPercentual(fatiaReceita)} da sua receita
                  {" · "}
                  {formatarPercentual(item.percentual)} do faturamento da categoria
                  {" · "}
                  {formatarMoedaBrl(item.ganhoPrestador)} de {formatarMoedaBrl(item.ganhoPlataforma)}
                </span>
              </div>
              <div className="painel-indicadores-categoria-barra">
                <span style={{ width: `${larguraBarra}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Metricas() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<PeriodoIndicador>("mes");
  const [indicador, setIndicador] = useState<TipoIndicador>("ganhos");
  const [dados, setDados] = useState<IndicadorPrestadorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const session = getValidAuthSession();
      if (!session?.token) {
        navigate("/login");
        return;
      }
      setIsLoading(true);
      try {
        const resposta = await buscarIndicadoresPrestador(periodo);
        setDados(resposta);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar Métricas.");
        setDados(null);
      } finally {
        setIsLoading(false);
      }
    }
    void carregar();
  }, [navigate, periodo]);

  const totalReceitaSerie = useMemo(
    () => (dados?.ganhosPropriosSerie ?? []).reduce((soma, item) => soma + item.valor, 0),
    [dados],
  );

  const resumo = useMemo(() => {
    if (!dados) {
      return { titulo: "", valor: "", detalhe: "", icone: Wallet };
    }
    switch (indicador) {
      case "efetividade":
        return {
          titulo: "Participacao nos serviços concluídos",
          valor: formatarPercentual(dados.efetividadePercentual),
          detalhe: `${dados.servicosConcluidos} seus servicos de ${dados.servicosConcluidosPlataforma} na plataforma`,
          icone: Target,
        };
      case "participacao_plataforma":
        return {
          titulo: "Participacao nos ganhos da plataforma",
          valor: formatarPercentual(dados.participacaoPlataformaPercentual),
          detalhe: `${formatarMoedaBrl(dados.ganhoPrestadorPeriodo)} de ${formatarMoedaBrl(dados.ganhoPlataformaPeriodo)} no periodo atual`,
          icone: Percent,
        };
      case "participacao_categoria":
        return {
          titulo: "Participacao por tipo de serviço",
          valor: dados.participacaoPorCategoria.length > 0
            ? formatarPercentual(
              dados.participacaoPorCategoria.reduce((maior, item) => (
                item.percentual > maior.percentual ? item : maior
              )).percentual,
            )
            : "—",
          detalhe: dados.participacaoPorCategoria.length > 0
            ? `Maior fatia: ${nomeTipoServico(dados.participacaoPorCategoria[0].tipoServico)}`
            : "Sem dados no período atual",
          icone: PieChart,
        };
      default:
        return {
          titulo: "Receita propria no período atual",
          valor: formatarMoedaBrl(dados.ganhosPropriosTotal),
          detalhe: periodo === "mes" ? "Mes corrente (pagos)" : "Dia corrente (pagos)",
          icone: Wallet,
        };
    }
  }, [dados, indicador, periodo]);

  const ResumoIcone = resumo.icone;

  return (
    <>
      <PainelSectionHeader
        eyebrow="Desempenho"
        title="Métricas"
        description="Compare sua receita, efetividade e participacao na plataforma por mes ou por semana."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Indicadores de desempenho</h2>
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

        <div className="painel-filtros painel-indicadores-toggle" style={{ marginBottom: 16 }}>
          {INDICADORES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`painel-filtro ${indicador === item.id ? "ativo" : ""}`}
              onClick={() => setIndicador(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <BarChart3 size={32} />
            </div>
            <p>Carregando metricas...</p>
          </div>
        ) : !dados ? (
          <div className="painel-vazio">
            <p>Nao foi possivel carregar as metricas.</p>
          </div>
        ) : (
          <>
            <div className="painel-stats-grid painel-stats-grid-compacto">
              <div className="painel-stat-card">
                <div className="painel-stat-icone">
                  <ResumoIcone size={22} />
                </div>
                <span className="painel-stat-label">{resumo.titulo}</span>
                <strong className="painel-stat-valor">{resumo.valor}</strong>
                <span className="painel-stat-detalhe">{resumo.detalhe}</span>
              </div>
              {indicador === "ganhos" && (
                <div className="painel-stat-card">
                  <div className="painel-stat-icone">
                    <TrendingUp size={22} />
                  </div>
                  <span className="painel-stat-label">Total na serie</span>
                  <strong className="painel-stat-valor">{formatarMoedaBrl(totalReceitaSerie)}</strong>
                  <span className="painel-stat-detalhe">
                    {periodo === "mes" ? "Ultimos 6 meses" : "Semana atual"}
                  </span>
                </div>
              )}
            </div>

            {indicador === "ganhos" && (
              <GraficoBarras
                dados={dados.ganhosPropriosSerie}
                modo="moeda"
                ariaLabel="Grafico de receita propria"
              />
            )}

            {indicador === "efetividade" && (
              <GraficoComparativoDuplo
                dados={dados.efetividadeSerie}
                valorVocePeriodo={dados.servicosConcluidos}
                valorPlataformaPeriodo={dados.servicosConcluidosPlataforma}
                derivarTotalPlataforma={totalPlataformaDoPonto}
                formatarValor={formatarQuantidade}
                rotuloVoce="Voce"
                rotuloPlataforma="Plataforma (total)"
                legendaVoce="Seus serviços concluídos"
                legendaPlataforma="Serviços concluídos na plataforma"
                ariaLabel="Grafico comparativo de serviços concluídos"
                tituloVoce="Voce"
                tituloPlataforma="Plataforma"
              />
            )}

            {indicador === "participacao_plataforma" && (
              <GraficoComparativoDuplo
                dados={dados.participacaoPlataformaSerie}
                valorVocePeriodo={dados.ganhoPrestadorPeriodo}
                valorPlataformaPeriodo={dados.ganhoPlataformaPeriodo}
                derivarTotalPlataforma={ganhoPlataformaDoPonto}
                formatarValor={formatarMoedaBrl}
                rotuloVoce="Voce"
                rotuloPlataforma="Plataforma (total)"
                legendaVoce="Sua receita"
                legendaPlataforma="Receita total da plataforma"
                ariaLabel="Grafico comparativo de receita na plataforma"
                tituloVoce="Voce"
                tituloPlataforma="Plataforma"
              />
            )}

            {indicador === "participacao_categoria" && (
              <GraficoCategorias categorias={dados.participacaoPorCategoria} />
            )}

            {indicador === "ganhos" && (
              <p className="workspace-hint" style={{ marginTop: 14 }}>
                Somente servicos com pagamento confirmado pelo cliente entram na receita.
              </p>
            )}
          </>
        )}
      </section>
    </>
  );
}

export default Metricas;
