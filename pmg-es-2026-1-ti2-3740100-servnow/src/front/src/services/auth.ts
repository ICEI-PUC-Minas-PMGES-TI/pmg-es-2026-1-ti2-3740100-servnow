export type TipoUsuario = "CLIENTE" | "PRESTADOR";

export type AuthResponse = {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  token: string;
  mensagem: string;
  fotoPerfilUrl?: string | null;
  fotoPerfilAjusteX?: number | null;
  fotoPerfilAjusteY?: number | null;
  fotoPerfilEnquadramento?: "cover" | "contain" | null;
};

export type CurrentUserResponse = {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  rua: string | null;
  numero: string | null;
  cep: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  fotoPerfilUrl: string | null;
  fotoPerfilAjusteX: number | null;
  fotoPerfilAjusteY: number | null;
  fotoPerfilEnquadramento: "cover" | "contain" | null;
  fotoLocalUrl: string | null;
  descricaoProfissional: string | null;
  especialidades: string | null;
  diasDisponiveis: string | null;
  horarioInicio: string | null;
  horarioFim: string | null;
  raioAtendimentoKm: number | null;
  documentoIdentidadeUrl: string | null;
};

export type PerfilResponse = {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  rua: string | null;
  numero: string | null;
  cep: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  fotoPerfilUrl: string | null;
  fotoPerfilAjusteX: number | null;
  fotoPerfilAjusteY: number | null;
  fotoPerfilEnquadramento: "cover" | "contain" | null;
  fotoLocalUrl: string | null;
  descricaoProfissional: string | null;
  especialidades: string | null;
  diasDisponiveis: string | null;
  horarioInicio: string | null;
  horarioFim: string | null;
  raioAtendimentoKm: number | null;
  documentoIdentidadeUrl: string | null;
  chavePix?: string | null;
  avaliacaoMedia: number | null;
  totalAvaliacoes: number;
  latitude?: number | null;
  longitude?: number | null;
  enderecos?: ClienteEnderecoResponse[];
  chavesPix?: ClienteChavePixResponse[];
};

export type ClienteEnderecoResponse = {
  id: number;
  rotulo: string | null;
  rua: string;
  numero: string;
  cep: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  fotoUrl: string | null;
  principal: boolean;
};

export type ClienteChavePixResponse = {
  id: number;
  rotulo: string | null;
  chave: string;
  tipo: string;
  principal: boolean;
};

export type ClienteEnderecoRequest = {
  id?: number;
  rotulo?: string;
  rua: string;
  numero: string;
  cep: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  principal: boolean;
  removerFoto?: boolean;
};

export type ClienteChavePixRequest = {
  id?: number;
  rotulo?: string;
  chave: string;
  tipo: string;
  principal: boolean;
};

export type ClienteCadastroSyncRequest = {
  enderecos: ClienteEnderecoRequest[];
  chavesPix: ClienteChavePixRequest[];
};

export type PerfilUpdateRequest = {
  nome?: string;
  rua?: string;
  numero?: string;
  cep?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  fotoPerfilAjusteX?: number;
  fotoPerfilAjusteY?: number;
  fotoPerfilEnquadramento?: "cover" | "contain";
  removerFotoPerfil?: boolean;
  removerFotoLocal?: boolean;
  removerDocumentoIdentidade?: boolean;
  descricaoProfissional?: string;
  especialidades?: string;
  diasDisponiveis?: string;
  horarioInicio?: string;
  horarioFim?: string;
  raioAtendimentoKm?: number;
  chavePix?: string | null;
};

export type SolicitacaoServicoResponse = {
  id: number;
  clienteId: number;
  clienteNome: string;
  prestadorId: number | null;
  prestadorNome: string | null;
  endereco: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  tipoServico: string;
  iconeServico: string | null;
  faixaPreco: string;
  descricao: string;
  data: string | null;
  horario: string | null;

  imagemUrl: string | null;
  status: string;
  criadoEm: string;
  aceitoEm: string | null;
  latitude: number | null;
  longitude: number | null;
  distanciaKm: number | null;
  distanciaLinhaReta?: boolean | null;
  valorAceito: number | null;
  concluidoEm: string | null;
};

export type SolicitacaoServicoCreateRequest = {
  tipoServico: string;
  iconeServico?: string;
  faixaPreco: string;
  descricao: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  data?: string;
  horario?: string;
};

export type PropostaCreateRequest = {
  solicitacaoId: number;
  valor: number;
  mensagem: string;
};

export type PropostaServicoResponse = {
  id: number;
  solicitacaoId: number;
  solicitacaoTipoServico: string;
  solicitacaoEndereco: string;
  solicitacaoData: string | null;
  solicitacaoHorario: string | null;
  clienteId: number;
  clienteNome: string;
  prestadorId: number;
  prestadorNome: string;
  valor: number;
  mensagem: string;
  status: "PENDENTE" | "ACEITA" | "RECUSADA" | "CANCELADA";
  criadoEm: string;
  respondidoEm: string | null;
  prestadorAvaliacaoMedia: number | null;
};

export type PerfilPublicoResponse = {
  id: number;
  nome: string;
  tipoUsuario: TipoUsuario;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  fotoPerfilUrl: string | null;
  descricao: string | null;
  especialidades: string | null;
  diasDisponiveis: string | null;
  horarioInicio: string | null;
  horarioFim: string | null;
  raioAtendimentoKm: number | null;
  avaliacaoMedia: number | null;
  totalAvaliacoes: number;
  comentarioDestaque: string | null;
  criadoEm: string | null;
};

export async function buscarPerfilPublico(
  usuarioId: number,
  token: string,
): Promise<PerfilPublicoResponse | null> {
  try {
    const response = await fetch(`${API_URL}/api/perfil/publico/${usuarioId}`, {
      headers: authHeader(token),
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as PerfilPublicoResponse;
  } catch {
    return null;
  }
}

const AUTH_STORAGE_KEY = "servnow.auth";
export const API_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8080";

export function saveAuthSession(session: AuthResponse) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthResponse | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function updateAuthSessionName(novoNome: string) {
  const session = getAuthSession();
  if (session) {
    session.nome = novoNome;
    saveAuthSession(session);
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getDashboardRoute(tipoUsuario: TipoUsuario) {
  return tipoUsuario === "CLIENTE" ? "/painel/cliente" : "/painel/prestador";
}

export function authHeader(token: string) {
  const bearer = `Bearer ${token.trim()}`;
  return { Authorization: bearer, "X-Authorization": bearer };
}

export function authHeaders(token: string, contentType?: string) {
  const bearer = `Bearer ${token.trim()}`;
  const headers = new Headers();

  headers.set("Authorization", bearer);
  headers.set("X-Authorization", bearer);

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  return headers;
}

export function tokenExpirado(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { exp?: number };
    if (!payload.exp) {
      return false;
    }

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function getValidAuthSession() {
  const session = getAuthSession();
  const token = session?.token?.trim();

  if (!session || !token || tokenExpirado(token)) {
    clearAuthSession();
    return null;
  }

  return { ...session, token };
}

export async function getResponseError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return data.detail || data.message || fallback;
  } catch {
    return fallback;
  }
}

export function formatarDataIso(valor: string | null | undefined) {
  if (!valor) {
    return "Data não informada";
  }
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    return "Data não informada";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}
