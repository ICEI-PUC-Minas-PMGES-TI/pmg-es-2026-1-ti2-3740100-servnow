import { ArrowRight, Calendar, Clock, FileText, PlusCircle, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import { API_URL, authHeader, getValidAuthSession, type SolicitacaoServicoResponse } from "../../../../services/auth";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";
import { formatarDataSolicitacao, getStatusClass, getStatusLabel } from "../../../../utils/solicitacaoLabels";

type InicioProps = {
  onIrParaSolicitacoes: () => void;
  onIrParaCriar: () => void;
};

export function Inicio({ onIrParaSolicitacoes, onIrParaCriar }: InicioProps) {
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function carregarSolicitacoes() {
      const session = getValidAuthSession();
      if (!session?.token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/solicitacoes/cliente`, {
          headers: authHeader(session.token),
        });

        if (response.status === 401) {
          toast.error("Sessao expirada. Entre novamente.");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar as solicitacoes.");
        }

        setSolicitacoes((await response.json()) as SolicitacaoServicoResponse[]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar solicitacoes.");
      } finally {
        setIsLoading(false);
      }
    }

    void carregarSolicitacoes();
  }, [navigate]);

  const solicitacoesRecentes = useMemo(() => solicitacoes.slice(0, 3), [solicitacoes]);
  const solicitacoesAtivas = useMemo(
    () => solicitacoes.filter((item) => item.status === "PUBLICADO" || item.status === "AGUARDANDO_PROPOSTAS").length,
    [solicitacoes],
  );
  const solicitacoesAgendadas = useMemo(
    () => solicitacoes.filter((item) => item.status === "AGENDADA").length,
    [solicitacoes],
  );

  return (
    <>
      <PainelSectionHeader
        eyebrow="Painel do cliente"
        title="Inicio"
        description="Acompanhe suas solicitacoes, agendamentos e gastos do mes."
      />

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
              <h2 style={{ margin: 0 }}>Voce tem um servico para comecar hoje</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--workspace-muted)" }}>
                Troca de chuveiro eletrico - previsto para 14:00
              </p>
            </div>
          </div>
          <button type="button" className="btn-primary" onClick={() => navigate("/acompanhamento")}>
            Acompanhar servico <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <section className="painel-stats-grid">
        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <FileText size={22} />
          </div>
          <span className="painel-stat-label">Solicitacoes ativas</span>
          <strong className="painel-stat-valor">{solicitacoesAtivas}</strong>
          <span className="painel-stat-detalhe">Em aberto para novos prestadores</span>
        </div>

        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <Calendar size={22} />
          </div>
          <span className="painel-stat-label">Servicos agendados</span>
          <strong className="painel-stat-valor">{solicitacoesAgendadas}</strong>
          <span className="painel-stat-detalhe">Solicitacoes com prestador definido</span>
        </div>

        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <Wallet size={22} />
          </div>
          <span className="painel-stat-label">Gastos no mes</span>
          <strong className="painel-stat-valor">R$ 480,00</strong>
          <span className="painel-stat-detalhe">2 servicos pagos em maio</span>
        </div>
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Suas solicitacoes</h2>
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
            <p>Voce ainda nao criou solicitacoes.</p>
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
                      <span className="painel-lista-item-meta-detalhe">{item.endereco}</span>
                      {item.data && (
                        <span className="painel-lista-item-meta-detalhe">
                          <Calendar size={13} /> {formatarDataSolicitacao(item.data)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="painel-lista-item-acoes">
                    <span className={`painel-status ${getStatusClass(item.status)}`}>{getStatusLabel(item.status)}</span>
                    <button type="button" className="painel-btn-ghost" onClick={onIrParaSolicitacoes}>Ver detalhes</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Precisa de um novo servico?</h2>
          <button type="button" className="btn-primary" onClick={onIrParaCriar}>
            <PlusCircle size={16} /> Criar solicitacao
          </button>
        </div>
        <p style={{ margin: 0, color: "var(--workspace-muted)", fontSize: 14 }}>
          Descreva o que voce precisa e receba propostas de prestadores qualificados da sua regiao.
        </p>
      </section>
    </>
  );
}

export default Inicio;
