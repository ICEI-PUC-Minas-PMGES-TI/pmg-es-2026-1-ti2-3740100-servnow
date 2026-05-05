import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, UserCircle } from "lucide-react";
import "./Header.css";
import logo from "../../assets/logo2.png";
import { Notificacoes } from "../Notificacoes/Notificacoes";
import { getAuthSession, getDashboardRoute } from "../../services/auth";
import { applyTheme, getNextTheme, getStoredTheme } from "../../services/theme";

interface HeaderProps {
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function Header({
  isLoggedIn = false,
  onLogin,
  onLogout,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getStoredTheme);
  const navigate = useNavigate();
  const session = getAuthSession();
  const loggedIn = isLoggedIn || Boolean(session);
  const dashboardRoute = session ? getDashboardRoute(session.tipoUsuario) : "/login";

  function handleToggleTheme() {
    const nextTheme = getNextTheme(theme);
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <img src={logo} alt="Servnow" className="logo-img" />
          <span className="logo-text">Servnow</span>
        </Link>

        <nav className="header-nav">
          <Link to="/" className="nav-link">Inicio</Link>
          {loggedIn && (
            <>
              <Link to={dashboardRoute} className="nav-link">Painel</Link>
              <a href="#" className="nav-link">Acompanhamento</a>
            </>
          )}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={handleToggleTheme}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {loggedIn ? (
            <>
              <button
                type="button"
                className="header-profile-icon"
                aria-label="Configurar perfil"
                title="Configurar perfil"
                onClick={() => navigate("/perfil")}
              >
                <UserCircle size={24} />
              </button>
              <Notificacoes />
              <button type="button" className="btn-logout" onClick={onLogout}>
                Sair
              </button>
            </>
          ) : (
            <button
              className="btn-login"
              onClick={() => {
                onLogin?.();
                navigate("/login");
              }}
            >
              Login
            </button>
          )}
        </div>

        <button
          className="header-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <div className="header-mobile-menu">
          <Link to="/" className="nav-link">Inicio</Link>
          {loggedIn && (
            <>
              <Link to={dashboardRoute} className="nav-link">Painel</Link>
              <a href="#" className="nav-link">Acompanhamento</a>
            </>
          )}
          <div className="mobile-auth">
            <button
              type="button"
              className="theme-toggle"
              onClick={handleToggleTheme}
              aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {loggedIn ? (
              <>
                <button
                  type="button"
                  className="mobile-user-info"
                  aria-label="Configurar perfil"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/perfil");
                  }}
                >
                  <UserCircle size={22} />
                </button>
                <Notificacoes />
                <button type="button" className="btn-logout" onClick={onLogout}>Sair</button>
              </>
            ) : (
              <button
                className="btn-login"
                onClick={() => {
                  onLogin?.();
                  navigate("/login");
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
