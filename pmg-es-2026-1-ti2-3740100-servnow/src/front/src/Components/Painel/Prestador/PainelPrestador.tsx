import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
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
import { Ganhos } from "../../../pages/Painel/Prestador/Ganhos";
import { Acompanhamento } from "../../../pages/Painel/Prestador/Acompanhamento";
import { Historico } from "../../../pages/Painel/Prestador/Historico";
import { PerfilPrestador } from "../../../pages/Painel/Prestador/Perfil";

import "../PainelCliente.css";

type Secao =
  | "inicio"
  | "solicitacoes"
  | "propostas"
  | "agendamentos"
  | "ganhos"
  | "acompanhamento"
  | "historico"
  | "perfil";

type ItemMenu = {
  id: Secao;
  label: string;
  icone: LucideIcon;
};

const ITENS_MENU: ItemMenu[] = [
  { id: "inicio", label: "Inicio", icone: LayoutDashboard },
  { id: "solicitacoes", label: "Solicitacoes", icone: FileText },
  { id: "propostas", label: "Propostas", icone: HandCoins },
  { id: "agendamentos", label: "Agendamentos", icone: Calendar },
  { id: "ganhos", label: "Ganhos", icone: BarChart3 },
  { id: "acompanhamento", label: "Acompanhamento", icone: Activity },
  { id: "historico", label: "Historico", icone: HistoryIcon },
  { id: "perfil", label: "Perfil", icone: User },
];

function isSecao(value: string | null): value is Secao {
  return ITENS_MENU.some((item) => item.id === value);
}

export function PainelPrestador() {
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
              onIrParaGanhos={() => handleSelecionarSecao("ganhos")}
            />
          )}
          {secaoAtiva === "solicitacoes" && <Solicitacoes />}
          {secaoAtiva === "propostas" && <Propostas />}
          {secaoAtiva === "agendamentos" && <Agendamentos />}
          {secaoAtiva === "ganhos" && <Ganhos />}
          {secaoAtiva === "acompanhamento" && <Acompanhamento />}
          {secaoAtiva === "historico" && <Historico />}
          {secaoAtiva === "perfil" && <PerfilPrestador />}
        </main>
      </div>
    </>
  );
}

export default PainelPrestador;

