import { Moon, Sun, UserCircle } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo_ServNow.jpeg";
import { getAuthSession, getDashboardRoute } from "../../services/auth";
import { applyTheme, getNextTheme, getStoredTheme } from "../../services/theme";
import "./Header.css";

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
  const profileRoute = session?.tipoUsuario === "CLIENTE" ? "/painel/cliente?secao=perfil" : "/perfil";

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
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>Início</NavLink>
          {loggedIn && (
            <>
              <NavLink to={dashboardRoute} className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>Painel</NavLink>
              <NavLink to="/acompanhamento" className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>Acompanhamento</NavLink>
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
                aria-label="Meu perfil"
                title="Meu perfil"
                onClick={() => navigate(profileRoute)}
              >
                <UserCircle size={24} />
              </button>
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

        <div className="mobile-header-actions">
          {loggedIn && (
            <>
              <button
                type="button"
                className="header-profile-icon mobile-header-action"
                aria-label="Meu perfil"
                title="Meu perfil"
                onClick={() => navigate(profileRoute)}
              >
                <UserCircle size={21} />
              </button>
            </>
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
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>Início</NavLink>
          {loggedIn && (
            <>
              <NavLink to={dashboardRoute} className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>Painel</NavLink>
              <NavLink to="/acompanhamento" className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>Acompanhamento</NavLink>
              <button type="button" className="nav-link mobile-logout-link" onClick={onLogout}>
                Sair
              </button>
            </>
          )}
          {!loggedIn && (
            <button
              type="button"
              className="nav-link mobile-login-link"
              onClick={() => {
                onLogin?.();
                navigate("/login");
              }}
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
}
