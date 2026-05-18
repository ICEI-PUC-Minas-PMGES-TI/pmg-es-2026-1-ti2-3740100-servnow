import { ArrowRight, BarChart3, FileText, HandCoins, Star, Wallet } from "lucide-react";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";

type InicioProps = {
  onIrParaSolicitacoes: () => void;
  onIrParaPropostas: () => void;
  onIrParaGanhos: () => void;
};

const solicitacoesRecentes = [
  {
    id: 1,
    titulo: "Troca de chuveiro eletrico",
    cliente: "Maria Costa",
    local: "Belvedere, BH",
    preco: "R$ 180",
    status: "aguardando" as const,
    statusLabel: "Nova oportunidade",
  },
  {
    id: 2,
    titulo: "Instalacao de ventilador de teto",
    cliente: "Ricardo A.",
    local: "Savassi, BH",
    preco: "R$ 250",
    status: "aguardando" as const,
    statusLabel: "Nova oportunidade",
  },
  {
    id: 3,
    titulo: "Reparo em tomada queimada",
    cliente: "Julia S.",
    local: "Funcionarios, BH",
    preco: "R$ 120",
    status: "agendado" as const,
    statusLabel: "Em andamento",
  },
];

export function Inicio({ onIrParaSolicitacoes, onIrParaPropostas, onIrParaGanhos }: InicioProps) {
  return (
    <>
      <PainelSectionHeader
        eyebrow="Painel do prestador"
        title="Inicio"
        description="Acompanhe novas solicitacoes, ganhos e avaliacoes dos seus atendimentos."
      />

      <section className="painel-stats-grid">
        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <FileText size={22} />
          </div>
          <span className="painel-stat-label">Oportunidades novas</span>
          <strong className="painel-stat-valor">4</strong>
          <span className="painel-stat-detalhe">2 publicadas hoje</span>
        </div>

        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <Wallet size={22} />
          </div>
          <span className="painel-stat-label">Ganhos no mes</span>
          <strong className="painel-stat-valor">R$ 3.840</strong>
          <span className="painel-stat-detalhe">+18% vs. mes anterior</span>
        </div>

        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <Star size={22} />
          </div>
          <span className="painel-stat-label">Avaliacao media</span>
          <strong className="painel-stat-valor">4,9</strong>
          <span className="painel-stat-detalhe">124 avaliacoes</span>
        </div>
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Solicitacoes disponiveis</h2>
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
                  <span className="painel-lista-item-meta-detalhe">{item.cliente}</span>
                  <span className="painel-lista-item-meta-detalhe">{item.local}</span>
                  <span className="painel-lista-item-meta-detalhe">{item.preco}</span>
                </div>
              </div>
              <div className="painel-lista-item-acoes">
                <span className={`painel-status ${item.status}`}>{item.statusLabel}</span>
                <button type="button" className="painel-btn-aceitar">Enviar proposta</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Atalhos rapidos</h2>
        </div>
        <div className="painel-atalhos-grid">
          <button type="button" className="painel-atalho-card" onClick={onIrParaPropostas}>
            <HandCoins size={20} />
            <span>Minhas propostas</span>
          </button>
          <button type="button" className="painel-atalho-card" onClick={onIrParaGanhos}>
            <BarChart3 size={20} />
            <span>Ver ganhos</span>
          </button>
        </div>
      </section>
    </>
  );
}

export default Inicio;
