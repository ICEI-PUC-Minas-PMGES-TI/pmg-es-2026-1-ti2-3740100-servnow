import {
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  MapPin,
  Star,
  User,
} from "lucide-react";

import { AtualizacoesOrdemTimeline } from "../Acompanhamento/AtualizacoesOrdemTimeline";
import type { AcompanhamentoDetalhe } from "../../services/acompanhamento";
import { formatarHorarioAcompanhamento } from "../../utils/acompanhamentoLabels";
import { formatarNotaAvaliacao } from "../../utils/formatarAvaliacao";
import {
  formatarMetodoPagamento,
  metodoPagamentoConfirmado,
} from "../../utils/formatarMetodoPagamento";
import { formatarMoedaBrl } from "../../utils/formatarMoeda";
import { formatarDataSolicitacao } from "../../utils/solicitacaoLabels";
import { TIPOS_SERVICO_MAP } from "../../utils/tiposServico";

type Props = {
  detalhe: AcompanhamentoDetalhe;
  perfil: "CLIENTE" | "PRESTADOR";
};

function AvaliacaoRelatorio({
  titulo,
  nota,
  comentario,
}: {
  titulo: string;
  nota: number;
  comentario: string | null;
}) {
  return (
    <article className="relatorio-servico-avaliacao">
      <div className="relatorio-servico-avaliacao-topo">
        <strong>{titulo}</strong>
        <span className="painel-feedback-nota" aria-label={`${nota} estrelas`}>
          <Star size={15} fill="currentColor" />
          {formatarNotaAvaliacao(nota)}
        </span>
      </div>
      {comentario ? <p>{comentario}</p> : <p className="relatorio-servico-sem-comentario">Sem comentário.</p>}
    </article>
  );
}

export function RelatorioServicoConteudo({ detalhe, perfil }: Props) {
  const tituloServico = TIPOS_SERVICO_MAP[detalhe.tipoServico]?.nome ?? detalhe.tipoServico;
  const contraparteLabel = perfil === "CLIENTE" ? "Prestador" : "Cliente";
  const contraparteNome =
    perfil === "CLIENTE"
      ? detalhe.prestadorNome ?? "Prestador"
      : detalhe.clienteNome;
  const valorExibir = detalhe.valorFinal ?? detalhe.valorAceito;
  const pagamento = metodoPagamentoConfirmado(
    detalhe.metodoPagamento,
    detalhe.metodoPagamentoSelecionado,
  );

  return (
    <div className="relatorio-servico-conteudo">
      <section className="relatorio-servico-bloco">
        <div className="relatorio-servico-cabecalho">
          <div>
            <h4>{tituloServico}</h4>
            <p>
              <User size={14} />
              {contraparteLabel}: {contraparteNome}
            </p>
          </div>
          <span className="painel-status concluido">Concluído</span>
        </div>

        <dl className="relatorio-servico-grid">
          {detalhe.data && (
            <div className="relatorio-servico-linha">
              <dt>
                <Calendar size={14} /> Data do serviço
              </dt>
              <dd>
                {formatarDataSolicitacao(detalhe.data)}
                {detalhe.horario ? ` às ${detalhe.horario}` : ""}
              </dd>
            </div>
          )}
          {detalhe.iniciadoEm && (
            <div className="relatorio-servico-linha">
              <dt>
                <Clock size={14} /> Início da execução
              </dt>
              <dd>{formatarHorarioAcompanhamento(detalhe.iniciadoEm)}</dd>
            </div>
          )}
          <div className="relatorio-servico-linha relatorio-servico-linha-full">
            <dt>
              <MapPin size={14} /> Endereço
            </dt>
            <dd>{detalhe.endereco}</dd>
          </div>
          {valorExibir != null && (
            <div className="relatorio-servico-linha">
              <dt>
                <DollarSign size={14} /> Valor
              </dt>
              <dd>{formatarMoedaBrl(valorExibir)}</dd>
            </div>
          )}
          <div className="relatorio-servico-linha">
            <dt>
              <CreditCard size={14} /> Pagamento
            </dt>
            <dd>{formatarMetodoPagamento(pagamento)}</dd>
          </div>
        </dl>

        {detalhe.descricao && (
          <p className="relatorio-servico-descricao">{detalhe.descricao}</p>
        )}
      </section>

      <AtualizacoesOrdemTimeline
        atualizacoes={detalhe.atualizacoes}
        titulo="Relatório do trabalho realizado"
        vazio="Nenhuma atualização registrada neste serviço."
      />

      <section className="relatorio-servico-bloco">
        <h4 className="relatorio-servico-subtitulo">Avaliações e comentários</h4>
        {detalhe.notaAvaliacao == null && detalhe.notaAvaliacaoPrestador == null ? (
          <p className="relatorio-servico-vazio">Nenhuma avaliação registrada para este serviço.</p>
        ) : (
          <div className="relatorio-servico-avaliacoes">
            {detalhe.notaAvaliacao != null && (
              <AvaliacaoRelatorio
                titulo="Cliente avaliou o prestador"
                nota={detalhe.notaAvaliacao}
                comentario={detalhe.comentarioAvaliacao}
              />
            )}
            {detalhe.notaAvaliacaoPrestador != null && (
              <AvaliacaoRelatorio
                titulo="Prestador avaliou o cliente"
                nota={detalhe.notaAvaliacaoPrestador}
                comentario={detalhe.comentarioAvaliacaoPrestador}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
