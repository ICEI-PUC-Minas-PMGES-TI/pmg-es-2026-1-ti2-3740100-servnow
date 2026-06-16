import { useEffect, useMemo, useState } from "react";
import { BarChart3, Percent, PieChart, Star, Target, TrendingUp, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  buscarIndicadoresPrestador,
  METAS_INDICADORES,
  type IndicadorPrestadorResponse,
  type IndicadorSeriePonto,
  type PeriodoIndicador,
} from "../../../../services/indicadores";
import { getValidAuthSession } from "../../../../services/auth";
import { formatarNotaAvaliacao, formatarQuantidadeAvaliacoes } from "../../../../utils/formatarAvaliacao";
import { formatarMoedaBrl } from "../../../../utils/formatarMoeda";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";

type TipoIndicador = "ganhos" | "avaliacao" | "efetividade" | "participacao_plataforma" | "participacao_categoria";

const CORES_CATEGORIA = ["#38bdf8", "#14b8a6", "#f59e0b", "#a78bfa", "#f472b6", "#94a3b8"];

const INDICADORES: Array<{ id: TipoIndicador; label: string }> = [
  { id: "ganhos", label: "Receita propria" },
  { id: "avaliacao", label: "Avaliacao media" },
  { id: "efetividade", label: "Efetividade" },
  { id: "participacao_plataforma", label: "Participacao na plataforma" },
  { id: "participacao_categoria", label: "Por tipo de serviço" },
];

function rotuloPeriodo(periodo: PeriodoIndicador): string {
  switch (periodo) {
    case "semana":
      return "Semana atual";
    case "ano":
      return "Ano corrente";
    default:
      return "Mes corrente";
  }
}

function rotuloSerie(periodo: PeriodoIndicador): string {
  switch (periodo) {
    case "semana":
      return "Semana atual";
    case "ano":
      return "Janeiro a dezembro do ano atual";
    default:
      return "Desde quando entrou na plataforma";
  }
}

function rotuloMeta(atingida: boolean): string {
  return atingida ? "Meta atingida" : "Meta nao atingida";
}

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
    <div className="painel-grafico" aria-label={ariaLabel}>
      {dados.map((item, indice) => {
        const valorExibido = valorBarra(item, modo);
        const rotuloValor = rotuloBarra(item, modo);
        const alturaPx = alturaBarraPx(valorExibido, maxValor);

        return (
          <div
            key={`${item.label}-${indice}`}
            className="painel-grafico-coluna"
            style={{ minHeight: ALTURA_AREA_BARRAS + ESPACO_ROTULO_VALOR + 28 }}
          >
            <span className="painel-grafico-valor">{rotuloValor}</span>
            <div className="painel-grafico-area" style={{ height: ALTURA_AREA_BARRAS }}>
              <div
                className="painel-grafico-barra"
                style={{ height: alturaPx }}
                title={`${item.label}: ${rotuloValor}`}
              />
            </div>
            <span className="painel-grafico-label">{item.label}</span>
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
    <div className="painel-grafico-participacao">
      <div className="painel-grafico-comparacao">
        <div className="painel-grafico-comparacao-item painel-grafico-comparacao-voce">
          <span className="painel-grafico-comparacao-rotulo">{rotuloVoce}</span>
          <strong>{formatarValor(valorVocePeriodo)}</strong>
        </div>
        <div className="painel-grafico-comparacao-item painel-grafico-comparacao-plataforma">
          <span className="painel-grafico-comparacao-rotulo">{rotuloPlataforma}</span>
          <strong>{formatarValor(valorPlataformaPeriodo)}</strong>
        </div>
      </div>

      <div className="painel-grafico painel-grafico-duplo" aria-label={ariaLabel}>
        {pontos.map((item, indice) => {
          const alturaVoce = alturaBarraPx(item.valor, maxValor);
          const alturaPlataforma = alturaBarraPx(item.totalPlataforma, maxValor);

          return (
            <div
              key={`${item.label}-${indice}`}
              className="painel-grafico-coluna painel-grafico-coluna-dupla"
              style={{ minHeight: ALTURA_AREA_BARRAS + ESPACO_ROTULO_VALOR + 32 }}
            >
              <div className="painel-grafico-valores-duplos">
                <span className="painel-grafico-valor">
                  {item.valor > 0 ? formatarValor(item.valor) : "-"}
                </span>
                <span className="painel-grafico-valor">
                  {item.totalPlataforma > 0 ? formatarValor(item.totalPlataforma) : "-"}
                </span>
              </div>
              <div className="painel-grafico-area-dupla" style={{ height: ALTURA_AREA_BARRAS }}>
                <div className="painel-grafico-par">
                  <div className="painel-grafico-area painel-grafico-area-interna">
                    <div
                      className="painel-grafico-barra painel-grafico-barra-voce"
                      style={{ height: alturaVoce }}
                      title={`${tituloVoce}: ${formatarValor(item.valor)}`}
                    />
                  </div>
                </div>
                <div className="painel-grafico-par">
                  <div className="painel-grafico-area painel-grafico-area-interna">
                    <div
                      className="painel-grafico-barra painel-grafico-barra-plataforma"
                      style={{ height: alturaPlataforma }}
                      title={`${tituloPlataforma}: ${formatarValor(item.totalPlataforma)}`}
                    />
                  </div>
                </div>
              </div>
              <span className="painel-grafico-label">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="painel-grafico-legenda" aria-hidden>
        <span className="painel-grafico-legenda-item">
          <i className="painel-grafico-legenda-cor painel-grafico-barra-voce" />
          {legendaVoce}
        </span>
        <span className="painel-grafico-legenda-item">
          <i className="painel-grafico-legenda-cor painel-grafico-barra-plataforma" />
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
                  Crescimento trimestral: {formatarPercentual(item.crescimentoTrimestral)}
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
      case "avaliacao": {
        const metaAtingida = dados.avaliacaoMedia != null
          && dados.avaliacaoMedia >= METAS_INDICADORES.avaliacaoMedia;
        return {
          titulo: "Avaliacao media",
          valor: dados.avaliacaoMedia != null ? formatarNotaAvaliacao(dados.avaliacaoMedia) : "—",
          detalhe: dados.totalAvaliacoes > 0
            ? `${formatarQuantidadeAvaliacoes(dados.totalAvaliacoes)} · Meta: ≥ ${METAS_INDICADORES.avaliacaoMedia} estrelas · ${rotuloMeta(metaAtingida)}`
            : "Sem avaliacoes ainda",
          icone: Star,
        };
      }
      case "efetividade": {
        const metaAtingida = dados.efetividadePercentual >= METAS_INDICADORES.efetividadePercentual;
        return {
          titulo: "Percentual de efetividade",
          valor: formatarPercentual(dados.efetividadePercentual),
          detalhe: `${dados.servicosConcluidos} concluidos de ${dados.servicosRecebidos} recebidos · Meta: ≥ ${METAS_INDICADORES.efetividadePercentual}% · ${rotuloMeta(metaAtingida)}`,
          icone: Target,
        };
      }
      case "participacao_plataforma": {
        const metaAtingida = dados.crescimentoParticipacaoMensal >= METAS_INDICADORES.crescimentoParticipacaoMensal;
        return {
          titulo: "Participacao nos ganhos da plataforma",
          valor: formatarPercentual(dados.participacaoPlataformaPercentual),
          detalhe: periodo === "mes" || periodo === "ano"
            ? `Crescimento mensal: ${formatarPercentual(dados.crescimentoParticipacaoMensal)} · Meta: ≥ ${METAS_INDICADORES.crescimentoParticipacaoMensal}% · ${rotuloMeta(metaAtingida)}`
            : `${formatarMoedaBrl(dados.ganhoPrestadorPeriodo)} de ${formatarMoedaBrl(dados.ganhoPlataformaPeriodo)} no periodo atual`,
          icone: Percent,
        };
      }
      case "participacao_categoria": {
        const maiorCrescimento = dados.participacaoPorCategoria.reduce(
          (maior, item) => (item.crescimentoTrimestral > maior.crescimentoTrimestral ? item : maior),
          { crescimentoTrimestral: -Infinity, tipoServico: "" } as { crescimentoTrimestral: number; tipoServico: string },
        );
        const metaAtingida = dados.participacaoPorCategoria.length > 0 && dados.participacaoPorCategoria.every(
          (item) => item.crescimentoTrimestral >= METAS_INDICADORES.crescimentoCategoriaTrimestral,
        );
        return {
          titulo: "Participacao por tipo de serviço",
          valor: dados.participacaoPorCategoria.length > 0
            ? formatarPercentual(maiorCrescimento.crescimentoTrimestral)
            : "—",
          detalhe: dados.participacaoPorCategoria.length > 0
            ? `Maior crescimento trimestral: ${nomeTipoServico(maiorCrescimento.tipoServico)} · Meta: ≥ ${METAS_INDICADORES.crescimentoCategoriaTrimestral}% em cada categoria · ${rotuloMeta(metaAtingida)}`
            : "Sem dados no periodo atual",
          icone: PieChart,
        };
      }
      default:
        return {
          titulo: "Receita propria no período atual",
          valor: formatarMoedaBrl(dados.ganhosPropriosTotal),
          detalhe: rotuloPeriodo(periodo) + " (pagos)",
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
        description="Compare sua receita, efetividade e participacao na plataforma por semana, mes ou ano."
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
            <button
              type="button"
              className={`painel-filtro ${periodo === "ano" ? "ativo" : ""}`}
              onClick={() => setPeriodo("ano")}
            >
              Por ano
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
                  <span className="painel-stat-detalhe">{rotuloSerie(periodo)}</span>
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

            {indicador === "avaliacao" && (
              <p className="workspace-hint" style={{ marginTop: 14 }}>
                Media das notas de 1 a 5 estrelas recebidas dos clientes em servicos concluidos e pagos.
              </p>
            )}

            {indicador === "efetividade" && (
              <GraficoComparativoDuplo
                dados={dados.efetividadeSerie}
                valorVocePeriodo={dados.servicosConcluidos}
                valorPlataformaPeriodo={dados.servicosRecebidos}
                derivarTotalPlataforma={(item) => item.percentual != null && item.percentual > 0
                  ? Math.round((item.valor * 100) / item.percentual)
                  : 0}
                formatarValor={formatarQuantidade}
                rotuloVoce="Concluidos"
                rotuloPlataforma="Recebidos"
                legendaVoce="Servicos concluidos"
                legendaPlataforma="Servicos recebidos"
                ariaLabel="Grafico de efetividade do prestador"
                tituloVoce="Concluidos"
                tituloPlataforma="Recebidos"
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
                Somente serviços com pagamento confirmados  entram na receita.
              </p>
            )}
          </>
        )}
      </section>
    </>
  );
}

export default Metricas;
