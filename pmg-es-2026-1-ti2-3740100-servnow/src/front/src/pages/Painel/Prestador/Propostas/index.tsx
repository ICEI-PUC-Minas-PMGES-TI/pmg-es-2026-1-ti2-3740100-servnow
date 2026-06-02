import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Eye, FileText, HandCoins } from "lucide-react";
import { PerfilPublicoModal } from "../../../../Components/Perfil/PerfilPublicoModal";
import { toast } from "react-toastify";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  API_URL,
  authHeader,
  formatarDataIso,
  getResponseError,
  getValidAuthSession,
  type PropostaServicoResponse,
} from "../../../../services/auth";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";
import {
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

function getListaItemClass(status: StatusProposta) {
  if (status === "ACEITA") return "painel-lista-item-aceita";
  if (status === "RECUSADA") return "painel-lista-item-recusada";
  if (status === "CANCELADA") return "painel-lista-item-cancelada";
  return "";
}

function tituloSolicitacao(proposta: PropostaServicoResponse) {
  return TIPOS_SERVICO_MAP[proposta.solicitacaoTipoServico]?.nome ?? proposta.solicitacaoTipoServico;
}

export function Propostas() {
  const navigate = useNavigate();
  const [propostas, setPropostas] = useState<PropostaServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroProposta>("todas");
  const [perfilUsuarioId, setPerfilUsuarioId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    const session = getValidAuthSession();
    if (!session?.token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/propostas/prestador`, {
        headers: authHeader(session.token),
      });
      if (response.status === 401) {
        toast.error("Sessão expirada. Entre novamente.");
        navigate("/login");
        return;
      }
      if (!response.ok) {
        throw new Error(await getResponseError(response, "Não foi possível carregar suas propostas."));
      }
      setPropostas((await response.json()) as PropostaServicoResponse[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar propostas.");
      setPropostas([]);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

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

  return (
    <>
      <PainelSectionHeader
        eyebrow="Histórico de propostas"
        title="Propostas"
        description="Acompanhe todas as propostas que você enviou e o status de cada uma."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Propostas enviadas</h2>
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
              <HandCoins size={32} />
            </div>
            <p>Carregando propostas...</p>
          </div>
        ) : lista.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <HandCoins size={32} />
            </div>
            <p>
              {propostas.length === 0
                ? "Você ainda não enviou propostas. Acesse Solicitações para encontrar oportunidades."
                : "Nenhuma proposta encontrada para esse filtro."}
            </p>
          </div>
        ) : (
          <div className="painel-lista">
            {lista.map((proposta) => (
              <article
                key={proposta.id}
                className={`painel-lista-item ${getListaItemClass(proposta.status)}`}
              >
                <div className="painel-lista-item-info">
                  <p className="painel-lista-item-titulo">
                    <FileText size={18} style={{ marginRight: 8, verticalAlign: "text-bottom" }} />
                    {tituloSolicitacao(proposta)}
                  </p>
                  <div className="painel-lista-item-meta">
                    <span className="painel-lista-item-meta-detalhe">{proposta.clienteNome}</span>
                    <span className="painel-lista-item-meta-detalhe">
                      <DollarSign size={13} />
                      {Number(proposta.valor).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    <span className="painel-lista-item-meta-detalhe">
                      <Calendar size={13} /> Enviada em {formatarDataIso(proposta.criadoEm)}
                    </span>
                  </div>
                  {proposta.mensagem && (
                    <p className="painel-lista-item-descrição">{proposta.mensagem}</p>
                  )}
                </div>
                <div className="painel-lista-item-acoes">
                  <button
                    type="button"
                    className="painel-btn-ghost"
                    onClick={() => setPerfilUsuarioId(proposta.clienteId)}
                  >
                    <Eye size={14} />
                    Ver perfil do cliente
                  </button>
                  <span className={`painel-status ${getPropostaStatusClass(proposta.status)}`}>
                    {getPropostaStatusLabel(proposta.status)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {perfilUsuarioId != null ? (
        <PerfilPublicoModal
          usuarioId={perfilUsuarioId}
          titulo="Perfil do cliente"
          onFechar={() => setPerfilUsuarioId(null)}
        />
      ) : null}
    </>
  );
}

export default Propostas;
