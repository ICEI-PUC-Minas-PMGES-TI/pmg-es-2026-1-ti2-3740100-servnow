import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  FileText,
  HandCoins,
  History as HistoryIcon,
  LayoutDashboard,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Header } from "../../Header/Header";
import { PainelSidebar } from "../PainelSidebar";
import { clearAuthSession, getAuthSession } from "../../../services/auth";

import { Inicio } from "../../../pages/Painel/Prestador/Inicio";
import { Solicitacoes } from "../../../pages/Painel/Prestador/Solicitacoes";
import { Propostas } from "../../../pages/Painel/Prestador/Propostas";
import { Agendamentos } from "../../../pages/Painel/Prestador/Agendamentos";
import { Metricas } from "../../../pages/Painel/Prestador/Metricas";
import { Historico } from "../../../pages/Painel/Prestador/Historico";
import { PerfilPrestador } from "../../../pages/Painel/Prestador/Perfil";

import "../PainelCliente.css";

type Secao =
  | "inicio"
  | "solicitacoes"
  | "propostas"
  | "agendamentos"
  | "metricas"
  | "historico"
  | "perfil";

type ItemMenu = {
  id: Secao;
  label: string;
  icone: LucideIcon;
};

const ITENS_MENU: ItemMenu[] = [
  { id: "inicio", label: "Início", icone: LayoutDashboard },
  { id: "solicitacoes", label: "Solicitações", icone: FileText },
  { id: "propostas", label: "Propostas", icone: HandCoins },
  { id: "agendamentos", label: "Agendamentos", icone: Calendar },
  { id: "metricas", label: "Métricas", icone: BarChart3 },
  { id: "historico", label: "Histórico", icone: HistoryIcon },
  { id: "perfil", label: "Perfil", icone: User },
];

function isSecao(value: string | null): value is Secao {
  if (value === "ganhos") {
    return true;
  }
  return ITENS_MENU.some((item) => item.id === value);
}

function normalizarSecao(value: string | null): Secao {
  if (value === "ganhos") {
    return "metricas";
  }
  return isSecao(value) ? value : "inicio";
}

export function PainelPrestador() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getAuthSession();
  const [secaoAtiva, setSecaoAtiva] = useState<Secao>(() => {
    return normalizarSecao(searchParams.get("secao"));
  });

  function handleLogout() {
    clearAuthSession();
    navigate("/login");
  }

  useEffect(() => {
    setSecaoAtiva(normalizarSecao(searchParams.get("secao")));
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

      <div className="painel-cliente painel-prestador">
        <PainelSidebar
          nomeUsuario={session.nome}
          papelLabel="Prestador"
          onEditarConta={() => navigate("/perfil")}
        >
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
        </PainelSidebar>

        <main className="painel-content">
          {secaoAtiva === "inicio" && (
            <Inicio
              onIrParaSolicitacoes={() => handleSelecionarSecao("solicitacoes")}
              onIrParaPropostas={() => handleSelecionarSecao("propostas")}
              onIrParaMetricas={() => handleSelecionarSecao("metricas")}
            />
          )}
          {secaoAtiva === "solicitacoes" && <Solicitacoes />}
          {secaoAtiva === "propostas" && <Propostas />}
          {secaoAtiva === "agendamentos" && <Agendamentos />}
          {secaoAtiva === "metricas" && <Metricas />}
          {secaoAtiva === "historico" && <Historico />}
          {secaoAtiva === "perfil" && <PerfilPrestador />}
        </main>
      </div>
    </>
  );
}

export default PainelPrestador;

