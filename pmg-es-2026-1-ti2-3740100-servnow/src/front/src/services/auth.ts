export type TipoUsuario = "CLIENTE" | "PRESTADOR";

export type AuthResponse = {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  token: string;
  mensagem: string;
};

export type CurrentUserResponse = {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
};

export type SolicitacaoServicoResponse = {
  id: number;
  clienteId: number;
  clienteNome: string;
  prestadorId: number | null;
  prestadorNome: string | null;
  endereco: string;
  tipoServico: string;
  faixaPreco: string;
  descricao: string;
  data: string;
  horario: string;
  imagemBase64: string | null;
  status: string;
  criadoEm: string;
  aceitoEm: string | null;
};

export type NotificacaoResponse = {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
};

export type NotificacaoResumoResponse = {
  quantidadeNaoLidas: number;
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

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getDashboardRoute(tipoUsuario: TipoUsuario) {
  return tipoUsuario === "CLIENTE" ? "/painel/cliente" : "/painel/prestador";
}
