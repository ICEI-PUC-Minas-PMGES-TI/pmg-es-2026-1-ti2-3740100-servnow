import { ArrowRight, Calendar, FileText, PlusCircle, Wallet } from "lucide-react";
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
  return (
    <>
      <PainelSectionHeader
        eyebrow="Painel do cliente"
        title="Inicio"
        description="Acompanhe suas solicitacoes, agendamentos e gastos do mes."
      />

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
