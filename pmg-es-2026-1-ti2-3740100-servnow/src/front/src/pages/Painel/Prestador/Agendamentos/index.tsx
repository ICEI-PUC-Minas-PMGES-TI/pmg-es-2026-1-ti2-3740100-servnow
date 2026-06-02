import { CalendarDays, Calendar, Clock, DollarSign, List, MapPin, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AgendaCalendario } from "../../../../Components/Agenda/AgendaCalendario";
import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import { API_URL, authHeader, getValidAuthSession, type SolicitacaoServicoResponse } from "../../../../services/auth";
import { formatarDataSolicitacao } from "../../../../utils/solicitacaoLabels";
import { formatarMoedaBrl } from "../../../../utils/formatarMoeda";
import { TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";

type Visao = "agenda" | "lista";

export function Agendamentos() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState<SolicitacaoServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visao, setVisao] = useState<Visao>("agenda");

  useEffect(() => {
    async function carregar() {
      const session = getValidAuthSession();
      if (!session?.token) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/solicitacoes/prestador/agendadas`, {
          headers: authHeader(session.token),
        });
        if (response.status === 401) {
          toast.error("Sessão expirada. Entre novamente.");
          navigate("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Não foi possível carregar os agendamentos.");
        }
        setAgendamentos((await response.json()) as SolicitacaoServicoResponse[]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar agendamentos.");
      } finally {
        setIsLoading(false);
      }
    }
    void carregar();
  }, [navigate]);

  const lista = useMemo(() => agendamentos, [agendamentos]);

  return (
    <>
      <PainelSectionHeader
        eyebrow="Sua agenda"
        title="Agendamentos"
        description="Serviços aceitos pelos clientes e já confirmados na sua agenda."
      />

      <section className="painel-card">
        <div className="painel-card-cabecalho">
          <h2>Proximos atendimentos</h2>
          <div className="painel-filtros">
            <button
              type="button"
              className={`painel-filtro ${visao === "agenda" ? "ativo" : ""}`}
              onClick={() => setVisao("agenda")}
            >
              <CalendarDays size={14} /> Agenda
            </button>
            <button
              type="button"
              className={`painel-filtro ${visao === "lista" ? "ativo" : ""}`}
              onClick={() => setVisao("lista")}
            >
              <List size={14} /> Lista
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <Calendar size={32} />
            </div>
            <p>Carregando agendamentos...</p>
          </div>
        ) : lista.length === 0 ? (
          <div className="painel-vazio">
            <div className="painel-vazio-icone">
              <Calendar size={32} />
            </div>
            <p>Voce ainda nao tem servicos agendados.</p>
          </div>
        ) : visao === "agenda" ? (
          <AgendaCalendario agendamentos={lista} papel="PRESTADOR" />
        ) : (
          <div className="painel-lista">
            {lista.map((item) => (
              <div key={item.id} className="painel-lista-item">
                <div className="painel-lista-item-info">
                  <p className="painel-lista-item-titulo">{TIPOS_SERVICO_MAP[item.tipoServico]?.nome ?? item.tipoServico}</p>
                  <div className="painel-lista-item-meta">
                    <span className="painel-lista-item-meta-detalhe">
                      <User size={13} /> {item.clienteNome}
                    </span>
                    <span className="painel-lista-item-meta-detalhe">
                      <MapPin size={13} /> {item.endereco}
                    </span>
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
                  <span className="painel-status agendado">Agendado</span>
                  <button
                    type="button"
                    className="painel-btn-ghost"
                    onClick={() => navigate(`/acompanhamento/${item.id}`)}
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

export default Agendamentos;
