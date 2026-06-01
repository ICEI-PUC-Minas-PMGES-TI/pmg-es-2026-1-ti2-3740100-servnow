import { MessageSquareQuote, Star, User } from "lucide-react";

import { formatarNotaAvaliacao, formatarQuantidadeAvaliacoes } from "../../utils/formatarAvaliacao";

type Props = {
  nome: string;
  avaliacaoMedia: number | null;
  totalAvaliacoes: number;
  comentarioDestaque: string | null;
  carregando?: boolean;
  onVerPerfil?: () => void;
};

export function ClienteAvaliacaoDestaque({
  nome,
  avaliacaoMedia,
  totalAvaliacoes,
  comentarioDestaque,
  carregando = false,
  onVerPerfil,
}: Props) {
  if (carregando) {
    return (
      <section className="solicitacao-cliente-avaliacao" aria-busy="true" aria-label="Carregando avaliacao do cliente">
        <p className="solicitacao-cliente-avaliacao-carregando">Carregando avaliacao do cliente...</p>
      </section>
    );
  }

  const temAvaliacoes = avaliacaoMedia != null && totalAvaliacoes > 0;

  return (
    <section className="solicitacao-cliente-avaliacao" aria-label={`Avaliacao de ${nome}`}>
      <div className="solicitacao-cliente-avaliacao-topo">
        <div className="solicitacao-cliente-avaliacao-identidade">
          <span className="solicitacao-cliente-avaliacao-avatar" aria-hidden="true">
            <User size={18} />
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
              ? `Nota media ${formatarNotaAvaliacao(avaliacaoMedia!)} de 5`
              : "Cliente sem avaliacoes na plataforma"
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
            <span className="solicitacao-cliente-avaliacao-nota-vazio">Sem avaliacoes</span>
          )}
        </div>
      </div>

      {comentarioDestaque ? (
        <blockquote className="solicitacao-cliente-avaliacao-comentario">
          <MessageSquareQuote size={18} aria-hidden="true" />
          <div>
            <span className="solicitacao-cliente-avaliacao-comentario-rotulo">Comentario em destaque</span>
            <p>{comentarioDestaque}</p>
          </div>
        </blockquote>
      ) : (
        <p className="solicitacao-cliente-avaliacao-sem-comentario">
          Este cliente ainda nao possui comentarios em destaque na plataforma.
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
