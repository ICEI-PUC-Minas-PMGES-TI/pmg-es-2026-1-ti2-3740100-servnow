import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Calendar, Clock3, FileText, List, MapPin, X } from "lucide-react";

import {
  API_URL,
  authHeader,
  authHeaders,
  buscarPerfilPublico,
  getValidAuthSession,
  type PerfilPublicoResponse,
  type PerfilResponse,
  type PropostaCreateRequest,
  type SolicitacaoServicoResponse,
} from "../../../../services/auth";
import type { LocalPrestadorMapa } from "../../../../Components/Mapa/MapaOportunidades";
import { PerfilPublicoConteudo } from "../../../../Components/Perfil/PerfilPublicoModal";
import { SolicitacaoDetalhesModal } from "../../../../Components/Solicitacao/SolicitacaoDetalhesModal";
import { SolicitacaoImagemThumb } from "../../../../Components/Solicitacao/SolicitacaoImagemThumb";
import { MapaOportunidades } from "../../../../Components/Mapa/MapaOportunidades";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import { dispararAtualizacaoNotificacoes } from "../../../../services/notificacoes";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";
import {
  enriquecerSolicitacao,
  filtrarOportunidades,
  formatarData,
  formatarDistancia,
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
  const [propostaAberta, setPropostaAberta] = useState<OportunidadeSolicitacao | null>(null);
  const [valorProposta, setValorProposta] = useState("");
  const [mensagemProposta, setMensagemProposta] = useState("");
  const [enviandoProposta, setEnviandoProposta] = useState(false);
  const [perfilCliente, setPerfilCliente] = useState<PerfilPublicoResponse | null>(null);
  const [carregandoPerfilCliente, setCarregandoPerfilCliente] = useState(false);
  const [visualizacao, setVisualizacao] = useState<"lista" | "mapa">("lista");
  const [localPrestador, setLocalPrestador] = useState<LocalPrestadorMapa | null>(null);

  useEffect(() => {
    async function carregarLocalPrestador() {
      const session = getValidAuthSession();
      if (!session?.token) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/perfil/prestador`, {
          headers: authHeader(session.token),
        });
        if (!response.ok) {
          return;
        }

        const perfil = (await response.json()) as PerfilResponse;
        if (
          perfil.latitude == null ||
          perfil.longitude == null ||
          !Number.isFinite(perfil.latitude) ||
          !Number.isFinite(perfil.longitude)
        ) {
          return;
        }

        const endereco = [perfil.rua, perfil.numero, perfil.bairro, perfil.cidade, perfil.estado]
          .filter(Boolean)
          .join(", ");

        setLocalPrestador({
          latitude: perfil.latitude,
          longitude: perfil.longitude,
          endereco: endereco || undefined,
        });
      } catch {
        // Local do prestador e opcional no mapa.
      }
    }

    void carregarLocalPrestador();
  }, [navigate]);

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

  const semLocalizacaoNoMapa = useMemo(
    () =>
      lista.filter(
        (item) =>
          item.latitude == null ||
          item.longitude == null ||
          !Number.isFinite(item.latitude) ||
          !Number.isFinite(item.longitude),
      ).length,
    [lista],
  );

  function limparFiltros() {
    setFiltroTipo("");
    setFiltroPreco("");
    setFiltroDistancia("");
    setBusca("");
  }

  function abrirVisualizacaoMapa() {
    if (lista.length === 0) {
      toast.info("Nenhuma solicitacao para exibir no mapa.");
      return;
    }
    setVisualizacao("mapa");
  }

  async function abrirModalProposta(item: OportunidadeSolicitacao) {
    setPropostaAberta(item);
    setValorProposta("");
    setMensagemProposta("");
    setPerfilCliente(null);
    setCarregandoPerfilCliente(true);
    const session = getValidAuthSession();
    if (!session?.token) {
      setCarregandoPerfilCliente(false);
      return;
    }
    try {
      const perfil = await buscarPerfilPublico(item.clienteId, session.token);
      if (perfil) {
        setPerfilCliente(perfil);
      }
    } catch {
      // Perfil publico e opcional na tela de proposta.
    } finally {
      setCarregandoPerfilCliente(false);
    }
  }

  async function enviarProposta() {
    if (!propostaAberta) return;
    const valor = Number(valorProposta.replace(",", "."));
    if (!Number.isFinite(valor) || valor <= 0) {
      toast.error("Informe um valor valido para a proposta.");
      return;
    }
    if (!mensagemProposta.trim()) {
      toast.error("Escreva uma mensagem para o cliente.");
      return;
    }

    const session = getValidAuthSession();
    if (!session?.token) {
      toast.error("Sessao expirada. Entre novamente.");
      navigate("/login");
      return;
    }

    const payload: PropostaCreateRequest = {
      solicitacaoId: propostaAberta.id,
      valor,
      mensagem: mensagemProposta.trim(),
    };

    setEnviandoProposta(true);
    try {
      const response = await fetch(`${API_URL}/api/propostas`, {
        method: "POST",
        headers: authHeaders(session.token, "application/json"),
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        toast.error("Sessao expirada. Entre novamente.");
        navigate("/login");
        return;
      }
      if (response.status === 404) {
        toast.error("Esta solicitacao nao esta mais disponivel para proposta. Atualize a lista.");
        setPropostaAberta(null);
        setSolicitacoes((atual) => atual.filter((item) => item.id !== propostaAberta.id));
        return;
      }
      if (!response.ok) {
        throw new Error(await getResponseError(response, "Nao foi possivel enviar a proposta."));
      }

      const solicitacaoId = propostaAberta.id;
      toast.success("Proposta enviada com sucesso.");
      setPropostaAberta(null);
      setSolicitacoes((atual) => atual.filter((item) => item.id !== solicitacaoId));
      if (detalheAberto?.id === solicitacaoId) {
        setDetalheAberto(null);
      }
      dispararAtualizacaoNotificacoes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar proposta.");
    } finally {
      setEnviandoProposta(false);
    }
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
            <div className="painel-visualizacao-toggle" role="group" aria-label="Visualizacao">
              <button
                type="button"
                className={visualizacao === "lista" ? "is-active" : ""}
                onClick={() => setVisualizacao("lista")}
              >
                <List size={14} style={{ marginRight: 6, verticalAlign: "text-bottom" }} />
                Lista
              </button>
              <button
                type="button"
                className={visualizacao === "mapa" ? "is-active" : ""}
                onClick={abrirVisualizacaoMapa}
              >
                <MapPin size={14} style={{ marginRight: 6, verticalAlign: "text-bottom" }} />
                Mapa
              </button>
            </div>
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

        {visualizacao === "mapa" && !isLoading && lista.length > 0 && (
          <>
            {!localPrestador && (
              <p className="painel-filtro-aviso">
                Cadastre seu endereco completo em Configurar perfil para ver sua localizacao como referencia no mapa.
              </p>
            )}
            <MapaOportunidades
              oportunidades={lista}
              semLocalizacao={semLocalizacaoNoMapa}
              localPrestador={localPrestador}
              onSelecionar={(item: OportunidadeSolicitacao) => setDetalheAberto(item)}
            />
          </>
        )}

        {isLoading ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>Carregando solicitacoes...</p>
          </div>
        ) : visualizacao === "mapa" && lista.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <MapPin size={32} />
            </div>
            <p>Nenhuma solicitacao encontrada para o mapa.</p>
          </div>
        ) : visualizacao === "mapa" ? null : lista.length === 0 ? (
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
                      <span className="painel-lista-item-meta-detalhe">
                        {formatarDistancia(item.distanciaKm, item.distanciaLinhaReta)}
                      </span>
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
                    <button type="button" className="painel-btn-aceitar" onClick={() => void abrirModalProposta(item)}>
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
        distanciaLinhaReta={detalheAberto?.distanciaLinhaReta}
      />

      {propostaAberta && (
        <div className="solicitacao-modal-overlay" role="presentation" onClick={() => setPropostaAberta(null)}>
          <div className="solicitacao-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="solicitacao-modal-cabecalho">
              <div className="solicitacao-modal-titulo-grupo">
                <h3>Enviar proposta</h3>
              </div>
            </header>
            <div className="solicitacao-modal-corpo">
              <section className="painel-card" style={{ padding: 14, marginBottom: 10 }}>
                <h4 style={{ marginTop: 0, marginBottom: 10 }}>Perfil do cliente</h4>
                <PerfilPublicoConteudo perfil={perfilCliente} carregando={carregandoPerfilCliente} />
              </section>
              <div className="painel-form-grid">
                <label className="form-field">
                  <span className="form-label">Valor proposto (R$)</span>
                  <div className="form-control">
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={valorProposta}
                      onChange={(event) => setValorProposta(event.target.value)}
                      placeholder="Ex: 150.00"
                    />
                  </div>
                </label>
                <label className="form-field form-field-full">
                  <span className="form-label">Mensagem para o cliente</span>
                  <div className="form-control form-control-textarea">
                    <textarea
                      maxLength={800}
                      value={mensagemProposta}
                      onChange={(event) => setMensagemProposta(event.target.value)}
                      placeholder="Descreva o que esta incluido no atendimento e sua disponibilidade."
                    />
                  </div>
                </label>
              </div>
            </div>
            <footer className="solicitacao-modal-rodape">
              <button type="button" className="btn-secondary" onClick={() => setPropostaAberta(null)} disabled={enviandoProposta}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={enviarProposta} disabled={enviandoProposta}>
                {enviandoProposta ? "Enviando..." : "Enviar proposta"}
              </button>
            </footer>
          </div>
        </div>
      )}
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

