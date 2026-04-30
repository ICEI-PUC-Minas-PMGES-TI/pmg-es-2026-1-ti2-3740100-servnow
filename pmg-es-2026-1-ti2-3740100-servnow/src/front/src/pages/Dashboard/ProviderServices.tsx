import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays, Clock3, Filter, MapPin, Search, Wallet } from "lucide-react";
import { toast } from "react-toastify";

import {
  API_URL,
  getAuthSession,
  type SolicitacaoServicoResponse,
} from "../../services/auth";

const tiposServico = [
  { value: "", label: "Todos os tipos" },
  { value: "ELETRICO", label: "Eletrico" },
  { value: "HIDRAULICO", label: "Hidraulico" },
  { value: "PINTURA", label: "Pintura" },
  { value: "MONTAGEM", label: "Montagem" },
  { value: "LIMPEZA", label: "Limpeza" },
  { value: "MANUTENCAO_GERAL", label: "Manutencao geral" },
];

const faixasPreco = [
  { value: "", label: "Todas as faixas" },
  { value: "ATE_150", label: "Ate R$ 150" },
  { value: "DE_150_A_300", label: "R$ 150 a R$ 300" },
  { value: "DE_300_A_600", label: "R$ 300 a R$ 600" },
  { value: "DE_600_A_1000", label: "R$ 600 a R$ 1.000" },
  { value: "ACIMA_1000", label: "Acima de R$ 1.000" },
];

function formatLabel(value: string, list: Array<{ value: string; label: string }>) {
  return list.find((item) => item.value === value)?.label ?? value;
}

export function ProviderServices() {
  const session = getAuthSession();
  const [services, setServices] = useState<SolicitacaoServicoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tipoServico, setTipoServico] = useState("");
  const [faixaPreco, setFaixaPreco] = useState("");
  const [data, setData] = useState("");
  const [distanciaKm, setDistanciaKm] = useState("");

  async function loadServices() {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (tipoServico) params.set("tipoServico", tipoServico);
      if (faixaPreco) params.set("faixaPreco", faixaPreco);
      if (data) params.set("data", data);
      if (distanciaKm) params.set("distanciaKm", distanciaKm);

      const query = params.toString();
      const response = await fetch(`${API_URL}/api/solicitacoes-servico/publicadas${query ? `?${query}` : ""}`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const dataResponse = (await response.json()) as SolicitacaoServicoResponse[] | { detail?: string };
      if (!response.ok) {
        throw new Error("detail" in dataResponse ? dataResponse.detail || "Nao foi possivel buscar as solicitacoes." : "Nao foi possivel buscar as solicitacoes.");
      }

      setServices(dataResponse as SolicitacaoServicoResponse[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel buscar as solicitacoes.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadServices();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const urgent = services.filter((service) => service.data === today).length;

    return {
      total: services.length,
      urgent,
      higherPrice: services.filter((service) => service.faixaPreco === "ACIMA_1000").length,
    };
  }, [services]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadServices();
  }

  async function handleAccept(serviceId: number) {
    if (!session?.token) {
      toast.error("Sua sessao expirou. Entre novamente.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/solicitacoes-servico/${serviceId}/aceitar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const dataResponse = (await response.json()) as SolicitacaoServicoResponse | { detail?: string };
      if (!response.ok) {
        throw new Error("detail" in dataResponse ? dataResponse.detail || "Nao foi possivel aceitar a solicitacao." : "Nao foi possivel aceitar a solicitacao.");
      }

      setServices((current) => current.filter((service) => service.id !== serviceId));
      toast.success("Solicitacao atribuida a voce. O cliente foi notificado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel aceitar a solicitacao.");
    }
  }

  return (
    <div className="solicitation-layout">
      <section className="solicitation-stats">
        <article className="workspace-card">
          <span className="workspace-card-label"><Search size={14} /> Novas solicitacoes</span>
          <h3>{stats.total}</h3>
          <small>Disponiveis para aceite</small>
        </article>
        <article className="workspace-card">
          <span className="workspace-card-label"><CalendarDays size={14} /> Urgentes</span>
          <h3>{stats.urgent}</h3>
          <small>Para o dia atual</small>
        </article>
        <article className="workspace-card">
          <span className="workspace-card-label"><Wallet size={14} /> Maior valor</span>
          <h3>{stats.higherPrice}</h3>
          <small>Faixa acima de R$ 1.000</small>
        </article>
        <article className="workspace-card">
          <span className="workspace-card-label"><MapPin size={14} /> Distancia</span>
          <h3>{distanciaKm || "--"}</h3>
          <small>Filtro pronto para evolucao</small>
        </article>
      </section>

      <section className="workspace-list-card">
        <div className="workspace-section-header">
          <div>
            <h2>Solicitacoes de clientes</h2>
            <p>Filtre por servico, faixa de preco, data e distancia para encontrar as melhores oportunidades.</p>
          </div>
          <span className="workspace-chip">Disponiveis</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="workspace-filter-grid">
            <label className="workspace-field">
              <span>Tipo de servico</span>
              <div className="workspace-input">
                <select value={tipoServico} onChange={(event) => setTipoServico(event.target.value)}>
                  {tiposServico.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="workspace-field">
              <span>Faixa de preco</span>
              <div className="workspace-input">
                <Wallet size={16} />
                <select value={faixaPreco} onChange={(event) => setFaixaPreco(event.target.value)}>
                  {faixasPreco.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="workspace-field">
              <span>Data</span>
              <div className="workspace-input">
                <CalendarDays size={16} />
                <input type="date" value={data} onChange={(event) => setData(event.target.value)} />
              </div>
            </label>

            <label className="workspace-field">
              <span>Distancia (km)</span>
              <div className="workspace-input">
                <MapPin size={16} />
                <input
                  type="number"
                  min="0"
                  placeholder="sera usada depois"
                  value={distanciaKm}
                  onChange={(event) => setDistanciaKm(event.target.value)}
                />
              </div>
            </label>
          </div>

          <div className="workspace-form-actions">
            <button type="submit" className="workspace-primary-button">
              <Filter size={15} />
              Aplicar filtros
            </button>
          </div>
        </form>
      </section>

      <section className="workspace-list-card">
        <div className="workspace-section-header">
          <div>
            <h3>Lista de solicitacoes</h3>
            <p>Atribua a solicitacao para voce quando decidir assumir o atendimento.</p>
          </div>
        </div>

        <div className="workspace-list">
          {isLoading && (
            <div className="workspace-empty">
              <p>Carregando solicitacoes disponiveis...</p>
            </div>
          )}

          {!isLoading && services.length === 0 && (
            <div className="workspace-empty">
              <p>Nenhuma solicitacao encontrada com os filtros atuais.</p>
            </div>
          )}

          {services.map((service) => (
            <article key={service.id} className="workspace-item">
              <div className="workspace-item-header">
                <div>
                  <span className="workspace-status aguardando">Nova</span>
                  <h4>{formatLabel(service.tipoServico, tiposServico)}</h4>
                </div>

                <div className="workspace-form-actions">
                  <button type="button" className="workspace-primary-button" onClick={() => handleAccept(service.id)}>
                    Aceitar
                  </button>
                </div>
              </div>

              <div className="workspace-meta">
                <span><MapPin size={14} /> {service.endereco}</span>
                <span><Wallet size={14} /> {formatLabel(service.faixaPreco, faixasPreco)}</span>
                <span><CalendarDays size={14} /> {service.data}</span>
                <span><Clock3 size={14} /> {service.horario}</span>
              </div>

              <p className="workspace-description">{service.descricao}</p>
              <p className="workspace-assigned">Cliente solicitante: <strong>{service.clienteNome}</strong></p>

              {service.imagemBase64 && (
                <img className="workspace-card-image" src={service.imagemBase64} alt={service.tipoServico} />
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
