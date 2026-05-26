import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Calendar, FileText, ImageIcon, MapPin, Trash2, Upload, X } from "lucide-react";

import {
  API_URL,
  authHeader,
  getValidAuthSession,
  type SolicitacaoServicoResponse,
} from "../../../../services/auth";
import { SolicitacaoDetalhesModal } from "../../../../Components/Solicitacao/SolicitacaoDetalhesModal";
import { SolicitacaoImagemThumb } from "../../../../Components/Solicitacao/SolicitacaoImagemThumb";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import { formatarMoedaBrl } from "../../../../utils/formatarMoeda";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";
import { otimizarImagemParaUpload } from "../../../../utils/otimizarImagemArquivo";
import {
  formatarDataSolicitacao,
  getFaixaPrecoLabel,
  getStatusClass,
  getStatusLabel,
} from "../../../../utils/solicitacaoLabels";

type FiltroSolicitacao = "todas" | "aguardando" | "agendadas" | "concluidas";
type EditForm = {
  tipoServico: string;
  faixaPreco: string;
  descricao: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  data: string;
  horario: string;
};

const FILTROS: Array<{ id: FiltroSolicitacao; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "aguardando", label: "Aguardando propostas" },
  { id: "agendadas", label: "Agendadas" },
  { id: "concluidas", label: "Concluidas" },
];

const FAIXAS_PRECO = [
  { value: "ATE_150", label: "Ate R$ 150" },
  { value: "DE_150_A_300", label: "R$ 150 a R$ 300" },
  { value: "DE_300_A_600", label: "R$ 300 a R$ 600" },
  { value: "DE_600_A_1000", label: "R$ 600 a R$ 1.000" },
  { value: "ACIMA_1000", label: "Acima de R$ 1.000" },
];

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

function podeEditarSolicitacao(status: string) {
  return status !== "AGENDADA";
}

export function Solicitacoes() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<FiltroSolicitacao>("todas");
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detalheAberto, setDetalheAberto] = useState<SolicitacaoServicoResponse | null>(null);
  const [editando, setEditando] = useState<SolicitacaoServicoResponse | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<SolicitacaoServicoResponse | null>(null);
  const [editImagemArquivo, setEditImagemArquivo] = useState<File | null>(null);
  const [editImagemPreviewUrl, setEditImagemPreviewUrl] = useState<string | null>(null);
  const [editRemoverImagem, setEditRemoverImagem] = useState(false);

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

  useEffect(() => () => {
    if (editImagemPreviewUrl) {
      URL.revokeObjectURL(editImagemPreviewUrl);
    }
  }, [editImagemPreviewUrl]);

  function abrirEdicao(item: SolicitacaoServicoResponse) {
    if (!podeEditarSolicitacao(item.status)) {
      toast.error("Nao e possivel editar uma solicitacao agendada.");
      return;
    }
    if (editImagemPreviewUrl) {
      URL.revokeObjectURL(editImagemPreviewUrl);
    }
    setEditando(item);
    setEditForm({
      tipoServico: item.tipoServico,
      faixaPreco: item.faixaPreco,
      descricao: item.descricao,
      cep: item.cep,
      rua: item.rua,
      numero: item.numero,
      complemento: item.complemento ?? "",
      bairro: item.bairro,
      cidade: item.cidade,
      estado: item.estado,
      data: item.data ?? "",
      horario: item.horario ?? "",
    });
    setEditImagemArquivo(null);
    setEditImagemPreviewUrl(null);
    setEditRemoverImagem(false);
  }

  function fecharEdicao() {
    if (salvandoEdicao) return;
    if (editImagemPreviewUrl) {
      URL.revokeObjectURL(editImagemPreviewUrl);
    }
    setEditando(null);
    setEditForm(null);
    setEditImagemArquivo(null);
    setEditImagemPreviewUrl(null);
    setEditRemoverImagem(false);
  }

  async function alterarFotoEdicao(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem valida.");
      return;
    }

    try {
      const otimizada = await otimizarImagemParaUpload(file);
      if (editImagemPreviewUrl) {
        URL.revokeObjectURL(editImagemPreviewUrl);
      }
      setEditImagemArquivo(otimizada);
      setEditImagemPreviewUrl(URL.createObjectURL(otimizada));
      setEditRemoverImagem(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel processar a imagem.");
    }
  }

  function removerFotoEdicao() {
    if (editImagemPreviewUrl) {
      URL.revokeObjectURL(editImagemPreviewUrl);
    }
    setEditImagemArquivo(null);
    setEditImagemPreviewUrl(null);
    setEditRemoverImagem(true);
  }

  async function salvarEdicao() {
    if (!editando || !editForm) return;
    if (!podeEditarSolicitacao(editando.status)) {
      toast.error("Nao e possivel editar uma solicitacao agendada.");
      return;
    }
    const session = getValidAuthSession();

    if (!session?.token) {
      toast.error("Sessao expirada. Entre novamente.");
      navigate("/login");
      return;
    }

    setSalvandoEdicao(true);
    try {
      const formData = new FormData();
      formData.append(
        "dados",
        new Blob([JSON.stringify(editForm)], { type: "application/json" }),
      );
      if (editImagemArquivo) {
        formData.append("imagem", editImagemArquivo);
      }
      if (editRemoverImagem) {
        formData.append("removerImagem", "true");
      }

      const response = await fetch(`${API_URL}/api/solicitacoes/${editando.id}`, {
        method: "PUT",
        headers: authHeader(session.token),
        body: formData,
      });

      if (response.status === 401) {
        toast.error("Sessao expirada. Entre novamente.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(await getResponseError(response, "Nao foi possivel editar a solicitacao."));
      }

      const atualizado = (await response.json()) as SolicitacaoServicoResponse;
      setSolicitacoes((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
      setDetalheAberto((atual) => (atual?.id === atualizado.id ? atualizado : atual));
      toast.success("Solicitacao editada e publicada novamente.");
      fecharEdicao();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao editar solicitacao.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function excluirSolicitacao(item: SolicitacaoServicoResponse) {
    const session = getValidAuthSession();
    if (!session?.token) {
      toast.error("Sessao expirada. Entre novamente.");
      navigate("/login");
      return;
    }

    setExcluindoId(item.id);
    try {
      const response = await fetch(`${API_URL}/api/solicitacoes/${item.id}`, {
        method: "DELETE",
        headers: authHeader(session.token),
      });

      if (response.status === 401) {
        toast.error("Sessao expirada. Entre novamente.");
        navigate("/login");
        return;
      }

      if (response.status === 404) {
        toast.error("Solicitacao nao encontrada no backend. Atualize a lista e tente novamente.");
        return;
      }

      if (!response.ok) {
        throw new Error(await getResponseError(response, "Nao foi possivel excluir a solicitacao."));
      }

      setSolicitacoes((atual) => atual.filter((s) => s.id !== item.id));
      setDetalheAberto((atual) => (atual?.id === item.id ? null : atual));
      toast.success("Solicitacao excluida com sucesso.");
      setConfirmarExclusao(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir solicitacao.");
    } finally {
      setExcluindoId(null);
    }
  }

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
                      <span className="painel-lista-item-meta-detalhe">
                        {item.status === "AGENDADA" && item.valorAceito != null
                          ? formatarMoedaBrl(item.valorAceito)
                          : getFaixaPrecoLabel(item.faixaPreco)}
                      </span>
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
                    {podeEditarSolicitacao(item.status) && (
                      <button type="button" className="painel-btn-ghost" onClick={() => abrirEdicao(item)}>
                        Editar
                      </button>
                    )}
                    <button
                      type="button"
                      className="painel-btn-recusar"
                      disabled={excluindoId === item.id}
                      onClick={() => setConfirmarExclusao(item)}
                    >
                      {excluindoId === item.id ? "Excluindo..." : "Excluir"}
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
        mostrarPrestador
      />

      {editando && editForm && (
        <div className="solicitacao-modal-overlay" role="presentation" onClick={fecharEdicao}>
          <div className="solicitacao-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="solicitacao-modal-cabecalho">
              <div className="solicitacao-modal-titulo-grupo">
                <h3>Editar solicitacao</h3>
              </div>
            </header>
            <div className="solicitacao-modal-corpo">
              <div className="workspace-form">
                <div className="painel-form-grid">
                  <label className="form-field">
                    <span className="form-label">Tipo de servico</span>
                    <div className="form-control">
                      <select value={editForm.tipoServico} onChange={(event) => setEditForm((atual) => atual ? { ...atual, tipoServico: event.target.value } : atual)}>
                        {Object.keys(TIPOS_SERVICO_MAP).map((tipo) => (
                          <option key={tipo} value={tipo}>{TIPOS_SERVICO_MAP[tipo]?.nome || tipo}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                  <label className="form-field">
                    <span className="form-label">Faixa de preco</span>
                    <div className="form-control">
                      <select value={editForm.faixaPreco} onChange={(event) => setEditForm((atual) => atual ? { ...atual, faixaPreco: event.target.value } : atual)}>
                        {FAIXAS_PRECO.map((faixa) => (
                          <option key={faixa.value} value={faixa.value}>{faixa.label}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                  <label className="form-field">
                    <span className="form-label">CEP</span>
                    <div className="form-control">
                      <input value={editForm.cep} onChange={(event) => setEditForm((atual) => atual ? { ...atual, cep: event.target.value } : atual)} />
                    </div>
                  </label>
                  <label className="form-field">
                    <span className="form-label">Rua</span>
                    <div className="form-control">
                      <input value={editForm.rua} onChange={(event) => setEditForm((atual) => atual ? { ...atual, rua: event.target.value } : atual)} />
                    </div>
                  </label>
                  <label className="form-field">
                    <span className="form-label">Numero</span>
                    <div className="form-control">
                      <input value={editForm.numero} onChange={(event) => setEditForm((atual) => atual ? { ...atual, numero: event.target.value } : atual)} />
                    </div>
                  </label>
                  <label className="form-field">
                    <span className="form-label">Complemento</span>
                    <div className="form-control">
                      <input value={editForm.complemento} onChange={(event) => setEditForm((atual) => atual ? { ...atual, complemento: event.target.value } : atual)} />
                    </div>
                  </label>
                  <label className="form-field">
                    <span className="form-label">Bairro</span>
                    <div className="form-control">
                      <input value={editForm.bairro} onChange={(event) => setEditForm((atual) => atual ? { ...atual, bairro: event.target.value } : atual)} />
                    </div>
                  </label>
                  <label className="form-field">
                    <span className="form-label">Cidade</span>
                    <div className="form-control">
                      <input value={editForm.cidade} onChange={(event) => setEditForm((atual) => atual ? { ...atual, cidade: event.target.value } : atual)} />
                    </div>
                  </label>
                  <label className="form-field">
                    <span className="form-label">Estado</span>
                    <div className="form-control">
                      <select value={editForm.estado} onChange={(event) => setEditForm((atual) => atual ? { ...atual, estado: event.target.value } : atual)}>
                        {ESTADOS_BR.map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                  <label className="form-field">
                    <span className="form-label">Data</span>
                    <div className="form-control">
                      <input type="date" value={editForm.data} onChange={(event) => setEditForm((atual) => atual ? { ...atual, data: event.target.value } : atual)} />
                    </div>
                  </label>
                  <label className="form-field">
                    <span className="form-label">Horario</span>
                    <div className="form-control">
                      <input type="time" value={editForm.horario} onChange={(event) => setEditForm((atual) => atual ? { ...atual, horario: event.target.value } : atual)} />
                    </div>
                  </label>
                  <label className="form-field form-field-full">
                    <span className="form-label">Descricao</span>
                    <div className="form-control form-control-textarea">
                      <textarea
                        maxLength={600}
                        value={editForm.descricao}
                        onChange={(event) => setEditForm((atual) => atual ? { ...atual, descricao: event.target.value } : atual)}
                      />
                    </div>
                  </label>
                  <label className="form-field form-field-full">
                    <span className="form-label">Foto do local</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <label className="btn-secondary" style={{ cursor: "pointer" }}>
                        <Upload size={16} /> Trocar foto
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={alterarFotoEdicao}
                          hidden
                        />
                      </label>
                      <button type="button" className="painel-btn-recusar" onClick={removerFotoEdicao}>
                        <Trash2 size={14} /> Remover foto
                      </button>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      {editImagemPreviewUrl ? (
                        <img
                          src={editImagemPreviewUrl}
                          alt="Nova foto da solicitacao"
                          style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(148, 163, 184, 0.3)" }}
                        />
                      ) : !editRemoverImagem && editando?.imagemUrl ? (
                        <SolicitacaoImagemThumb
                          solicitacaoId={editando.id}
                          imagemUrl={editando.imagemUrl}
                          className="solicitacao-imagem-thumb"
                        />
                      ) : (
                        <div className="solicitacao-imagem-placeholder" style={{ width: 120, height: 90 }}>
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <footer className="solicitacao-modal-rodape">
              <button type="button" className="btn-secondary" onClick={fecharEdicao} disabled={salvandoEdicao}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={salvarEdicao} disabled={salvandoEdicao}>
                {salvandoEdicao ? "Salvando..." : "Salvar e republicar"}
              </button>
            </footer>
          </div>
        </div>
      )}

      {confirmarExclusao && (
        <div className="solicitacao-modal-overlay" role="presentation" onClick={() => setConfirmarExclusao(null)}>
          <div
            className="solicitacao-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: 460 }}
          >
            <header className="solicitacao-modal-cabecalho">
              <div className="solicitacao-modal-titulo-grupo">
                <Trash2 size={20} />
                <h3>Excluir solicitacao</h3>
              </div>
              <button
                type="button"
                className="solicitacao-modal-fechar"
                onClick={() => setConfirmarExclusao(null)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </header>
            <div className="solicitacao-modal-corpo">
              <p style={{ marginTop: 0, fontWeight: 600, color: "var(--workspace-text)" }}>
                Deseja excluir esta solicitacao?
              </p>
              <p style={{ marginBottom: 0, color: "var(--workspace-muted)" }}>
                As propostas vinculadas tambem serao removidas. Essa acao nao pode ser desfeita.
              </p>
            </div>
            <footer className="solicitacao-modal-rodape">
              <button type="button" className="btn-secondary" onClick={() => setConfirmarExclusao(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="painel-btn-recusar"
                disabled={excluindoId === confirmarExclusao.id}
                onClick={() => excluirSolicitacao(confirmarExclusao)}
              >
                {excluindoId === confirmarExclusao.id ? "Excluindo..." : "Sim, excluir"}
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
