import { API_URL, authHeader, getValidAuthSession } from "./auth";

export type AcompanhamentoDisponivel = {
  solicitacaoId: number;
  tipoServico: string;
  contraparteNome: string | null;
  data: string | null;
  horario: string | null;
  valorAceito: number | null;
  etapa: string | null;
};

export type AtualizacaoServico = {
  id: number;
  descricao: string;
  fotoUrl: string | null;
  criadoEm: string;
};

export type AcompanhamentoDetalhe = {
  solicitacaoId: number;
  tipoServico: string;
  descricao: string;
  endereco: string;
  data: string | null;
  horario: string | null;
  clienteId: number;
  clienteNome: string;
  prestadorId: number | null;
  prestadorNome: string | null;
  valorAceito: number | null;
  statusSolicitacao: string;
  ordemServicoId: number;
  etapa: string;
  codigoVerificacao: string | null;
  codigoExpiraEm: string | null;
  iniciadoEm: string | null;
  previstoTerminoEm: string | null;
  valorFinal: number | null;
  metodoPagamento: string | null;
  notaAvaliacao: number | null;
  comentarioAvaliacao: string | null;
  atualizacoes: AtualizacaoServico[];
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getValidAuthSession();
  if (!session?.token) {
    throw new Error("Sessao expirada.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...authHeader(session.token),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const texto = await response.text();
    let mensagem = "Nao foi possivel concluir a operacao.";
    try {
      const json = JSON.parse(texto) as { detail?: string; title?: string };
      mensagem = json.detail ?? json.title ?? mensagem;
    } catch {
      if (texto) {
        mensagem = texto;
      }
    }
    throw new Error(mensagem);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function listarDisponiveis() {
  return requestJson<AcompanhamentoDisponivel[]>("/api/acompanhamento/disponiveis");
}

export function obterDetalhe(solicitacaoId: number) {
  return requestJson<AcompanhamentoDetalhe>(`/api/acompanhamento/${solicitacaoId}`);
}

export function iniciarAcompanhamento(solicitacaoId: number) {
  return requestJson<AcompanhamentoDetalhe>(`/api/acompanhamento/${solicitacaoId}/iniciar`, {
    method: "POST",
  });
}

export function renovarCodigo(solicitacaoId: number) {
  return requestJson<AcompanhamentoDetalhe>(`/api/acompanhamento/${solicitacaoId}/renovar-codigo`, {
    method: "POST",
  });
}

export function confirmarChegada(solicitacaoId: number, codigo: string) {
  return requestJson<AcompanhamentoDetalhe>(`/api/acompanhamento/${solicitacaoId}/confirmar-chegada`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo }),
  });
}

export function registrarAtualizacao(solicitacaoId: number, descricao: string, foto?: File) {
  const session = getValidAuthSession();
  if (!session?.token) {
    throw new Error("Sessao expirada.");
  }

  const form = new FormData();
  form.append("descricao", descricao);
  if (foto) {
    form.append("foto", foto);
  }

  return fetch(`${API_URL}/api/acompanhamento/${solicitacaoId}/atualizacoes`, {
    method: "POST",
    headers: authHeader(session.token),
    body: form,
  }).then(async (response) => {
    if (!response.ok) {
      const texto = await response.text();
      throw new Error(texto || "Nao foi possivel enviar a atualizacao.");
    }
    return (await response.json()) as AcompanhamentoDetalhe;
  });
}

export function concluirExecucao(solicitacaoId: number) {
  return requestJson<AcompanhamentoDetalhe>(`/api/acompanhamento/${solicitacaoId}/concluir-execucao`, {
    method: "POST",
  });
}

export function confirmarPagamento(solicitacaoId: number, metodoPagamento: "PIX" | "CREDITO" | "DEBITO") {
  return requestJson<AcompanhamentoDetalhe>(`/api/acompanhamento/${solicitacaoId}/confirmar-pagamento`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metodoPagamento }),
  });
}

export function avaliarServico(solicitacaoId: number, nota: number, comentario?: string) {
  return requestJson<AcompanhamentoDetalhe>(`/api/acompanhamento/${solicitacaoId}/avaliar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nota, comentario: comentario ?? null }),
  });
}
