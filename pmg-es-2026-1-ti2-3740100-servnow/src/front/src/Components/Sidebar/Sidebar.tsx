import {
    CheckCircle,
    Clock,
    Edit,
    Eye, FileText,
    LogOut,
    Menu,
    Settings,
    User,
    Wallet,
    X
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../services/auth";
import "./Sidebar.css";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ size: number }>;
  href?: string;
  id?: string;
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const panelMenuItems: MenuItem[] = [
    { label: "Visão geral", icon: Eye, id: "visao-geral" },
    { label: "Solicitações", icon: FileText, id: "solicitacoes" },
    { label: "Em andamento", icon: Clock, id: "em-andamento" },
    { label: "Concluídos", icon: CheckCircle, id: "concluidos" },
  ];

  const accountMenuItems: MenuItem[] = [
    { label: "Meu perfil", icon: User, id: "meu-perfil" },
    { label: "Editar perfil", icon: Edit, id: "editar-perfil" },
    { label: "Ganhos", icon: Wallet, id: "ganhos" },
    { label: "Configurações", icon: Settings, id: "configuracoes" },
  ];

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const handleMenuClick = (id?: string) => {
    setIsOpen(false);
    // Aqui você pode adicionar navegação específica
    if (id === "meu-perfil") {
      navigate("/perfil");
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Painel</h2>
        </div>

        {/* Painel Section */}
        <nav className="sidebar-section">
          <div className="section-title">PAINEL</div>
          <ul className="menu-list">
            {panelMenuItems.map((item) => (
              <li key={item.id} className="menu-item">
                <button
                  className="menu-link"
                  onClick={() => handleMenuClick(item.id)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Conta Section */}
        <nav className="sidebar-section">
          <div className="section-title">CONTA</div>
          <ul className="menu-list">
            {accountMenuItems.map((item) => (
              <li key={item.id} className="menu-item">
                <button
                  className="menu-link"
                  onClick={() => handleMenuClick(item.id)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
