import {
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  QrCode,
  RefreshCw,
  Send,
  Smartphone,
  Star,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { AtualizacaoFoto } from "../../../../Components/Acompanhamento/AtualizacaoFoto";
import { BotaoRota } from "../../../../Components/Acompanhamento/BotaoRota";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  avaliarCliente,
  carregarPixCopiaCola,
  carregarPixQrCode,
  concluirExecucao,
  confirmarChegada,
  obterDetalhe,
  registrarAtualizacao,
  solicitarReagendamento,
  type AcompanhamentoDetalhe
} from "../../../../services/acompanhamento";
import {
  formatarDataHoraAcompanhamento,
  formatarHorarioAcompanhamento,
} from "../../../../utils/acompanhamentoLabels";
import { formatarMoedaBrl } from "../../../../utils/formatarMoeda";
import { formatarDataSolicitacao } from "../../../../utils/solicitacaoLabels";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";

type PrestadorEtapa = "confirmar-chegada" | "em-execucao" | "aguardando-reagendamento" | "visita-reagendada" | "aguardando-pagamento" | "aguardando-avaliacao" | "concluido";

const ETAPAS_INFO: Array<{ id: PrestadorEtapa; label: string; numero: number }> = [
  { id: "confirmar-chegada", label: "Chegada", numero: 1 },
  { id: "em-execucao", label: "Em execucao", numero: 2 },
  { id: "aguardando-pagamento", label: "Pagamento", numero: 3 },
  { id: "aguardando-avaliacao", label: "Avaliacao", numero: 4 },
];

function etapaBackendParaPrestador(etapa: string): PrestadorEtapa {
  switch (etapa) {
    case "EM_ANDAMENTO":
      return "em-execucao";
    case "AGUARDANDO_REAGENDAMENTO":
      return "aguardando-reagendamento";
    case "VISITA_REAGENDADA":
      return "visita-reagendada";
    case "AGUARDANDO_PAGAMENTO":
      return "aguardando-pagamento";
    case "AGUARDANDO_AVALIACAO":
      return "aguardando-avaliacao";
    case "CONCLUIDA":
      return "concluido";
    default:
      return "confirmar-chegada";
  }
}

type Props = {
  solicitacaoId: number;
};

export function AcompanhamentoPrestadorDetalhe({ solicitacaoId }: Props) {
  const navigate = useNavigate();
  const [detalhe, setDetalhe] = useState<AcompanhamentoDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [codigo, setCodigo] = useState(["", "", "", ""]);
  const [novaAtualizacao, setNovaAtualizacao] = useState("");
  const [novaFoto, setNovaFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pixQrUrl, setPixQrUrl] = useState<string | null>(null);
  const [pixCopiaCola, setPixCopiaCola] = useState<string | null>(null);
  const [carregandoPixQr, setCarregandoPixQr] = useState(false);
  const [pixQrErro, setPixQrErro] = useState<string | null>(null);
  const [notaCliente, setNotaCliente] = useState(0);
  const [comentarioCliente, setComentarioCliente] = useState("");
  const [percentualReagendamento, setPercentualReagendamento] = useState(50);
  const [observacaoReagendamento, setObservacaoReagendamento] = useState("");

  const carregar = useCallback(async () => {
    try {
      const dados = await obterDetalhe(solicitacaoId);
      setDetalhe(dados);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar acompanhamento.");
      navigate("/acompanhamento");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, solicitacaoId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const etapa = detalhe ? etapaBackendParaPrestador(detalhe.etapa) : "confirmar-chegada";
  const progressoAtual = detalhe?.percentualConcluido ?? 0;
  const percentualMinimo = Math.min(progressoAtual + 1, 99);

  useEffect(() => {
    if (percentualReagendamento < percentualMinimo) {
      setPercentualReagendamento(percentualMinimo);
    }
  }, [percentualMinimo, percentualReagendamento]);

  useEffect(() => {
    if (etapa !== "aguardando-pagamento") {
      return;
    }
    const intervalo = window.setInterval(() => {
      void obterDetalhe(solicitacaoId)
        .then(setDetalhe)
        .catch(() => undefined);
    }, 3000);
    return () => window.clearInterval(intervalo);
  }, [etapa, solicitacaoId]);

  const clienteEscolheuPix = detalhe?.metodoPagamentoSelecionado === "PIX";

  useEffect(() => {
    if (etapa !== "aguardando-pagamento") {
      setPixQrUrl((anterior) => {
        if (anterior) {
          URL.revokeObjectURL(anterior);
        }
        return null;
      });
      setPixCopiaCola(null);
      setPixQrErro(null);
      return;
    }

    let cancelado = false;

    async function carregarPix() {
      setCarregandoPixQr(true);
      setPixQrErro(null);
      try {
        const [url, copiaCola] = await Promise.all([
          carregarPixQrCode(solicitacaoId),
          carregarPixCopiaCola(solicitacaoId),
        ]);
        if (cancelado) {
          URL.revokeObjectURL(url);
          return;
        }
        setPixQrUrl((anterior) => {
          if (anterior) {
            URL.revokeObjectURL(anterior);
          }
          return url;
        });
        setPixCopiaCola(copiaCola);
      } catch (error) {
        if (!cancelado) {
          setPixQrUrl((anterior) => {
            if (anterior) {
              URL.revokeObjectURL(anterior);
            }
            return null;
          });
          setPixCopiaCola(null);
          setPixQrErro(error instanceof Error ? error.message : "Nao foi possivel gerar o QR Code PIX.");
        }
      } finally {
        if (!cancelado) {
          setCarregandoPixQr(false);
        }
      }
    }

    void carregarPix();

    return () => {
      cancelado = true;
    };
  }, [etapa, solicitacaoId]);

  async function copiarCodigoPix() {
    if (!pixCopiaCola) {
      return;
    }
    try {
      await navigator.clipboard.writeText(pixCopiaCola);
      toast.success("Codigo PIX copiado.");
    } catch {
      toast.error("Nao foi possivel copiar o codigo PIX.");
    }
  }

  useEffect(() => {
    return () => {
      setPixQrUrl((anterior) => {
        if (anterior) {
          URL.revokeObjectURL(anterior);
        }
        return null;
      });
    };
  }, []);

  const tituloServico = detalhe
    ? (TIPOS_SERVICO_MAP[detalhe.tipoServico]?.nome ?? detalhe.tipoServico)
    : "";
  const etapaAtualIndex = ETAPAS_INFO.findIndex((e) => e.id === (
    etapa === "aguardando-reagendamento" ? "em-execucao" : etapa === "visita-reagendada" ? "confirmar-chegada" : etapa
  ));
  const valorExibir = detalhe?.valorFinal ?? detalhe?.valorAceito ?? 0;

  const iniciaisCliente = useMemo(() => {
    const nome = detalhe?.clienteNome ?? "";
    return nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "C";
  }, [detalhe?.clienteNome]);

  function handleCodigoChange(index: number, valor: string) {
    const apenasDigito = valor.replace(/\D/g, "").slice(-1);
    const novo = [...codigo];
    novo[index] = apenasDigito;
    setCodigo(novo);

    if (apenasDigito && index < 3) {
      const proximo = document.querySelector<HTMLInputElement>(`#codigo-${index + 1}`);
      proximo?.focus();
    }
  }

  function handleFotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setNovaFoto(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewFoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function handleConfirmarChegada() {
    const codigoCompleto = codigo.join("");
    if (codigoCompleto.length !== 4) {
      toast.error("Informe o codigo de 4 digitos.");
      return;
    }
    setEnviando(true);
    try {
      setDetalhe(await confirmarChegada(solicitacaoId, codigoCompleto));
      setCodigo(["", "", "", ""]);
      toast.success("Chegada confirmada. Servico iniciado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Codigo invalido.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleEnviarAtualizacao() {
    if (!novaAtualizacao.trim()) return;
    setEnviando(true);
    try {
      setDetalhe(await registrarAtualizacao(solicitacaoId, novaAtualizacao.trim(), novaFoto ?? undefined));
      setNovaAtualizacao("");
      setNovaFoto(null);
      setPreviewFoto(null);
      toast.success("Atualizacao enviada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar atualizacao.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleConcluirServico() {
    setEnviando(true);
    try {
      setDetalhe(await concluirExecucao(solicitacaoId));
      toast.success("Execucao concluida. Aguardando pagamento do cliente.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao concluir servico.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleSolicitarReagendamento() {
    if (percentualReagendamento <= progressoAtual) {
      toast.error(`Informe um percentual maior que ${progressoAtual}%.`);
      return;
    }
    setEnviando(true);
    try {
      setDetalhe(await solicitarReagendamento(
        solicitacaoId,
        percentualReagendamento,
        observacaoReagendamento || undefined,
      ));
      setObservacaoReagendamento("");
      toast.success("Reagendamento solicitado. Aguardando o cliente escolher o horario.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao solicitar reagendamento.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleAvaliarCliente() {
    if (notaCliente === 0) {
      toast.error("Selecione uma nota. A avaliacao do cliente e obrigatoria.");
      return;
    }
    setEnviando(true);
    try {
      const atualizado = await avaliarCliente(solicitacaoId, notaCliente, comentarioCliente || undefined);
      setDetalhe(atualizado);
      setNotaCliente(0);
      setComentarioCliente("");
      if (atualizado.etapa === "CONCLUIDA") {
        toast.success("Avaliacao enviada. Servico finalizado!");
      } else {
        toast.success("Avaliacao enviada. Aguardando o cliente avaliar o servico.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar avaliacao.");
    } finally {
      setEnviando(false);
    }
  }

  const prestadorJaAvaliouCliente = detalhe?.notaAvaliacaoPrestador != null;
  const clienteJaAvaliouPrestador = detalhe?.notaAvaliacao != null;
  const avaliacaoPrestadorPendente =
    (etapa === "aguardando-avaliacao" || etapa === "concluido") && !prestadorJaAvaliouCliente;

  if (isLoading || !detalhe) {
    return (
      <div className="painel-vazio">
        <p>Carregando acompanhamento...</p>
      </div>
    );
  }

  return (
    <>
      {!avaliacaoPrestadorPendente && (
        <button type="button" className="painel-btn-ghost" onClick={() => navigate("/acompanhamento")} style={{ marginBottom: 12 }}>
          <ArrowLeft size={16} />
          Voltar para lista
        </button>
      )}

      {avaliacaoPrestadorPendente && (
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--brand-strong)", fontWeight: 600 }}>
          Avalie o cliente para concluir o servico. Esta etapa e obrigatoria.
        </p>
      )}

      <PainelSectionHeader
        eyebrow="Servico em andamento"
        title={tituloServico}
        description="Confirme sua chegada e mantenha o cliente informado sobre o andamento."
      />

      {etapa !== "concluido" && (
        <div className="acomp-stepper">
          {ETAPAS_INFO.map((info, index) => {
            const ativo = etapa === info.id
              || (etapa === "aguardando-reagendamento" && info.id === "em-execucao")
              || (etapa === "visita-reagendada" && info.id === "confirmar-chegada");
            const concluido = index < etapaAtualIndex;
            const classe = ativo ? "ativo" : concluido ? "concluido" : "";
            return (
              <span key={info.id} style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
                <span className={`acomp-stepper-item ${classe}`}>
                  <span className="acomp-stepper-circulo">
                    {concluido ? <CheckCircle2 size={16} /> : info.numero}
                  </span>
                  {info.label}
                </span>
                {index < ETAPAS_INFO.length - 1 && <span className="acomp-stepper-linha" />}
              </span>
            );
          })}
        </div>
      )}

      {etapa === "confirmar-chegada" && (
        <section className="painel-card">
          <div className="acomp-codigo-centro">
            <div className="acomp-codigo-icone">
              <MapPin size={26} />
            </div>
            <h2 className="acomp-codigo-titulo">Voce chegou?</h2>
            <p className="acomp-codigo-sub">Digite o codigo de 4 digitos que o cliente vai te mostrar</p>

            <div className="acomp-cliente-mini">
              <div className="acomp-cliente-mini-avatar">{iniciaisCliente}</div>
              <div className="acomp-cliente-mini-info">
                <strong>{detalhe.clienteNome}</strong>
                <span>{detalhe.endereco}</span>
                <span style={{ display: "block", marginTop: 6 }}>{tituloServico}</span>
                {progressoAtual > 0 && (
                  <span style={{ display: "block", marginTop: 8, color: "var(--brand-strong)", fontWeight: 600 }}>
                    Progresso do servico: {progressoAtual}%
                  </span>
                )}
              </div>
            </div>

            <BotaoRota endereco={detalhe.endereco} />

            <div className="acomp-codigo-input-grupo">
              <span className="acomp-codigo-label">Codigo do cliente</span>
              <div className="acomp-codigo-inputs">
                {codigo.map((digito, index) => (
                  <input
                    key={index}
                    id={`codigo-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="acomp-codigo-input"
                    value={digito}
                    onChange={(event) => handleCodigoChange(index, event.target.value)}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              className="acomp-btn-primary"
              onClick={() => void handleConfirmarChegada()}
              disabled={enviando}
            >
              Confirmar chegada
            </button>
          </div>
        </section>
      )}

      {etapa === "em-execucao" && (
        <>
          <section className="painel-card acomp-card-servico">
            <div className="acomp-card-servico-cabecalho">
              <div>
                <h2>{tituloServico}</h2>
                <p style={{ margin: "4px 0 0", color: "var(--workspace-muted)", fontSize: 13 }}>
                  Cliente: {detalhe.clienteNome}
                </p>
              </div>
              <span className="painel-status agendado">EM ANDAMENTO</span>
            </div>
            <div className="acomp-card-servico-meta">
              <span><Clock size={14} /> Iniciado as {formatarHorarioAcompanhamento(detalhe.iniciadoEm)}</span>
              <span><Clock size={14} /> Previsao: {formatarHorarioAcompanhamento(detalhe.previstoTerminoEm)}</span>
            </div>
            {progressoAtual > 0 && (
              <div className="acomp-progresso" style={{ marginTop: 14 }}>
                <div className="acomp-progresso-cabecalho">
                  <span>Progresso acumulado</span>
                  <strong>{progressoAtual}%</strong>
                </div>
                <div className="acomp-progresso-barra">
                  <span style={{ width: `${progressoAtual}%` }} />
                </div>
              </div>
            )}
            <BotaoRota endereco={detalhe.endereco} />
          </section>

          <section className="painel-card">
            <div className="painel-card-cabecalho">
              <h2>Enviar atualizacao</h2>
            </div>

            <div className="acomp-form-bloco">
              <textarea
                className="acomp-textarea"
                placeholder="Descreva o andamento do servico..."
                value={novaAtualizacao}
                onChange={(event) => setNovaAtualizacao(event.target.value)}
              />

              <label className="acomp-upload">
                <Camera size={20} />
                <span>{previewFoto ? "Trocar foto" : "Tirar ou adicionar foto"}</span>
                <input type="file" accept="image/*" onChange={handleFotoUpload} />
              </label>

              {previewFoto && (
                <div className="acomp-foto-preview">
                  <img src={previewFoto} alt="Preview da nova atualizacao" />
                </div>
              )}

              <button
                type="button"
                className="acomp-btn-primary"
                onClick={() => void handleEnviarAtualizacao()}
                disabled={!novaAtualizacao.trim() || enviando}
              >
                <Send size={16} />
                Enviar atualizacao
              </button>
            </div>
          </section>

          <section className="painel-card">
            <div className="painel-card-cabecalho">
              <h2>Atualizacoes anteriores</h2>
            </div>
            {detalhe.atualizacoes.length === 0 ? (
              <p style={{ color: "var(--workspace-muted)", fontSize: 13 }}>Nenhuma atualizacao enviada ainda.</p>
            ) : (
              <div className="acomp-timeline">
                {detalhe.atualizacoes.map((atualizacao) => (
                  <div key={atualizacao.id} className="acomp-timeline-item">
                    <span className="acomp-timeline-data">{formatarDataHoraAcompanhamento(atualizacao.criadoEm)}</span>
                    <p>{atualizacao.descricao}</p>
                    {atualizacao.fotoUrl && (
                      <AtualizacaoFoto fotoUrl={atualizacao.fotoUrl} alt={`Atualizacao ${atualizacao.id}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="acomp-reagendar-bloco" style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--workspace-border)" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>Servico nao concluido nesta visita?</h3>
              <p style={{ margin: "0 0 14px", color: "var(--workspace-muted)", fontSize: 13 }}>
                Informe o percentual concluido e solicite um reagendamento com o cliente.
              </p>

              <label className="acomp-codigo-label" htmlFor="percentual-reagendamento">
                Percentual concluido ({percentualReagendamento}%)
              </label>
              <input
                id="percentual-reagendamento"
                type="range"
                min={percentualMinimo}
                max={99}
                value={percentualReagendamento}
                onChange={(event) => setPercentualReagendamento(Number(event.target.value))}
                style={{ width: "100%", marginBottom: 12 }}
              />

              <textarea
                className="acomp-textarea"
                placeholder="Observacao para o cliente (opcional)..."
                value={observacaoReagendamento}
                onChange={(event) => setObservacaoReagendamento(event.target.value)}
                style={{ marginBottom: 12 }}
              />

              <button
                type="button"
                className="painel-btn-ghost"
                onClick={() => void handleSolicitarReagendamento()}
                disabled={enviando}
              >
                <RefreshCw size={16} />
                Solicitar reagendamento
              </button>
            </div>

            <button
              type="button"
              className="acomp-btn-primary"
              onClick={() => void handleConcluirServico()}
              disabled={enviando}
              style={{ marginTop: 18 }}
            >
              <CheckCircle2 size={16} />
              Concluir servico (100%)
            </button>
          </section>
        </>
      )}

      {etapa === "aguardando-reagendamento" && (
        <section className="painel-card">
          <div className="painel-card-cabecalho">
            <h2>Aguardando reagendamento</h2>
          </div>
          <p style={{ color: "var(--workspace-muted)", fontSize: 13, marginBottom: 14 }}>
            O cliente precisa escolher um novo horario para continuar o servico.
          </p>
          <div className="acomp-progresso">
            <div className="acomp-progresso-cabecalho">
              <span>Progresso informado</span>
              <strong>{progressoAtual}%</strong>
            </div>
            <div className="acomp-progresso-barra">
              <span style={{ width: `${progressoAtual}%` }} />
            </div>
          </div>
          {detalhe.observacaoReagendamento && (
            <p style={{ marginTop: 14, fontSize: 13 }}>
              <strong>Sua observacao:</strong> {detalhe.observacaoReagendamento}
            </p>
          )}
        </section>
      )}

      {etapa === "visita-reagendada" && (
        <section className="painel-card">
          <div className="painel-card-cabecalho">
            <h2>Visita reagendada</h2>
          </div>
          <p style={{ color: "var(--workspace-muted)", fontSize: 13, marginBottom: 14 }}>
            O cliente confirmou o novo horario. Retorne na data agendada para continuar o servico.
          </p>

          <div className="acomp-card-servico-meta" style={{ marginBottom: 14 }}>
            <span><Calendar size={14} /> {detalhe.data ? formatarDataSolicitacao(detalhe.data) : "--"} as {detalhe.horario ?? "--:--"}</span>
            <span><Clock size={14} /> Cliente: {detalhe.clienteNome}</span>
          </div>

          <div className="acomp-progresso">
            <div className="acomp-progresso-cabecalho">
              <span>Progresso do servico</span>
              <strong>{progressoAtual}%</strong>
            </div>
            <div className="acomp-progresso-barra">
              <span style={{ width: `${progressoAtual}%` }} />
            </div>
          </div>

          <button
            type="button"
            className="painel-btn-ghost"
            style={{ marginTop: 18 }}
            onClick={() => navigate("/acompanhamento")}
          >
            Voltar para lista
          </button>
        </section>
      )}

      {etapa === "aguardando-pagamento" && (
        <section className="painel-card">
          <div className="painel-card-cabecalho">
            <h2>Aguardando pagamento</h2>
          </div>

          <div className="acomp-pagamento-total">
            <span>Total do servico - {tituloServico}</span>
            <strong>{formatarMoedaBrl(valorExibir)}</strong>
          </div>

          <p style={{ color: "var(--workspace-muted)", fontSize: 13, marginBottom: 14 }}>
            {clienteEscolheuPix
              ? "O cliente escolheu PIX. Mostre o QR Code abaixo para receber o pagamento."
              : "QR Code PIX disponivel abaixo. O cliente ainda pode alterar a forma de pagamento no app."}
          </p>

          <div className="acomp-pix-qr-container">
            {carregandoPixQr && !pixQrUrl && (
              <p className="acomp-pix-qr-status">Gerando QR Code PIX...</p>
            )}
            {pixQrUrl && (
              <img
                src={pixQrUrl}
                alt="QR Code PIX para pagamento do servico"
                className="acomp-pix-qr-imagem"
              />
            )}
            {!carregandoPixQr && !pixQrUrl && (
              <p className="acomp-pix-qr-status">
                {pixQrErro ?? "Nao foi possivel carregar o QR Code. Tentando novamente..."}
              </p>
            )}
          </div>

          <p className="acomp-pix-qr-legenda">
            Valor: {formatarMoedaBrl(valorExibir)} — recebedor: {detalhe.prestadorNome ?? "Prestador"}
          </p>

          {pixCopiaCola ? (
            <div style={{ marginTop: 16 }}>
              <p style={{ color: "var(--workspace-muted)", fontSize: 13, marginBottom: 8 }}>
                Se a leitura falhar, use o Pix Copia e Cola:
              </p>
              <div className="acomp-pix-copia-cola">
                <code>{pixCopiaCola}</code>
              </div>
              <button type="button" className="painel-btn-ghost" style={{ marginTop: 10 }} onClick={() => void copiarCodigoPix()}>
                <Copy size={14} />
                Copiar codigo PIX
              </button>
            </div>
          ) : null}

          {!clienteEscolheuPix && (
            <div className="acomp-pagamento-opcao selecionada" style={{ marginTop: 18 }}>
              <span className="acomp-pagamento-opcao-icone">
                <Smartphone size={18} />
              </span>
              <span className="acomp-pagamento-opcao-info">
                <strong>Aguardando confirmacao do cliente</strong>
                <span>Selecao de pagamento no app do cliente</span>
              </span>
              <QrCode size={20} style={{ marginLeft: "auto", color: "var(--brand-strong)" }} />
            </div>
          )}
        </section>
      )}

      {(etapa === "aguardando-avaliacao" || (etapa === "concluido" && !prestadorJaAvaliouCliente)) && (
        <section className="painel-card">
          <div className="painel-card-cabecalho">
            <h2>{prestadorJaAvaliouCliente ? "Avaliacao enviada" : "Avaliar cliente (obrigatorio)"}</h2>
          </div>

          {!prestadorJaAvaliouCliente && (
            <p style={{ color: "var(--workspace-muted)", fontSize: 13, marginBottom: 16 }}>
              O pagamento foi confirmado. Selecione uma nota e envie sua avaliacao do cliente para finalizar o servico.
            </p>
          )}

          {prestadorJaAvaliouCliente && !clienteJaAvaliouPrestador && (
            <p style={{ color: "var(--workspace-muted)", fontSize: 13, marginBottom: 16 }}>
              Sua avaliacao foi registrada. Aguardando o cliente avaliar seu atendimento.
            </p>
          )}

          {prestadorJaAvaliouCliente && clienteJaAvaliouPrestador && (
            <p style={{ color: "var(--workspace-muted)", fontSize: 13, marginBottom: 16 }}>
              Avaliacoes concluidas. O servico foi finalizado.
            </p>
          )}

          {!prestadorJaAvaliouCliente && (
            <>
              <div className="acomp-cliente-mini" style={{ marginBottom: 16 }}>
                <div className="acomp-cliente-mini-avatar">{iniciaisCliente}</div>
                <div className="acomp-cliente-mini-info">
                  <strong>{detalhe.clienteNome}</strong>
                  <span>{tituloServico}</span>
                </div>
              </div>

              <p style={{ textAlign: "center", margin: "8px 0 4px", fontSize: 13, color: "var(--workspace-muted)" }}>
                Como foi o atendimento com este cliente?
              </p>

              <div className="acomp-estrelas">
                {[1, 2, 3, 4, 5].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    className={`acomp-estrela ${valor <= notaCliente ? "ativa" : ""}`}
                    onClick={() => setNotaCliente(valor)}
                    aria-label={`${valor} estrelas`}
                  >
                    <Star size={28} fill={valor <= notaCliente ? "#facc15" : "transparent"} />
                  </button>
                ))}
              </div>

              <textarea
                className="acomp-textarea"
                placeholder="Comentario sobre o cliente (opcional)"
                value={comentarioCliente}
                onChange={(event) => setComentarioCliente(event.target.value)}
                style={{ marginTop: 8, marginBottom: 14 }}
              />

              <button
                type="button"
                className="acomp-btn-primary"
                onClick={() => void handleAvaliarCliente()}
                disabled={notaCliente === 0 || enviando}
              >
                Enviar avaliacao do cliente
              </button>
            </>
          )}

          {prestadorJaAvaliouCliente && (
            <>
              <div className="acomp-final" style={{ padding: "12px 0" }}>
                <p style={{ margin: 0, color: "var(--workspace-muted)", fontSize: 14 }}>
                  Voce avaliou {detalhe.clienteNome} com {detalhe.notaAvaliacaoPrestador} estrela(s).
                </p>
              </div>
              <button
                type="button"
                className="acomp-btn-primary"
                onClick={() => navigate("/acompanhamento")}
                style={{ maxWidth: 280, marginTop: 16 }}
              >
                Voltar para lista
              </button>
            </>
          )}
        </section>
      )}

      {etapa === "concluido" && prestadorJaAvaliouCliente && (
        <section className="painel-card">
          <div className="acomp-final">
            <div className="acomp-final-icone">
              <CheckCircle2 size={36} />
            </div>
            <h2>Servico finalizado!</h2>
            <p>As avaliacoes foram registradas. Obrigado por usar a Servnow.</p>
            <button
              type="button"
              className="acomp-btn-primary"
              onClick={() => navigate("/acompanhamento")}
              style={{ maxWidth: 280 }}
            >
              Voltar para lista
            </button>
          </div>
        </section>
      )}
    </>
  );
}

export default AcompanhamentoPrestadorDetalhe;
