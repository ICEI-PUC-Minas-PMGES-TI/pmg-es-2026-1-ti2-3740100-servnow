import { API_URL, authHeader, authHeaders, getResponseError, getValidAuthSession } from "./auth";

export type TipoNotificacao =
  | "NOVA_PROPOSTA"
  | "PROPOSTA_RECUSADA"
  | "PROPOSTA_CANCELADA"
  | "SERVICO_AGENDADO";

export type NotificacaoResponse = {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  propostaId: number | null;
  solicitacaoId: number | null;
  lida: boolean;
  criadoEm: string;
};

export type NotificacaoResumoResponse = {
  totalNaoLidas: number;
};

export const NOTIFICACOES_ATUALIZAR_EVENTO = "servnow:notificacoes-atualizar";

export function dispararAtualizacaoNotificacoes() {
  window.dispatchEvent(new Event(NOTIFICACOES_ATUALIZAR_EVENTO));
}

export async function listarNotificacoes(): Promise<NotificacaoResponse[]> {
  const session = getValidAuthSession();
  if (!session?.token) {
    return [];
  }

  const response = await fetch(`${API_URL}/api/notificacoes`, {
    headers: authHeader(session.token),
  });

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Nao foi possivel carregar as notificacoes."));
  }

  return (await response.json()) as NotificacaoResponse[];
}

export async function resumoNotificacoes(): Promise<NotificacaoResumoResponse> {
  const session = getValidAuthSession();
  if (!session?.token) {
    return { totalNaoLidas: 0 };
  }

  const response = await fetch(`${API_URL}/api/notificacoes/resumo`, {
    headers: authHeader(session.token),
  });

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Nao foi possivel carregar o resumo de notificacoes."));
  }

  return (await response.json()) as NotificacaoResumoResponse;
}

export async function marcarNotificacaoComoLida(notificacaoId: number): Promise<void> {
  const session = getValidAuthSession();
  if (!session?.token) {
    return;
  }

  const response = await fetch(`${API_URL}/api/notificacoes/${notificacaoId}/lida`, {
    method: "PATCH",
    headers: authHeaders(session.token),
  });

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Nao foi possivel marcar a notificacao como lida."));
  }
}

export async function marcarTodasNotificacoesComoLidas(): Promise<void> {
  const session = getValidAuthSession();
  if (!session?.token) {
    return;
  }

  const response = await fetch(`${API_URL}/api/notificacoes/lidas`, {
    method: "PATCH",
    headers: authHeaders(session.token),
  });

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Nao foi possivel marcar as notificacoes como lidas."));
  }
}

export function rotaNotificacao(
  tipo: TipoNotificacao,
  tipoUsuario: "CLIENTE" | "PRESTADOR",
): string {
  if (tipo === "NOVA_PROPOSTA") {
    return "/painel/cliente?secao=propostas";
  }
  if (tipo === "PROPOSTA_RECUSADA" || tipo === "PROPOSTA_CANCELADA") {
    return "/painel/prestador?secao=propostas";
  }
  return tipoUsuario === "CLIENTE"
    ? "/painel/cliente?secao=agendamentos"
    : "/painel/prestador?secao=agendamentos";
}
