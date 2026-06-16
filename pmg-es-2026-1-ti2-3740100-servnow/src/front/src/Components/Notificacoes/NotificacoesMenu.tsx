import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNotificacoes } from "../../hooks/useNotificacoes";
import { formatarDataIso, getAuthSession } from "../../services/auth";
import {
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
  rotaNotificacao,
  type NotificacaoResponse,
} from "../../services/notificacoes";
import "./NotificacoesMenu.css";

export function NotificacoesMenu() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const { notificacoes, totalNaoLidas, atualizar } = useNotificacoes();
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setAberto(false);
      }
    }

    if (aberto) {
      document.addEventListener("mousedown", handleClickFora);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickFora);
    };
  }, [aberto]);

  async function handleAbrir() {
    const proximo = !aberto;
    setAberto(proximo);
    if (proximo) {
      await atualizar();
    }
  }

  async function handleSelecionar(notificacao: NotificacaoResponse) {
    if (!notificacao.lida) {
      try {
        await marcarNotificacaoComoLida(notificacao.id);
      } catch {
        return;
      }
    }

    setAberto(false);
    await atualizar();

    if (session?.tipoUsuario) {
      navigate(rotaNotificacao(notificacao.tipo, session.tipoUsuario));
    }
  }

  async function handleMarcarTodas() {
    try {
      await marcarTodasNotificacoesComoLidas();
      await atualizar();
    } catch {
      return;
    }
  }

  if (!session) {
    return null;
  }

  const badge = totalNaoLidas > 99 ? "99+" : String(totalNaoLidas);

  return (
    <div className="notificacoes-menu" ref={containerRef}>
      <button
        type="button"
        className="header-notificacoes-icon"
        aria-label={`Notificações${totalNaoLidas > 0 ? `, ${totalNaoLidas} não lidas` : ""}`}
        title="Notificações"
        onClick={() => void handleAbrir()}
      >
        <Bell size={22} />
        {totalNaoLidas > 0 ? <span className="notificacoes-badge">{badge}</span> : null}
      </button>

      {aberto ? (
        <div className="notificacoes-painel" role="dialog" aria-label="Lista de notificações">
          <div className="notificacoes-painel-cabecalho">
            <h3>Notificações</h3>
            {totalNaoLidas > 0 ? (
              <button type="button" className="notificacoes-marcar-todas" onClick={() => void handleMarcarTodas()}>
                Marcar todas como lidas
              </button>
            ) : null}
          </div>

          {notificacoes.length === 0 ? (
            <p className="notificacoes-vazio">Nenhuma notificacao no momento.</p>
          ) : (
            <ul className="notificacoes-lista">
              {notificacoes.map((notificacao) => (
                <li key={notificacao.id}>
                  <button
                    type="button"
                    className={`notificacao-item ${notificacao.lida ? "lida" : "nao-lida"}`}
                    onClick={() => void handleSelecionar(notificacao)}
                  >
                    <strong>{notificacao.titulo}</strong>
                    <span>{notificacao.mensagem}</span>
                    <time>{formatarDataIso(notificacao.criadoEm)}</time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
