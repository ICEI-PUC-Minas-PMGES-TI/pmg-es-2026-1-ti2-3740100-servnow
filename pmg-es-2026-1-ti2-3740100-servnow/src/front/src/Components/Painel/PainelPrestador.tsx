import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  CheckCircle,
  FileText,
  LayoutDashboard,
  Pencil,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Header } from "../Header/Header";
import { clearAuthSession, getAuthSession } from "../../services/auth";

import { Acompanhamento } from "../../pages/Painel/Prestador/Acompanhamento";

import "./PainelCliente.css";

type Secao = "inicio" | "solicitacoes" | "acompanhamento" | "concluidos" | "perfil";

type ItemMenu = {
  id: Secao;
  label: string;
  icone: LucideIcon;
};

const ITENS_MENU: ItemMenu[] = [
  { id: "inicio", label: "Visao geral", icone: LayoutDashboard },
  { id: "solicitacoes", label: "Solicitacoes", icone: FileText },
  { id: "acompanhamento", label: "Em andamento", icone: Activity },
  { id: "concluidos", label: "Concluidos", icone: CheckCircle },
  { id: "perfil", label: "Perfil", icone: User },
];

function isSecao(value: string | null): value is Secao {
  return ITENS_MENU.some((item) => item.id === value);
}

function EmConstrucao({ titulo }: { titulo: string }) {
  return (
    <>
      <header className="painel-secao-cabecalho">
        <span className="eyebrow">Painel do prestador</span>
        <h1>{titulo}</h1>
        <p>Esta secao ainda esta em construcao.</p>
      </header>
      <section className="painel-card">
        <div className="painel-vazio">
          <p>Em breve voce vera essa secao funcionando por aqui.</p>
        </div>
      </section>
    </>
  );
}

export function PainelPrestador() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getAuthSession();
  const [secaoAtiva, setSecaoAtiva] = useState<Secao>(() => {
    const secao = searchParams.get("secao");
    return isSecao(secao) ? secao : "acompanhamento";
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
    setSearchParams(secao === "acompanhamento" ? {} : { secao });
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Header onLogout={handleLogout} />

      <div className="painel-cliente">
        <aside className="painel-sidebar">
          <span className="painel-sidebar-titulo">Painel</span>
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
          {secaoAtiva === "inicio" && <EmConstrucao titulo="Visao geral" />}
          {secaoAtiva === "solicitacoes" && <EmConstrucao titulo="Solicitacoes" />}
          {secaoAtiva === "acompanhamento" && <Acompanhamento />}
          {secaoAtiva === "concluidos" && <EmConstrucao titulo="Servicos concluidos" />}
          {secaoAtiva === "perfil" && <EmConstrucao titulo="Meu perfil" />}
        </main>
      </div>
    </>
  );
}

export default PainelPrestador;
