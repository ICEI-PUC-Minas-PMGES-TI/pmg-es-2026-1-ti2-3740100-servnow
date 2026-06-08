import { ImageIcon } from "lucide-react";

import { useSolicitacaoImagemUrl } from "../../hooks/useSolicitacaoImagemUrl";

type Props = {
  solicitacaoId: number;
  imagemUrl: string | null;
  alt?: string;
  className?: string;
  onClick?: () => void;
};

export function SolicitacaoImagemThumb({ solicitacaoId, imagemUrl, alt, className, onClick }: Props) {
  const { src, carregando } = useSolicitacaoImagemUrl(imagemUrl, solicitacaoId);

  if (!imagemUrl) {
    return null;
  }

  if (carregando || !src) {
    return (
      <span
        className={`solicitacao-imagem-placeholder ${className ?? ""}`}
        aria-hidden={!onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={onClick ? (event) => event.key === "Enter" && onClick() : undefined}
      >
        <ImageIcon size={20} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? "Foto da solicitação"}
      className={`${className ?? "solicitacao-imagem-thumb"}${onClick ? " solicitacao-imagem-clicavel" : ""}`}
      onClick={onClick}
    />
  );
}
