import { ArrowRight, BarChart3, FileText, HandCoins, Star, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import { API_URL, authHeader, getValidAuthSession, type SolicitacaoServicoResponse } from "../../../../services/auth";
import { listarAvaliacoesRecebidas } from "../../../../services/perfil";
import { formatarNotaAvaliacao, formatarQuantidadeAvaliacoes } from "../../../../utils/formatarAvaliacao";
import { formatarMoedaBrl } from "../../../../utils/formatarMoeda";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";
import { getFaixaPrecoLabel, getStatusClass, getStatusLabel } from "../../../../utils/solicitacaoLabels";

type InicioProps = {
  onIrParaSolicitacoes: () => void;
  onIrParaPropostas: () => void;
  onIrParaGanhos: () => void;
};

export function Inicio({ onIrParaSolicitacoes, onIrParaPropostas, onIrParaGanhos }: InicioProps) {
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avaliacaoMedia, setAvaliacaoMedia] = useState<number | null>(null);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);
  const [agendadas, setAgendadas] = useState<SolicitacaoServicoResponse[]>([]);

  useEffect(() => {
    async function carregarSolicitacoes() {
      const session = getValidAuthSession();
      if (!session?.token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/solicitacoes/prestador`, {
          headers: authHeader(session.token),
        });

        if (response.status === 401) {
          toast.error("Sessao expirada. Entre novamente.");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar as solicitacoes.");
        }

        setSolicitacoes((await response.json()) as SolicitacaoServicoResponse[]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar solicitacoes.");
      } finally {
        setIsLoading(false);
      }
    }

    void carregarSolicitacoes();
  }, [navigate]);

  useEffect(() => {
    void listarAvaliacoesRecebidas()
      .then((dados) => {
        setAvaliacaoMedia(dados.avaliacaoMedia);
        setTotalAvaliacoes(dados.totalAvaliacoes);
      })
      .catch(() => {
        setAvaliacaoMedia(null);
        setTotalAvaliacoes(0);
      });
  }, []);

  useEffect(() => {
    const session = getValidAuthSession();
    if (!session?.token) {
      return;
    }
    void fetch(`${API_URL}/api/solicitacoes/prestador/agendadas`, {
      headers: authHeader(session.token),
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((dados) => setAgendadas(dados as SolicitacaoServicoResponse[]))
      .catch(() => setAgendadas([]));
  }, []);

  const solicitacoesRecentes = useMemo(() => solicitacoes.slice(0, 3), [solicitacoes]);
  const oportunidadesNovas = useMemo(
    () => solicitacoes.filter((item) => item.status === "PUBLICADO" || item.status === "AGUARDANDO_PROPOSTAS").length,
    [solicitacoes],
  );

  // Ganhos do mes: soma dos servicos agendados para o mes corrente.
  const ganhosMes = useMemo(() => {
    const mesAtual = new Date().toISOString().slice(0, 7);
    return agendadas.reduce((soma, item) => {
      const referencia = (item.data ?? item.aceitoEm ?? item.criadoEm ?? "").slice(0, 7);
      return referencia === mesAtual ? soma + (item.valorAceito ?? 0) : soma;
    }, 0);
  }, [agendadas]);

  return (
    <>
      <PainelSectionHeader
        eyebrow="Painel do prestador"
        title="Inicio"
        description="Acompanhe novas solicitacoes, ganhos e avaliacoes dos seus atendimentos."
      />

      <section className="painel-stats-grid">
        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <FileText size={22} />
          </div>
          <span className="painel-stat-label">Oportunidades novas</span>
          <strong className="painel-stat-valor">{oportunidadesNovas}</strong>
          <span className="painel-stat-detalhe">Solicitacoes publicadas no momento</span>
        </div>

        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <Wallet size={22} />
          </div>
          <span className="painel-stat-label">Ganhos no mes</span>
          <strong className="painel-stat-valor">{formatarMoedaBrl(ganhosMes)}</strong>
          <span className="painel-stat-detalhe">Servicos agendados para este mes</span>
        </div>

        <div className="painel-stat-card">
          <div className="painel-stat-icone">
            <Star size={22} />
          </div>
          <span className="painel-stat-label">Avaliacao media</span>
          <strong className="painel-stat-valor">
            {avaliacaoMedia != null ? formatarNotaAvaliacao(avaliacaoMedia) : "—"}
          </strong>
          <span className="painel-stat-detalhe">
            {totalAvaliacoes > 0 ? formatarQuantidadeAvaliacoes(totalAvaliacoes) : "Sem avaliacoes ainda"}
          </span>
        </div>
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Solicitacoes disponiveis</h2>
          <button type="button" className="painel-btn-ghost" onClick={onIrParaSolicitacoes}>
            Ver todas <ArrowRight size={14} />
          </button>
        </div>

        {isLoading ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>Carregando solicitacoes...</p>
          </div>
        ) : solicitacoesRecentes.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <FileText size={32} />
            </div>
            <p>Nenhuma solicitacao disponivel agora.</p>
          </div>
        ) : (
          <div className="painel-lista">
            {solicitacoesRecentes.map((item) => {
              const tipo = TIPOS_SERVICO_MAP[item.tipoServico]?.nome ?? item.tipoServico;
              return (
                <div key={item.id} className="painel-lista-item">
                  <div className="painel-lista-item-info">
                    <p className="painel-lista-item-titulo">{tipo}</p>
                    <div className="painel-lista-item-meta">
                      <span className="painel-lista-item-meta-detalhe">{item.clienteNome}</span>
                      <span className="painel-lista-item-meta-detalhe">{item.cidade} - {item.estado}</span>
                      <span className="painel-lista-item-meta-detalhe">{getFaixaPrecoLabel(item.faixaPreco)}</span>
                    </div>
                  </div>
                  <div className="painel-lista-item-acoes">
                    <span className={`painel-status ${getStatusClass(item.status)}`}>{getStatusLabel(item.status)}</span>
                    <button type="button" className="painel-btn-aceitar" onClick={onIrParaSolicitacoes}>Enviar proposta</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Atalhos rapidos</h2>
        </div>
        <div className="painel-atalhos-grid">
          <button type="button" className="painel-atalho-card" onClick={onIrParaPropostas}>
            <HandCoins size={20} />
            <span>Minhas propostas</span>
          </button>
          <button type="button" className="painel-atalho-card" onClick={onIrParaGanhos}>
            <BarChart3 size={20} />
            <span>Ver ganhos</span>
          </button>
        </div>
      </section>
    </>
  );
}

export default Inicio;
