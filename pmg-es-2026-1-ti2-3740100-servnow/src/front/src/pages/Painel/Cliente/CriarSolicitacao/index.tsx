import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Building,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Hash,
  Home,
  LoaderCircle,
  MapPin,
  PlusCircle,
  Tag,
} from "lucide-react";

import { PainelSectionHeader } from "../../../../Components/Painel/PainelSectionHeader";
import {
  API_URL,
  authHeaders,
  clearAuthSession,
  getValidAuthSession,
  type SolicitacaoServicoCreateRequest,
} from "../../../../services/auth";
import { TIPOS_SERVICO, TIPOS_SERVICO_MAP } from "../../../../utils/tiposServico";

const FAIXAS_PRECO = [
  { value: "ATE_150", label: "Ate R$ 150" },
  { value: "DE_150_A_300", label: "R$ 150 a R$ 300" },
  { value: "DE_300_A_600", label: "R$ 300 a R$ 600" },
  { value: "DE_600_A_1000", label: "R$ 600 a R$ 1.000" },
  { value: "ACIMA_1000", label: "Acima de R$ 1.000" },
];

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export function CriarSolicitacao() {
  const navigate = useNavigate();
  const [tipoServico, setTipoServico] = useState("");
  const [faixaPreco, setFaixaPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "found" | "not-found" | "error">("idle");
  const cepDigits = onlyDigits(cep);

  useEffect(() => {
    if (cepDigits.length !== 8) {
      setCepStatus("idle");
      return;
    }

    const controller = new AbortController();

    async function buscarEnderecoPorCep() {
      setCepStatus("loading");

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Nao foi possivel consultar o CEP.");
        }

        const data = (await response.json()) as ViaCepResponse;

        if (data.erro) {
          setCepStatus("not-found");
          return;
        }

        setCep(data.cep ?? formatCep(cepDigits));
        setRua(data.logradouro ?? "");
        setBairro(data.bairro ?? "");
        setCidade(data.localidade ?? "");
        setEstado(data.uf ?? "");
        setCepStatus("found");
      } catch (error) {
        if (!controller.signal.aborted) {
          setCepStatus("error");
        }
      }
    }

    void buscarEnderecoPorCep();

    return () => controller.abort();
  }, [cepDigits]);

  function handleCepChange(event: ChangeEvent<HTMLInputElement>) {
    setCep(formatCep(event.target.value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getValidAuthSession();

    if (!session?.token) {
      toast.error("Sessao expirada. Entre novamente.");
      navigate("/login");
      return;
    }

    const payload: SolicitacaoServicoCreateRequest = {
      tipoServico,
      iconeServico: tipoServico || undefined,
      faixaPreco,
      descricao,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      data: data || undefined,
      horario: horario || undefined,
    };

    setIsSaving(true);

    try {
      const authCheck = await fetch(`${API_URL}/api/auth/me`, {
        cache: "no-store",
        headers: authHeaders(session.token),
      });

      if (authCheck.status === 401) {
        const detalhe = await getResponseError(authCheck, "Authorization Bearer nao informado ou nao aceito.");
        clearAuthSession();
        toast.error(`Sessao nao aceita pelo backend. ${detalhe}`);
        navigate("/login");
        return;
      }

      if (!authCheck.ok) {
        throw new Error(await getResponseError(authCheck, "Nao foi possivel validar sua sessao."));
      }

      const response = await fetch(`${API_URL}/api/solicitacoes`, {
        method: "POST",
        cache: "no-store",
        headers: authHeaders(session.token, "application/json"),
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        const detalhe = await getResponseError(response, "Token recusado pelo backend.");
        clearAuthSession();
        toast.error(`Nao foi possivel autenticar a solicitacao. ${detalhe}`);
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(await getResponseError(response, "Nao foi possivel salvar a solicitacao."));
      }

      toast.success("Solicitacao criada com sucesso.");
      navigate("/painel/cliente?secao=solicitacoes");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar solicitacao.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <PainelSectionHeader
        eyebrow="Nova solicitacao"
        title="Criar solicitacao"
        description="Preencha os dados do servico que voce precisa para receber propostas de prestadores."
      />

      <section className="painel-card">
        <form className="workspace-form" onSubmit={handleSubmit}>
          <div className="painel-form-grid">
            <label className="form-field">
              <span className="form-label">Tipo de servico</span>
              <div className="form-control">
                {tipoServico ? (
                  <>
                    {(() => {
                      const IconComponent = TIPOS_SERVICO_MAP[tipoServico]?.icone;
                      return IconComponent ? <IconComponent size={16} /> : <Tag size={16} />;
                    })()}
                  </>
                ) : (
                  <Tag size={16} />
                )}
                <select
                  value={tipoServico}
                  onChange={(event) => setTipoServico(event.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {TIPOS_SERVICO.map((tipo) => (
                    <option key={tipo} value={tipo}>{TIPOS_SERVICO_MAP[tipo]?.nome || tipo}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">Faixa de preco</span>
              <div className="form-control">
                <DollarSign size={16} />
                <select
                  value={faixaPreco}
                  onChange={(event) => setFaixaPreco(event.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {FAIXAS_PRECO.map((faixa) => (
                    <option key={faixa.value} value={faixa.value}>{faixa.label}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">CEP</span>
              <div className="form-control">
                {cepStatus === "loading" ? <LoaderCircle className="painel-spin" size={16} /> : <Hash size={16} />}
                <input
                  type="text"
                  value={cep}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  inputMode="numeric"
                  maxLength={9}
                  required
                />
              </div>
              {cepStatus === "not-found" && <span className="painel-cep-feedback">CEP nao encontrado.</span>}
              {cepStatus === "error" && <span className="painel-cep-feedback">Nao foi possivel consultar o CEP.</span>}
            </label>

            <label className="form-field form-field-full">
              <span className="form-label">Rua</span>
              <div className="form-control">
                <MapPin size={16} />
                <input
                  type="text"
                  value={rua}
                  onChange={(event) => setRua(event.target.value)}
                  placeholder="Nome da rua ou avenida"
                  required
                />
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">Numero</span>
              <div className="form-control">
                <input
                  type="text"
                  value={numero}
                  onChange={(event) => setNumero(event.target.value)}
                  placeholder="Ex: 123"
                  required
                />
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">Complemento (opcional)</span>
              <div className="form-control">
                <Home size={16} />
                <input
                  type="text"
                  value={complemento}
                  onChange={(event) => setComplemento(event.target.value)}
                  placeholder="Apto, bloco, casa..."
                />
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">Bairro</span>
              <div className="form-control">
                <Building size={16} />
                <input
                  type="text"
                  value={bairro}
                  onChange={(event) => setBairro(event.target.value)}
                  placeholder="Bairro"
                  required
                />
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">Cidade</span>
              <div className="form-control">
                <input
                  type="text"
                  value={cidade}
                  onChange={(event) => setCidade(event.target.value)}
                  placeholder="Cidade"
                  required
                />
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">Estado</span>
              <div className="form-control">
                <select
                  value={estado}
                  onChange={(event) => setEstado(event.target.value)}
                  required
                >
                  <option value="">UF</option>
                  {ESTADOS_BR.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">Data preferida</span>
              <div className="form-control">
                <Calendar size={16} />
                <input
                  type="date"
                  value={data}
                  onChange={(event) => setData(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">Horario preferido</span>
              <div className="form-control">
                <Clock size={16} />
                <input
                  type="time"
                  value={horario}
                  onChange={(event) => setHorario(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="form-field form-field-full">
              <span className="form-label">Descricao do servico</span>
              <div className="form-control form-control-textarea">
                <FileText size={16} />
                <textarea
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="Descreva com detalhes o que voce precisa para os prestadores enviarem propostas mais precisas."
                  maxLength={600}
                  required
                />
              </div>
              <span className="form-counter">{descricao.length}/600</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isSaving}>
              <PlusCircle size={16} /> {isSaving ? "Enviando..." : "Enviar solicitacao"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

export default CriarSolicitacao;

async function getResponseError(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("json")) {
      const data = (await response.json()) as { detail?: string; message?: string; error?: string };
      return data.detail || data.message || data.error || fallback;
    }

    const text = await response.text();
    return text.trim() || fallback;
  } catch {
    return fallback;
  }
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
