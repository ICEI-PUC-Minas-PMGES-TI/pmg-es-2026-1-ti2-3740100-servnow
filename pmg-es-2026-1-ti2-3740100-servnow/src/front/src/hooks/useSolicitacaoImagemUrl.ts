import { useEffect, useState } from "react";

import { getValidAuthSession } from "../services/auth";
import { carregarUrlImagemSolicitacao } from "../utils/solicitacaoImagem";

export function useSolicitacaoImagemUrl(imagemUrl: string | null, solicitacaoId: number) {
  const [src, setSrc] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!imagemUrl) {
      setSrc(null);
      setCarregando(false);
      return;
    }

    const session = getValidAuthSession();
    if (!session?.token) {
      setSrc(null);
      return;
    }

    let ativo = true;
    let blobUrl: string | null = null;
    setCarregando(true);

    void carregarUrlImagemSolicitacao(imagemUrl, session.token)
      .then((url) => {
        if (!ativo) {
          URL.revokeObjectURL(url);
          return;
        }
        blobUrl = url;
        setSrc(url);
      })
      .catch(() => {
        if (ativo) {
          setSrc(null);
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [imagemUrl, solicitacaoId]);

  return { src, carregando };
}
