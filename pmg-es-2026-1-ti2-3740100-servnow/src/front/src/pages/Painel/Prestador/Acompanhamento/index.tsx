import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  QrCode,
  Send,
  Smartphone,
  Star,
} from "lucide-react";

import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";

type Etapa = "confirmar-chegada" | "em-execucao" | "aguardando-pagamento" | "aguardando-avaliacao" | "concluido";

type Atualizacao = {
  id: number;
  horario: string;
  descricao: string;
  fotos: string[];
};

const ATUALIZACOES_INICIAIS: Atualizacao[] = [
  {
    id: 1,
    horario: "14:45 - Hoje",
    descricao: "Removendo o chuveiro antigo e preparando a instalacao.",
    fotos: [],
  },
];

const SERVICO_MOCK = {
  titulo: "Troca de chuveiro eletrico",
  cliente: "Maria Silva",
  clienteEndereco: "Rua das Flores, 123 - Sao Paulo",
  inicio: "14:00",
  previsto: "16:00",
  valor: 180,
};

const ETAPAS_INFO: Array<{ id: Etapa; label: string; numero: number }> = [
  { id: "confirmar-chegada", label: "Chegada", numero: 1 },
  { id: "em-execucao", label: "Em execucao", numero: 2 },
  { id: "aguardando-pagamento", label: "Pagamento", numero: 3 },
  { id: "aguardando-avaliacao", label: "Avaliacao", numero: 4 },
];

export function Acompanhamento() {
  const [etapa, setEtapa] = useState<Etapa>("confirmar-chegada");
  const [codigo, setCodigo] = useState(["", "", "", ""]);
  const [novaAtualizacao, setNovaAtualizacao] = useState("");
  const [novaFoto, setNovaFoto] = useState<string>("");
  const [atualizacoes, setAtualizacoes] = useState<Atualizacao[]>(ATUALIZACOES_INICIAIS);

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

  function confirmarChegada() {
    // Mock: aceita qualquer codigo
    setEtapa("em-execucao");
  }

  function handleFotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNovaFoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  function enviarAtualizacao() {
    if (!novaAtualizacao.trim()) return;
    const agora = new Date();
    const hora = `${agora.getHours().toString().padStart(2, "0")}:${agora.getMinutes().toString().padStart(2, "0")}`;
    setAtualizacoes([
      {
        id: Date.now(),
        horario: `${hora} - Agora`,
        descricao: novaAtualizacao.trim(),
        fotos: novaFoto ? [novaFoto] : [],
      },
      ...atualizacoes,
    ]);
    setNovaAtualizacao("");
    setNovaFoto("");
  }

  function concluirServico() {
    setEtapa("aguardando-pagamento");
  }

  function confirmarPagamentoRecebido() {
    setEtapa("aguardando-avaliacao");
  }

  function reiniciarFluxo() {
    setEtapa("confirmar-chegada");
    setCodigo(["", "", "", ""]);
    setAtualizacoes(ATUALIZACOES_INICIAIS);
    setNovaAtualizacao("");
    setNovaFoto("");
  }

  const etapaAtualIndex = ETAPAS_INFO.findIndex((e) => e.id === etapa);

  return (
    <>
      <PainelSectionHeader
        eyebrow="Servico em andamento"
        title="Acompanhar servico"
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

      {/* ETAPA 1: confirmar chegada */}
      {etapa === "confirmar-chegada" && (
        <section className="painel-card">
          <div className="acomp-codigo-centro">
            <div className="acomp-codigo-icone">
              <MapPin size={26} />
            </div>
            <h2 className="acomp-codigo-titulo">Voce chegou?</h2>
            <p className="acomp-codigo-sub">Digite o codigo de 4 digitos que o cliente vai te mostrar</p>

            <div className="acomp-cliente-mini">
              <div className="acomp-cliente-mini-avatar">MS</div>
              <div className="acomp-cliente-mini-info">
                <strong>{SERVICO_MOCK.cliente}</strong>
                <span>{SERVICO_MOCK.clienteEndereco}</span>
                <span style={{ display: "block", marginTop: 6 }}>{SERVICO_MOCK.titulo}</span>
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
              onClick={confirmarChegada}
            >
              Codigo valido (mock)
            </button>
            <span style={{ fontSize: 12, color: "var(--workspace-muted)", marginTop: -4 }}>
              A validacao real sera feita pelo back-end. Por enquanto, qualquer codigo e aceito.
            </span>
          </div>
        </section>
      )}

      {/* ETAPA 2: em execucao */}
      {etapa === "em-execucao" && (
        <>
          <section className="painel-card acomp-card-servico">
            <div className="acomp-card-servico-cabecalho">
              <div>
                <h2>{SERVICO_MOCK.titulo}</h2>
                <p style={{ margin: "4px 0 0", color: "var(--workspace-muted)", fontSize: 13 }}>
                  Cliente: {SERVICO_MOCK.cliente}
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
                <span>{novaFoto ? "Trocar foto" : "Tirar ou adicionar foto"}</span>
                <input type="file" accept="image/*" onChange={handleFotoUpload} />
              </label>

              {novaFoto && (
                <div className="acomp-foto-preview">
                  <img src={novaFoto} alt="Preview da nova atualizacao" />
                </div>
              )}

              <button
                type="button"
                className="acomp-btn-primary"
                onClick={enviarAtualizacao}
                disabled={!novaAtualizacao.trim()}
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
            <div className="acomp-timeline">
              {atualizacoes.map((atualizacao) => (
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

            <button
              type="button"
              className="acomp-btn-primary"
              onClick={concluirServico}
              style={{ marginTop: 18 }}
            >
              <CheckCircle2 size={16} />
              Concluir servico
            </button>
          </section>
        </>
      )}

      {/* ETAPA 3: aguardando pagamento */}
      {etapa === "aguardando-pagamento" && (
        <section className="painel-card">
          <div className="painel-card-cabecalho">
            <h2>Aguardando pagamento</h2>
          </div>

          <div className="acomp-pagamento-total">
            <span>Total do servico - {SERVICO_MOCK.titulo}</span>
            <strong>R$ {SERVICO_MOCK.valor.toFixed(2).replace(".", ",")}</strong>
          </div>

          <p style={{ color: "var(--workspace-muted)", fontSize: 13, marginBottom: 14 }}>
            O cliente escolheu o seguinte metodo de pagamento:
          </p>

          <div className="acomp-pagamento-opcao selecionada" style={{ marginBottom: 18 }}>
            <span className="acomp-pagamento-opcao-icone">
              <Smartphone size={18} />
            </span>
            <span className="acomp-pagamento-opcao-info">
              <strong>PIX</strong>
              <span>Pagamento instantaneo</span>
            </span>
            <QrCode size={20} style={{ marginLeft: "auto", color: "var(--brand-strong)" }} />
          </div>

          <button type="button" className="acomp-btn-primary" onClick={confirmarPagamentoRecebido}>
            <CreditCard size={16} />
            Pagamento recebido
          </button>
        </section>
      )}

      {/* ETAPA 4: aguardando avaliacao */}
      {etapa === "aguardando-avaliacao" && (
        <section className="painel-card">
          <div className="acomp-final">
            <div className="acomp-final-icone">
              <Star size={36} fill="#facc15" color="#facc15" />
            </div>
            <h2>Aguardando avaliacao do cliente</h2>
            <p>
              O servico foi concluido e o pagamento confirmado. Em breve voce recebera a avaliacao
              do cliente.
            </p>
            <button type="button" className="acomp-btn-primary" onClick={reiniciarFluxo} style={{ maxWidth: 280 }}>
              Atender novo servico
            </button>
          </div>
        </section>
      )}
    </>
  );
}

export default Acompanhamento;
