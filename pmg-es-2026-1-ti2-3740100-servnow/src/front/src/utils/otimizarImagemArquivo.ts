const TAMANHO_MAXIMO_BYTES = 1_800_000;
const LADO_MAXIMO_PX = 1200;

function carregarImagem(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Nao foi possivel ler a imagem."));
    };

    image.src = objectUrl;
  });
}

function canvasParaJpegBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Nao foi possivel processar a imagem."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

function nomeArquivoJpeg(nomeOriginal: string) {
  const base = nomeOriginal.replace(/\.[^.]+$/, "") || "foto";
  return `${base}.jpg`;
}


export async function otimizarImagemParaUpload(file: File) {
  const image = await carregarImagem(file);
  const scale = Math.min(1, LADO_MAXIMO_PX / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Nao foi possivel processar a imagem.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  for (let quality = 0.82; quality >= 0.45; quality -= 0.08) {
    const blob = await canvasParaJpegBlob(canvas, quality);
    if (blob.size <= TAMANHO_MAXIMO_BYTES) {
      return new File([blob], nomeArquivoJpeg(file.name), { type: "image/jpeg" });
    }
  }

  throw new Error("A imagem ficou grande demais. Tente uma foto menor.");
}
