import { useMemo, useState } from "react";
import { Calendar, DollarSign, FileText, HandCoins } from "lucide-react";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";

type StatusProposta = "PENDENTE" | "ACEITA" | "RECUSADA" | "EXPIRADA";

type PropostaEnviada = {
  id: number;
  solicitacao: string;
  cliente: string;
  valor: number;
  status: StatusProposta;
  enviadaEm: string;
};

const PROPOSTAS_ENVIADAS: PropostaEnviada[] = [
  {
    id: 1,
    solicitacao: "Troca de chuveiro eletrico",
    cliente: "Maria Costa",
    valor: 180,
    status: "PENDENTE",
    enviadaEm: "18/05/2026",
  },
  {
    id: 2,
    solicitacao: "Instalacao de ventilador de teto",
    cliente: "Ricardo A.",
    valor: 250,
    status: "ACEITA",
    enviadaEm: "16/05/2026",
  },
  {
    id: 3,
    solicitacao: "Reparo em tomada queimada",
    cliente: "Julia S.",
    valor: 120,
    status: "RECUSADA",
    enviadaEm: "14/05/2026",
  },
  {
    id: 4,
    solicitacao: "Instalacao de lustre na sala",
    cliente: "Pedro F.",
    valor: 200,
    status: "EXPIRADA",
    enviadaEm: "10/05/2026",
  },
];

const FILTROS: Array<{ id: StatusProposta | "todas"; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "PENDENTE", label: "Pendentes" },
  { id: "ACEITA", label: "Aceitas" },
  { id: "RECUSADA", label: "Recusadas" },
  { id: "EXPIRADA", label: "Expiradas" },
];

function getStatusClass(status: StatusProposta) {
  if (status === "ACEITA") return "agendado";
  if (status === "RECUSADA") return "concluido";
  if (status === "EXPIRADA") return "aguardando";
  return "aguardando";
}

function getStatusLabel(status: StatusProposta) {
  const labels: Record<StatusProposta, string> = {
    PENDENTE: "Pendente",
    ACEITA: "Aceita",
    RECUSADA: "Recusada",
    EXPIRADA: "Expirada",
  };
  return labels[status];
}

export function Propostas() {
  const [filtro, setFiltro] = useState<StatusProposta | "todas">("todas");

  const lista = useMemo(() => {
    if (filtro === "todas") return PROPOSTAS_ENVIADAS;
    return PROPOSTAS_ENVIADAS.filter((item) => item.status === filtro);
  }, [filtro]);

  return (
    <>
      <PainelSectionHeader
        eyebrow="Historico de propostas"
        title="Propostas"
        description="Acompanhe todas as propostas que voce enviou e o status de cada uma."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Propostas enviadas</h2>
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

        {lista.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <HandCoins size={32} />
            </div>
            <p>Nenhuma proposta encontrada para esse filtro.</p>
          </div>
        ) : (
          <div className="painel-lista">
            {lista.map((proposta) => (
              <article key={proposta.id} className="painel-lista-item">
                <div className="painel-lista-item-info">
                  <p className="painel-lista-item-titulo">
                    <FileText size={18} style={{ marginRight: 8, verticalAlign: "text-bottom" }} />
                    {proposta.solicitacao}
                  </p>
                  <div className="painel-lista-item-meta">
                    <span className="painel-lista-item-meta-detalhe">{proposta.cliente}</span>
                    <span className="painel-lista-item-meta-detalhe">
                      <DollarSign size={13} />
                      {proposta.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                    <span className="painel-lista-item-meta-detalhe">
                      <Calendar size={13} /> Enviada em {proposta.enviadaEm}
                    </span>
                  </div>
                </div>
                <div className="painel-lista-item-acoes">
                  <span className={`painel-status ${getStatusClass(proposta.status)}`}>
                    {getStatusLabel(proposta.status)}
                  </span>
                  <button type="button" className="painel-btn-ghost">
                    Ver detalhes
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Propostas;

