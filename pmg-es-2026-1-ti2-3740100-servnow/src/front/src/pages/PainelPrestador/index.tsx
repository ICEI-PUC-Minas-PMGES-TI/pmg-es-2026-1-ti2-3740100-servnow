import {
  BadgeDollarSign,
  BarChart3,
  Calendar,
  Clock3,
  FileText,
  Inbox,
  MapPin,
  PencilLine,
  Settings2,
  UserRound,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAuthSession } from "../../services/auth";
import "./PainelPrestador.css";

export function PainelPrestador() {
  const session = getAuthSession();
  const [nome, setNome] = useState(session?.nome ?? "Usuário");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPreco, setFiltroPreco] = useState("");
  const [filtroDistancia, setFiltroDistancia] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const novaSession = getAuthSession();
    if (novaSession?.nome) {
      setNome(novaSession.nome);
    }
  }, []);

  type Solicitacao = { 
    id: number; 
    titulo: string; 
    cliente: string; 
    local: string; 
    preco: string; 
    distancia: string; 
    duracao: string; 
    novo: boolean; 
    tipo: string;
  };

  const solicitacoes: Solicitacao[] = [
    { id: 1, titulo: "Troca de chuveiro elétrico", cliente: "Maria Costa", local: "Belvedere, BH", preco: "R$ 180", distancia: "2.3 km", duracao: "~1h 15min", novo: true, tipo: "eletrica" },
    { id: 2, titulo: "Instalação de ventilador de teto", cliente: "Ricardo A.", local: "Savaí, BH", preco: "R$ 250", distancia: "4.1 km", duracao: "~2h", novo: true, tipo: "eletrica" },
    { id: 3, titulo: "Reparo em tomada queimada", cliente: "Julias J.", local: "Funcionários, BH", preco: "R$ 120", distancia: "3.0 km", duracao: "~45min", novo: false, tipo: "eletrica" },
    { id: 4, titulo: "Instalação de lustre na sala", cliente: "Pedro F.", local: "Lourdes, BH", preco: "R$ 200", distancia: "1.8 km", duracao: "~1h30", novo: false, tipo: "eletrica" },
  ];

  const newCount = solicitacoes.filter(s => s.novo).length;

  const verificarFiltros = (s: Solicitacao): boolean => {
    if (filtroTipo && s.tipo !== filtroTipo) return false;
    if (busca && !s.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
    
    if (filtroPreco) {
      const precoStr = s.preco.replace("R$", "").trim().replace(/\./g, "");
      const preco = parseInt(precoStr);
      if (filtroPreco === "0-150" && preco > 150) return false;
      if (filtroPreco === "150-300" && (preco < 150 || preco > 300)) return false;
      if (filtroPreco === "300-600" && (preco < 300 || preco > 600)) return false;
      if (filtroPreco === "600+" && preco < 600) return false;
    }

    if (filtroDistancia) {
      const dist = parseFloat(s.distancia.replace(" km", ""));
      if (filtroDistancia === "0-2" && dist > 2) return false;
      if (filtroDistancia === "2-5" && (dist < 2 || dist > 5)) return false;
      if (filtroDistancia === "5-10" && (dist < 5 || dist > 10)) return false;
      if (filtroDistancia === "10+" && dist < 10) return false;
    }

    return true;
  };

  const solicitacoesFiltradas = solicitacoes.filter(verificarFiltros);

  const cards = [
    { title: "Propostas novas", value: newCount, meta: newCount > 0 ? `+${newCount} hoje` : "0 hoje" },
    { title: "Ganhos no mês", value: "R$ 3.840", meta: "+18% vs. mês anterior" },
    { title: "Avaliação média", value: "4.9", meta: "Com 124 avaliações" },
  ];

  const painelMenu = [
    { label: "Visão geral", Icon: BarChart3, active: true, tone: "overview" },
    { label: "Propostas", Icon: Inbox, tone: "requests" },
    { label: "Em andamento", Icon: Clock3, tone: "progress" },
    { label: "Agendamentos", Icon: Calendar, tone: "done" },
    { label: "Relatório", Icon: FileText, tone: "overview" },
  ];

  const contaMenu = [
    { label: "Meu perfil", Icon: UserRound, tone: "profile" },
    { label: "Editar perfil", Icon: PencilLine, tone: "edit" },
    { label: "Ganhos", Icon: BadgeDollarSign, tone: "earnings" },
    { label: "Configurações", Icon: Settings2, tone: "settings" },
  ];

  const aceitar = (id: number) => {
    alert(`Solicitação ${id} aceita (stub)`);
  };

  const limparFiltros = () => {
    setFiltroTipo("");
    setFiltroPreco("");
    setFiltroDistancia("");
    setBusca("");
  };

  return (
    <div className="painel-root">
      <aside className="painel-sidebar">
        <div className="sidebar-top">
          <div className="brand">Servnow</div>
          <nav className="sidebar-nav">
            {painelMenu.map(({ label, Icon, active, tone }) => (
              <a key={label} className={active ? "active" : ""}>
                <Icon size={16} className={`sidebar-icon sidebar-icon-${tone}`} />
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="sidebar-account">
          <div className="account-name"><UserRound size={18} className="sidebar-icon sidebar-icon-profile" /> {nome}</div>
          <nav className="sidebar-nav small">
            {contaMenu.map(({ label, Icon, tone }) => (
              <a key={label}>
                <Icon size={16} className={`sidebar-icon sidebar-icon-${tone}`} />
                {label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <main className="painel-main">
        <header className="painel-header">
          <h1>Olá, {nome}! <span className="wave">👋</span></h1>
          <p className="sub">Você tem <strong>{newCount} novas solicitações</strong> aguardando sua resposta.</p>
        </header>

        <section className="cards-row">
          {cards.map((c, i) => (
            <div key={i} className="stat-card">
              <div className="stat-title">{c.title}</div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-meta">{c.meta}</div>
            </div>
          ))}
        </section>

        <section className="solicitacoes-card workspace-card">
          <div className="solicitacoes-header">
            <h2>Propostas de clientes</h2>
            <div className="filters-container">
              <div className="filters">
                <div className="filter-group search">
                  <input 
                    placeholder="Buscar proposta..." 
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="filter-input"
                  />
                </div>
                <div className="filter-group">
                  <select 
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Tipo</option>
                    <option value="eletrica">Elétrica</option>
                    <option value="hidraulica">Hidráulica</option>
                    <option value="moveis">Montagem de Móveis</option>
                    <option value="manutencao">Manutenção Geral</option>
                    <option value="pintura">Pintura</option>
                    <option value="eletro">Eletrodomésticos</option>
                  </select>
                </div>
                <div className="filter-group">
                  <select 
                    value={filtroPreco}
                    onChange={(e) => setFiltroPreco(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Preço</option>
                    <option value="0-150">Até R$ 150</option>
                    <option value="150-300">R$ 150 - R$ 300</option>
                    <option value="300-600">R$ 300 - R$ 600</option>
                    <option value="600+">Acima de R$ 600</option>
                  </select>
                </div>
                <div className="filter-group">
                  <select 
                    value={filtroDistancia}
                    onChange={(e) => setFiltroDistancia(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Distância</option>
                    <option value="0-2">Até 2 km</option>
                    <option value="2-5">2 - 5 km</option>
                    <option value="5-10">5 - 10 km</option>
                    <option value="10+">Acima de 10 km</option>
                  </select>
                </div>
                <button className="btn-secondary">Ver no mapa</button>
                {(filtroTipo || filtroPreco || filtroDistancia || busca) && (
                  <button 
                    className="btn-clear"
                    onClick={limparFiltros}
                  >
                    <X size={16} /> Limpar
                  </button>
                )}
              </div>
              {solicitacoesFiltradas.length === 0 && solicitacoes.length > 0 && (
                <div className="filter-info">
                  Nenhuma proposta encontrada com os filtros selecionados
                </div>
              )}
            </div>
          </div>

          <div className="solicitacoes-list">
            {solicitacoesFiltradas.length > 0 ? (
              solicitacoesFiltradas.map(s => (
                <div key={s.id} className="solicitacao-item">
                  <div className="solicitacao-left">
                    <div className="avatar-initial">{s.titulo.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                    <div>
                      <div className="solicitacao-title">{s.titulo} {s.novo && <span className="badge-new">NOVO</span>}</div>
                      <div className="solicitacao-meta">
                        <strong className="cliente-name">{s.cliente}</strong>
                        <span className="meta-sep">•</span>
                        <MapPin size={12} /> <span className="meta-text">{s.local}</span>
                        <span className="meta-sep">•</span>
                        <span className="meta-text">{s.distancia}</span>
                        <span className="meta-sep">•</span>
                        <Clock3 size={12} /> <span className="meta-text">{s.duracao}</span>
                      </div>
                    </div>
                  </div>
                  <div className="solicitacao-right">
                    <div className="price">{s.preco}</div>
                    <button className="btn-primary" onClick={() => aceitar(s.id)}>Aceitar</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <MapPin size={32} />
                <p>Nenhuma proposta encontrada</p>
              </div>
            )}
          </div>
        </section>

        <section className="recent-services workspace-card">
          <div className="recent-header">
            <h3>Serviços recentes</h3>
          </div>
          <div className="recent-list">
            <div className="recent-item">Troca de disjuntor — <strong>R$ 220</strong> <button className="btn-secondary small">Detalhes</button></div>
            <div className="recent-item">Instalação de luminária LED — <strong>R$ 150</strong> <button className="btn-secondary small">Detalhes</button></div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default PainelPrestador;
