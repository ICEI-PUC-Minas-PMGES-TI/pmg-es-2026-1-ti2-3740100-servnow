import { API_URL, authHeader, getValidAuthSession } from "./auth";

export type AvaliacaoRecebida = {
  ordemServicoId: number;
  autorNome: string;
  tipoServico: string;
  nota: number;
  comentario: string | null;
  avaliadoEm: string;
};

export type AvaliacoesRecebidasResponse = {
  avaliacaoMedia: number | null;
  totalAvaliacoes: number;
  comentarioDestaque: string | null;
  avaliacoes: AvaliacaoRecebida[];
};

export async function listarAvaliacoesRecebidas(): Promise<AvaliacoesRecebidasResponse> {
  const session = getValidAuthSession();
  if (!session?.token) {
    throw new Error("Sessao expirada.");
  }

  const response = await fetch(`${API_URL}/api/perfil/avaliacoes-recebidas`, {
    headers: authHeader(session.token),
  });

  if (!response.ok) {
    const texto = await response.text();
    throw new Error(texto || "Nao foi possivel carregar as avaliacoes.");
  }

  return (await response.json()) as AvaliacoesRecebidasResponse;
}
