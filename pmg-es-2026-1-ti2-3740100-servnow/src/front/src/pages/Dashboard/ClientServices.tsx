import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ImagePlus,
  MapPin,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import { API_URL, getAuthSession, type SolicitacaoServicoResponse } from "../../services/auth";

type ClienteServicoForm = {
  endereco: string;
  tipoServico: string;
  faixaPreco: string;
  descricao: string;
  data: string;
  horario: string;
  imagemBase64: string;
};

type ClientServicesProps = {
  userId: number;
};

type StatusTab = "TODAS" | "AGUARDANDO_ACEITE" | "EM_ANDAMENTO" | "CONCLUIDOS";

const initialForm: ClienteServicoForm = {
  endereco: "",
  tipoServico: "ELETRICO",
  faixaPreco: "ATE_150",
  descricao: "",
  data: "",
  horario: "",
  imagemBase64: "",
};

const tiposServico = [
  { value: "ELETRICO", label: "Eletrico" },
  { value: "HIDRAULICO", label: "Hidraulico" },
  { value: "PINTURA", label: "Pintura" },
  { value: "MONTAGEM", label: "Montagem" },
  { value: "LIMPEZA", label: "Limpeza" },
  { value: "MANUTENCAO_GERAL", label: "Manutencao geral" },
];

const faixasPreco = [
  { value: "ATE_150", label: "Ate R$ 150" },
  { value: "DE_150_A_300", label: "R$ 150 a R$ 300" },
  { value: "DE_300_A_600", label: "R$ 300 a R$ 600" },
  { value: "DE_600_A_1000", label: "R$ 600 a R$ 1.000" },
  { value: "ACIMA_1000", label: "Acima de R$ 1.000" },
];

function formatLabel(value: string, list: Array<{ value: string; label: string }>) {
  return list.find((item) => item.value === value)?.label ?? value;
}

function getStatusInfo(status: string) {
  switch (status) {
    case "ACEITO":
      return { key: "EM_ANDAMENTO" as const, label: "Em andamento", className: "andamento" };
    case "CONCLUIDO":
      return { key: "CONCLUIDOS" as const, label: "Concluido", className: "concluido" };
    default:
      return { key: "AGUARDANDO_ACEITE" as const, label: "Aguardando aceite", className: "aguardando" };
  }
}

export function ClientServices({ userId }: ClientServicesProps) {
  const session = getAuthSession();
  const [services, setServices] = useState<SolicitacaoServicoResponse[]>([]);
  const [form, setForm] = useState<ClienteServicoForm>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("TODAS");

  useEffect(() => {
    async function loadServices() {
      if (!session?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/solicitacoes-servico/minhas`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        const data = (await response.json()) as SolicitacaoServicoResponse[] | { detail?: string };

        if (!response.ok) {
          throw new Error("detail" in data ? data.detail || "Nao foi possivel carregar as solicitacoes." : "Nao foi possivel carregar as solicitacoes.");
        }

        setServices(data as SolicitacaoServicoResponse[]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Nao foi possivel carregar as solicitacoes.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadServices();
  }, [session?.token, userId]);

  const counts = useMemo(() => {
    return services.reduce(
      (acc, service) => {
        const status = getStatusInfo(service.status).key;
        acc.total += 1;
        if (status === "AGUARDANDO_ACEITE") acc.awaiting += 1;
        if (status === "EM_ANDAMENTO") acc.progress += 1;
        if (status === "CONCLUIDOS") acc.done += 1;
        return acc;
      },
      { total: 0, awaiting: 0, progress: 0, done: 0 },
    );
  }, [services]);

  const filteredServices = useMemo(() => {
    if (activeTab === "TODAS") {
      return services;
    }

    return services.filter((service) => getStatusInfo(service.status).key === activeTab);
  }, [activeTab, services]);

  function updateField<Key extends keyof ClienteServicoForm>(key: Key, value: ClienteServicoForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      updateField("imagemBase64", result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.endereco || !form.descricao || !form.data || !form.horario) {
      toast.error("Preencha endereco, descricao, dia e horario antes de publicar.");
      return;
    }

    if (!session?.token) {
      toast.error("Sua sessao expirou. Entre novamente.");
      return;
    }

    try {
      const response = await fetch(
        editingId ? `${API_URL}/api/solicitacoes-servico/${editingId}` : `${API_URL}/api/solicitacoes-servico`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify(form),
        },
      );

      const data = (await response.json()) as SolicitacaoServicoResponse | { detail?: string };

      if (!response.ok) {
        throw new Error("detail" in data ? data.detail || "Nao foi possivel salvar a solicitacao." : "Nao foi possivel salvar a solicitacao.");
      }

      const savedService = data as SolicitacaoServicoResponse;
      if (editingId) {
        setServices((current) => current.map((service) => (service.id === editingId ? savedService : service)));
        toast.success("Solicitacao atualizada com sucesso.");
      } else {
        setServices((current) => [savedService, ...current]);
        toast.success("Solicitacao publicada com sucesso.");
      }

      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar a solicitacao.");
    }
  }

  function handleEdit(service: SolicitacaoServicoResponse) {
    setEditingId(service.id);
    setForm({
      endereco: service.endereco,
      tipoServico: service.tipoServico,
      faixaPreco: service.faixaPreco,
      descricao: service.descricao,
      data: service.data,
      horario: service.horario,
      imagemBase64: service.imagemBase64 ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(serviceId: number) {
    if (!session?.token) {
      toast.error("Sua sessao expirou. Entre novamente.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/solicitacoes-servico/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (!response.ok) {
        const data = (await response.json()) as { detail?: string };
        throw new Error(data.detail || "Nao foi possivel excluir a solicitacao.");
      }

      setServices((current) => current.filter((service) => service.id !== serviceId));
      if (editingId === serviceId) {
        resetForm();
      }

      toast.success("Solicitacao excluida com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel excluir a solicitacao.");
    }
  }

  return (
    <div className="solicitation-layout">
      <section className="solicitation-stats">
        <article className="workspace-card">
          <span className="workspace-card-label"><ClipboardList size={14} /> Total</span>
          <h3>{counts.total}</h3>
          <small>Solicitacoes cadastradas</small>
        </article>
        <article className="workspace-card">
          <span className="workspace-card-label"><Clock3 size={14} /> Aguardando</span>
          <h3>{counts.awaiting}</h3>
          <small>Pendentes de aceite</small>
        </article>
        <article className="workspace-card">
          <span className="workspace-card-label"><Wallet size={14} /> Em andamento</span>
          <h3>{counts.progress}</h3>
          <small>Com prestador responsavel</small>
        </article>
        <article className="workspace-card">
          <span className="workspace-card-label"><CheckCircle2 size={14} /> Concluidos</span>
          <h3>{counts.done}</h3>
          <small>Historico finalizado</small>
        </article>
      </section>

      <section className="workspace-list-card">
        <div className="workspace-section-header">
          <div>
            <h2>Nova solicitacao</h2>
            <p>Preencha os dados do servico, publique o pedido e acompanhe a resposta dos prestadores.</p>
          </div>
          <span className="workspace-chip">{editingId ? "Editando" : "Criando"}</span>
        </div>

        <form className="workspace-form-grid" onSubmit={handleSubmit}>
          <label className="workspace-field workspace-field-full">
            <span>Endereco</span>
            <div className="workspace-input">
              <MapPin size={16} />
              <input
                type="text"
                placeholder="Rua, numero, bairro e cidade"
                value={form.endereco}
                onChange={(event) => updateField("endereco", event.target.value)}
              />
            </div>
          </label>

          <label className="workspace-field">
            <span>Tipo de servico</span>
            <div className="workspace-input">
              <select value={form.tipoServico} onChange={(event) => updateField("tipoServico", event.target.value)}>
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
              <select value={form.faixaPreco} onChange={(event) => updateField("faixaPreco", event.target.value)}>
                {faixasPreco.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </label>

          <label className="workspace-field">
            <span>Dia desejado</span>
            <div className="workspace-input">
              <CalendarDays size={16} />
              <input type="date" value={form.data} onChange={(event) => updateField("data", event.target.value)} />
            </div>
          </label>

          <label className="workspace-field">
            <span>Horario desejado</span>
            <div className="workspace-input">
              <Clock3 size={16} />
              <input type="time" value={form.horario} onChange={(event) => updateField("horario", event.target.value)} />
            </div>
          </label>

          <label className="workspace-field workspace-field-full">
            <span>Descricao</span>
            <div className="workspace-input textarea">
              <textarea
                rows={5}
                placeholder="Descreva o problema, o contexto do servico e qualquer detalhe importante."
                value={form.descricao}
                onChange={(event) => updateField("descricao", event.target.value)}
              />
            </div>
          </label>

          <label className="workspace-field workspace-field-full">
            <span>Imagem opcional</span>
            <div className="workspace-upload">
              <ImagePlus size={18} />
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
            {form.imagemBase64 && (
              <img className="workspace-upload-preview" src={form.imagemBase64} alt="Preview do servico" />
            )}
          </label>

          <div className="workspace-form-actions workspace-field-full">
            <button type="submit" className="workspace-primary-button">
              {editingId ? "Salvar alteracoes" : "Publicar solicitacao"}
            </button>
            {editingId && (
              <button type="button" className="workspace-secondary-button" onClick={resetForm}>
                Cancelar edicao
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="workspace-list-card">
        <div className="workspace-section-header">
          <div>
            <h3>Solicitacoes</h3>
            <p>Organize seus pedidos por status e acompanhe quando um prestador assumir o atendimento.</p>
          </div>
        </div>

        <div className="workspace-tab-bar">
          <button type="button" className={`workspace-filter-pill ${activeTab === "TODAS" ? "active" : ""}`} onClick={() => setActiveTab("TODAS")}>
            Todas
          </button>
          <button type="button" className={`workspace-filter-pill ${activeTab === "AGUARDANDO_ACEITE" ? "active" : ""}`} onClick={() => setActiveTab("AGUARDANDO_ACEITE")}>
            Aguardando aceite
          </button>
          <button type="button" className={`workspace-filter-pill ${activeTab === "EM_ANDAMENTO" ? "active" : ""}`} onClick={() => setActiveTab("EM_ANDAMENTO")}>
            Em andamento
          </button>
          <button type="button" className={`workspace-filter-pill ${activeTab === "CONCLUIDOS" ? "active" : ""}`} onClick={() => setActiveTab("CONCLUIDOS")}>
            Concluidos
          </button>
        </div>

        <div className="workspace-list">
          {isLoading && (
            <div className="workspace-empty">
              <p>Carregando solicitacoes...</p>
            </div>
          )}

          {!isLoading && filteredServices.length === 0 && (
            <div className="workspace-empty">
              <p>Nenhuma solicitacao encontrada nessa categoria.</p>
            </div>
          )}

          {filteredServices.map((service) => {
            const status = getStatusInfo(service.status);

            return (
              <article key={service.id} className="workspace-item">
                <div className="workspace-item-header">
                  <div>
                    <span className={`workspace-status ${status.className}`}>{status.label}</span>
                    <h4>{formatLabel(service.tipoServico, tiposServico)}</h4>
                  </div>

                  {status.key === "AGUARDANDO_ACEITE" ? (
                    <div className="workspace-form-actions">
                      <button type="button" className="workspace-action-button-secondary" onClick={() => handleEdit(service)}>
                        <Pencil size={15} />
                        Editar
                      </button>
                      <button type="button" className="workspace-action-button-secondary" onClick={() => handleDelete(service.id)}>
                        <Trash2 size={15} />
                        Excluir
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="workspace-meta">
                  <span><MapPin size={14} /> {service.endereco}</span>
                  <span><Wallet size={14} /> {formatLabel(service.faixaPreco, faixasPreco)}</span>
                  <span><CalendarDays size={14} /> {service.data}</span>
                  <span><Clock3 size={14} /> {service.horario}</span>
                </div>

                <p className="workspace-description">{service.descricao}</p>

                {service.prestadorNome && (
                  <p className="workspace-assigned">
                    Prestador responsavel: <strong>{service.prestadorNome}</strong>
                  </p>
                )}

                {service.imagemBase64 && (
                  <img className="workspace-card-image" src={service.imagemBase64} alt={service.tipoServico} />
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
