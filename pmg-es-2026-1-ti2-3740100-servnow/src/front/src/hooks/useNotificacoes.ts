import { useCallback, useEffect, useState } from "react";

import { getAuthSession } from "../services/auth";
import {
  NOTIFICACOES_ATUALIZAR_EVENTO,
  listarNotificacoes,
  resumoNotificacoes,
  type NotificacaoResponse,
} from "../services/notificacoes";

const INTERVALO_MS = 30_000;

export function useNotificacoes() {
  const session = getAuthSession();
  const [notificacoes, setNotificacoes] = useState<NotificacaoResponse[]>([]);
  const [totalNaoLidas, setTotalNaoLidas] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const atualizar = useCallback(async () => {
    if (!session?.token) {
      setNotificacoes([]);
      setTotalNaoLidas(0);
      return;
    }

    setIsLoading(true);
    try {
      const [lista, resumo] = await Promise.all([listarNotificacoes(), resumoNotificacoes()]);
      setNotificacoes(lista);
      setTotalNaoLidas(resumo.totalNaoLidas);
    } catch {
      setNotificacoes([]);
      setTotalNaoLidas(0);
    } finally {
      setIsLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    void atualizar();
  }, [atualizar]);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    const intervalo = window.setInterval(() => {
      void atualizar();
    }, INTERVALO_MS);

    const onAtualizar = () => {
      void atualizar();
    };

    window.addEventListener(NOTIFICACOES_ATUALIZAR_EVENTO, onAtualizar);
    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener(NOTIFICACOES_ATUALIZAR_EVENTO, onAtualizar);
    };
  }, [atualizar, session?.token]);

  return {
    notificacoes,
    totalNaoLidas,
    isLoading,
    atualizar,
  };
}
