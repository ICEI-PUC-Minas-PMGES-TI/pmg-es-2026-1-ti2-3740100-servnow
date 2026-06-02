import { ArrowRight, BarChart3, Clock, FileText, HandCoins, Star, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import { API_URL, authHeader, getValidAuthSession, type SolicitacaoServicoResponse } from "../../../../services/auth";
import { listarAvaliacoesRecebidas } from "../../../../services/perfil";
import { formatarNotaAvaliacao, formatarQuantidadeAvaliacoes } from "../../../../utils/formatarAvaliacao";
import { formatarMoedaBrl } from "../../../../utils/formatarMoeda";
import { chaveMesReferencia, dataReferenciaFinanceira } from "../../../../utils/referenciaFinanceira";
import { calcularProximoServicoAgendado } from "../../../../utils/proximoServicoAgendado";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";
import { getFaixaPrecoLabel, getStatusClass, getStatusLabel } from "../../../../utils/solicitacaoLabels";

type InicioProps = {
  onIrParaSolicitacoes: () => void;
  onIrParaPropostas: () => void;
  onIrParaMetricas: () => void;
};

export function Inicio({ onIrParaSolicitacoes, onIrParaPropostas, onIrParaMetricas }: InicioProps) {
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avaliacaoMedia, setAvaliacaoMedia] = useState<number | null>(null);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);
  const [agendadas, setAgendadas] = useState<SolicitacaoServicoResponse[]>([]);
  const [servicosPagos, setServicosPagos] = useState<SolicitacaoServicoResponse[]>([]);

  useEffect(() => {
    async function carregarSolicitacoes() {
      const session = getValidAuthSession();
      if (!session?.token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/solicitacoes/prestador`, {
          headers: authHeader(session.token),
        });

        if (response.status === 401) {
          toast.error("Sessão expirada. Entre novamente.");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Não foi possível carregar as solicitações.");
        }

        setSolicitacoes((await response.json()) as SolicitacaoServicoResponse[]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar solicitações.");
      } finally {
        setIsLoading(false);
      }
    }

    void carregarSolicitacoes();
  }, [navigate]);

  useEffect(() => {
    void listarAvaliacoesRecebidas()
      .then((dados) => {
        setAvaliacaoMedia(dados.avaliacaoMedia);
        setTotalAvaliacoes(dados.totalAvaliacoes);
      })
      .catch(() => {
        setAvaliacaoMedia(null);
        setTotalAvaliacoes(0);
      });
  }, []);

  useEffect(() => {
    const session = getValidAuthSession();
    if (!session?.token) {
      return;
    }
    const headers = authHeader(session.token);
    void Promise.all([
      fetch(`${API_URL}/api/solicitacoes/prestador/pagas`, { headers }),
      fetch(`${API_URL}/api/solicitacoes/prestador/agendadas`, { headers }),
    ])
      .then(([pagas, agendadasResp]) => {
        if (pagas.ok) {
          void pagas.json().then((dados) => setServicosPagos(dados as SolicitacaoServicoResponse[]));
        }
        if (agendadasResp.ok) {
          void agendadasResp.json().then((dados) => setAgendadas(dados as SolicitacaoServicoResponse[]));
        }
      })
      .catch(() => {
        setServicosPagos([]);
        setAgendadas([]);
      });
  }, []);

  const solicitacoesRecentes = useMemo(() => solicitacoes.slice(0, 3), [solicitacoes]);
  const oportunidadesNovas = useMemo(
    () => solicitacoes.filter((item) => item.status === "PUBLICADO" || item.status === "AGUARDANDO_PROPOSTAS").length,
    [solicitacoes],
  );

  const proximoServico = useMemo(
    () => calcularProximoServicoAgendado(agendadas, "PRESTADOR"),
    [agendadas],
  );

  const ganhosMes = useMemo(() => {
    const mesAtual = chaveMesReferencia(new Date());
    return servicosPagos.reduce((soma, item) => {
      const data = dataReferenciaFinanceira(item);
      if (!data || chaveMesReferencia(data) !== mesAtual) {
        return soma;
      }
      return soma + (item.valorAceito ?? 0);
    }, 0);
  }, [servicosPagos]);

  return (
    <>
      <PainelSectionHeader
        eyebrow="Painel do prestador"
        title="Início"
        description="Acompanhe novas solicitações, Métricas e Avaliações dos seus atendimentos."
      />

      {!isLoading && proximoServico && (
        <section
          className="painel-card"
          style={{
            marginBottom: 18,
            background: "linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(20, 184, 166, 0.08))",
            borderColor: "rgba(56, 189, 248, 0.35)",
          }}
        >
          <div className="painel-card-cabecalho" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(56, 189, 248, 0.2)",
                  color: "var(--brand-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clock size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{proximoServico.titulo}</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--workspace-muted)" }}>
                  {proximoServico.subtitulo}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(`/acompanhamento/${proximoServico.item.id}`)}
            >
              Acompanhar servico <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}

      <section className="painel-stats-grid">
        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <FileText size={22} />
          </div>
          <span className="painel-stat-label">Oportunidades novas</span>
          <strong className="painel-stat-valor">{oportunidadesNovas}</strong>
          <span className="painel-stat-detalhe">Solicitacoes publicadas no momento</span>
        </div>

        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <Wallet size={22} />
          </div>
          <span className="painel-stat-label">Receita no mes</span>
          <strong className="painel-stat-valor">{formatarMoedaBrl(ganhosMes)}</strong>
          <span className="painel-stat-detalhe">Servicos pagos neste mes</span>
        </div>

        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <Star size={22} />
          </div>
          <span className="painel-stat-label">Avaliacao media</span>
          <strong className="painel-stat-valor">
            {avaliacaoMedia != null ? formatarNotaAvaliacao(avaliacaoMedia) : "—"}
          </strong>
          <span className="painel-stat-detalhe">
            {totalAvaliacoes > 0 ? formatarQuantidadeAvaliacoes(totalAvaliacoes) : "Sem Avaliações ainda"}
          </span>
        </div>
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Solicitacoes disponiveis</h2>
          <button type="button" className="painel-btn-ghost" onClick={onIrParaSolicitacoes}>
            Ver todas <ArrowRight size={14} />
          </button>
        </div>

        {isLoading ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>Carregando solicitacoes...</p>
          </div>
        ) : solicitacoesRecentes.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>Nenhuma solicitacao disponivel agora.</p>
          </div>
        ) : (
          <div className="painel-lista">
            {solicitacoesRecentes.map((item) => {
              const tipo = TIPOS_SERVICO_MAP[item.tipoServico]?.nome ?? item.tipoServico;
              return (
                <div key={item.id} className="painel-lista-item">
                  <div className="painel-lista-item-info">
                    <p className="painel-lista-item-titulo">{tipo}</p>
                    <div className="painel-lista-item-meta">
                      <span className="painel-lista-item-meta-detalhe">{item.clienteNome}</span>
                      <span className="painel-lista-item-meta-detalhe">{item.cidade} - {item.estado}</span>
                      <span className="painel-lista-item-meta-detalhe">{getFaixaPrecoLabel(item.faixaPreco)}</span>
                    </div>
                  </div>
                  <div className="painel-lista-item-acoes">
                    <span className={`painel-status ${getStatusClass(item.status)}`}>{getStatusLabel(item.status)}</span>
                    <button type="button" className="painel-btn-aceitar" onClick={onIrParaSolicitacoes}>Enviar proposta</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Atalhos rapidos</h2>
        </div>
        <div className="painel-atalhos-grid">
          <button type="button" className="painel-atalho-card" onClick={onIrParaPropostas}>
            <HandCoins size={20} />
            <span>Minhas propostas</span>
          </button>
          <button type="button" className="painel-atalho-card" onClick={onIrParaMetricas}>
            <BarChart3 size={20} />
            <span>Ver metricas</span>
          </button>
        </div>
      </section>
    </>
  );
}

export default Inicio;
