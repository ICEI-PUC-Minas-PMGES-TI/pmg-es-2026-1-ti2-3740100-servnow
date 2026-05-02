import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Bell,
  BarChart3,
  Briefcase,
  ClipboardList,
  Cog,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Star,
  TrendingUp,
  Users,
  Wrench,
  Zap,
  Droplet,
  PaintBucket,
  Hammer,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";

import {
  API_URL,
  clearAuthSession,
  getAuthSession,
  type CurrentUserResponse,
  type SolicitacaoServicoResponse,
} from "../../services/auth";
import "./Prestador.css";

type FilterTab = "TODOS" | "PROCESSAMENTO" | "NOVO" | "REAGENDAMENTO" | "URGENTE";

type ServicoIcone = {
  Icon: typeof Wrench;
  bg: string;
  color: string;
};

const tipoServicoLabels: Record<string, string> = {
  ELETRICO: "Servico eletrico",
  HIDRAULICO: "Servico hidraulico",
  PINTURA: "Servico de pintura",
  MONTAGEM: "Montagem de moveis",
  LIMPEZA: "Servico de limpeza",
  MANUTENCAO_GERAL: "Manutencao geral",
};

const faixaPrecoValor: Record<string, number> = {
  ATE_150: 150,
  DE_150_A_300: 200,
  DE_300_A_600: 450,
  DE_600_A_1000: 800,
  ACIMA_1000: 1200,
};

function getServicoIcone(tipoServico: string): ServicoIcone {
  switch (tipoServico) {
    case "ELETRICO":
      return { Icon: Zap, bg: "linear-gradient(135deg, #a855f7, #7e22ce)", color: "#ffffff" };
    case "HIDRAULICO":
      return { Icon: Droplet, bg: "linear-gradient(135deg, #38bdf8, #0ea5e9)", color: "#ffffff" };
    case "PINTURA":
      return { Icon: PaintBucket, bg: "linear-gradient(135deg, #f97316, #ea580c)", color: "#ffffff" };
    case "MONTAGEM":
      return { Icon: Hammer, bg: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#ffffff" };
    case "LIMPEZA":
      return { Icon: Sparkles, bg: "linear-gradient(135deg, #ec4899, #db2777)", color: "#ffffff" };
    case "MANUTENCAO_GERAL":
      return { Icon: Wrench, bg: "linear-gradient(135deg, #22d3ee, #0891b2)", color: "#ffffff" };
    default:
      return { Icon: Wrench, bg: "linear-gradient(135deg, #22d3ee, #0891b2)", color: "#ffffff" };
  }
}

function getRandomDistance(seed: number) {
  const distances = [1.2, 1.8, 2.5, 3.2, 3.8, 4.5, 5.1, 6.3];
  return distances[seed % distances.length];
}

function relativeTime(criadoEm: string): string {
  const created = new Date(criadoEm);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `Ha ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Ha ${diffH} ${diffH === 1 ? "hora" : "horas"}`;
  const diffD = Math.floor(diffH / 24);
  return `Ha ${diffD} ${diffD === 1 ? "dia" : "dias"}`;
}

function isUrgente(servico: SolicitacaoServicoResponse): boolean {
  return servico.data === new Date().toISOString().slice(0, 10);
}

function isNovo(servico: SolicitacaoServicoResponse): boolean {
  const created = new Date(servico.criadoEm);
  const diffMs = Date.now() - created.getTime();
  return diffMs < 60 * 60 * 1000;
}

function getStatusBadge(servico: SolicitacaoServicoResponse): { label: string; className: string } {
  if (servico.status === "ACEITO") {
    return { label: "Processamento", className: "processamento" };
  }
  if (isUrgente(servico)) {
    return { label: "Urgente", className: "urgente" };
  }
  return { label: "Novo", className: "novo" };
}

const navItems = [
  { key: "inicio", label: "Inicio", Icon: Home, badge: null as number | null },
  { key: "solicitacoes", label: "Solicitacoes", Icon: ClipboardList, badge: 0 },
  { key: "atendimentos", label: "Atendimentos", Icon: Briefcase, badge: null },
  { key: "consultas", label: "Consultas", Icon: MessageSquare, badge: null },
  { key: "clientes", label: "Clientes", Icon: Users, badge: null },
  { key: "relatorios", label: "Relatorios", Icon: BarChart3, badge: null },
  { key: "configuracoes", label: "Configuracoes", Icon: Cog, badge: null },
];

export function Prestador() {
  const navigate = useNavigate();
  const session = getAuthSession();

  const [user, setUser] = useState<CurrentUserResponse | null>(
    session
      ? {
          id: session.id,
          nome: session.nome,
          email: session.email,
          tipoUsuario: session.tipoUsuario,
        }
      : null,
  );
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoServicoResponse[]>([]);
  const [historico, setHistorico] = useState<SolicitacaoServicoResponse[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("TODOS");
  const [activeNav, setActiveNav] = useState("inicio");
  const [busca, setBusca] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!session?.token) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as CurrentUserResponse;
        setUser(data);
      } catch {
        // mantemos os dados da sessao local quando o backend nao responde
      }
    }

    void loadCurrentUser();
  }, [session?.token]);

  useEffect(() => {
    async function loadSolicitacoes() {
      if (!session?.token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/solicitacoes-servico/publicadas`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });

        if (!response.ok) {
          const data = (await response.json()) as { detail?: string };
          throw new Error(data.detail || "Nao foi possivel carregar solicitacoes.");
        }

        const data = (await response.json()) as SolicitacaoServicoResponse[];
        setSolicitacoes(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar solicitacoes.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSolicitacoes();
  }, [session?.token]);

  useEffect(() => {
    async function loadNotificacoes() {
      if (!session?.token) return;

      try {
        const response = await fetch(`${API_URL}/api/notificacoes/resumo`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });

        if (response.ok) {
          const data = (await response.json()) as { quantidadeNaoLidas: number };
          setUnreadCount(data.quantidadeNaoLidas);
        }
      } catch {
        // ignora erros silenciosamente
      }
    }

    void loadNotificacoes();
  }, [session?.token]);

  const stats = useMemo(() => {
    const ativas = solicitacoes.length;
    const urgentes = solicitacoes.filter(isUrgente).length;
    const novos = solicitacoes.filter(isNovo).length;

    return {
      solicitacoesAtivas: ativas,
      servicosUteis: 27,
      faturamento: "R$ 3.840",
      avaliacaoMedia: "4.9",
      avaliacoesTotal: 156,
      urgentes,
      novos,
    };
  }, [solicitacoes]);

  const solicitacoesFiltradas = useMemo(() => {
    let lista = solicitacoes;

    if (busca.trim()) {
      const buscaLower = busca.trim().toLowerCase();
      lista = lista.filter(
        (item) =>
          item.endereco.toLowerCase().includes(buscaLower) ||
          item.descricao.toLowerCase().includes(buscaLower) ||
          tipoServicoLabels[item.tipoServico]?.toLowerCase().includes(buscaLower),
      );
    }

    switch (activeFilter) {
      case "PROCESSAMENTO":
        return lista.filter((item) => item.status === "ACEITO");
      case "NOVO":
        return lista.filter((item) => item.status === "PUBLICADO" && isNovo(item));
      case "URGENTE":
        return lista.filter(isUrgente);
      case "REAGENDAMENTO":
        return lista.filter((item) => {
          const dataServico = new Date(item.data);
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          dataServico.setHours(0, 0, 0, 0);
          return dataServico.getTime() > hoje.getTime();
        });
      default:
        return lista;
    }
  }, [solicitacoes, activeFilter, busca]);

  function handleLogout() {
    clearAuthSession();
    navigate("/login");
  }

  async function handleAceitar(id: number) {
    if (!session?.token) {
      toast.error("Sua sessao expirou. Entre novamente.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/solicitacoes-servico/${id}/aceitar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });

      const data = (await response.json()) as SolicitacaoServicoResponse | { detail?: string };

      if (!response.ok) {
        const detail = "detail" in data ? data.detail : null;
        throw new Error(detail || "Nao foi possivel aceitar a solicitacao.");
      }

      const aceita = data as SolicitacaoServicoResponse;
      setSolicitacoes((current) => current.filter((item) => item.id !== id));
      setHistorico((current) => [aceita, ...current]);
      toast.success("Solicitacao aceita com sucesso! O cliente foi notificado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao aceitar solicitacao.");
    }
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.tipoUsuario !== "PRESTADOR") {
    return <Navigate to="/painel/cliente" replace />;
  }

  const nomeExibicao = user?.nome ?? session.nome;
  const primeiraLetra = nomeExibicao.charAt(0).toUpperCase();
  const nomeCurto =
    nomeExibicao.split(" ").length > 1
      ? `${nomeExibicao.split(" ")[0]} ${nomeExibicao.split(" ").slice(-1)[0].charAt(0)}.`
      : nomeExibicao;

  return (
    <div className={`prestador-page ${sidebarOpen ? "" : "sidebar-closed"}`}>
      <aside className="prestador-sidebar">
        <div className="prestador-sidebar-header">
          <div className="prestador-logo-icon">S</div>
          {sidebarOpen && <span className="prestador-logo-text">Servnow</span>}
        </div>

        <nav className="prestador-nav">
          {navItems.map((item) => {
            const Icon = item.Icon;
            const isActive = activeNav === item.key;
            const badgeValue =
              item.key === "solicitacoes" ? stats.solicitacoesAtivas : item.badge;

            return (
              <button
                key={item.key}
                type="button"
                className={`prestador-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveNav(item.key)}
                title={item.label}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <>
                    <span className="prestador-nav-label">{item.label}</span>
                    {badgeValue !== null && badgeValue > 0 && (
                      <span className="prestador-nav-badge">{badgeValue}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="prestador-sidebar-footer">
          <button
            type="button"
            className="prestador-logout-button"
            onClick={handleLogout}
            title="Sair"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <div className="prestador-content">
        <header className="prestador-topbar">
          <button
            type="button"
            className="prestador-menu-toggle"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label="Alternar menu"
          >
            <Menu size={22} />
          </button>

          <div className="prestador-greeting">
            <h1>
              Ola, {nomeExibicao.split(" ")[0]}! <span className="prestador-wave">👋</span>
            </h1>
            <p>Aqui estao as solicitacoes disponiveis</p>
          </div>

          <div className="prestador-topbar-actions">
            <div className="prestador-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </div>

            <button type="button" className="prestador-icon-button" aria-label="Notificacoes">
              <Bell size={20} />
              {unreadCount > 0 && <span className="prestador-notification-dot" />}
            </button>

            <div className="prestador-user-pill">
              <span className="prestador-user-avatar">{primeiraLetra}</span>
              <span className="prestador-user-name">{nomeCurto}</span>
            </div>
          </div>
        </header>

        <main className="prestador-main">
          <section className="prestador-stats">
            <article className="prestador-stat-card">
              <div className="prestador-stat-header">
                <span className="prestador-stat-label">SOLICITACOES ATIVAS</span>
                <FileText size={18} className="prestador-stat-icon" />
              </div>
              <h2>{stats.solicitacoesAtivas}</h2>
            </article>

            <article className="prestador-stat-card">
              <div className="prestador-stat-header">
                <span className="prestador-stat-label">SERVICOS UTEIS</span>
                <TrendingUp size={18} className="prestador-stat-icon green" />
              </div>
              <h2>{stats.servicosUteis}</h2>
              <small>Ultimos 30 dias</small>
            </article>

            <article className="prestador-stat-card">
              <div className="prestador-stat-header">
                <span className="prestador-stat-label">FATURAMENTO</span>
                <BarChart3 size={18} className="prestador-stat-icon blue" />
              </div>
              <h2>{stats.faturamento}</h2>
              <small>Este mes</small>
            </article>

            <article className="prestador-stat-card">
              <div className="prestador-stat-header">
                <span className="prestador-stat-label">AVALIACAO MEDIA</span>
                <Star size={18} className="prestador-stat-icon yellow" fill="currentColor" />
              </div>
              <h2>{stats.avaliacaoMedia}</h2>
              <small>{stats.avaliacoesTotal} Avaliacoes</small>
            </article>
          </section>

          <section className="prestador-section">
            <header className="prestador-section-header">
              <h3>Solicitacoes de clientes</h3>
            </header>

            <div className="prestador-filters">
              {[
                { key: "TODOS" as const, label: "Todos" },
                { key: "PROCESSAMENTO" as const, label: "Processamento" },
                { key: "NOVO" as const, label: "Novo caso" },
                { key: "REAGENDAMENTO" as const, label: "Reagendamento" },
                { key: "URGENTE" as const, label: "Urgente" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`prestador-filter-pill ${activeFilter === tab.key ? "active" : ""}`}
                  onClick={() => setActiveFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="prestador-list">
              {isLoading && (
                <div className="prestador-empty">
                  <p>Carregando solicitacoes disponiveis...</p>
                </div>
              )}

              {!isLoading && solicitacoesFiltradas.length === 0 && (
                <div className="prestador-empty">
                  <p>Nenhuma solicitacao encontrada para esse filtro.</p>
                </div>
              )}

              {solicitacoesFiltradas.map((servico) => {
                const { Icon, bg } = getServicoIcone(servico.tipoServico);
                const status = getStatusBadge(servico);
                const distancia = getRandomDistance(servico.id);
                const tempo = relativeTime(servico.criadoEm);
                const valor = faixaPrecoValor[servico.faixaPreco] ?? 0;

                return (
                  <article key={servico.id} className="prestador-item">
                    <div className="prestador-item-icon" style={{ background: bg }}>
                      <Icon size={22} />
                    </div>

                    <div className="prestador-item-info">
                      <div className="prestador-item-title">
                        <h4>{tipoServicoLabels[servico.tipoServico] ?? servico.tipoServico}</h4>
                        <span className={`prestador-status-badge ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="prestador-item-meta">
                        <span><MapPin size={13} /> {servico.endereco}</span>
                        <span><TrendingUp size={13} /> {distancia} km</span>
                        <span><Clock size={13} /> {tempo}</span>
                      </div>
                    </div>

                    <div className="prestador-item-price">R$ {valor}</div>

                    <button
                      type="button"
                      className="prestador-action-button"
                      onClick={() => handleAceitar(servico.id)}
                    >
                      Solicitar
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="prestador-section">
            <header className="prestador-section-header">
              <h3>Servicos recentes</h3>
            </header>

            <div className="prestador-list">
              {historico.length === 0 && (
                <div className="prestador-empty">
                  <p>Voce ainda nao concluiu nenhum servico nesta sessao.</p>
                </div>
              )}

              {historico.map((servico) => {
                const { Icon, bg } = getServicoIcone(servico.tipoServico);
                const valor = faixaPrecoValor[servico.faixaPreco] ?? 0;

                return (
                  <article key={`hist-${servico.id}`} className="prestador-item">
                    <div className="prestador-item-icon" style={{ background: bg }}>
                      <Icon size={22} />
                    </div>

                    <div className="prestador-item-info">
                      <div className="prestador-item-title">
                        <h4>{tipoServicoLabels[servico.tipoServico] ?? servico.tipoServico}</h4>
                        <span className="prestador-status-badge concluido">Concluido</span>
                      </div>
                      <div className="prestador-item-meta">
                        <span className="rating"><Star size={13} fill="#facc15" color="#facc15" /> 4.9</span>
                        <span><MapPin size={13} /> {servico.endereco}</span>
                      </div>
                    </div>

                    <div className="prestador-item-price">R$ {valor}</div>

                    <button type="button" className="prestador-action-button outline">
                      Detalhes
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Prestador;
