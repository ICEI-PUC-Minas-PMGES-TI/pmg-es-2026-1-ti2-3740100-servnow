import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logo2.png";

interface HeaderProps {
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  userName?: string;
}

export function Header({
  isLoggedIn = false,
  onLogin,
  onLogout,
  userName,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-inner">

        {/* LOGO */}
        <Link to="/" className="header-logo">
          <img src={logo} alt="Servnow" className="logo-img" />
          <span className="logo-text">Servnow</span>
        </Link>

        {/* NAV */}
        <nav className="header-nav">
          <a href="#" className="nav-link">Início</a>
          <a href="#" className="nav-link">Serviços</a>
          <a href="#" className="nav-link">Sobre</a>
        </nav>

        {/* AÇÕES */}
        <div className="header-actions">
          {isLoggedIn ? (
            <>
              {userName && (
                <span className="header-username">Olá, {userName}</span>
              )}
              <button className="btn-logout" onClick={onLogout}>
                Logout
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

        {/* HAMBURGUER */}
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

      {/* MENU MOBILE */}
      {menuOpen && (
        <div className="header-mobile-menu">
          <a href="#" className="nav-link">Início</a>
          <a href="#" className="nav-link">Serviços</a>
          <a href="#" className="nav-link">Sobre</a>
          <div className="mobile-auth">
            {isLoggedIn ? (
              <button className="btn-logout" onClick={onLogout}>Logout</button>
            ) : (
              <button className="btn-login" onClick={onLogin}></button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}