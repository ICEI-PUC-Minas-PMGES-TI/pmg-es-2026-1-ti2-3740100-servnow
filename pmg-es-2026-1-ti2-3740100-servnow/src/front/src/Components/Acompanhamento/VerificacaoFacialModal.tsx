import { Camera, ScanFace, X } from "lucide-react";
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

type EtapaCamera = "solicitar" | "ativa" | "processando" | "negada";

function mensagemErroCamera(erro: unknown): string {
  if (erro instanceof DOMException) {
    if (erro.name === "NotAllowedError" || erro.name === "PermissionDeniedError") {
      return "Acesso a camera negado. Toque em \"Permitir camera\" para o navegador exibir o pedido de permissao.";
    }
    if (erro.name === "NotFoundError" || erro.name === "DevicesNotFoundError") {
      return "Nenhuma camera encontrada neste dispositivo.";
    }
    if (erro.name === "NotReadableError" || erro.name === "TrackStartError") {
      return "A camera esta em uso por outro aplicativo. Feche-o e tente novamente.";
    }
  }
  if (erro instanceof Error && erro.message) {
    return erro.message;
  }
  return "Nao foi possivel acessar a camera. Tente novamente.";
}

export function VerificacaoFacialModal({
  aberto,
  fotoPerfilUrl,
  limiarSimilaridade = 55,
  onFechar,
  onSucesso,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [etapa, setEtapa] = useState<EtapaCamera>("solicitar");
  const [mensagem, setMensagem] = useState<string | null>(null);

  const pararCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const solicitarCamera = useCallback(async () => {
    setMensagem(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setEtapa("negada");
      setMensagem("Seu navegador nao suporta acesso a camera.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setEtapa("ativa");
    } catch (erro) {
      setEtapa("negada");
      setMensagem(mensagemErroCamera(erro));
    }
  }, []);

  useEffect(() => {
    if (!aberto) {
      pararCamera();
      setEtapa("solicitar");
      setMensagem(null);
      return;
    }

    let cancelado = false;

    async function tentarCameraJaPermitida() {
      if (!navigator.permissions?.query) {
        return;
      }
      try {
        const status = await navigator.permissions.query({ name: "camera" as PermissionName });
        if (cancelado) {
          return;
        }
        if (status.state === "granted") {
          await solicitarCamera();
        }
      } catch {
        // Permissions API indisponivel ou nome nao suportado — usuario clica no botao
      }
    }

    void tentarCameraJaPermitida();

    return () => {
      cancelado = true;
      pararCamera();
    };
  }, [aberto, pararCamera, solicitarCamera]);

  async function handleCapturar() {
    if (!videoRef.current || !fotoPerfilUrl) {
      setMensagem("Cadastre uma foto de perfil com o rosto visivel antes de continuar.");
      setEtapa("negada");
      return;
    }

    const session = getValidAuthSession();
    if (!session?.token) {
      setMensagem("Sessao expirada. Faca login novamente.");
      setEtapa("negada");
      return;
    }

    setEtapa("processando");
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
        setEtapa("ativa");
        setMensagem(
          `Similaridade ${resultado.similaridade.toFixed(1)}% (minimo ${limiarSimilaridade}%). Ajuste a iluminacao e tente novamente.`,
        );
        return;
      }

      try {
        await onSucesso(resultado.similaridade);
        pararCamera();
      } catch (error) {
        setEtapa("ativa");
        setMensagem(error instanceof Error ? error.message : "Nao foi possivel registrar a verificacao no servidor.");
      }
    } catch (error) {
      setEtapa("ativa");
      setMensagem(error instanceof Error ? error.message : "Falha na verificacao facial.");
    }
  }

  if (!aberto) {
    return null;
  }

  const cameraAtiva = etapa === "ativa" || etapa === "processando";
  const mostrarPedidoPermissao = etapa === "solicitar" || etapa === "negada";

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
          <video
            ref={videoRef}
            className={`verif-facial-video ${cameraAtiva ? "" : "verif-facial-video--oculto"}`}
            playsInline
            muted
          />

          {mostrarPedidoPermissao && (
            <div className="verif-facial-placeholder">
              <Camera size={40} strokeWidth={1.5} />
              <p>
                {etapa === "solicitar"
                  ? "Toque no botao abaixo. O navegador vai abrir um pedido para usar a camera."
                  : "Permissao necessaria para continuar."}
              </p>
              <button type="button" className="acomp-btn-primary" onClick={() => void solicitarCamera()}>
                <Camera size={16} />
                Permitir camera
              </button>
              {etapa === "negada" && (
                <p className="verif-facial-dica">
                  Se o pedido nao aparecer, abra o cadeado na barra de endereco do navegador e libere a camera para
                  este site.
                </p>
              )}
            </div>
          )}

          {etapa === "processando" && (
            <div className="verif-facial-processando">Analisando rosto...</div>
          )}
        </div>

        {mensagem && <p className={etapa === "negada" ? "verif-facial-erro" : "verif-facial-aviso"}>{mensagem}</p>}

        <div className="verif-facial-acoes">
          <button type="button" className="painel-btn-ghost" onClick={onFechar} disabled={etapa === "processando"}>
            Cancelar
          </button>
          <button
            type="button"
            className="acomp-btn-primary"
            onClick={() => void handleCapturar()}
            disabled={etapa !== "ativa" && etapa !== "processando"}
          >
            <ScanFace size={16} />
            {etapa === "processando" ? "Verificando..." : "Capturar e verificar"}
          </button>
        </div>
      </div>
    </div>
  );
}
