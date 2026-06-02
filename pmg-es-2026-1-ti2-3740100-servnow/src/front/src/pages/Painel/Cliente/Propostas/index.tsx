import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, DollarSign, Eye, FileText, MessageSquare, Star, User, X } from "lucide-react";
import { PerfilPublicoModal } from "../../../../Components/Perfil/PerfilPublicoModal";
import { toast } from "react-toastify";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  API_URL,
  authHeader,
  authHeaders,
  formatarDataIso,
  getResponseError,
  getValidAuthSession,
  type PropostaServicoResponse,
} from "../../../../services/auth";
import { dispararAtualizacaoNotificacoes } from "../../../../services/notificacoes";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";
import {
  getPropostaCardClass,
  getPropostaStatusClass,
  getPropostaStatusLabel,
  type StatusProposta,
} from "../../../../utils/propostaLabels";

type FiltroProposta = StatusProposta | "todas" | "encerradas";

const FILTROS: Array<{ id: FiltroProposta; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "PENDENTE", label: "Pendentes" },
  { id: "ACEITA", label: "Aceitas" },
  { id: "encerradas", label: "Recusadas" },
];

function tituloSolicitacao(proposta: PropostaServicoResponse) {
  return TIPOS_SERVICO_MAP[proposta.solicitacaoTipoServico]?.nome ?? proposta.solicitacaoTipoServico;
}

export function Propostas() {
  const navigate = useNavigate();
  const [propostas, setPropostas] = useState<PropostaServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acaoId, setAcaoId] = useState<number | null>(null);
  const [perfilUsuarioId, setPerfilUsuarioId] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<FiltroProposta>("todas");
  const [confirmarRecusa, setConfirmarRecusa] = useState<PropostaServicoResponse | null>(null);

  const carregar = useCallback(
    async (opcoes?: { silencioso?: boolean }) => {
      const session = getValidAuthSession();
      if (!session?.token) {
        navigate("/login");
        return;
      }

      if (!opcoes?.silencioso) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(`${API_URL}/api/propostas/cliente`, {
          headers: authHeader(session.token),
        });
        if (response.status === 401) {
          toast.error("Sessão expirada. Entre novamente.");
          navigate("/login");
          return;
        }
        if (!response.ok) {
          throw new Error(await getResponseError(response, "Não foi possível carregar as propostas."));
        }
        const lista = (await response.json()) as PropostaServicoResponse[];
        setPropostas(lista);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar propostas.");
        if (!opcoes?.silencioso) {
          setPropostas([]);
        }
      } finally {
        if (!opcoes?.silencioso) {
          setIsLoading(false);
        }
      }
    },
    [navigate],
  );

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const lista = useMemo(() => {
    if (filtro === "todas") return propostas;
    if (filtro === "encerradas") {
      return propostas.filter((item) => item.status === "RECUSADA" || item.status === "CANCELADA");
    }
    return propostas.filter((item) => item.status === filtro);
  }, [filtro, propostas]);

  async function responderProposta(propostaId: number, acao: "aceitar" | "recusar") {
    const session = getValidAuthSession();
    if (!session?.token) {
      toast.error("Sessão expirada. Entre novamente.");
      navigate("/login");
      return;
    }

    setAcaoId(propostaId);
    try {
      const response = await fetch(`${API_URL}/api/propostas/${propostaId}/${acao}`, {
        method: "POST",
        headers: authHeaders(session.token),
      });
      if (response.status === 401) {
        toast.error("Sessão expirada. Entre novamente.");
        navigate("/login");
        return;
      }
      if (!response.ok) {
        throw new Error(
          await getResponseError(
            response,
            acao === "aceitar" ? "Não foi possível aceitar a proposta." : "Não foi possível recusar a proposta.",
          ),
        );
      }

      const atualizada = (await response.json()) as PropostaServicoResponse;

      if (acao === "aceitar") {
        setPropostas((atual) =>
          atual.map((item) => {
            if (item.id === atualizada.id) {
              return atualizada;
            }
            if (item.solicitacaoId === atualizada.solicitacaoId && item.status === "PENDENTE") {
              return { ...item, status: "CANCELADA" };
            }
            return item;
          }),
        );
        toast.success("Proposta aceita. As demais propostas desta solicitação foram canceladas.");
      } else {
        setPropostas((atual) => atual.map((item) => (item.id === atualizada.id ? atualizada : item)));
        toast.success("Proposta recusada. Ela permanece no Histórico em Recusadas.");
      }

      dispararAtualizacaoNotificacoes();
      void carregar({ silencioso: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao responder proposta.");
    } finally {
      setAcaoId(null);
      setConfirmarRecusa(null);
    }
  }

  return (
    <>
      <PainelSectionHeader
        eyebrow="Propostas recebidas"
        title="Propostas"
        description="Veja as propostas enviadas por prestadores para as solicitações que você criou."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Propostas de prestadores</h2>
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

        {isLoading ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>Carregando propostas...</p>
          </div>
        ) : lista.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>
              {propostas.length === 0
                ? "Nenhuma proposta recebida no momento."
                : "Nenhuma proposta encontrada para esse filtro."}
            </p>
          </div>
        ) : (
          <div className="painel-propostas-lista">
            {lista.map((proposta) => {
              const avaliacao = proposta.prestadorAvaliacaoMedia;
              const pendente = proposta.status === "PENDENTE";
              const processando = acaoId === proposta.id;

              return (
                <article
                  className={`painel-proposta-card ${getPropostaCardClass(proposta.status)}`}
                  key={proposta.id}
                >
                  <div className="painel-proposta-cabecalho">
                    <div>
                      <span className="painel-proposta-solicitação">{tituloSolicitacao(proposta)}</span>
                      <h3>{proposta.prestadorNome}</h3>
                    </div>

                    <div className="painel-proposta-cabecalho-status">
                      {avaliacao != null ? (
                        <div className="painel-proposta-avaliacao" aria-label={`${avaliacao} estrelas`}>
                          <Star size={15} fill="currentColor" />
                          {avaliacao.toFixed(2).replace(".", ",")}
                        </div>
                      ) : null}
                      <span className={`painel-status ${getPropostaStatusClass(proposta.status)}`}>
                        {getPropostaStatusLabel(proposta.status)}
                      </span>
                    </div>
                  </div>

                  <div className="painel-proposta-comentario">
                    <MessageSquare size={17} />
                    <p>{proposta.mensagem}</p>
                  </div>

                  <div className="painel-proposta-rodape">
                    <span className="painel-proposta-prestador">
                      <User size={14} />
                      Enviada em {formatarDataIso(proposta.criadoEm)}
                      {proposta.respondidoEm ? ` · Respondida em ${formatarDataIso(proposta.respondidoEm)}` : ""}
                    </span>

                    <strong className="painel-proposta-valor">
                      <DollarSign size={16} />
                      {Number(proposta.valor).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                  </div>

                  <div className="painel-proposta-acoes">
                    <button
                      type="button"
                      className="painel-btn-ghost"
                      onClick={() => setPerfilUsuarioId(proposta.prestadorId)}
                    >
                      <Eye size={15} />
                      Ver perfil do prestador
                    </button>

                    {pendente ? (
                      <>
                        <button
                          type="button"
                          className="painel-btn-recusar"
                          disabled={processando}
                          onClick={() => setConfirmarRecusa(proposta)}
                        >
                          <X size={15} />
                          Recusar
                        </button>

                        <button
                          type="button"
                          className="painel-btn-aceitar"
                          disabled={processando}
                          onClick={() => void responderProposta(proposta.id, "aceitar")}
                        >
                          <Check size={15} />
                          Aceitar
                        </button>
                      </>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {perfilUsuarioId != null ? (
        <PerfilPublicoModal
          usuarioId={perfilUsuarioId}
          titulo="Perfil do prestador"
          onFechar={() => setPerfilUsuarioId(null)}
        />
      ) : null}

      {confirmarRecusa && (
        <div className="solicitação-modal-overlay" role="presentation" onClick={() => setConfirmarRecusa(null)}>
          <div
            className="solicitação-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: 460 }}
          >
            <header className="solicitação-modal-cabecalho">
              <div className="solicitação-modal-titulo-grupo">
                <X size={20} />
                <h3>Recusar proposta</h3>
              </div>
              <button
                type="button"
                className="solicitação-modal-fechar"
                onClick={() => setConfirmarRecusa(null)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </header>
            <div className="solicitação-modal-corpo">
              <p style={{ marginTop: 0 }}>Deseja recusar a proposta de {confirmarRecusa.prestadorNome}?</p>
              <p style={{ marginBottom: 0, color: "var(--workspace-muted)" }}>
                A proposta continuara visivel no filtro Recusadas.
              </p>
            </div>
            <footer className="solicitação-modal-rodape">
              <button type="button" className="btn-secondary" onClick={() => setConfirmarRecusa(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="painel-btn-recusar"
                disabled={acaoId === confirmarRecusa.id}
                onClick={() => void responderProposta(confirmarRecusa.id, "recusar")}
              >
                {acaoId === confirmarRecusa.id ? "Recusando..." : "Sim, recusar"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

export default Propostas;
