import { Check, DollarSign, FileText, MessageSquare, Star, User, X } from "lucide-react";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";

type PropostaRecebida = {
  id: number;
  solicitacao: string;
  prestador: string;
  avaliacao: number;
  comentario: string;
  valor: number;
};

const PROPOSTAS_RECEBIDAS: PropostaRecebida[] = [
  {
    id: 1,
    solicitacao: "Conserto de chuveiro eletrico",
    prestador: "Joao Pereira",
    avaliacao: 4.8,
    comentario: "Consigo verificar a instalacao, trocar a resistencia se necessario e revisar a fiacao do banheiro.",
    valor: 120,
  },
  {
    id: 2,
    solicitacao: "Conserto de chuveiro eletrico",
    prestador: "Carlos Mendes",
    avaliacao: 4.6,
    comentario: "Tenho disponibilidade hoje a tarde. Levo as pecas mais comuns para resolver no primeiro atendimento.",
    valor: 150,
  },
  {
    id: 3,
    solicitacao: "Instalacao de ventilador de teto",
    prestador: "Marina Costa",
    avaliacao: 4.9,
    comentario: "Farei a instalacao completa, com teste de estabilidade e orientacao de uso apos o servico.",
    valor: 210,
  },
];

export function Propostas() {
  return (
    <>
      <PainelSectionHeader
        eyebrow="Propostas recebidas"
        title="Propostas"
        description="Veja as propostas enviadas por prestadores para as solicitacoes que voce criou."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Propostas de prestadores</h2>
        </div>

        {PROPOSTAS_RECEBIDAS.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>Nenhuma proposta recebida no momento.</p>
          </div>
        ) : (
          <div className="painel-propostas-lista">
            {PROPOSTAS_RECEBIDAS.map((proposta) => (
              <article className="painel-proposta-card" key={proposta.id}>
                <div className="painel-proposta-cabecalho">
                  <div>
                    <span className="painel-proposta-solicitacao">{proposta.solicitacao}</span>
                    <h3>{proposta.prestador}</h3>
                  </div>

                  <div className="painel-proposta-avaliacao" aria-label={`${proposta.avaliacao} estrelas`}>
                    <Star size={15} fill="currentColor" />
                    {proposta.avaliacao.toFixed(1)}
                  </div>
                </div>

                <div className="painel-proposta-comentario">
                  <MessageSquare size={17} />
                  <p>{proposta.comentario}</p>
                </div>

                <div className="painel-proposta-rodape">
                  <span className="painel-proposta-prestador">
                    <User size={14} />
                    Prestador de servico
                  </span>

                  <strong className="painel-proposta-valor">
                    <DollarSign size={16} />
                    {proposta.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </strong>
                </div>

                <div className="painel-proposta-acoes">
                  <button type="button" className="painel-btn-ghost">
                    <User size={15} />
                    Ver perfil do prestador
                  </button>

                  <button type="button" className="painel-btn-recusar">
                    <X size={15} />
                    Recusar
                  </button>

                  <button type="button" className="painel-btn-aceitar">
                    <Check size={15} />
                    Aceitar
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
