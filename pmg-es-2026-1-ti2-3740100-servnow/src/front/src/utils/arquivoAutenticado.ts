import { API_URL, authHeader } from "../services/auth";

export type ArquivoCarregado = {
  url: string;
  mimeType: string;
};

export async function carregarArquivoAutenticado(
  arquivoUrl: string,
  token: string,
): Promise<ArquivoCarregado> {
  const path = arquivoUrl.startsWith("http") ? arquivoUrl : `${API_URL}${arquivoUrl}`;
  const response = await fetch(path, {
    cache: "no-store",
    headers: authHeader(token),
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o arquivo.");
  }

  const blob = await response.blob();
  return {
    url: URL.createObjectURL(blob),
    mimeType: blob.type || response.headers.get("Content-Type") || "",
  };
}

/** Retorna apenas a URL blob (revogar com URL.revokeObjectURL quando nao precisar). */
export async function carregarUrlArquivoAutenticado(arquivoUrl: string, token: string) {
  const arquivo = await carregarArquivoAutenticado(arquivoUrl, token);
  return arquivo.url;
}
