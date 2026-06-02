import { Calendar, Clock, DollarSign, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { PainelSectionHeader } from "../../../Components/Painel/PainelSectionHeader";
import { listarDisponiveis, type AcompanhamentoDisponivel } from "../../../services/acompanhamento";
import { formatarMoedaBrl } from "../../../utils/formatarMoeda";
import { formatarDataSolicitacao } from "../../../utils/solicitacaoLabels";
import { labelEtapaAcompanhamento } from "../../../utils/acompanhamentoLabels";
import { TIPOS_SERVICO_MAP } from "../../../utils/tiposServico";

export function AcompanhamentoLista() {
  const navigate = useNavigate();
  const [itens, setItens] = useState<AcompanhamentoDisponivel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        setItens(await listarDisponiveis());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar servicos.");
      } finally {
        setIsLoading(false);
      }
    }
    void carregar();
  }, []);

  return (
    <>
      <PainelSectionHeader
        eyebrow="Processo 4"
        title="Acompanhamento"
        description="Selecione um serviço agendado para acompanhar em tempo real."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Servicos disponiveis</h2>
        </div>

        {isLoading ? (
          <div className="painel-vazio">
            <p>Carregando...</p>
          </div>
        ) : itens.length === 0 ? (
          <div className="painel-vazio">
            <p>Nenhum servico agendado para acompanhar.</p>
          </div>
        ) : (
          <div className="painel-lista">
            {itens.map((item) => (
              <div key={item.solicitacaoId} className="painel-lista-item">
                <div className="painel-lista-item-info">
                  <p className="painel-lista-item-titulo">
                    {TIPOS_SERVICO_MAP[item.tipoServico]?.nome ?? item.tipoServico}
                  </p>
                  <div className="painel-lista-item-meta">
                    {item.contraparteNome && (
                      <span className="painel-lista-item-meta-detalhe">
                        <User size={13} /> {item.contraparteNome}
                      </span>
                    )}
                    {item.data && (
                      <span className="painel-lista-item-meta-detalhe">
                        <Calendar size={13} /> {formatarDataSolicitacao(item.data)}
                      </span>
                    )}
                    {item.horario && (
                      <span className="painel-lista-item-meta-detalhe">
                        <Clock size={13} /> {item.horario}
                      </span>
                    )}
                    <span className="painel-lista-item-meta-detalhe painel-proposta-valor">
                      <DollarSign size={13} />
                      {formatarMoedaBrl(item.valorAceito)}
                    </span>
                  </div>
                </div>
                <div className="painel-lista-item-acoes">
                  <span className="painel-status agendado">{labelEtapaAcompanhamento(item.etapa)}</span>
                  <button
                    type="button"
                    className="painel-btn-ghost"
                    onClick={() => navigate(`/acompanhamento/${item.solicitacaoId}`)}
                  >
                    Acompanhar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default AcompanhamentoLista;
