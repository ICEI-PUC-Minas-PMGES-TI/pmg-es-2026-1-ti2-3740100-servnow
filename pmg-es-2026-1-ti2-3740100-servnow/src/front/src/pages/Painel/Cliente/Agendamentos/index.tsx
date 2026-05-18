import { Calendar, Clock, MapPin, User } from "lucide-react";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";

type Agendamento = {
  id: number;
  titulo: string;
  categoria: string;
  prestador: string;
  endereco: string;
  data: string;
  horario: string;
};

const AGENDAMENTOS: Agendamento[] = [
  {
    id: 1,
    titulo: "Pintura da sala",
    categoria: "Pintura",
    prestador: "Carlos Mendes",
    endereco: "Rua das Flores, 123 - Centro",
    data: "14/05/2026",
    horario: "09:00",
  },
  {
    id: 2,
    titulo: "Instalacao de ventilador de teto",
    categoria: "Eletrica",
    prestador: "Joao Pereira",
    endereco: "Av. Brasil, 456 - Jardim America",
    data: "20/05/2026",
    horario: "14:30",
  },
];

export function Agendamentos() {
  return (
    <>
      <PainelSectionHeader
        eyebrow="Sua agenda"
        title="Agendamentos"
        description="Servicos confirmados apos voce aceitar propostas dos prestadores."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Proximos servicos</h2>
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
                      <User size={13} /> {item.prestador}
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
                  </div>
                </div>
                <div className="painel-lista-item-acoes">
                  <span className="painel-status agendado">Agendado</span>
                  <button type="button" className="painel-btn-ghost">Ver detalhes</button>
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
