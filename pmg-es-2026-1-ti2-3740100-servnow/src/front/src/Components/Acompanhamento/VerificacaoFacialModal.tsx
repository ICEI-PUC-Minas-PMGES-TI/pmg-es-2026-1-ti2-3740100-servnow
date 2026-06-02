import { ScanFace, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getValidAuthSession } from "../../services/auth";
import { carregarArquivoAutenticado } from "../../utils/arquivoAutenticado";
import {
  capturarFrameDoVideo,
  compararRostoComReferencia,
  imagemParaElemento,
} from "../../utils/verificacaoFacial";

type Props = {
  aberto: boolean;
  fotoPerfilUrl: string | null | undefined;
  limiarSimilaridade?: number;
  onFechar: () => void;
  onSucesso: (similaridade: number) => Promise<void>;
};

export function VerificacaoFacialModal({
  aberto,
  fotoPerfilUrl,
  limiarSimilaridade = 55,
  onFechar,
  onSucesso,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"camera" | "processando" | "erro">("camera");
  const [mensagem, setMensagem] = useState<string | null>(null);

  const pararCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!aberto) {
      pararCamera();
      setStatus("camera");
      setMensagem(null);
      return;
    }

    let cancelado = false;

    async function iniciarCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelado) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setStatus("erro");
        setMensagem("Permita o acesso a camera nas configuracoes do navegador para verificar sua identidade.");
      }
    }

    void iniciarCamera();

    return () => {
      cancelado = true;
      pararCamera();
    };
  }, [aberto, pararCamera]);

  async function handleCapturar() {
    if (!videoRef.current || !fotoPerfilUrl) {
      setMensagem("Cadastre uma foto de perfil com o rosto visivel antes de continuar.");
      setStatus("erro");
      return;
    }

    const session = getValidAuthSession();
    if (!session?.token) {
      setMensagem("Sessao expirada. Faca login novamente.");
      setStatus("erro");
      return;
    }

    setStatus("processando");
    setMensagem(null);

    try {
      const arquivoPerfil = await carregarArquivoAutenticado(fotoPerfilUrl, session.token);
      if (!arquivoPerfil?.url) {
        throw new Error("Nao foi possivel carregar a foto de perfil.");
      }

      const referencia = await imagemParaElemento(arquivoPerfil.url);
      const captura = capturarFrameDoVideo(videoRef.current);
      const resultado = await compararRostoComReferencia(referencia, captura, limiarSimilaridade);

      if (!resultado.aprovado) {
        setStatus("camera");
        setMensagem(
          `Similaridade ${resultado.similaridade.toFixed(1)}% (minimo ${limiarSimilaridade}%). Ajuste a iluminacao e tente novamente.`,
        );
        return;
      }

      try {
        await onSucesso(resultado.similaridade);
        pararCamera();
      } catch (error) {
        setStatus("camera");
        setMensagem(error instanceof Error ? error.message : "Nao foi possivel registrar a verificacao no servidor.");
      }
    } catch (error) {
      setStatus("camera");
      setMensagem(error instanceof Error ? error.message : "Falha na verificacao facial.");
    }
  }

  if (!aberto) {
    return null;
  }

  return (
    <div className="verif-facial-overlay" role="dialog" aria-modal="true" aria-labelledby="verif-facial-titulo">
      <div className="verif-facial-modal painel-card">
        <div className="verif-facial-cabecalho">
          <h2 id="verif-facial-titulo">Verificacao facial</h2>
          <button type="button" className="painel-btn-ghost" onClick={onFechar} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <p className="verif-facial-texto">
          Confirme que voce e o prestador cadastrado. Sua selfie sera comparada com a foto de perfil e nao sera
          armazenada no servidor.
        </p>

        <div className="verif-facial-video-wrap">
          <video ref={videoRef} className="verif-facial-video" playsInline muted />
          {status === "processando" && (
            <div className="verif-facial-processando">Analisando rosto...</div>
          )}
        </div>

        {mensagem && <p className="verif-facial-erro">{mensagem}</p>}

        <div className="verif-facial-acoes">
          <button type="button" className="painel-btn-ghost" onClick={onFechar} disabled={status === "processando"}>
            Cancelar
          </button>
          <button
            type="button"
            className="acomp-btn-primary"
            onClick={() => void handleCapturar()}
            disabled={status === "processando" || status === "erro"}
          >
            <ScanFace size={16} />
            {status === "processando" ? "Verificando..." : "Capturar e verificar"}
          </button>
        </div>
      </div>
    </div>
  );
}
