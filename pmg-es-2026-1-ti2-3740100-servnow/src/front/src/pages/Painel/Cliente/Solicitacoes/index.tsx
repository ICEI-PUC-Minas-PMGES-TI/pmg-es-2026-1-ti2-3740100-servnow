import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Calendar, FileText, MapPin } from "lucide-react";

import {
  API_URL,
  authHeader,
  getValidAuthSession,
  type SolicitacaoServicoResponse,
} from "../../../../services/auth";
import { SolicitacaoDetalhesModal } from "../../../../Components/Solicitacao/SolicitacaoDetalhesModal";
import { SolicitacaoImagemThumb } from "../../../../Components/Solicitacao/SolicitacaoImagemThumb";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";
import {
  formatarDataSolicitacao,
  getFaixaPrecoLabel,
  getStatusClass,
  getStatusLabel,
} from "../../../../utils/solicitacaoLabels";

type FiltroSolicitacao = "todas" | "aguardando" | "agendadas" | "concluidas";

const FILTROS: Array<{ id: FiltroSolicitacao; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "aguardando", label: "Aguardando propostas" },
  { id: "agendadas", label: "Agendadas" },
  { id: "concluidas", label: "Concluidas" },
];

export function Solicitacoes() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<FiltroSolicitacao>("todas");
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detalheAberto, setDetalheAberto] = useState<SolicitacaoServicoResponse | null>(null);

  useEffect(() => {
    async function carregarSolicitacoes() {
      const session = getValidAuthSession();

      if (!session?.token) {
        toast.error("Sessao expirada. Entre novamente.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/solicitacoes/cliente`, {
          headers: authHeader(session.token),
        });

        if (response.status === 401) {
          toast.error("Nao foi possivel autenticar suas solicitacoes. Entre novamente e tente de novo.");
          return;
        }

        if (!response.ok) {
          throw new Error(await getResponseError(response, "Nao foi possivel carregar suas solicitacoes."));
        }

        setSolicitacoes(await response.json() as SolicitacaoServicoResponse[]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar solicitacoes.");
      } finally {
        setIsLoading(false);
      }
    }

    void carregarSolicitacoes();
  }, [navigate]);

  const lista = useMemo(() => {
    if (filtro === "todas") return solicitacoes;
    if (filtro === "aguardando") return solicitacoes.filter((item) => item.status === "PUBLICADO" || item.status === "AGUARDANDO_PROPOSTAS");
    if (filtro === "agendadas") return solicitacoes.filter((item) => item.status === "AGENDADA");
    return solicitacoes.filter((item) => item.status === "CONCLUIDA");
  }, [filtro, solicitacoes]);

  return (
    <>
      <PainelSectionHeader
        eyebrow="Suas solicitacoes"
        title="Solicitacoes"
        description="Veja todas as solicitacoes que voce ja criou."
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

        {isLoading ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>Carregando solicitacoes...</p>
          </div>
        ) : lista.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>Nenhuma solicitacao encontrada para esse filtro.</p>
          </div>
        ) : (
          <div className="painel-lista">
            {lista.map((item) => {
              const tipoServico = TIPOS_SERVICO_MAP[item.tipoServico];
              const IconComponent = tipoServico?.icone || FileText;
              return (
                <div key={item.id} className="painel-lista-item">
                  {item.imagemUrl && (
                    <SolicitacaoImagemThumb
                      solicitacaoId={item.id}
                      imagemUrl={item.imagemUrl}
                      className="solicitacao-imagem-thumb"
                      onClick={() => setDetalheAberto(item)}
                    />
                  )}
                  <div className="painel-lista-item-info">
                    <p className="painel-lista-item-titulo">
                      <IconComponent size={18} style={{ marginRight: "8px", verticalAlign: "text-bottom" }} />
                      {tipoServico?.nome || item.tipoServico}
                    </p>
                    <div className="painel-lista-item-meta">
                      <span className="painel-lista-item-meta-detalhe">{getFaixaPrecoLabel(item.faixaPreco)}</span>
                      <span className="painel-lista-item-meta-detalhe">
                        <MapPin size={13} /> {item.endereco}
                      </span>
                      {item.data && (
                        <span className="painel-lista-item-meta-detalhe">
                          <Calendar size={13} /> {formatarDataSolicitacao(item.data)}
                        </span>
                      )}
                      {(item.status === "PUBLICADO" || item.status === "AGUARDANDO_PROPOSTAS") && (
                        <span className="painel-lista-item-meta-detalhe">
                          Aguardando propostas de prestadores
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="painel-lista-item-acoes">
                    <span className={`painel-status ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                    <button type="button" className="painel-btn-ghost" onClick={() => setDetalheAberto(item)}>
                      Ver detalhes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <SolicitacaoDetalhesModal
        solicitacao={detalheAberto}
        onFechar={() => setDetalheAberto(null)}
      />
    </>
  );
}

export default Solicitacoes;

async function getResponseError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return data.detail || data.message || fallback;
  } catch {
    return fallback;
  }
}
