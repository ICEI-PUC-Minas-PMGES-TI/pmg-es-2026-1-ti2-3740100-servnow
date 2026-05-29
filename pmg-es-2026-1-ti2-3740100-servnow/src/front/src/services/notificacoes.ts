import { API_URL, authHeader, authHeaders, getResponseError, getValidAuthSession } from "./auth";
import { createSupabaseClient, isSupabaseConfigured } from "../lib/supabase";
import { mapNotificacaoRow, type NotificacaoRow } from "../lib/supabaseMappers";

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

function supabaseErrorMessage(error: { message: string; code?: string; details?: string }) {
  return error.details || error.message || "Erro na API Supabase.";
}

export async function listarNotificacoes(): Promise<NotificacaoResponse[]> {
  const session = getValidAuthSession();
  if (!session?.token) {
    return [];
  }

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseClient(session.token);
    const { data, error } = await supabase
      .from("notificacoes")
      .select("id, tipo, titulo, mensagem, proposta_id, solicitacao_id, lida, criado_em")
      .order("criado_em", { ascending: false });

    if (error) {
      throw new Error(supabaseErrorMessage(error));
    }

    return (data as NotificacaoRow[]).map(mapNotificacaoRow);
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

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseClient(session.token);
    const { count, error } = await supabase
      .from("notificacoes")
      .select("id", { count: "exact", head: true })
      .eq("lida", false);

    if (error) {
      throw new Error(supabaseErrorMessage(error));
    }

    return { totalNaoLidas: count ?? 0 };
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

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseClient(session.token);
    const { error } = await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", notificacaoId);

    if (error) {
      throw new Error(supabaseErrorMessage(error));
    }
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

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseClient(session.token);
    const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("lida", false);

    if (error) {
      throw new Error(supabaseErrorMessage(error));
    }
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
