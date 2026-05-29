import {
  API_URL,
  authHeader,
  authHeaders,
  getResponseError,
  type ClienteCadastroSyncRequest,
  type PerfilResponse,
} from "./auth";

export async function sincronizarCadastrosCliente(
  token: string,
  payload: ClienteCadastroSyncRequest,
): Promise<PerfilResponse> {
  const response = await fetch(`${API_URL}/api/perfil/cliente/cadastros`, {
    method: "PUT",
    headers: {
      ...authHeader(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Nao foi possivel salvar enderecos e pagamentos."));
  }

  return (await response.json()) as PerfilResponse;
}

export async function enviarFotoEnderecoCliente(
  token: string,
  enderecoId: number,
  arquivo: File,
): Promise<PerfilResponse> {
  const formData = new FormData();
  formData.append("foto", arquivo);

  const response = await fetch(`${API_URL}/api/perfil/cliente/enderecos/${enderecoId}/foto`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getResponseError(response, "Nao foi possivel enviar a foto do endereco."));
  }

  return (await response.json()) as PerfilResponse;
}
