import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Calendar, Clock3, FileText, MapPin, X } from "lucide-react";

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
  enriquecerSolicitacao,
  filtrarOportunidades,
  formatarData,
  getFaixaPrecoLabel,
  type OportunidadeSolicitacao,
} from "../utils/filtrosSolicitacao";

export function Solicitacoes() {
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<OportunidadeSolicitacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPreco, setFiltroPreco] = useState("");
  const [filtroDistancia, setFiltroDistancia] = useState("");
  const [busca, setBusca] = useState("");
  const [detalheAberto, setDetalheAberto] = useState<OportunidadeSolicitacao | null>(null);

  useEffect(() => {
    async function carregarSolicitacoes() {
      const session = getValidAuthSession();

      if (!session?.token) {
        toast.error("Sessao expirada. Entre novamente.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/solicitacoes/prestador`, {
          headers: authHeader(session.token),
        });

        if (response.status === 401) {
          toast.error("Nao foi possivel autenticar. Entre novamente e tente de novo.");
          return;
        }

        if (!response.ok) {
          throw new Error(await getResponseError(response, "Nao foi possivel carregar as solicitacoes."));
        }

        const dados = (await response.json()) as SolicitacaoServicoResponse[];
        setSolicitacoes(dados.map(enriquecerSolicitacao));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar solicitacoes.");
      } finally {
        setIsLoading(false);
      }
    }

    void carregarSolicitacoes();
  }, [navigate]);

  const lista = useMemo(
    () =>
      filtrarOportunidades(solicitacoes, {
        busca,
        tipo: filtroTipo,
        preco: filtroPreco,
        distancia: filtroDistancia,
      }),
    [solicitacoes, busca, filtroTipo, filtroPreco, filtroDistancia],
  );

  const temFiltrosAtivos = Boolean(filtroTipo || filtroPreco || filtroDistancia || busca);

  function limparFiltros() {
    setFiltroTipo("");
    setFiltroPreco("");
    setFiltroDistancia("");
    setBusca("");
  }

  function verNoMapa() {
    if (lista.length === 0) {
      toast.info("Nenhuma solicitacao para exibir no mapa.");
      return;
    }

    const primeira = lista[0];
    const endereco = encodeURIComponent(primeira.endereco || `${primeira.rua}, ${primeira.cidade}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${endereco}`, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <PainelSectionHeader
        eyebrow="Oportunidades"
        title="Solicitacoes"
        description="Filtre por tipo, preco e distancia. Envie propostas para os servicos disponiveis."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho painel-card-cabecalho-coluna">
          <h2>Propostas de clientes</h2>
          <div className="painel-filtros-toolbar">
            <div className="painel-filtro-grupo painel-filtro-grupo-busca">
              <input
                type="search"
                className="painel-filtro-input"
                placeholder="Buscar proposta..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="painel-filtro-grupo">
              <select
                className="painel-filtro-select"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Tipo</option>
                <option value="eletrica">Eletrica</option>
                <option value="hidraulica">Hidraulica</option>
                <option value="moveis">Montagem de moveis</option>
                <option value="manutencao">Manutencao geral</option>
                <option value="pintura">Pintura</option>
                <option value="eletro">Eletrodomesticos</option>
              </select>
            </div>
            <div className="painel-filtro-grupo">
              <select
                className="painel-filtro-select"
                value={filtroPreco}
                onChange={(e) => setFiltroPreco(e.target.value)}
              >
                <option value="">Preco</option>
                <option value="0-150">Ate R$ 150</option>
                <option value="150-300">R$ 150 - R$ 300</option>
                <option value="300-600">R$ 300 - R$ 600</option>
                <option value="600+">Acima de R$ 600</option>
              </select>
            </div>
            <div className="painel-filtro-grupo">
              <select
                className="painel-filtro-select"
                value={filtroDistancia}
                onChange={(e) => setFiltroDistancia(e.target.value)}
              >
                <option value="">Distancia</option>
                <option value="0-2">Ate 2 km</option>
                <option value="2-5">2 - 5 km</option>
                <option value="5-10">5 - 10 km</option>
                <option value="10+">Acima de 10 km</option>
              </select>
            </div>
            <button type="button" className="painel-btn-mapa" onClick={verNoMapa}>
              <MapPin size={16} />
              Ver no mapa
            </button>
            {temFiltrosAtivos && (
              <button type="button" className="painel-btn-limpar" onClick={limparFiltros}>
                <X size={16} />
                Limpar
              </button>
            )}
          </div>
          {lista.length === 0 && solicitacoes.length > 0 && !isLoading && (
            <p className="painel-filtro-aviso">Nenhuma proposta encontrada com os filtros selecionados.</p>
          )}
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
              <MapPin size={32} />
            </div>
            <p>Nenhuma solicitacao encontrada.</p>
          </div>
        ) : (
          <div className="painel-lista">
            {lista.map((item) => {
              const tipoServico = TIPOS_SERVICO_MAP[item.tipoServico];
              const IconComponent = tipoServico?.icone || FileText;
              const nova = item.status === "PUBLICADO" || item.status === "AGUARDANDO_PROPOSTAS";

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
                      {nova && <span className="painel-badge-novo">NOVO</span>}
                    </p>
                    <div className="painel-lista-item-meta">
                      <span className="painel-lista-item-meta-detalhe">
                        <strong>{item.clienteNome}</strong>
                      </span>
                      <span className="painel-lista-item-meta-detalhe">{getFaixaPrecoLabel(item.faixaPreco)}</span>
                      <span className="painel-lista-item-meta-detalhe">
                        <MapPin size={13} /> {item.endereco}
                      </span>
                      <span className="painel-lista-item-meta-detalhe">{item.distanciaKm.toFixed(1)} km</span>
                      {item.data && (
                        <span className="painel-lista-item-meta-detalhe">
                          <Calendar size={13} /> {formatarData(item.data)}
                        </span>
                      )}
                      {item.horario && (
                        <span className="painel-lista-item-meta-detalhe">
                          <Clock3 size={13} /> {item.horario}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="painel-lista-item-acoes">
                    <span className="painel-status aguardando">Nova oportunidade</span>
                    <button type="button" className="painel-btn-ghost" onClick={() => setDetalheAberto(item)}>
                      Ver detalhes
                    </button>
                    <button type="button" className="painel-btn-aceitar">
                      Enviar proposta
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
        mostrarCliente
        distanciaKm={detalheAberto?.distanciaKm}
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

