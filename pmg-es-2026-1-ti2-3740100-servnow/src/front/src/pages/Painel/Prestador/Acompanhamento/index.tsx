import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  Send,
  Smartphone,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { AtualizacaoFoto } from "../../../../Components/Acompanhamento/AtualizacaoFoto";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  confirmarChegada,
  concluirExecucao,
  iniciarAcompanhamento,
  registrarAtualizacao,
  type AcompanhamentoDetalhe,
} from "../../../../services/acompanhamento";
import {
  formatarDataHoraAcompanhamento,
  formatarHorarioAcompanhamento,
} from "../../../../utils/acompanhamentoLabels";
import { formatarMoedaBrl } from "../../../../utils/formatarMoeda";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";

type PrestadorEtapa = "confirmar-chegada" | "em-execucao" | "aguardando-pagamento" | "aguardando-avaliacao" | "concluido";

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

  const carregar = useCallback(async () => {
    try {
      const dados = await iniciarAcompanhamento(solicitacaoId);
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
  const tituloServico = detalhe
    ? (TIPOS_SERVICO_MAP[detalhe.tipoServico]?.nome ?? detalhe.tipoServico)
    : "";
  const etapaAtualIndex = ETAPAS_INFO.findIndex((e) => e.id === etapa);
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

  if (isLoading || !detalhe) {
    return (
      <div className="painel-vazio">
        <p>Carregando acompanhamento...</p>
      </div>
    );
  }

  return (
    <>
      <button type="button" className="painel-btn-ghost" onClick={() => navigate("/acompanhamento")} style={{ marginBottom: 12 }}>
        <ArrowLeft size={16} />
        Voltar para lista
      </button>

      <PainelSectionHeader
        eyebrow="Servico em andamento"
        title={tituloServico}
        description="Confirme sua chegada e mantenha o cliente informado sobre o andamento."
      />

      {etapa !== "concluido" && (
        <div className="acomp-stepper">
          {ETAPAS_INFO.map((info, index) => {
            const ativo = etapa === info.id;
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
              </div>
            </div>

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

            <button
              type="button"
              className="acomp-btn-primary"
              onClick={() => void handleConcluirServico()}
              disabled={enviando}
              style={{ marginTop: 18 }}
            >
              <CheckCircle2 size={16} />
              Concluir servico
            </button>
          </section>
        </>
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
            O cliente confirmara o pagamento na plataforma. Aguarde a confirmacao.
          </p>

          <div className="acomp-pagamento-opcao selecionada" style={{ marginBottom: 18 }}>
            <span className="acomp-pagamento-opcao-icone">
              <Smartphone size={18} />
            </span>
            <span className="acomp-pagamento-opcao-info">
              <strong>Aguardando cliente</strong>
              <span>Pagamento via app</span>
            </span>
            <QrCode size={20} style={{ marginLeft: "auto", color: "var(--brand-strong)" }} />
          </div>
        </section>
      )}

      {etapa === "aguardando-avaliacao" && (
        <section className="painel-card">
          <div className="acomp-final">
            <div className="acomp-final-icone">
              <Star size={36} fill="#facc15" color="#facc15" />
            </div>
            <h2>Aguardando avaliacao do cliente</h2>
            <p>
              O servico foi concluido e o pagamento confirmado. Em breve voce recebera a avaliacao do cliente.
            </p>
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

      {etapa === "concluido" && (
        <section className="painel-card">
          <div className="acomp-final">
            <div className="acomp-final-icone">
              <CheckCircle2 size={36} />
            </div>
            <h2>Servico finalizado!</h2>
            <p>O cliente concluiu a avaliacao. Obrigado por usar a Servnow.</p>
            <button
              type="button"
              className="acomp-btn-primary"
              onClick={() => navigate("/acompanhamento")}
              style={{ maxWidth: 280 }}
            >
              Atender novo servico
            </button>
          </div>
        </section>
      )}
    </>
  );
}

export default AcompanhamentoPrestadorDetalhe;
