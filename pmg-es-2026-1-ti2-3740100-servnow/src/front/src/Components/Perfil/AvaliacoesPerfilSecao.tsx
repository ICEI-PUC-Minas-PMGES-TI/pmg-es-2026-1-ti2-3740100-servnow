import { useEffect, useState } from "react";
import { CalendarDays, Star } from "lucide-react";

import { listarAvaliacoesRecebidas, type AvaliacaoRecebida } from "../../services/perfil";
import { formatarDataHoraAcompanhamento } from "../../utils/acompanhamentoLabels";
import { formatarNotaAvaliacao, formatarRotuloAvaliacoes } from "../../utils/formatarAvaliacao";
import { TIPOS_SERVICO_MAP } from "../../utils/tiposServico";

type Props = {
  descricaoLista: string;
  mensagemVazia: string;
};

export function AvaliacoesPerfilSecao({ descricaoLista, mensagemVazia }: Props) {
  const [avaliacaoMedia, setAvaliacaoMedia] = useState<number | null>(null);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoRecebida[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void listarAvaliacoesRecebidas()
      .then((dados) => {
        setAvaliacaoMedia(dados.avaliacaoMedia);
        setTotalAvaliacoes(dados.totalAvaliacoes);
        setAvaliacoes(dados.avaliacoes);
      })
      .catch(() => {
        setAvaliacaoMedia(null);
        setTotalAvaliacoes(0);
        setAvaliacoes([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="painel-card painel-perfil-card painel-perfil-card-avaliacoes">
      <div className="painel-perfil-card-cabecalho">
        <div className="painel-conta-card-icone">
          <Star size={22} />
        </div>
        <div>
          <h2>Avaliacoes recebidas</h2>
          <p>{descricaoLista}</p>
        </div>
      </div>

      <div className="painel-perfil-resumo-avaliacao">
        <Star size={18} fill="currentColor" />
        <strong>
          {isLoading
            ? "Calculando media..."
            : formatarRotuloAvaliacoes(avaliacaoMedia, totalAvaliacoes)}
        </strong>
      </div>

      {isLoading ? (
        <p className="painel-perfil-vazio">Carregando avaliacoes...</p>
      ) : avaliacoes.length === 0 ? (
        <p className="painel-perfil-vazio">{mensagemVazia}</p>
      ) : (
        <div className="painel-feedback-lista painel-perfil-avaliacoes-scroll">
          {avaliacoes.map((avaliacao) => {
            const tituloServico = TIPOS_SERVICO_MAP[avaliacao.tipoServico]?.nome ?? avaliacao.tipoServico;
            return (
              <article className="painel-feedback-item" key={avaliacao.ordemServicoId}>
                <div className="painel-feedback-topo">
                  <div>
                    <strong>{avaliacao.autorNome}</strong>
                    <span>{tituloServico}</span>
                  </div>
                  <div className="painel-feedback-nota" aria-label={`${avaliacao.nota} estrelas`}>
                    <Star size={15} fill="currentColor" />
                    {formatarNotaAvaliacao(avaliacao.nota)}
                  </div>
                </div>
                {avaliacao.comentario ? <p>{avaliacao.comentario}</p> : null}
                <span className="painel-feedback-data">
                  <CalendarDays size={14} />
                  {formatarDataHoraAcompanhamento(avaliacao.avaliadoEm)}
                </span>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
