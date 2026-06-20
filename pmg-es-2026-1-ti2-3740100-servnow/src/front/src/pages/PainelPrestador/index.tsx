import {
    CheckCircle,
    MessageSquare,
    Plus,
    Search,
    Settings,
    Star,
    TrendingUp
} from "lucide-react";
import { useState } from "react";
import { Sidebar } from "../../Components/Sidebar/Sidebar";
import { StatCard } from "../../Components/StatCard/StatCard";
import "./PainelPrestador.css";

interface Service {
  id: string;
  title: string;
  client: string;
  location: string;
  price: number;
  status: "novo" | "em_andamento" | "concluido";
  distance: string;
  timeframe: string;
  rating?: number;
}

interface RecentService {
  id: string;
  title: string;
  professional?: string;
  status: "concluido" | "em_andamento";
  date: string;
  price: number;
  rating: number;
}

export function PainelPrestador() {
  const [selectedTab, setSelectedTab] = useState("todas");
  const userName = "Lucas";

  const stats = [
    {
      label: "SOLICITAÇÕES NOVAS",
      value: "4",
      change: "+1 hoje",
      icon: Plus,
      color: "blue"
    },
    {
      label: "CONCLUÍDOS (MÊS)",
      value: "27",
      change: "+3% vs mês anterior",
      icon: CheckCircle,
      color: "green"
    },
    {
      label: "GANHOS NO MÊS",
      value: "R$ 3.840",
      change: "+1% vs mês anterior",
      icon: TrendingUp,
      color: "orange"
    },
    {
      label: "AVALIAÇÃO MÉDIA",
      value: "4.9",
      change: "com 127 avaliações",
      icon: Star,
      color: "yellow"
    }
  ];

  const services: Service[] = [
    {
      id: "1",
      title: "Troca de chuveiro elétrico",
      client: "1 Bairro, Bl - 3, Apto 5",
      location: "Maria Costa",
      price: 180,
      status: "novo",
      distance: "~15 min",
      timeframe: "2 horas"
    },
    {
      id: "2",
      title: "Instalação de ventilador de teto",
      client: "Diadema, DM - 4 Km",
      location: "Jardim Rio",
      price: 250,
      status: "novo",
      distance: "~42 min",
      timeframe: "3 horas"
    },
    {
      id: "3",
      title: "Reparo em tomada queimada",
      client: "2 Funcionários, DF - 3.5 km",
      location: "Julia S.",
      price: 120,
      status: "novo",
      distance: "~14 h",
      timeframe: "1 hora"
    },
    {
      id: "4",
      title: "Instalação de lustre na sala",
      client: "2 Lourdes, DF - 1.8 km",
      location: "Positron",
      price: 200,
      status: "novo",
      distance: "~1d 3h",
      timeframe: "2 horas"
    }
  ];

  const recentServices: RecentService[] = [
    {
      id: "1",
      title: "Troca de disjuntor",
      professional: "Ana",
      status: "concluido",
      date: "Concluído",
      price: 220,
      rating: 5
    },
    {
      id: "2",
      title: "Instalação de luminádia LED",
      professional: "Bruno",
      status: "concluido",
      date: "Concluído",
      price: 150,
      rating: 5
    }
  ];

  const filterOptions = ["Todas", "Próximas (16km)", "Maior valor", "Mais recentes", "Urgentes"];

  return (
    <div className="painel-prestador-container">
      <Sidebar />
      
      <main className="painel-prestador-main">
        {/* Header do Painel */}
        <div className="painel-header">
          <div className="painel-header-left">
            <h1>Olá, {userName}! 👋</h1>
            <p>Você tem 4 novas solicitações aguardando sua resposta.</p>
          </div>
          <div className="painel-header-right">
            <button className="icon-button">
              <MessageSquare size={20} />
            </button>
            <button className="icon-button">
              <Settings size={20} />
            </button>
            <div className="user-avatar">
              <span>LB</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const { label, value, change, icon: Icon, color } = stat;
            return (
              <StatCard 
                key={index} 
                label={label}
                value={value}
                change={change}
                icon={Icon}
                color={color as "blue" | "green" | "orange" | "yellow"}
              />
            );
          })}
        </div>

        {/* Solicitações de Clientes */}
        <div className="solicitacoes-section">
          <div className="solicitacoes-header">
            <h2>Solicitações de clientes</h2>
            
            <div className="solicitacoes-controls">
              <div className="search-box">
                <Search size={18} />
                <input type="text" placeholder="Buscar solicitação..." />
              </div>

              <div className="filter-tabs">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    className={`filter-tab ${selectedTab === option.toLowerCase() ? "active" : ""}`}
                    onClick={() => setSelectedTab(option.toLowerCase())}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="services-list">
            {services.map((service) => (
              <div key={service.id} className="service-item">
                <div className="service-header">
                  <div className="service-title-group">
                    <h3>{service.title}</h3>
                    <span className="service-status novo">NOVO</span>
                  </div>
                  <span className="service-price">R$ {service.price}</span>
                </div>

                <div className="service-details">
                  <div className="detail-row">
                    <span className="detail-label">{service.client}</span>
                    <span className="detail-label">{service.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="service-meta">~{service.distance}</span>
                    <span className="service-meta">{service.timeframe}</span>
                  </div>
                </div>

                <button className="btn-aceitar">Aceitar</button>
              </div>
            ))}
          </div>
        </div>

        {/* Serviços Recentes */}
        <div className="servicos-recentes-section">
          <h2>Serviços recentes</h2>
          
          <div className="recentes-list">
            {recentServices.map((service) => (
              <div key={service.id} className="recente-item">
                <div className="recente-left">
                  <div className="avatar-circle">
                    {service.professional?.charAt(0)}
                  </div>
                  <div className="recente-info">
                    <h3>{service.title}</h3>
                    <span className="recente-status">{service.professional} • {service.status === "concluido" ? "Concluído" : "Em andamento"}</span>
                  </div>
                </div>
                <div className="recente-right">
                  <span className="recente-price">R$ {service.price}</span>
                  <div className="recente-rating">
                    <Star size={16} className="star-filled" />
                    <span>{service.rating}</span>
                  </div>
                  <button className="recente-details">Detalhes</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
