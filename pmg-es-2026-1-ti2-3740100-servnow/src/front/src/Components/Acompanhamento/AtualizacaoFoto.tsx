import { useArquivoUrl } from "../../hooks/useArquivoUrl";

type Props = {
  fotoUrl: string;
  alt: string;
};

export function AtualizacaoFoto({ fotoUrl, alt }: Props) {
  const { src, carregando } = useArquivoUrl(fotoUrl);

  if (carregando) {
    return <div className="acomp-timeline-fotos" style={{ minHeight: 80 }} />;
  }

  if (!src) {
    return null;
  }

  return (
    <div className="acomp-timeline-fotos">
      <img src={src} alt={alt} />
    </div>
  );
}
