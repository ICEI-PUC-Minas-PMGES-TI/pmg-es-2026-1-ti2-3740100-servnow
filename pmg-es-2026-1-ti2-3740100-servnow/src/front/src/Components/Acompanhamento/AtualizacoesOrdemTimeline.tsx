import { AtualizacaoFoto } from "./AtualizacaoFoto";
import type { AtualizacaoServico } from "../../services/acompanhamento";
import { formatarDataHoraAcompanhamento } from "../../utils/acompanhamentoLabels";

type Props = {
  atualizacoes: AtualizacaoServico[];
  titulo?: string;
  vazio?: string;
};

export function AtualizacoesOrdemTimeline({
  atualizacoes,
  titulo = "Atualizações do serviço",
  vazio = "Nenhuma Atualização registrada nesta ordem de serviço.",
}: Props) {
  return (
    <section className="painel-card">
      <div className="painel-card-cabecalho">
        <h2>{titulo}</h2>
      </div>
      {atualizacoes.length === 0 ? (
        <p style={{ color: "var(--workspace-muted)", fontSize: 13, margin: 0 }}>{vazio}</p>
      ) : (
        <div className="acomp-timeline">
          {atualizacoes.map((atualizacao) => (
            <div key={atualizacao.id} className="acomp-timeline-item">
              <span className="acomp-timeline-data">{formatarDataHoraAcompanhamento(atualizacao.criadoEm)}</span>
              <p>{atualizacao.descricao}</p>
              {atualizacao.fotoUrl && (
                <AtualizacaoFoto fotoUrl={atualizacao.fotoUrl} alt={`Atualizacao ${atualizacao.id}`} />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
