import { ArrowRight, Calendar, Clock, FileText, PlusCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";

type InicioProps = {
  onIrParaSolicitacoes: () => void;
  onIrParaCriar: () => void;
};

const solicitacoesRecentes = [
  {
    id: 1,
    titulo: "Conserto de chuveiro eletrico",
    categoria: "Eletrica",
    data: "12/05/2026",
    status: "aguardando" as const,
    statusLabel: "Aguardando propostas",
  },
  {
    id: 2,
    titulo: "Pintura da sala",
    categoria: "Pintura",
    data: "08/05/2026",
    status: "agendado" as const,
    statusLabel: "Agendado",
  },
  {
    id: 3,
    titulo: "Vazamento na pia da cozinha",
    categoria: "Hidraulica",
    data: "02/05/2026",
    status: "concluido" as const,
    statusLabel: "Concluido",
  },
];

export function Inicio({ onIrParaSolicitacoes, onIrParaCriar }: InicioProps) {
  const navigate = useNavigate();

  return (
    <>
      <PainelSectionHeader
        eyebrow="Painel do cliente"
        title="Inicio"
        description="Acompanhe suas solicitacoes, agendamentos e gastos do mes."
      />

      <section
        className="painel-card"
        style={{
          marginBottom: 18,
          background: "linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(20, 184, 166, 0.08))",
          borderColor: "rgba(56, 189, 248, 0.35)",
        }}
      >
        <div className="painel-card-cabecalho" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(56, 189, 248, 0.2)",
                color: "var(--brand-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>Voce tem um servico para comecar hoje</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--workspace-muted)" }}>
                Troca de chuveiro eletrico - previsto para 14:00
              </p>
            </div>
          </div>
          <button type="button" className="btn-primary" onClick={() => navigate("/acompanhamento")}>
            Acompanhar servico <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <section className="painel-stats-grid">
        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <FileText size={22} />
          </div>
          <span className="painel-stat-label">Solicitacoes ativas</span>
          <strong className="painel-stat-valor">3</strong>
          <span className="painel-stat-detalhe">2 com propostas recebidas</span>
        </div>

        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <Calendar size={22} />
          </div>
          <span className="painel-stat-label">Servicos agendados</span>
          <strong className="painel-stat-valor">1</strong>
          <span className="painel-stat-detalhe">Proximo em 14/05</span>
        </div>

        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <Wallet size={22} />
          </div>
          <span className="painel-stat-label">Gastos no mes</span>
          <strong className="painel-stat-valor">R$ 480,00</strong>
          <span className="painel-stat-detalhe">2 servicos pagos em maio</span>
        </div>
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Suas solicitacoes</h2>
          <button type="button" className="painel-btn-ghost" onClick={onIrParaSolicitacoes}>
            Ver todas <ArrowRight size={14} />
          </button>
        </div>

        <div className="painel-lista">
          {solicitacoesRecentes.map((item) => (
            <div key={item.id} className="painel-lista-item">
              <div className="painel-lista-item-info">
                <p className="painel-lista-item-titulo">{item.titulo}</p>
                <div className="painel-lista-item-meta">
                  <span className="painel-lista-item-meta-detalhe">{item.categoria}</span>
                  <span className="painel-lista-item-meta-detalhe">
                    <Calendar size={13} /> {item.data}
                  </span>
                </div>
              </div>
              <div className="painel-lista-item-acoes">
                <span className={`painel-status ${item.status}`}>{item.statusLabel}</span>
                <button type="button" className="painel-btn-ghost">Ver detalhes</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Precisa de um novo servico?</h2>
          <button type="button" className="btn-primary" onClick={onIrParaCriar}>
            <PlusCircle size={16} /> Criar solicitacao
          </button>
        </div>
        <p style={{ margin: 0, color: "var(--workspace-muted)", fontSize: 14 }}>
          Descreva o que voce precisa e receba propostas de prestadores qualificados da sua regiao.
        </p>
      </section>
    </>
  );
}

export default Inicio;
