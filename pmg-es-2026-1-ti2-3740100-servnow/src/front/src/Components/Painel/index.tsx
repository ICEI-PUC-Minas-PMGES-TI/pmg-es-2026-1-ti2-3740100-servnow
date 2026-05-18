import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  Calendar,
  FileText,
  HandCoins,
  History as HistoryIcon,
  LayoutDashboard,
  Pencil,
  PlusCircle,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Header } from "../Header/Header";
import { clearAuthSession, getAuthSession } from "../../services/auth";

import { Inicio } from "../../pages/Painel/Cliente/Inicio";
import { CriarSolicitacao } from "../../pages/Painel/Cliente/CriarSolicitacao";
import { Solicitacoes } from "../../pages/Painel/Cliente/Solicitacoes";
import { Propostas } from "../../pages/Painel/Cliente/Propostas";
import { Agendamentos } from "../../pages/Painel/Cliente/Agendamentos";
import { Acompanhamento } from "../../pages/Painel/Cliente/Acompanhamento";
import { Historico } from "../../pages/Painel/Cliente/Historico";
import { Conta } from "../../pages/Painel/Cliente/Conta";
import { PerfilCliente } from "../../pages/Painel/Cliente/Perfil";

import "./PainelCliente.css";

type Secao =
  | "inicio"
  | "criar"
  | "solicitacoes"
  | "propostas"
  | "agendamentos"
  | "acompanhamento"
  | "historico"
  | "perfil"
  | "conta";

type ItemMenu = {
  id: Secao;
  label: string;
  icone: LucideIcon;
};

const ITENS_MENU: ItemMenu[] = [
  { id: "inicio", label: "Inicio", icone: LayoutDashboard },
  { id: "criar", label: "Criar solicitacao", icone: PlusCircle },
  { id: "solicitacoes", label: "Solicitacoes", icone: FileText },
  { id: "propostas", label: "Propostas", icone: HandCoins },
  { id: "agendamentos", label: "Agendamentos", icone: Calendar },
  { id: "acompanhamento", label: "Acompanhamento", icone: Activity },
  { id: "historico", label: "Historico", icone: HistoryIcon },
  { id: "perfil", label: "Perfil", icone: User },
];

function isSecao(value: string | null): value is Secao {
  return ITENS_MENU.some((item) => item.id === value);
}

export function PainelCliente() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getAuthSession();
  const [secaoAtiva, setSecaoAtiva] = useState<Secao>(() => {
    const secao = searchParams.get("secao");
    return isSecao(secao) ? secao : "inicio";
  });

  function handleLogout() {
    clearAuthSession();
    navigate("/login");
  }

  useEffect(() => {
    const secao = searchParams.get("secao");
    if (isSecao(secao)) {
      setSecaoAtiva(secao);
    }
  }, [searchParams]);

  function handleSelecionarSecao(secao: Secao) {
    setSecaoAtiva(secao);
    setSearchParams(secao === "inicio" ? {} : { secao });
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Header onLogout={handleLogout} />

      <div className="painel-cliente">
        <aside className="painel-sidebar">
          <span className="painel-sidebar-titulo">Menu</span>
          <nav className="painel-nav">
            {ITENS_MENU.map((item) => {
              const Icone = item.icone;
              const ativo = secaoAtiva === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`painel-nav-item ${ativo ? "ativo" : ""}`}
                  onClick={() => handleSelecionarSecao(item.id)}
                >
                  <Icone size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              className="painel-nav-item"
              onClick={() => navigate("/perfil")}
            >
              <Pencil size={18} />
              <span>Editar conta</span>
            </button>
          </nav>
        </aside>

        <main className="painel-content">
          {secaoAtiva === "inicio" && (
            <Inicio
              onIrParaSolicitacoes={() => handleSelecionarSecao("solicitacoes")}
              onIrParaCriar={() => handleSelecionarSecao("criar")}
            />
          )}
          {secaoAtiva === "criar" && <CriarSolicitacao />}
          {secaoAtiva === "solicitacoes" && <Solicitacoes />}
          {secaoAtiva === "propostas" && <Propostas />}
          {secaoAtiva === "agendamentos" && <Agendamentos />}
          {secaoAtiva === "acompanhamento" && <Acompanhamento />}
          {secaoAtiva === "historico" && <Historico />}
          {secaoAtiva === "perfil" && <PerfilCliente />}
          {secaoAtiva === "conta" && <Conta />}
        </main>
      </div>
    </>
  );
}

export default PainelCliente;
