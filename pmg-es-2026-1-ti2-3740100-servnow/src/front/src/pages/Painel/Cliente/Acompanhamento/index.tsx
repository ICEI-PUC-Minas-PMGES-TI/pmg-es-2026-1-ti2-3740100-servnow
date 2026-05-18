import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  QrCode,
  Smartphone,
  Star,
  User,
} from "lucide-react";

import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";

type Etapa = "aguardando-chegada" | "em-andamento" | "pagamento" | "avaliacao" | "concluido";

type MetodoPagamento = "pix" | "credito" | "debito";

const ATUALIZACOES_PRESTADOR = [
  {
    id: 1,
    horario: "15:30 - Hoje",
    descricao: "Instalacao do novo chuveiro concluida. Testei o funcionamento e esta tudo ok.",
    fotos: [
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400",
    ],
  },
  {
    id: 2,
    horario: "14:45 - Hoje",
    descricao: "Removendo o chuveiro antigo e preparando a instalacao.",
    fotos: [],
  },
];

const SERVICO_MOCK = {
  titulo: "Troca de chuveiro eletrico",
  prestador: "Joao Silva",
  prestadorProfissao: "Eletricista",
  prestadorAvaliacao: 4.8,
  prestadorAvaliacoesCount: 127,
  inicio: "14:00",
  previsto: "16:00",
  valor: 180,
  codigo: "4823",
  chegadaEstimadaMin: 18,
};

const METODOS_PAGAMENTO: Array<{ id: MetodoPagamento; nome: string; desc: string; icone: typeof QrCode }> = [
  { id: "pix", nome: "PIX", desc: "Pagamento instantaneo", icone: QrCode },
  { id: "credito", nome: "Cartao de credito", desc: "Em ate 12x", icone: CreditCard },
  { id: "debito", nome: "Cartao de debito", desc: "Debito a vista", icone: CreditCard },
];

const ETAPAS_INFO: Array<{ id: Etapa; label: string; numero: number }> = [
  { id: "aguardando-chegada", label: "Aguardando chegada", numero: 1 },
  { id: "em-andamento", label: "Em andamento", numero: 2 },
  { id: "pagamento", label: "Pagamento", numero: 3 },
  { id: "avaliacao", label: "Avaliacao", numero: 4 },
];

export function Acompanhamento() {
  const [etapa, setEtapa] = useState<Etapa>("aguardando-chegada");
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>("pix");
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");

  function avancarEtapa() {
    if (etapa === "aguardando-chegada") setEtapa("em-andamento");
    else if (etapa === "em-andamento") setEtapa("pagamento");
    else if (etapa === "pagamento") setEtapa("avaliacao");
    else if (etapa === "avaliacao") setEtapa("concluido");
  }

  function reiniciarFluxo() {
    setEtapa("aguardando-chegada");
    setNota(0);
    setComentario("");
    setMetodoPagamento("pix");
  }

  const etapaAtualIndex = ETAPAS_INFO.findIndex((e) => e.id === etapa);

  return (
    <>
      <PainelSectionHeader
        eyebrow="Servico atual"
        title="Acompanhamento"
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

      {/* ETAPA 1: aguardando chegada (codigo + ETA) */}
      {etapa === "aguardando-chegada" && (
        <section className="painel-card">
          <div className="acomp-codigo-centro">
            <div className="acomp-codigo-icone">
              <MapPin size={26} />
            </div>
            <h2 className="acomp-codigo-titulo">Seu prestador esta chegando!</h2>
            <p className="acomp-codigo-sub">Mostre este codigo quando ele chegar na sua porta</p>

            <div className="acomp-cliente-mini">
              <div className="acomp-cliente-mini-avatar">JS</div>
              <div className="acomp-cliente-mini-info">
                <strong>{SERVICO_MOCK.prestador}</strong>
                <span>{SERVICO_MOCK.prestadorProfissao}</span>
                <span style={{ display: "block", marginTop: 4 }}>
                  <Star size={12} fill="#facc15" color="#facc15" style={{ verticalAlign: "middle" }} />{" "}
                  {SERVICO_MOCK.prestadorAvaliacao} - {SERVICO_MOCK.prestadorAvaliacoesCount} avaliacoes
                </span>
                <span style={{ display: "block", marginTop: 4 }}>{SERVICO_MOCK.titulo}</span>
              </div>
            </div>

            <div className="acomp-codigo-exibir">
              <span className="acomp-codigo-exibir-titulo">Codigo de confirmacao</span>
              <div className="acomp-codigo-exibir-numeros">
                {SERVICO_MOCK.codigo.split("").map((digito, idx) => (
                  <span key={idx}>{digito}</span>
                ))}
              </div>
              <span className="acomp-codigo-exibir-info">Valido por 30 minutos - Atualiza automaticamente</span>
            </div>

            <div className="acomp-eta">
              <span className="acomp-eta-label">
                <Clock size={16} />
                Chegada estimada em:
              </span>
              <span className="acomp-eta-tempo">{SERVICO_MOCK.chegadaEstimadaMin} min</span>
              <div className="acomp-eta-barra">
                <div className="acomp-eta-barra-fill" style={{ width: "60%" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, width: "100%", flexDirection: "column" }}>
              <button type="button" className="acomp-btn-danger">
                Prestador atrasado? Avisar
              </button>
              <button type="button" className="acomp-btn-link danger" style={{ alignSelf: "center" }}>
                Cancelar servico
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ETAPA 2: em andamento (atualizacoes do prestador) */}
      {etapa === "em-andamento" && (
        <>
          <section className="painel-card acomp-card-servico">
            <div className="acomp-card-servico-cabecalho">
              <div>
                <h2>{SERVICO_MOCK.titulo}</h2>
                <p style={{ margin: "4px 0 0", color: "var(--workspace-muted)", fontSize: 13 }}>
                  Prestador: {SERVICO_MOCK.prestador}
                </p>
              </div>
              <span className="painel-status agendado">EM ANDAMENTO</span>
            </div>
            <div className="acomp-card-servico-meta">
              <span><Clock size={14} /> Iniciado as {SERVICO_MOCK.inicio}</span>
              <span><Clock size={14} /> Previsao de termino: {SERVICO_MOCK.previsto}</span>
            </div>
          </section>

          <section className="painel-card">
            <div className="painel-card-cabecalho">
              <h2>Atualizacoes do prestador</h2>
            </div>
            <div className="acomp-timeline">
              {ATUALIZACOES_PRESTADOR.map((atualizacao) => (
                <div key={atualizacao.id} className="acomp-timeline-item">
                  <span className="acomp-timeline-data">{atualizacao.horario}</span>
                  <p>{atualizacao.descricao}</p>
                  {atualizacao.fotos.length > 0 && (
                    <div className="acomp-timeline-fotos">
                      {atualizacao.fotos.map((foto, idx) => (
                        <img key={idx} src={foto} alt={`Atualizacao ${atualizacao.id} foto ${idx + 1}`} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ETAPA 3: pagamento */}
      {etapa === "pagamento" && (
        <section className="painel-card">
          <div className="painel-card-cabecalho">
            <h2>Pagamento</h2>
          </div>

          <div className="acomp-pagamento-total">
            <span>Total do servico - {SERVICO_MOCK.titulo}</span>
            <strong>R$ {SERVICO_MOCK.valor.toFixed(2).replace(".", ",")}</strong>
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
                    {metodo.id === "pix" ? <Smartphone size={18} /> : <Icone size={18} />}
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
                    onChange={() => setMetodoPagamento(metodo.id)}
                  />
                </label>
              );
            })}
          </div>

          <button type="button" className="acomp-btn-primary" onClick={avancarEtapa}>
            Confirmar pagamento
          </button>
        </section>
      )}

      {/* ETAPA 4: avaliacao */}
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
              <strong>{SERVICO_MOCK.prestador}</strong>
              <span>{SERVICO_MOCK.prestadorProfissao}</span>
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
            onClick={avancarEtapa}
            disabled={nota === 0}
          >
            Enviar avaliacao
          </button>
        </section>
      )}

      {/* ETAPA 5: concluido */}
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
            <button type="button" className="acomp-btn-primary" onClick={reiniciarFluxo} style={{ maxWidth: 280 }}>
              Acompanhar outro servico
            </button>
          </div>
        </section>
      )}

      {/* Botao mock para avançar entre etapas (so para teste / demonstracao) */}
      {etapa !== "concluido" && etapa !== "pagamento" && etapa !== "avaliacao" && (
        <div className="acomp-mock-actions">
          <button type="button" className="painel-btn-ghost" onClick={avancarEtapa}>
            Avancar etapa (mock)
          </button>
        </div>
      )}
    </>
  );
}

export default Acompanhamento;
