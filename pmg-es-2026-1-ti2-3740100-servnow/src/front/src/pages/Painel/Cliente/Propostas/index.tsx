import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, DollarSign, FileText, MessageSquare, Star, User, X } from "lucide-react";
import { toast } from "react-toastify";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  API_URL,
  authHeader,
  authHeaders,
  formatarDataIso,
  getResponseError,
  getValidAuthSession,
  type PerfilPublicoResponse,
  type PropostaServicoResponse,
} from "../../../../services/auth";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";

function tituloSolicitacao(proposta: PropostaServicoResponse) {
  return TIPOS_SERVICO_MAP[proposta.solicitacaoTipoServico]?.nome ?? proposta.solicitacaoTipoServico;
}

export function Propostas() {
  const navigate = useNavigate();
  const [propostas, setPropostas] = useState<PropostaServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acaoId, setAcaoId] = useState<number | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Record<number, number | null>>({});

  const carregar = useCallback(async () => {
    const session = getValidAuthSession();
    if (!session?.token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/propostas/cliente`, {
        headers: authHeader(session.token),
      });
      if (response.status === 401) {
        toast.error("Sessao expirada. Entre novamente.");
        navigate("/login");
        return;
      }
      if (!response.ok) {
        throw new Error(await getResponseError(response, "Nao foi possivel carregar as propostas."));
      }
      const lista = (await response.json()) as PropostaServicoResponse[];
      setPropostas(lista);
      void carregarAvaliacoes(lista, session.token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar propostas.");
      setPropostas([]);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  async function carregarAvaliacoes(lista: PropostaServicoResponse[], token: string) {
    const prestadoresUnicos = [...new Set(lista.map((item) => item.prestadorId))];
    const entradas = await Promise.all(
      prestadoresUnicos.map(async (prestadorId) => {
        try {
          const response = await fetch(`${API_URL}/api/perfil/publico/${prestadorId}`, {
            headers: authHeader(token),
          });
          if (!response.ok) {
            return [prestadorId, null] as const;
          }
          const perfil = (await response.json()) as PerfilPublicoResponse;
          return [prestadorId, perfil.avaliacaoMedia] as const;
        } catch {
          return [prestadorId, null] as const;
        }
      }),
    );
    setAvaliacoes(Object.fromEntries(entradas));
  }

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function responderProposta(propostaId: number, acao: "aceitar" | "recusar") {
    const session = getValidAuthSession();
    if (!session?.token) {
      toast.error("Sessao expirada. Entre novamente.");
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
        toast.error("Sessao expirada. Entre novamente.");
        navigate("/login");
        return;
      }
      if (!response.ok) {
        throw new Error(
          await getResponseError(
            response,
            acao === "aceitar" ? "Nao foi possivel aceitar a proposta." : "Nao foi possivel recusar a proposta.",
          ),
        );
      }

      toast.success(acao === "aceitar" ? "Proposta aceita. Servico agendado." : "Proposta recusada.");
      await carregar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao responder proposta.");
    } finally {
      setAcaoId(null);
    }
  }

  return (
    <>
      <PainelSectionHeader
        eyebrow="Propostas recebidas"
        title="Propostas"
        description="Veja as propostas enviadas por prestadores para as solicitacoes que voce criou."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Propostas de prestadores</h2>
        </div>

        {isLoading ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>Carregando propostas...</p>
          </div>
        ) : propostas.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>Nenhuma proposta recebida no momento.</p>
          </div>
        ) : (
          <div className="painel-propostas-lista">
            {propostas.map((proposta) => {
              const avaliacao = avaliacoes[proposta.prestadorId];
              const pendente = proposta.status === "PENDENTE";
              const processando = acaoId === proposta.id;

              return (
                <article className="painel-proposta-card" key={proposta.id}>
                  <div className="painel-proposta-cabecalho">
                    <div>
                      <span className="painel-proposta-solicitacao">{tituloSolicitacao(proposta)}</span>
                      <h3>{proposta.prestadorNome}</h3>
                    </div>

                    {avaliacao != null ? (
                      <div className="painel-proposta-avaliacao" aria-label={`${avaliacao} estrelas`}>
                        <Star size={15} fill="currentColor" />
                        {avaliacao.toFixed(1)}
                      </div>
                    ) : null}
                  </div>

                  <div className="painel-proposta-comentario">
                    <MessageSquare size={17} />
                    <p>{proposta.mensagem}</p>
                  </div>

                  <div className="painel-proposta-rodape">
                    <span className="painel-proposta-prestador">
                      <User size={14} />
                      Enviada em {formatarDataIso(proposta.criadoEm)}
                      {!pendente && ` · ${proposta.status === "ACEITA" ? "Aceita" : "Recusada"}`}
                    </span>

                    <strong className="painel-proposta-valor">
                      <DollarSign size={16} />
                      {Number(proposta.valor).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                  </div>

                  {pendente ? (
                    <div className="painel-proposta-acoes">
                      <button type="button" className="painel-btn-recusar" disabled={processando} onClick={() => void responderProposta(proposta.id, "recusar")}>
                        <X size={15} />
                        Recusar
                      </button>

                      <button type="button" className="painel-btn-aceitar" disabled={processando} onClick={() => void responderProposta(proposta.id, "aceitar")}>
                        <Check size={15} />
                        Aceitar
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export default Propostas;
