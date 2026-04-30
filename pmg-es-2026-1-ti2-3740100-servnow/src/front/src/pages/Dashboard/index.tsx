import { useEffect, useState } from "react";
import { BriefcaseBusiness, ClipboardList, LogOut, Settings, UserRound } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { Header } from "../../Components/Header/Header";
import { ClientServices } from "./ClientServices";
import { ProviderServices } from "./ProviderServices";

import {
  API_URL,
  clearAuthSession,
  getAuthSession,
  type CurrentUserResponse,
} from "../../services/auth";

type DashboardProps = {
  perfil: "CLIENTE" | "PRESTADOR";
};

const roleContent = {
  CLIENTE: {
    eyebrow: "Solicitacoes",
    title: "Gerencie seus pedidos de servico",
    subtitle: "Acompanhe o que ainda aguarda aceite, o que ja esta em andamento e o historico concluido.",
    menu: [
      { icon: ClipboardList, label: "Solicitacoes" },
      { icon: BriefcaseBusiness, label: "Aguardando aceite" },
      { icon: Settings, label: "Em andamento" },
      { icon: UserRound, label: "Concluidos" },
    ],
  },
  PRESTADOR: {
    eyebrow: "Solicitacoes",
    title: "Encontre oportunidades e aceite novos servicos",
    subtitle: "Use os filtros para localizar pedidos relevantes e atribua a solicitacao para voce assim que decidir atender.",
    menu: [
      { icon: ClipboardList, label: "Solicitacoes" },
      { icon: BriefcaseBusiness, label: "Proximas de mim" },
      { icon: Settings, label: "Maior valor" },
      { icon: UserRound, label: "Historico" },
    ],
  },
};

export function Dashboard({ perfil }: DashboardProps) {
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
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!session?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        const data = (await response.json()) as CurrentUserResponse | { detail?: string };

        if (!response.ok) {
          throw new Error("detail" in data ? data.detail || "Sua sessao expirou." : "Sua sessao expirou.");
        }

        setUser(data as CurrentUserResponse);
      } catch (error) {
        clearAuthSession();
        setFeedback(error instanceof Error ? error.message : "Sua sessao expirou.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCurrentUser();
  }, [session?.token]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.tipoUsuario !== perfil) {
    return <Navigate to={user.tipoUsuario === "CLIENTE" ? "/painel/cliente" : "/painel/prestador"} replace />;
  }

  const content = roleContent[perfil];

  function handleLogout() {
    clearAuthSession();
    navigate("/login");
  }

  return (
    <>
      <Header onLogout={handleLogout} />
      <div className="workspace-page">
        <div className="workspace-shell">
          <aside className="workspace-sidebar">
            <span className="workspace-sidebar-label">Solicitacoes</span>
            <nav className="workspace-nav">
              {content.menu.map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`workspace-nav-item ${index === 0 ? "active" : ""}`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="workspace-sidebar-footer">
              <button type="button" className="workspace-secondary-button" onClick={() => navigate("/")}>
                Voltar ao inicio
              </button>
              <button type="button" className="workspace-primary-button" onClick={handleLogout}>
                <LogOut size={15} />
                Sair
              </button>
            </div>
          </aside>

          <main className="workspace-main">
            <header className="workspace-hero">
              <div>
                <span className="workspace-hero-label">{content.eyebrow}</span>
                <h1>{isLoading ? "Carregando..." : `Ola, ${user?.nome ?? session.nome}!`}</h1>
                <p>{content.subtitle}</p>
              </div>
            </header>

            {feedback && (
              <div className="workspace-feedback">
                <p>{feedback}</p>
              </div>
            )}

            {perfil === "CLIENTE" ? (
              <ClientServices userId={user?.id ?? session.id} />
            ) : (
              <ProviderServices />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
