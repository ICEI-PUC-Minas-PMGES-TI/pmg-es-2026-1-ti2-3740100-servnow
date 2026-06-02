import { ArrowLeft, Calendar, CheckCircle2, Clock, DollarSign, MapPin, Star, User } from "lucide-react";

import { PainelSectionHeader } from "../Painel/PainelSectionHeader";
import type { AcompanhamentoDetalhe } from "../../services/acompanhamento";
import { formatarHorarioAcompanhamento } from "../../utils/acompanhamentoLabels";
import { formatarMoedaBrl } from "../../utils/formatarMoeda";
import { formatarDataSolicitacao } from "../../utils/solicitacaoLabels";
import { AtualizacoesOrdemTimeline } from "./AtualizacoesOrdemTimeline";

type Props = {
  detalhe: AcompanhamentoDetalhe;
  tituloServico: string;
  contraparteLabel: string;
  contraparteNome: string;
  onVoltar: () => void;
};

export function DetalheOrdemHistorico({
  detalhe,
  tituloServico,
  contraparteLabel,
  contraparteNome,
  onVoltar,
}: Props) {
  const valorExibir = detalhe.valorFinal ?? detalhe.valorAceito;

  return (
    <>
      <button type="button" className="painel-btn-ghost" onClick={onVoltar} style={{ marginBottom: 12 }}>
        <ArrowLeft size={16} />
        Voltar ao Historico
      </button>

      <PainelSectionHeader
        eyebrow="Histórico"
        title={tituloServico}
        description="Consulte as informações e as atualizações registradas durante a execução."
      />

      <section className="painel-card acomp-card-servico">
        <div className="acomp-card-servico-cabecalho">
          <div>
            <h2>{tituloServico}</h2>
            <p style={{ margin: "4px 0 0", color: "var(--workspace-muted)", fontSize: 13 }}>
              {contraparteLabel}: {contraparteNome}
            </p>
          </div>
          <span className="painel-status concluído">Concluído</span>
        </div>
        <div className="acomp-card-servico-meta">
          {detalhe.data && (
            <span>
              <Calendar size={14} /> {formatarDataSolicitacao(detalhe.data)}
              {detalhe.horario ? ` às ${detalhe.horario}` : ""}
            </span>
          )}
          {detalhe.iniciadoEm && (
            <span>
              <Clock size={14} /> Iniciado às {formatarHorarioAcompanhamento(detalhe.iniciadoEm)}
            </span>
          )}
          {detalhe.previstoTerminoEm && (
            <span>
              <Clock size={14} /> Previsão: {formatarHorarioAcompanhamento(detalhe.previstoTerminoEm)}
            </span>
          )}
          <span>
            <MapPin size={14} /> {detalhe.endereco}
          </span>
          {valorExibir != null && (
            <span>
              <DollarSign size={14} /> {formatarMoedaBrl(valorExibir)}
            </span>
          )}
        </div>
        {detalhe.descricao && (
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--workspace-muted)" }}>{detalhe.descricao}</p>
        )}
        {(detalhe.percentualConcluido ?? 0) > 0 && (
          <div className="acomp-progresso" style={{ marginTop: 14 }}>
            <div className="acomp-progresso-cabecalho">
              <span>Progresso registrado</span>
              <strong>{detalhe.percentualConcluido}%</strong>
            </div>
            <div className="acomp-progresso-barra">
              <span style={{ width: `${detalhe.percentualConcluido}%` }} />
            </div>
          </div>
        )}
      </section>

      <AtualizacoesOrdemTimeline
        atualizacoes={detalhe.atualizacoes}
        titulo="Atualizações durante o serviço"
      />

      {(detalhe.notaAvaliacao != null || detalhe.notaAvaliacaoPrestador != null) && (
        <section className="painel-card">
          <div className="painel-card-cabecalho">
            <h2>Avaliacoes</h2>
          </div>
          {detalhe.notaAvaliacao != null && (
            <p style={{ margin: "0 0 8px", fontSize: 14 }}>
              <Star size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              Cliente avaliou o prestador: {detalhe.notaAvaliacao} estrela(s)
              {detalhe.comentarioAvaliacao ? ` — "${detalhe.comentarioAvaliacao}"` : ""}
            </p>
          )}
          {detalhe.notaAvaliacaoPrestador != null && (
            <p style={{ margin: 0, fontSize: 14 }}>
              <Star size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              Prestador avaliou o cliente: {detalhe.notaAvaliacaoPrestador} estrela(s)
              {detalhe.comentarioAvaliacaoPrestador ? ` — "${detalhe.comentarioAvaliacaoPrestador}"` : ""}
            </p>
          )}
        </section>
      )}

      <section className="painel-card">
        <div className="acomp-final">
          <div className="acomp-final-icon">
            <CheckCircle2 size={36} />
          </div>
          <h2>Serviço finalizado</h2>
          <p style={{ margin: 0, color: "var(--workspace-muted)", fontSize: 14 }}>
            <User size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
            {contraparteLabel}: {contraparteNome}
          </p>
        </div>
      </section>
    </>
  );
}
