import { useEffect, useState } from "react";

import { getValidAuthSession } from "../services/auth";
import { carregarUrlArquivoAutenticado } from "../utils/arquivoAutenticado";

export function useArquivoUrl(arquivoUrl: string | null | undefined) {
  const [src, setSrc] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!arquivoUrl) {
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

    void carregarUrlArquivoAutenticado(arquivoUrl, session.token)
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
  }, [arquivoUrl]);

  return { src, carregando };
}
