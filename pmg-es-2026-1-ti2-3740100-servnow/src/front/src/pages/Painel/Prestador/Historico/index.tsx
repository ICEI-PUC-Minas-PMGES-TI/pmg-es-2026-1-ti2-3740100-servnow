import { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle, DollarSign, History as HistoryIcon, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import { API_URL, authHeader, getValidAuthSession, type SolicitacaoServicoResponse } from "../../../../services/auth";
import { formatarMoedaBrl } from "../../../../utils/formatarMoeda";
import { formatarDataSolicitacao } from "../../../../utils/solicitacaoLabels";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";

type FiltroHistorico = "mes" | "semana" | "todos";

const FILTROS: Array<{ id: FiltroHistorico; label: string }> = [
  { id: "mes", label: "Este mes" },
  { id: "semana", label: "Esta semana" },
  { id: "todos", label: "Todos" },
];

// Data de referencia do servico concluido (conclusao -> aceite -> data agendada).
function dataReferencia(item: SolicitacaoServicoResponse): Date | null {
  const iso = item.concluidoEm ?? item.aceitoEm;
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (item.data) {
    const [ano, mes, dia] = item.data.slice(0, 10).split("-").map(Number);
    if (ano && mes && dia) return new Date(ano, mes - 1, dia);
  }
  return null;
}

function dentroDoPeriodo(item: SolicitacaoServicoResponse, filtro: FiltroHistorico): boolean {
  if (filtro === "todos") return true;
  const data = dataReferencia(item);
  if (!data) return false;
  const hoje = new Date();
  if (filtro === "mes") {
    return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth();
  }
  // semana atual (domingo a sabado)
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - hoje.getDay());
  const fim = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 7);
  return data >= inicio && data < fim;
}

function rotuloData(item: SolicitacaoServicoResponse): string {
  const iso = item.concluidoEm ?? item.aceitoEm;
  if (iso) return formatarDataSolicitacao(iso.slice(0, 10));
  if (item.data) return formatarDataSolicitacao(item.data.slice(0, 10));
  return "-";
}

export function Historico() {
  const navigate = useNavigate();
  const [concluidos, setConcluidos] = useState<SolicitacaoServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroHistorico>("mes");

  useEffect(() => {
    async function carregar() {
      const session = getValidAuthSession();
      if (!session?.token) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/solicitacoes/prestador/pagas`, {
          headers: authHeader(session.token),
        });
        if (response.status === 401) {
          toast.error("Sessão expirada. Entre novamente.");
          navigate("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Não foi possível carregar o Histórico.");
        }
        setConcluidos((await response.json()) as SolicitacaoServicoResponse[]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar Histórico.");
      } finally {
        setIsLoading(false);
      }
    }
    void carregar();
  }, [navigate]);

  const lista = useMemo(
    () => concluidos.filter((item) => dentroDoPeriodo(item, filtro)),
    [concluidos, filtro],
  );

  const totalServicos = lista.length;
  const totalGanho = useMemo(
    () => lista.reduce((soma, item) => soma + (item.valorAceito ?? 0), 0),
    [lista],
  );

  return (
    <>
      <PainelSectionHeader
        eyebrow="Resumo"
        title="Histórico"
        description="Serviços concluídos e ganhos do período selecionado."
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
            <span className="painel-stat-label">Total de ganhos</span>
            <strong className="painel-stat-valor">{formatarMoedaBrl(totalGanho)}</strong>
          </div>
        </div>
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Servicos concluidos</h2>
        </div>

        {isLoading ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <HistoryIcon size={32} />
            </div>
            <p>Carregando historico...</p>
          </div>
        ) : lista.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <HistoryIcon size={32} />
            </div>
            <p>Nenhum servico concluido no periodo selecionado.</p>
          </div>
        ) : (
          <div className="painel-lista">
            {lista.map((item) => {
              const tipo = TIPOS_SERVICO_MAP[item.tipoServico]?.nome ?? item.tipoServico;
              return (
                <div key={item.id} className="painel-lista-item">
                  <div className="painel-lista-item-info">
                    <p className="painel-lista-item-titulo">{tipo}</p>
                    <div className="painel-lista-item-meta">
                      <span className="painel-lista-item-meta-detalhe">
                        <User size={13} /> {item.clienteNome}
                      </span>
                      <span className="painel-lista-item-meta-detalhe">
                        <Calendar size={13} /> {rotuloData(item)}
                      </span>
                      <span className="painel-lista-item-meta-detalhe painel-proposta-valor">
                        <DollarSign size={13} /> {formatarMoedaBrl(item.valorAceito)}
                      </span>
                    </div>
                  </div>
                  <div className="painel-lista-item-acoes">
                    <span className="painel-status concluido">Concluido</span>
                    <button
                      type="button"
                      className="painel-btn-ghost"
                      onClick={() => navigate(`/acompanhamento/${item.id}`)}
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export default Historico;
