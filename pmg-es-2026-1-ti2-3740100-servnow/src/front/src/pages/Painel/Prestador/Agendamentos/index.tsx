import { Calendar, Clock, MapPin, User } from "lucide-react";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";

type AgendamentoPrestador = {
  id: number;
  titulo: string;
  categoria: string;
  cliente: string;
  endereco: string;
  data: string;
  horario: string;
  valor: number;
};

const AGENDAMENTOS: AgendamentoPrestador[] = [
  {
    id: 1,
    titulo: "Instalacao de ventilador de teto",
    categoria: "Eletrica",
    cliente: "Ricardo A.",
    endereco: "Rua da Bahia, 512 - Savassi, BH",
    data: "20/05/2026",
    horario: "14:30",
    valor: 250,
  },
  {
    id: 2,
    titulo: "Troca de disjuntor",
    categoria: "Eletrica",
    cliente: "Ana Paula",
    endereco: "Av. Afonso Pena, 1200 - Centro, BH",
    data: "22/05/2026",
    horario: "09:00",
    valor: 220,
  },
];

export function Agendamentos() {
  return (
    <>
      <PainelSectionHeader
        eyebrow="Sua agenda"
        title="Agendamentos"
        description="Servicos aceitos pelos clientes e ja confirmados na sua agenda."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Proximos atendimentos</h2>
        </div>

        {AGENDAMENTOS.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <Calendar size={32} />
            </div>
            <p>Voce ainda nao tem servicos agendados.</p>
          </div>
        ) : (
          <div className="painel-lista">
            {AGENDAMENTOS.map((item) => (
              <div key={item.id} className="painel-lista-item">
                <div className="painel-lista-item-info">
                  <p className="painel-lista-item-titulo">{item.titulo}</p>
                  <div className="painel-lista-item-meta">
                    <span className="painel-lista-item-meta-detalhe">{item.categoria}</span>
                    <span className="painel-lista-item-meta-detalhe">
                      <User size={13} /> {item.cliente}
                    </span>
                    <span className="painel-lista-item-meta-detalhe">
                      <MapPin size={13} /> {item.endereco}
                    </span>
                    <span className="painel-lista-item-meta-detalhe">
                      <Calendar size={13} /> {item.data}
                    </span>
                    <span className="painel-lista-item-meta-detalhe">
                      <Clock size={13} /> {item.horario}
                    </span>
                    <span className="painel-lista-item-meta-detalhe">
                      {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>
                <div className="painel-lista-item-acoes">
                  <span className="painel-status agendado">Agendado</span>
                  <button type="button" className="painel-btn-ghost">
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Agendamentos;
