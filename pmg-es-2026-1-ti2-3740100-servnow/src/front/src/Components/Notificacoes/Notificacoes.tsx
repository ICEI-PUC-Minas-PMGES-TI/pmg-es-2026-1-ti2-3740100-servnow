import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import "./Notificacoes.css";

import {
  API_URL,
  getAuthSession,
  type NotificacaoResponse,
  type NotificacaoResumoResponse,
} from "../../services/auth";

export function Notificacoes() {
  const session = getAuthSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificacaoResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadNotifications() {
      if (!session?.token) {
        return;
      }

      try {
        const [summaryResponse, listResponse] = await Promise.all([
          fetch(`${API_URL}/api/notificacoes/resumo`, {
            headers: { Authorization: `Bearer ${session.token}` },
          }),
          fetch(`${API_URL}/api/notificacoes`, {
            headers: { Authorization: `Bearer ${session.token}` },
          }),
        ]);

        if (summaryResponse.ok) {
          const summary = (await summaryResponse.json()) as NotificacaoResumoResponse;
          setUnreadCount(summary.quantidadeNaoLidas);
        }

        if (listResponse.ok) {
          const list = (await listResponse.json()) as NotificacaoResponse[];
          setNotifications(list);
        }
      } catch {
        setNotifications([]);
      }
    }

    void loadNotifications();
  }, [session?.token]);

  async function markAsRead(notificationId: number) {
    if (!session?.token) {
      return;
    }

    await fetch(`${API_URL}/api/notificacoes/${notificationId}/lida`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${session.token}` },
    });

    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, lida: true } : item)),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  }

  if (!session?.token) {
    return null;
  }

  return (
    <div className="notification-bell">
      <button
        type="button"
        className="notification-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Notificacoes"
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <strong>Notificacoes</strong>
            <span>{unreadCount} nao lidas</span>
          </div>

          <div className="notification-list">
            {notifications.length === 0 && (
              <p className="notification-empty">Nenhuma notificacao no momento.</p>
            )}

            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`notification-item ${notification.lida ? "read" : "unread"}`}
                onClick={() => {
                  setIsOpen(false);
                  if (!notification.lida) {
                    void markAsRead(notification.id);
                  }
                }}
              >
                <div className="notification-item-top">
                  <strong>{notification.titulo}</strong>
                  {!notification.lida && <span className="notification-dot" />}
                </div>
                <p>{notification.mensagem}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
