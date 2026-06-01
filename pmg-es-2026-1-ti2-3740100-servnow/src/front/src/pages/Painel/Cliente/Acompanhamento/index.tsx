import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  QrCode,
  Smartphone,
  Star,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { AtualizacaoFoto } from "../../../../Components/Acompanhamento/AtualizacaoFoto";
import { BotaoRota } from "../../../../Components/Acompanhamento/BotaoRota";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  avaliarServico,
  confirmarPagamento,
  confirmarReagendamento,
  iniciarAcompanhamento,
  obterDetalhe,
  renovarCodigo,
  selecionarMetodoPagamento,
  type AcompanhamentoDetalhe,
} from "../../../../services/acompanhamento";
import {
  formatarDataHoraAcompanhamento,
  formatarHorarioAcompanhamento,
} from "../../../../utils/acompanhamentoLabels";
import { formatarMoedaBrl } from "../../../../utils/formatarMoeda";
import { formatarDataSolicitacao } from "../../../../utils/solicitacaoLabels";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";

type MetodoPagamento = "PIX" | "CREDITO" | "DEBITO";

type ClienteEtapa = "aguardando-chegada" | "em-andamento" | "reagendamento" | "visita-reagendada" | "pagamento" | "avaliacao" | "concluido";

const METODOS_PAGAMENTO: Array<{ id: MetodoPagamento; nome: string; desc: string; icone: typeof QrCode }> = [
  { id: "PIX", nome: "PIX", desc: "Pagamento instantaneo", icone: QrCode },
  { id: "CREDITO", nome: "Cartao de credito", desc: "Em ate 12x", icone: CreditCard },
  { id: "DEBITO", nome: "Cartao de debito", desc: "Debito a vista", icone: CreditCard },
];

const ETAPAS_INFO: Array<{ id: ClienteEtapa; label: string; numero: number }> = [
  { id: "aguardando-chegada", label: "Aguardando chegada", numero: 1 },
  { id: "em-andamento", label: "Em andamento", numero: 2 },
  { id: "pagamento", label: "Pagamento", numero: 3 },
  { id: "avaliacao", label: "Avaliacao", numero: 4 },
];

function etapaBackendParaCliente(etapa: string): ClienteEtapa {
  switch (etapa) {
    case "EM_ANDAMENTO":
      return "em-andamento";
    case "AGUARDANDO_REAGENDAMENTO":
      return "reagendamento";
    case "VISITA_REAGENDADA":
      return "visita-reagendada";
    case "AGUARDANDO_PAGAMENTO":
      return "pagamento";
    case "AGUARDANDO_AVALIACAO":
      return "avaliacao";
    case "CONCLUIDA":
      return "concluido";
    default:
      return "aguardando-chegada";
  }
}

type Props = {
  solicitacaoId: number;
};

export function AcompanhamentoClienteDetalhe({ solicitacaoId }: Props) {
  const navigate = useNavigate();
  const [detalhe, setDetalhe] = useState<AcompanhamentoDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>("PIX");
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [novaDataReagendamento, setNovaDataReagendamento] = useState("");
  const [novoHorarioReagendamento, setNovoHorarioReagendamento] = useState("");

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

  useEffect(() => {
    if (!detalhe || etapaBackendParaCliente(detalhe.etapa) !== "pagamento") {
      return;
    }
    if (detalhe.metodoPagamentoSelecionado === metodoPagamento) {
      return;
    }
    void selecionarMetodoPagamento(solicitacaoId, metodoPagamento)
      .then(setDetalhe)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Erro ao sincronizar metodo de pagamento.");
      });
  }, [detalhe, metodoPagamento, solicitacaoId]);

  const etapa = detalhe ? etapaBackendParaCliente(detalhe.etapa) : "aguardando-chegada";
  const progressoAtual = detalhe?.percentualConcluido ?? 0;
  const tituloServico = detalhe
    ? (TIPOS_SERVICO_MAP[detalhe.tipoServico]?.nome ?? detalhe.tipoServico)
    : "";

  const etapaAtualIndex = ETAPAS_INFO.findIndex((e) => e.id === (
    etapa === "reagendamento" || etapa === "visita-reagendada" ? "em-andamento" : etapa
  ));

  const valorExibir = detalhe?.valorFinal ?? detalhe?.valorAceito ?? 0;

  async function handleRenovarCodigo() {
    setEnviando(true);
    try {
      setDetalhe(await renovarCodigo(solicitacaoId));
      toast.success("Novo codigo gerado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao renovar codigo.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleConfirmarReagendamento() {
    if (!novaDataReagendamento || !novoHorarioReagendamento) {
      toast.error("Informe a nova data e horario.");
      return;
    }
    setEnviando(true);
    try {
      await confirmarReagendamento(solicitacaoId, novaDataReagendamento, novoHorarioReagendamento);
      const dataFormatada = formatarDataSolicitacao(novaDataReagendamento);
      toast.success(`Reagendamento confirmado para ${dataFormatada} as ${novoHorarioReagendamento}.`);
      navigate("/acompanhamento");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao confirmar reagendamento.");
    } finally {
      setEnviando(false);
    }
  }

  useEffect(() => {
    if (etapa !== "reagendamento" || !detalhe) {
      return;
    }
    if (!novaDataReagendamento && detalhe.data) {
      setNovaDataReagendamento(detalhe.data);
    }
    if (!novoHorarioReagendamento && detalhe.horario) {
      setNovoHorarioReagendamento(detalhe.horario);
    }
  }, [detalhe, etapa, novaDataReagendamento, novoHorarioReagendamento]);

  async function handleMetodoPagamentoChange(metodo: MetodoPagamento) {
    setMetodoPagamento(metodo);
    try {
      setDetalhe(await selecionarMetodoPagamento(solicitacaoId, metodo));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao selecionar metodo de pagamento.");
    }
  }

  async function handleConfirmarPagamento() {
    setEnviando(true);
    try {
      setDetalhe(await confirmarPagamento(solicitacaoId, metodoPagamento));
      toast.success("Pagamento confirmado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao confirmar pagamento.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleAvaliar() {
    if (nota === 0) return;
    setEnviando(true);
    try {
      const atualizado = await avaliarServico(solicitacaoId, nota, comentario || undefined);
      setDetalhe(atualizado);
      if (atualizado.etapa === "CONCLUIDA") {
        toast.success("Avaliacao enviada. Servico finalizado!");
      } else {
        toast.success("Avaliacao enviada. Aguardando o prestador avaliar o atendimento.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar avaliacao.");
    } finally {
      setEnviando(false);
    }
  }

  const clienteJaAvaliouPrestador = detalhe?.notaAvaliacao != null;
  const prestadorJaAvaliouCliente = detalhe?.notaAvaliacaoPrestador != null;

  const iniciaisPrestador = useMemo(() => {
    const nome = detalhe?.prestadorNome ?? "";
    return nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "P";
  }, [detalhe?.prestadorNome]);

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
        eyebrow="Servico atual"
        title={tituloServico}
        description="Acompanhe em tempo real o servico que voce contratou."
      />

      {etapa !== "concluido" && (
        <div className="acomp-stepper">
          {ETAPAS_INFO.map((info, index) => {
            const ativo = etapa === info.id
              || (etapa === "reagendamento" && info.id === "em-andamento")
              || (etapa === "visita-reagendada" && info.id === "aguardando-chegada");
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

      {etapa === "aguardando-chegada" && (
        <section className="painel-card">
          <div className="acomp-codigo-centro">
            <div className="acomp-codigo-icone">
              <MapPin size={26} />
            </div>
            <h2 className="acomp-codigo-titulo">Seu prestador esta chegando!</h2>
            <p className="acomp-codigo-sub">Mostre este codigo quando ele chegar na sua porta</p>

            <div className="acomp-cliente-mini">
              <div className="acomp-cliente-mini-avatar">{iniciaisPrestador}</div>
              <div className="acomp-cliente-mini-info">
                <strong>{detalhe.prestadorNome}</strong>
                <span>{detalhe.endereco}</span>
                <span style={{ display: "block", marginTop: 4 }}>{tituloServico}</span>
                {progressoAtual > 0 && (
                  <span style={{ display: "block", marginTop: 8, color: "var(--brand-strong)", fontWeight: 600 }}>
                    Progresso do servico: {progressoAtual}%
                  </span>
                )}
              </div>
            </div>

            <BotaoRota endereco={detalhe.endereco} />

            {detalhe.codigoVerificacao ? (
              <div className="acomp-codigo-exibir">
                <span className="acomp-codigo-exibir-titulo">Codigo de confirmacao</span>
                <div className="acomp-codigo-exibir-numeros">
                  {detalhe.codigoVerificacao.split("").map((digito, idx) => (
                    <span key={idx}>{digito}</span>
                  ))}
                </div>
                <span className="acomp-codigo-exibir-info">Valido por 30 minutos</span>
              </div>
            ) : (
              <p style={{ color: "var(--workspace-muted)", fontSize: 13 }}>
                Codigo expirado. Gere um novo codigo abaixo.
              </p>
            )}

            <button
              type="button"
              className="acomp-btn-primary"
              onClick={() => void handleRenovarCodigo()}
              disabled={enviando}
            >
              Gerar novo codigo
            </button>
          </div>
        </section>
      )}

      {etapa === "em-andamento" && (
        <>
          <section className="painel-card acomp-card-servico">
            <div className="acomp-card-servico-cabecalho">
              <div>
                <h2>{tituloServico}</h2>
                <p style={{ margin: "4px 0 0", color: "var(--workspace-muted)", fontSize: 13 }}>
                  Prestador: {detalhe.prestadorNome}
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
          </section>

          <section className="painel-card">
            <div className="painel-card-cabecalho">
              <h2>Atualizacoes do prestador</h2>
            </div>
            {detalhe.atualizacoes.length === 0 ? (
              <p style={{ color: "var(--workspace-muted)", fontSize: 13 }}>Nenhuma atualizacao ainda.</p>
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
            <button type="button" className="painel-btn-ghost" style={{ marginTop: 12 }} onClick={() => void obterDetalhe(solicitacaoId).then(setDetalhe)}>
              Atualizar
            </button>
          </section>
        </>
      )}

      {etapa === "reagendamento" && (
        <section className="painel-card">
          <div className="painel-card-cabecalho">
            <h2>Reagendar servico</h2>
          </div>
          <p style={{ color: "var(--workspace-muted)", fontSize: 13, marginBottom: 14 }}>
            O prestador informou que o servico ainda nao foi concluido. Escolha um novo horario para continuar.
          </p>

          <div className="acomp-progresso">
            <div className="acomp-progresso-cabecalho">
              <span>Progresso informado pelo prestador</span>
              <strong>{progressoAtual}%</strong>
            </div>
            <div className="acomp-progresso-barra">
              <span style={{ width: `${progressoAtual}%` }} />
            </div>
          </div>

          {detalhe.observacaoReagendamento && (
            <p style={{ marginTop: 14, fontSize: 13 }}>
              <strong>Observacao do prestador:</strong> {detalhe.observacaoReagendamento}
            </p>
          )}

          <div className="acomp-form-bloco" style={{ marginTop: 18 }}>
            <label className="acomp-codigo-label" htmlFor="nova-data-reagendamento">Nova data</label>
            <input
              id="nova-data-reagendamento"
              type="date"
              value={novaDataReagendamento}
              onChange={(event) => setNovaDataReagendamento(event.target.value)}
              style={{ width: "100%", marginBottom: 12 }}
            />

            <label className="acomp-codigo-label" htmlFor="novo-horario-reagendamento">Novo horario</label>
            <input
              id="novo-horario-reagendamento"
              type="time"
              value={novoHorarioReagendamento}
              onChange={(event) => setNovoHorarioReagendamento(event.target.value)}
              style={{ width: "100%", marginBottom: 16 }}
            />

            <button
              type="button"
              className="acomp-btn-primary"
              onClick={() => void handleConfirmarReagendamento()}
              disabled={enviando}
            >
              Confirmar reagendamento
            </button>
          </div>
        </section>
      )}

      {etapa === "visita-reagendada" && (
        <section className="painel-card">
          <div className="acomp-codigo-centro">
            <div className="acomp-codigo-icone">
              <Calendar size={26} />
            </div>
            <h2 className="acomp-codigo-titulo">Visita reagendada</h2>
            <p className="acomp-codigo-sub">
              O codigo de confirmacao ficara disponivel no dia da nova visita.
            </p>

            <div className="acomp-cliente-mini">
              <div className="acomp-cliente-mini-avatar">{iniciaisPrestador}</div>
              <div className="acomp-cliente-mini-info">
                <strong>{detalhe.prestadorNome}</strong>
                <span>{detalhe.endereco}</span>
                <span style={{ display: "block", marginTop: 8 }}>
                  Nova data: {detalhe.data ? formatarDataSolicitacao(detalhe.data) : "--"} as {detalhe.horario ?? "--:--"}
                </span>
              </div>
            </div>

            {progressoAtual > 0 && (
              <div className="acomp-progresso" style={{ width: "100%", marginTop: 8 }}>
                <div className="acomp-progresso-cabecalho">
                  <span>Progresso do servico</span>
                  <strong>{progressoAtual}%</strong>
                </div>
                <div className="acomp-progresso-barra">
                  <span style={{ width: `${progressoAtual}%` }} />
                </div>
              </div>
            )}

            <button
              type="button"
              className="acomp-btn-primary"
              onClick={() => navigate("/acompanhamento")}
              style={{ marginTop: 8 }}
            >
              Voltar para lista
            </button>
          </div>
        </section>
      )}

      {etapa === "pagamento" && (
        <section className="painel-card">
          <div className="painel-card-cabecalho">
            <h2>Pagamento</h2>
          </div>

          <div className="acomp-pagamento-total">
            <span>Total do servico - {tituloServico}</span>
            <strong>{formatarMoedaBrl(valorExibir)}</strong>
          </div>

          <div className="acomp-pagamento-opcoes">
            {METODOS_PAGAMENTO.map((metodo) => {
              const Icone = metodo.icone;
              return (
                <label
                  key={metodo.id}
                  className={`acomp-pagamento-opcao ${metodoPagamento === metodo.id ? "selecionada" : ""}`}
                >
                  <span className="acomp-pagamento-opcao-icone">
                    {metodo.id === "PIX" ? <Smartphone size={18} /> : <Icone size={18} />}
                  </span>
                  <span className="acomp-pagamento-opcao-info">
                    <strong>{metodo.nome}</strong>
                    <span>{metodo.desc}</span>
                  </span>
                  <input
                    type="radio"
                    name="metodo-pagamento"
                    value={metodo.id}
                    checked={metodoPagamento === metodo.id}
                    onChange={() => void handleMetodoPagamentoChange(metodo.id)}
                  />
                </label>
              );
            })}
          </div>

          <button
            type="button"
            className="acomp-btn-primary"
            onClick={() => void handleConfirmarPagamento()}
            disabled={enviando}
          >
            Confirmar pagamento
          </button>
        </section>
      )}

      {etapa === "avaliacao" && (
        <section className="painel-card">
          <div className="painel-card-cabecalho">
            <h2>{clienteJaAvaliouPrestador ? "Avaliacao enviada" : "Avaliar prestador"}</h2>
          </div>

          {clienteJaAvaliouPrestador && !prestadorJaAvaliouCliente && (
            <p style={{ color: "var(--workspace-muted)", fontSize: 13, marginBottom: 16 }}>
              Sua avaliacao foi registrada. Aguardando {detalhe.prestadorNome} avaliar o atendimento para finalizar o servico.
            </p>
          )}

          {clienteJaAvaliouPrestador && prestadorJaAvaliouCliente && (
            <p style={{ color: "var(--workspace-muted)", fontSize: 13, marginBottom: 16 }}>
              Avaliacoes concluidas. O servico sera finalizado em instantes.
            </p>
          )}

          {!clienteJaAvaliouPrestador && (
            <>
              <div className="acomp-avaliar-prestador">
                <div className="acomp-avaliar-avatar">
                  <User size={22} />
                </div>
                <div>
                  <strong>{detalhe.prestadorNome}</strong>
                  <span>{tituloServico}</span>
                </div>
              </div>

              <p style={{ textAlign: "center", margin: "8px 0 4px", fontSize: 13, color: "var(--workspace-muted)" }}>
                Como foi o servico?
              </p>

              <div className="acomp-estrelas">
                {[1, 2, 3, 4, 5].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    className={`acomp-estrela ${valor <= nota ? "ativa" : ""}`}
                    onClick={() => setNota(valor)}
                    aria-label={`${valor} estrelas`}
                  >
                    <Star size={28} fill={valor <= nota ? "#facc15" : "transparent"} />
                  </button>
                ))}
              </div>

              <textarea
                className="acomp-textarea"
                placeholder="Comentario (opcional)"
                value={comentario}
                onChange={(event) => setComentario(event.target.value)}
                style={{ marginTop: 8, marginBottom: 14 }}
              />

              <button
                type="button"
                className="acomp-btn-primary"
                onClick={() => void handleAvaliar()}
                disabled={nota === 0 || enviando}
              >
                Enviar avaliacao
              </button>
            </>
          )}

          {clienteJaAvaliouPrestador && (
            <p style={{ margin: 0, fontSize: 14, color: "var(--workspace-muted)" }}>
              Voce avaliou {detalhe.prestadorNome} com {detalhe.notaAvaliacao} estrela(s).
            </p>
          )}
        </section>
      )}

      {etapa === "concluido" && (
        <section className="painel-card">
          <div className="acomp-final">
            <div className="acomp-final-icone">
              <CheckCircle2 size={36} />
            </div>
            <h2>Servico finalizado!</h2>
            <p>
              Obrigado por usar a Servnow. Sua avaliacao ajuda outros clientes a encontrar bons prestadores.
            </p>
            {detalhe.notaAvaliacaoPrestador != null && (
              <p style={{ margin: 0, fontSize: 14, color: "var(--workspace-muted)" }}>
                {detalhe.prestadorNome} avaliou voce com {detalhe.notaAvaliacaoPrestador} estrela(s).
              </p>
            )}
            <button
              type="button"
              className="acomp-btn-primary"
              onClick={() => navigate("/acompanhamento")}
              style={{ maxWidth: 280 }}
            >
              Acompanhar outro servico
            </button>
          </div>
        </section>
      )}
    </>
  );
}

export default AcompanhamentoClienteDetalhe;
