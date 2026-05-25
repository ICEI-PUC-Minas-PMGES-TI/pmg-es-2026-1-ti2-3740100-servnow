import { AlertCircle, Calendar, CheckCircle, Clock, MapPin, Phone, Plus, User } from "lucide-react";
import "./Agendamentos.css";

export function Agendamentos() {
  const agendamentos = [
    {
      id: 1,
      cliente: "Maria Costa",
      telefone: "(31) 99999-0001",
      servico: "Troca de chuveiro elétrico",
      local: "Belvedere, BH",
      data: "2026-05-20",
      hora: "14:00",
      preco: "R$ 180",
      status: "confirmado",
      distancia: "2.3 km"
    },
    {
      id: 2,
      cliente: "Ricardo A.",
      telefone: "(31) 99999-0002",
      servico: "Instalação de ventilador de teto",
      local: "Savaí, BH",
      data: "2026-05-21",
      hora: "10:00",
      preco: "R$ 250",
      status: "confirmado",
      distancia: "4.1 km"
    },
    {
      id: 3,
      cliente: "Julias J.",
      telefone: "(31) 99999-0003",
      servico: "Reparo em tomada queimada",
      local: "Funcionários, BH",
      data: "2026-05-22",
      hora: "09:00",
      preco: "R$ 120",
      status: "pendente",
      distancia: "3.0 km"
    },
  ];

  const getStatusColor = (status: string) => {
    return status === "confirmado" ? "status-confirmado" : "status-pendente";
  };

  const getStatusIcon = (status: string) => {
    return status === "confirmado" ? CheckCircle : AlertCircle;
  };

  return (
    <div className="agendamentos-container">
      <div className="agendamentos-header">
        <div>
          <h1>Agendamentos</h1>
          <p>Gerenciar seus compromissos e serviços agendados</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          Novo agendamento
        </button>
      </div>

      <div className="agendamentos-calendar-section">
        <div className="calendar-info">
          <Calendar size={20} />
          <span>Você tem 2 agendamentos confirmados para esta semana</span>
        </div>
      </div>

      <div className="agendamentos-list">
        {agendamentos.map((agendamento) => {
          const StatusIcon = getStatusIcon(agendamento.status);
          const dataObj = new Date(agendamento.data);
          const dataFormatada = dataObj.toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <div key={agendamento.id} className="agendamento-card">
              <div className="agendamento-card-header">
                <div className="agendamento-status">
                  <StatusIcon size={16} className={getStatusColor(agendamento.status)} />
                  <span className={getStatusColor(agendamento.status)}>
                    {agendamento.status === "confirmado" ? "Confirmado" : "Pendente"}
                  </span>
                </div>
                <div className="agendamento-preco">{agendamento.preco}</div>
              </div>

              <div className="agendamento-servico">
                <strong>{agendamento.servico}</strong>
              </div>

              <div className="agendamento-details">
                <div className="detail-item">
                  <User size={16} />
                  <span>{agendamento.cliente}</span>
                </div>
                <div className="detail-item">
                  <Phone size={16} />
                  <span>{agendamento.telefone}</span>
                </div>
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>{dataFormatada}</span>
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  <span>{agendamento.hora}</span>
                </div>
                <div className="detail-item">
                  <MapPin size={16} />
                  <span>{agendamento.local} • {agendamento.distancia}</span>
                </div>
              </div>

              <div className="agendamento-actions">
                <button className="btn-secondary">Contato</button>
                <button className="btn-secondary">Detalhes</button>
                <button className="btn-secondary danger">Cancelar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Agendamentos;
