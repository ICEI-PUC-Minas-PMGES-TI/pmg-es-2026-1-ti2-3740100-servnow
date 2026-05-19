import { carregarUrlArquivoAutenticado } from "./arquivoAutenticado";

/** @deprecated Use carregarUrlArquivoAutenticado */
export async function carregarUrlImagemSolicitacao(imagemUrl: string, token: string) {
  return carregarUrlArquivoAutenticado(imagemUrl, token);
}
