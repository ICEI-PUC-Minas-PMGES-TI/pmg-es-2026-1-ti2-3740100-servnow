import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
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
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  avaliarServico,
  confirmarPagamento,
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
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";

type MetodoPagamento = "PIX" | "CREDITO" | "DEBITO";

type ClienteEtapa = "aguardando-chegada" | "em-andamento" | "pagamento" | "avaliacao" | "concluido";

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
  const tituloServico = detalhe
    ? (TIPOS_SERVICO_MAP[detalhe.tipoServico]?.nome ?? detalhe.tipoServico)
    : "";

  const etapaAtualIndex = ETAPAS_INFO.findIndex((e) => e.id === etapa);

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
      setDetalhe(await avaliarServico(solicitacaoId, nota, comentario || undefined));
      toast.success("Avaliacao enviada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar avaliacao.");
    } finally {
      setEnviando(false);
    }
  }

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
              </div>
            </div>

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
            <h2>Avaliar prestador</h2>
          </div>

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
