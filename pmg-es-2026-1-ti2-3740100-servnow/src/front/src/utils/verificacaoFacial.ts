import * as faceapi from "@vladmandic/face-api";

const MODEL_BASE =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model";

let modelosCarregados = false;

export type ResultadoComparacaoFacial = {
  similaridade: number;
  aprovado: boolean;
};

export async function carregarModelosFaciais(): Promise<void> {
  if (modelosCarregados) {
    return;
  }
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_BASE),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_BASE),
  ]);
  modelosCarregados = true;
}

async function descritorDeImagem(
  elemento: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
): Promise<Float32Array> {
  const deteccao = await faceapi
    .detectSingleFace(elemento, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
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

export async function compararRostoComReferencia(
  referencia: HTMLImageElement,
  captura: HTMLCanvasElement,
  limiarSimilaridade = 55,
): Promise<ResultadoComparacaoFacial> {
  await carregarModelosFaciais();

  const descritorReferencia = await descritorDeImagem(referencia);
  const descritorCaptura = await descritorDeImagem(captura);

  const distancia = faceapi.euclideanDistance(descritorReferencia, descritorCaptura);
  const similaridade = distanciaParaSimilaridade(distancia);

  return {
    similaridade,
    aprovado: similaridade >= limiarSimilaridade,
  };
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

export function capturarFrameDoVideo(video: HTMLVideoElement): HTMLCanvasElement {
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
