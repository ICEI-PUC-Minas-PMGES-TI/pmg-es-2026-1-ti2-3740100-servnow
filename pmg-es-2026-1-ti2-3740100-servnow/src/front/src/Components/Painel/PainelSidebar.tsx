import { Pencil } from "lucide-react";
import type { ReactNode } from "react";

type PainelSidebarProps = {
  nomeUsuario: string;
  papelLabel: string;
  children: ReactNode;
  onEditarConta: () => void;
};

function obterInicial(nome: string) {
  const texto = nome.trim();
  if (!texto) {
    return "U";
  }
  return texto.charAt(0).toUpperCase();
}

export function PainelSidebar({
  nomeUsuario,
  papelLabel,
  children,
  onEditarConta,
}: PainelSidebarProps) {
  const nomeExibicao = nomeUsuario.trim() || "Usuário";

  return (
    <aside className="painel-sidebar">
      <div className="painel-sidebar-welcome">
        <div className="painel-sidebar-avatar" aria-hidden="true">
          {obterInicial(nomeExibicao)}
        </div>
        <div className="painel-sidebar-welcome-text">
          <span>Bem-vindo</span>
          <strong title={nomeExibicao}>{nomeExibicao}</strong>
          <small>{papelLabel}</small>
        </div>
      </div>

      <div className="painel-sidebar-corpo">
        <span className="painel-sidebar-titulo">Menu</span>
        <nav className="painel-nav">
          {children}
          <button
            type="button"
            className="painel-nav-item painel-nav-item-editar"
            onClick={onEditarConta}
          >
            <Pencil size={18} />
            <span>Editar conta</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}

export default PainelSidebar;

