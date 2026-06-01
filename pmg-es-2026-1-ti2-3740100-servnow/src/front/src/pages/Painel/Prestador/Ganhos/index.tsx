import { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import { API_URL, authHeader, getValidAuthSession, type SolicitacaoServicoResponse } from "../../../../services/auth";
import { formatarMoedaBrl } from "../../../../utils/formatarMoeda";

type PeriodoGanhos = "mes" | "semana";

type PontoGanho = {
  label: string;
  valor: number;
};

const NOMES_MES_CURTO = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

// Converte a data de referencia do servico (data agendada ou aceite) para um objeto Date local.
function dataReferencia(item: SolicitacaoServicoResponse): Date | null {
  if (item.data) {
    const [ano, mes, dia] = item.data.slice(0, 10).split("-").map(Number);
    if (ano && mes && dia) {
      return new Date(ano, mes - 1, dia);
    }
  }
  if (item.aceitoEm) {
    const d = new Date(item.aceitoEm);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function Ganhos() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState<SolicitacaoServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState<PeriodoGanhos>("mes");

  useEffect(() => {
    async function carregar() {
      const session = getValidAuthSession();
      if (!session?.token) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/solicitacoes/prestador/agendadas`, {
          headers: authHeader(session.token),
        });
        if (response.status === 401) {
          toast.error("Sessao expirada. Entre novamente.");
          navigate("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Nao foi possivel carregar os ganhos.");
        }
        setAgendamentos((await response.json()) as SolicitacaoServicoResponse[]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar ganhos.");
      } finally {
        setIsLoading(false);
      }
    }
    void carregar();
  }, [navigate]);

  // Ganhos dos ultimos 6 meses (incluindo o mes atual)
  const ganhosMes = useMemo<PontoGanho[]>(() => {
    const hoje = new Date();
    const pontos: PontoGanho[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const ref = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const chave = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}`;
      const total = agendamentos.reduce((soma, item) => {
        const data = dataReferencia(item);
        if (!data) return soma;
        const chaveItem = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
        return chaveItem === chave ? soma + (item.valorAceito ?? 0) : soma;
      }, 0);
      pontos.push({ label: NOMES_MES_CURTO[ref.getMonth()], valor: total });
    }
    return pontos;
  }, [agendamentos]);

  // Ganhos da semana atual (domingo a sabado)
  const ganhosSemana = useMemo<PontoGanho[]>(() => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - hoje.getDay());
    return DIAS_SEMANA_CURTO.map((label, indice) => {
      const dia = new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate() + indice);
      const total = agendamentos.reduce((soma, item) => {
        const data = dataReferencia(item);
        if (!data) return soma;
        const mesmoDia = data.getFullYear() === dia.getFullYear()
          && data.getMonth() === dia.getMonth()
          && data.getDate() === dia.getDate();
        return mesmoDia ? soma + (item.valorAceito ?? 0) : soma;
      }, 0);
      return { label, valor: total };
    });
  }, [agendamentos]);

  const dados = periodo === "mes" ? ganhosMes : ganhosSemana;
  const total = useMemo(() => dados.reduce((soma, item) => soma + item.valor, 0), [dados]);
  const maxValor = useMemo(() => Math.max(...dados.map((item) => item.valor), 1), [dados]);

  return (
    <>
      <PainelSectionHeader
        eyebrow="Financeiro"
        title="Ganhos"
        description="Valores dos servicos agendados por mes e por semana."
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

        {isLoading ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <BarChart3 size={32} />
            </div>
            <p>Carregando ganhos...</p>
          </div>
        ) : (
          <>
            <div className="painel-stats-grid painel-stats-grid-compacto">
              <div className="painel-stat-card">
                <div className="painel-stat-icone">
                  <TrendingUp size={22} />
                </div>
                <span className="painel-stat-label">Total no periodo</span>
                <strong className="painel-stat-valor">{formatarMoedaBrl(total)}</strong>
                <span className="painel-stat-detalhe">
                  {periodo === "mes" ? "Ultimos 6 meses" : "Semana atual"}
                </span>
              </div>
              <div className="painel-stat-card">
                <div className="painel-stat-icone">
                  <BarChart3 size={22} />
                </div>
                <span className="painel-stat-label">Media</span>
                <strong className="painel-stat-valor">{formatarMoedaBrl(total / dados.length)}</strong>
                <span className="painel-stat-detalhe">Por {periodo === "mes" ? "mes" : "dia"}</span>
              </div>
            </div>

            <div className="painel-grafico" aria-label="Grafico de ganhos">
              {dados.map((item, indice) => {
                const altura = Math.round((item.valor / maxValor) * 100);
                return (
                  <div key={`${item.label}-${indice}`} className="painel-grafico-coluna">
                    <span className="painel-grafico-valor">
                      {item.valor > 0
                        ? item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
                        : "-"}
                    </span>
                    <div
                      className="painel-grafico-barra"
                      style={{ height: `${Math.max(altura, 2)}%` }}
                      title={`${item.label}: ${formatarMoedaBrl(item.valor)}`}
                    />
                    <span className="painel-grafico-label">{item.label}</span>
                  </div>
                );
              })}
            </div>

            <p className="workspace-hint" style={{ marginTop: 14 }}>
              Os valores consideram os servicos agendados. O total recebido apos a conclusao sera
              integrado quando o monitoramento de pagamentos estiver disponivel.
            </p>
          </>
        )}
      </section>
    </>
  );
}

export default Ganhos;
