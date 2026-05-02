import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Building,
  Hash,
  Image as ImageIcon,
  MapPin,
  Save,
  User,
} from "lucide-react";

import { Header } from "../../Components/Header/Header";
import {
  API_URL,
  clearAuthSession,
  getAuthSession,
  type PerfilResponse,
  type PerfilUpdateRequest,
} from "../../services/auth";
import "./Perfil.css";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const TIPOS_SERVICO = [
  { value: "ELETRICO", label: "Elétrico" },
  { value: "HIDRAULICO", label: "Hidráulico" },
  { value: "PINTURA", label: "Pintura" },
  { value: "MONTAGEM", label: "Montagem" },
  { value: "LIMPEZA", label: "Limpeza" },
  { value: "MANUTENCAO_GERAL", label: "Manutenção geral" },
];

type FormState = {
  nome: string;
  rua: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  fotoBase64: string;
  descricaoProfissional: string;
  especialidades: string[];
};

const initialState: FormState = {
  nome: "",
  rua: "",
  numero: "",
  cep: "",
  bairro: "",
  cidade: "",
  estado: "",
  fotoBase64: "",
  descricaoProfissional: "",
  especialidades: [],
};

export function Perfil() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const [form, setForm] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function carregarPerfil() {
      if (!session?.token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/perfil`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar o perfil.");
        }

        const data = (await response.json()) as PerfilResponse;
        setForm({
          nome: data.nome ?? "",
          rua: data.rua ?? "",
          numero: data.numero ?? "",
          cep: data.cep ?? "",
          bairro: data.bairro ?? "",
          cidade: data.cidade ?? "",
          estado: data.estado ?? "",
          fotoBase64: data.fotoBase64 ?? "",
          descricaoProfissional: data.descricaoProfissional ?? "",
          especialidades: data.especialidades
            ? data.especialidades.split(",").map((item) => item.trim()).filter(Boolean)
            : [],
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar perfil.");
      } finally {
        setIsLoading(false);
      }
    }

    void carregarPerfil();
  }, [session?.token, navigate]);

  function handleLogout() {
    clearAuthSession();
    navigate("/login");
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleEspecialidade(value: string) {
    setForm((current) => {
      const exists = current.especialidades.includes(value);
      return {
        ...current,
        especialidades: exists
          ? current.especialidades.filter((item) => item !== value)
          : [...current.especialidades, value],
      };
    });
  }

  function handleFotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem precisa ter no máximo 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      updateField("fotoBase64", result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.token) {
      toast.error("Sessão expirou. Entre novamente.");
      navigate("/login");
      return;
    }

    if (!form.nome.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    setIsSaving(true);

    const payload: PerfilUpdateRequest = {
      nome: form.nome.trim(),
      rua: form.rua,
      numero: form.numero,
      cep: form.cep,
      bairro: form.bairro,
      cidade: form.cidade,
      estado: form.estado,
      fotoBase64: form.fotoBase64,
      descricaoProfissional: form.descricaoProfissional,
      especialidades: form.especialidades.join(","),
    };

    try {
      const response = await fetch(`${API_URL}/api/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { detail?: string };
        throw new Error(data.detail || "Não foi possível salvar o perfil.");
      }

      toast.success("Perfil atualizado com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar o perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!session) {
    return null;
  }

  const isCliente = session.tipoUsuario === "CLIENTE";

  return (
    <>
      <Header onLogout={handleLogout} />

      <div className="perfil-page">
        <div className="perfil-container">
          <button type="button" className="perfil-voltar" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Voltar
          </button>

          <header className="perfil-header">
            <span className="perfil-eyebrow">Configurar perfil</span>
            <h1>{isCliente ? "Meu perfil de cliente" : "Meu perfil de prestador"}</h1>
            <p>
              {isCliente
                ? "Atualize seus dados e o endereço onde você costuma solicitar serviços."
                : "Mantenha seu perfil profissional atualizado para que mais clientes encontrem você."}
            </p>
          </header>

          {isLoading ? (
            <div className="perfil-loading">Carregando seus dados...</div>
          ) : (
            <form className="perfil-form" onSubmit={handleSubmit}>
              <section className="perfil-section">
                <h2>Dados pessoais</h2>

                <label className="perfil-field perfil-field-full">
                  <span>Nome completo</span>
                  <div className="perfil-input">
                    <User size={16} />
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(event) => updateField("nome", event.target.value)}
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                </label>
              </section>

              {isCliente ? (
                <>
                  <section className="perfil-section">
                    <h2>Endereço</h2>

                    <div className="perfil-grid">
                      <label className="perfil-field">
                        <span>CEP</span>
                        <div className="perfil-input">
                          <Hash size={16} />
                          <input
                            type="text"
                            value={form.cep}
                            onChange={(event) => updateField("cep", event.target.value)}
                            placeholder="00000-000"
                          />
                        </div>
                      </label>

                      <label className="perfil-field perfil-field-wide">
                        <span>Rua</span>
                        <div className="perfil-input">
                          <MapPin size={16} />
                          <input
                            type="text"
                            value={form.rua}
                            onChange={(event) => updateField("rua", event.target.value)}
                            placeholder="Nome da rua ou avenida"
                          />
                        </div>
                      </label>

                      <label className="perfil-field">
                        <span>Número</span>
                        <div className="perfil-input">
                          <input
                            type="text"
                            value={form.numero}
                            onChange={(event) => updateField("numero", event.target.value)}
                            placeholder="Ex: 123"
                          />
                        </div>
                      </label>

                      <label className="perfil-field">
                        <span>Bairro</span>
                        <div className="perfil-input">
                          <Building size={16} />
                          <input
                            type="text"
                            value={form.bairro}
                            onChange={(event) => updateField("bairro", event.target.value)}
                            placeholder="Bairro"
                          />
                        </div>
                      </label>

                      <label className="perfil-field">
                        <span>Cidade</span>
                        <div className="perfil-input">
                          <input
                            type="text"
                            value={form.cidade}
                            onChange={(event) => updateField("cidade", event.target.value)}
                            placeholder="Cidade"
                          />
                        </div>
                      </label>

                      <label className="perfil-field">
                        <span>Estado</span>
                        <div className="perfil-input">
                          <select
                            value={form.estado}
                            onChange={(event) => updateField("estado", event.target.value)}
                          >
                            <option value="">UF</option>
                            {ESTADOS_BR.map((uf) => (
                              <option key={uf} value={uf}>{uf}</option>
                            ))}
                          </select>
                        </div>
                      </label>
                    </div>
                  </section>

                  <section className="perfil-section">
                    <h2>Foto do local</h2>
                    <p className="perfil-hint">Adicione uma foto do imóvel para que o prestador encontre o local com facilidade.</p>

                    <label className="perfil-upload">
                      <ImageIcon size={18} />
                      <span>{form.fotoBase64 ? "Trocar foto" : "Selecionar foto"}</span>
                      <input type="file" accept="image/*" onChange={handleFotoChange} />
                    </label>

                    {form.fotoBase64 && (
                      <div className="perfil-foto-preview">
                        <img src={form.fotoBase64} alt="Pré-visualização do local" />
                        <button
                          type="button"
                          className="perfil-foto-remover"
                          onClick={() => updateField("fotoBase64", "")}
                        >
                          Remover foto
                        </button>
                      </div>
                    )}
                  </section>
                </>
              ) : (
                <>
                  <section className="perfil-section">
                    <h2>Descrição profissional</h2>
                    <p className="perfil-hint">Conte sobre sua experiência e o que você faz de melhor (até 500 caracteres).</p>

                    <label className="perfil-field perfil-field-full">
                      <span>Sobre você</span>
                      <div className="perfil-input perfil-input-textarea">
                        <textarea
                          rows={6}
                          maxLength={500}
                          value={form.descricaoProfissional}
                          onChange={(event) => updateField("descricaoProfissional", event.target.value)}
                          placeholder="Ex: Eletricista com 10 anos de experiência em residências e comércios..."
                        />
                      </div>
                      <small className="perfil-counter">
                        {form.descricaoProfissional.length}/500
                      </small>
                    </label>
                  </section>

                  <section className="perfil-section">
                    <h2>Tipos de serviço</h2>
                    <p className="perfil-hint">Escolha pelo menos uma especialidade que você atende.</p>

                    <div className="perfil-checkboxes">
                      {TIPOS_SERVICO.map((tipo) => {
                        const ativo = form.especialidades.includes(tipo.value);
                        return (
                          <button
                            type="button"
                            key={tipo.value}
                            className={`perfil-tag ${ativo ? "ativo" : ""}`}
                            onClick={() => toggleEspecialidade(tipo.value)}
                          >
                            {tipo.label}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              <div className="perfil-actions">
                <button
                  type="button"
                  className="perfil-button-secondary"
                  onClick={() => navigate(-1)}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button type="submit" className="perfil-button-primary" disabled={isSaving}>
                  <Save size={16} />
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default Perfil;
