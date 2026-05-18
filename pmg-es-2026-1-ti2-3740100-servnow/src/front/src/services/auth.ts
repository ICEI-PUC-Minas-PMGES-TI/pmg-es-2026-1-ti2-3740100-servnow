export type TipoUsuario = "CLIENTE" | "PRESTADOR";

export type AuthResponse = {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  token: string;
  mensagem: string;
  fotoPerfilBase64?: string | null;
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
  fotoPerfilBase64: string | null;
  fotoPerfilAjusteX: number | null;
  fotoPerfilAjusteY: number | null;
  fotoPerfilEnquadramento: "cover" | "contain" | null;
  fotoBase64: string | null;
  descricaoProfissional: string | null;
  especialidades: string | null;
  diasDisponiveis: string | null;
  horarioInicio: string | null;
  horarioFim: string | null;
  raioAtendimentoKm: number | null;
  documentoIdentidadeBase64: string | null;
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
  fotoPerfilBase64: string | null;
  fotoPerfilAjusteX: number | null;
  fotoPerfilAjusteY: number | null;
  fotoPerfilEnquadramento: "cover" | "contain" | null;
  fotoBase64: string | null;
  descricaoProfissional: string | null;
  especialidades: string | null;
  diasDisponiveis: string | null;
  horarioInicio: string | null;
  horarioFim: string | null;
  raioAtendimentoKm: number | null;
  documentoIdentidadeBase64: string | null;
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
  fotoPerfilBase64?: string;
  fotoPerfilAjusteX?: number;
  fotoPerfilAjusteY?: number;
  fotoPerfilEnquadramento?: "cover" | "contain";
  fotoBase64?: string;
  descricaoProfissional?: string;
  especialidades?: string;
  diasDisponiveis?: string;
  horarioInicio?: string;
  horarioFim?: string;
  raioAtendimentoKm?: number;
  documentoIdentidadeBase64?: string;
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
  imagemBase64: string | null;
  status: string;
  criadoEm: string;
  aceitoEm: string | null;
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
  imagemBase64?: string;
};

const AUTH_STORAGE_KEY = "servnow.auth";
export const API_URL = "http://localhost:8080";

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
