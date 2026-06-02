import * as faceapi from "@vladmandic/face-api";

const MODEL_BASE =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model";

const DETECTOR_OPTS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.45,
});

const MAX_LADO_PROCESSAMENTO = 400;

let modelosCarregados = false;
let promessaModelos: Promise<void> | null = null;

let cacheReferencia: { chave: string; descritor: Float32Array } | null = null;

export type ResultadoComparacaoFacial = {
  similaridade: number;
  aprovado: boolean;
};

export function modelosFaciaisProntos(): boolean {
  return modelosCarregados;
}

export async function carregarModelosFaciais(): Promise<void> {
  if (modelosCarregados) {
    return;
  }
  if (promessaModelos) {
    return promessaModelos;
  }

  promessaModelos = Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_BASE),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_BASE),
  ]).then(() => {
    modelosCarregados = true;
  });

  return promessaModelos;
}

/** Baixa modelos cedo (ex.: ao abrir o modal) para nao esperar na captura. */
export function preCarregarModelosFaciais(): void {
  void carregarModelosFaciais().catch(() => undefined);
}

function redimensionarParaProcessamento(
  origem: HTMLImageElement | HTMLCanvasElement,
): HTMLCanvasElement {
  const { width, height } =
    origem instanceof HTMLImageElement
      ? { width: origem.naturalWidth, height: origem.naturalHeight }
      : { width: origem.width, height: origem.height };

  const escala = Math.min(1, MAX_LADO_PROCESSAMENTO / Math.max(width, height));
  const largura = Math.max(1, Math.round(width * escala));
  const altura = Math.max(1, Math.round(height * escala));

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Nao foi possivel preparar a imagem.");
  }
  ctx.drawImage(origem, 0, 0, largura, altura);
  return canvas;
}

async function descritorDeImagem(
  elemento: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
): Promise<Float32Array> {
  const entrada =
    elemento instanceof HTMLVideoElement
      ? redimensionarParaProcessamento(capturarFrameDeVideo(elemento))
      : redimensionarParaProcessamento(elemento);

  const deteccao = await faceapi
    .detectSingleFace(entrada, DETECTOR_OPTS)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!deteccao) {
    throw new Error("Nenhum rosto detectado. Posicione o rosto de frente para a camera.");
  }
  return deteccao.descriptor;
}

export function distanciaParaSimilaridade(distancia: number): number {
  const normalizada = Math.max(0, Math.min(1, 1 - distancia));
  return Math.round(normalizada * 1000) / 10;
}

/** Texto amigavel para o usuario (evita exibir % tecnico, ex.: 55,5). */
export function mensagemVerificacaoAprovada(): string {
  return "Sua identidade foi confirmada com sucesso.";
}

export function mensagemVerificacaoRejeitada(): string {
  return "Nao foi possivel confirmar sua identidade. Posicione o rosto de frente, com boa iluminacao, e tente novamente.";
}

/** Calcula e guarda o descritor da foto de perfil (evita reprocessar a cada selfie). */
export async function prepararReferenciaFacial(
  referencia: HTMLImageElement,
  chaveCache: string,
): Promise<void> {
  await carregarModelosFaciais();
  if (cacheReferencia?.chave === chaveCache) {
    return;
  }
  const descritor = await descritorDeImagem(referencia);
  cacheReferencia = { chave: chaveCache, descritor };
}

function compararDescritores(
  descritorReferencia: Float32Array,
  descritorCaptura: Float32Array,
  limiarSimilaridade: number,
): ResultadoComparacaoFacial {
  const distancia = faceapi.euclideanDistance(descritorReferencia, descritorCaptura);
  const similaridade = distanciaParaSimilaridade(distancia);
  return {
    similaridade,
    aprovado: similaridade >= limiarSimilaridade,
  };
}

/** Usa o descritor da foto de perfil ja calculado (mais rapido na captura). */
export async function compararCapturaComReferenciaPreparada(
  captura: HTMLCanvasElement,
  chaveCache: string,
  limiarSimilaridade = 55,
): Promise<ResultadoComparacaoFacial> {
  await carregarModelosFaciais();
  if (!cacheReferencia || cacheReferencia.chave !== chaveCache) {
    throw new Error("Foto de perfil ainda nao foi preparada. Aguarde um instante e tente novamente.");
  }
  const descritorCaptura = await descritorDeImagem(captura);
  return compararDescritores(cacheReferencia.descritor, descritorCaptura, limiarSimilaridade);
}

export async function compararRostoComReferencia(
  referencia: HTMLImageElement,
  captura: HTMLCanvasElement,
  limiarSimilaridade = 55,
  chaveCache?: string,
): Promise<ResultadoComparacaoFacial> {
  await carregarModelosFaciais();

  const chave = chaveCache ?? referencia.src;
  let descritorReferencia: Float32Array;

  if (cacheReferencia?.chave === chave) {
    descritorReferencia = cacheReferencia.descritor;
  } else {
    descritorReferencia = await descritorDeImagem(referencia);
    cacheReferencia = { chave, descritor: descritorReferencia };
  }

  const descritorCaptura = await descritorDeImagem(captura);
  return compararDescritores(descritorReferencia, descritorCaptura, limiarSimilaridade);
}

export async function imagemParaElemento(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Nao foi possivel carregar a foto de perfil."));
    img.src = src;
  });
}

function capturarFrameDeVideo(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Nao foi possivel capturar a imagem da camera.");
  }
  ctx.drawImage(video, 0, 0);
  return canvas;
}

export function capturarFrameDoVideo(video: HTMLVideoElement): HTMLCanvasElement {
  return redimensionarParaProcessamento(capturarFrameDeVideo(video));
}
