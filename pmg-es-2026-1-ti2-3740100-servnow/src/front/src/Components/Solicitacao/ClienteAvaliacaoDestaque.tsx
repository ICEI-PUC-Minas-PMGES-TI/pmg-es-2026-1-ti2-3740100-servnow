import { LoaderCircle, MessageSquareQuote, Star, User } from "lucide-react";

import { useArquivoUrl } from "../../hooks/useArquivoUrl";
import { formatarNotaAvaliacao, formatarQuantidadeAvaliacoes } from "../../utils/formatarAvaliacao";

type Props = {
  nome: string;
  fotoPerfilUrl?: string | null;
  avaliacaoMedia: number | null;
  totalAvaliacoes: number;
  comentarioDestaque: string | null;
  carregando?: boolean;
  onVerPerfil?: () => void;
};

export function ClienteAvaliacaoDestaque({
  nome,
  fotoPerfilUrl = null,
  avaliacaoMedia,
  totalAvaliacoes,
  comentarioDestaque,
  carregando = false,
  onVerPerfil,
}: Props) {
  const { src: fotoPerfilSrc, carregando: fotoPerfilCarregando } = useArquivoUrl(fotoPerfilUrl);

  if (carregando) {
    return (
      <section className="solicitacao-cliente-avaliacao" aria-busy="true" aria-label="Carregando avaliação do cliente">
        <p className="solicitacao-cliente-avaliacao-carregando">Carregando avaliação do cliente...</p>
      </section>
    );
  }

  const temAvaliacoes = avaliacaoMedia != null && totalAvaliacoes > 0;

  return (
    <section className="solicitacao-cliente-avaliacao" aria-label={`Avaliação de ${nome}`}>
      <div className="solicitacao-cliente-avaliacao-topo">
        <div className="solicitacao-cliente-avaliacao-identidade">
          <span className="solicitacao-cliente-avaliacao-avatar" aria-hidden="true">
            {fotoPerfilCarregando ? (
              <LoaderCircle className="painel-spin" size={18} />
            ) : fotoPerfilSrc ? (
              <img src={fotoPerfilSrc} alt="" className="solicitacao-cliente-avaliacao-avatar-foto" />
            ) : (
              <User size={18} />
            )}
          </span>
          <div>
            <span className="solicitacao-cliente-avaliacao-rotulo">Cliente</span>
            <strong className="solicitacao-cliente-avaliacao-nome">{nome}</strong>
          </div>
        </div>

        <div
          className={`solicitacao-cliente-avaliacao-nota ${temAvaliacoes ? "" : "sem-avaliacao"}`}
          aria-label={
            temAvaliacoes
              ? `Nota média ${formatarNotaAvaliacao(avaliacaoMedia!)} de 5`
              : "Cliente sem Avaliações na plataforma"
          }
        >
          <Star size={18} fill={temAvaliacoes ? "currentColor" : "transparent"} />
          {temAvaliacoes ? (
            <>
              <span className="solicitacao-cliente-avaliacao-nota-valor">
                {formatarNotaAvaliacao(avaliacaoMedia!)}
              </span>
              <span className="solicitacao-cliente-avaliacao-nota-total">
                {formatarQuantidadeAvaliacoes(totalAvaliacoes)}
              </span>
            </>
          ) : (
            <span className="solicitacao-cliente-avaliacao-nota-vazio">Sem avaliações</span>
          )}
        </div>
      </div>

      {comentarioDestaque ? (
        <blockquote className="solicitacao-cliente-avaliacao-comentario">
          <MessageSquareQuote size={18} aria-hidden="true" />
          <div>
            <span className="solicitacao-cliente-avaliacao-comentario-rotulo">Comentário em destaque</span>
            <p>{comentarioDestaque}</p>
          </div>
        </blockquote>
      ) : (
        <p className="solicitacao-cliente-avaliacao-sem-comentario">
          Este cliente ainda não possui comentários em destaque na plataforma.
        </p>
      )}

      {onVerPerfil ? (
        <button type="button" className="solicitacao-cliente-avaliacao-perfil-btn" onClick={onVerPerfil}>
          Ver perfil completo
        </button>
      ) : null}
    </section>
  );
}
