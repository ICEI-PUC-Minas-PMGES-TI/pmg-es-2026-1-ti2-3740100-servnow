import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Image as ImageIcon, Save, User } from "lucide-react";

import { Header } from "../Header/Header";
import { ClientePerfil } from "../../pages/Configurarperfil/Cliente";
import { PrestadorPerfil } from "../../pages/Configurarperfil/Prestador";
import {
  API_URL,
  clearAuthSession,
  getAuthSession,
  type PerfilResponse,
  type PerfilUpdateRequest,
} from "../../services/auth";
import "./Perfil.css";

export type FormState = {
  nome: string;
  rua: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  fotoPerfilBase64: string;
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
  fotoPerfilBase64: "",
  fotoBase64: "",
  descricaoProfissional: "",
  especialidades: [],
};

const MAX_FOTO_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FOTO_BASE64_LENGTH = 190000;

export function Perfil() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const isCliente = session?.tipoUsuario === "CLIENTE";
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
        const endpoint = `${API_URL}/api/perfil/${session.tipoUsuario === "CLIENTE" ? "cliente" : "prestador"}`;
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${session.token}` },
        });

        if (response.status === 401) {
          clearAuthSession();
          toast.error("Sessao expirada. Entre novamente.");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(await getResponseError(response, "Nao foi possivel carregar o perfil."));
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
          fotoPerfilBase64: data.fotoPerfilBase64 ?? "",
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

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

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

  async function handleFotoChange(event: ChangeEvent<HTMLInputElement>, field: "fotoPerfilBase64" | "fotoBase64") {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FOTO_FILE_BYTES) {
      toast.error("A imagem precisa ter no maximo 5 MB.");
      return;
    }

    try {
      const fotoBase64 = await otimizarFoto(file);
      updateField(field, fotoBase64);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel carregar a imagem.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.token) {
      toast.error("Sessao expirou. Entre novamente.");
      navigate("/login");
      return;
    }

    if (!form.nome.trim()) {
      toast.error("O nome e obrigatorio.");
      return;
    }

    setIsSaving(true);

    const payload: PerfilUpdateRequest = session.tipoUsuario === "CLIENTE"
      ? {
          nome: form.nome.trim(),
          rua: form.rua,
          numero: form.numero,
          cep: form.cep,
          bairro: form.bairro,
          cidade: form.cidade,
          estado: form.estado,
          fotoPerfilBase64: form.fotoPerfilBase64,
          fotoBase64: form.fotoBase64,
        }
      : {
          nome: form.nome.trim(),
          fotoPerfilBase64: form.fotoPerfilBase64,
          descricaoProfissional: form.descricaoProfissional,
          especialidades: form.especialidades.join(","),
        };

    try {
      const endpoint = `${API_URL}/api/perfil/${session.tipoUsuario === "CLIENTE" ? "cliente" : "prestador"}`;
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        clearAuthSession();
        toast.error("Sessao expirada. Entre novamente.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(await getResponseError(response, "Nao foi possivel salvar o perfil."));
      }

      toast.success("Perfil atualizado com sucesso.");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar o perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Header onLogout={handleLogout} />

      <div className="workspace-page perfil-page">
        <div className="workspace-container">
          <button type="button" className="workspace-back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Voltar
          </button>

          <header className="workspace-card workspace-header perfil-header">
            <span className="workspace-eyebrow">Configurar perfil</span>
            <h1 className="workspace-title">{isCliente ? "Meu perfil de cliente" : "Meu perfil de prestador"}</h1>
            <p className="workspace-description">
              {isCliente
                ? "Atualize seus dados e o endereco onde voce costuma solicitar servicos."
                : "Mantenha seu perfil profissional atualizado para que mais clientes encontrem voce."}
            </p>
          </header>

          {isLoading ? (
            <div className="workspace-card workspace-loading">Carregando seus dados...</div>
          ) : (
            <form className="workspace-form" onSubmit={handleSubmit}>
              <section className="workspace-card workspace-section">
                <h2>Dados pessoais</h2>

                <label className="form-field form-field-full">
                  <span className="form-label">Nome completo</span>
                  <div className="form-control">
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

                <div className="perfil-upload-group">
                  <div>
                    <h3>Foto de perfil</h3>
                    <p className="workspace-hint">Adicione uma foto para identificar seu perfil na plataforma.</p>
                  </div>

                  <label className="perfil-upload">
                    <ImageIcon size={18} />
                    <span>{form.fotoPerfilBase64 ? "Trocar foto" : "Selecionar foto"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFotoChange(event, "fotoPerfilBase64")}
                    />
                  </label>

                  {form.fotoPerfilBase64 && (
                    <div className="perfil-foto-preview perfil-foto-preview-avatar">
                      <img src={form.fotoPerfilBase64} alt="Pre-visualizacao da foto de perfil" />
                      <button
                        type="button"
                        className="perfil-foto-remover"
                        onClick={() => updateField("fotoPerfilBase64", "")}
                      >
                        Remover foto
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {isCliente ? (
                <ClientePerfil
                  form={form}
                  updateField={updateField}
                  handleFotoChange={(event) => handleFotoChange(event, "fotoBase64")}
                />
              ) : (
                <PrestadorPerfil
                  form={form}
                  updateField={updateField}
                  toggleEspecialidade={toggleEspecialidade}
                />
              )}

              <div className="form-actions perfil-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(-1)}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary perfil-button-primary" disabled={isSaving}>
                  <Save size={16} />
                  {isSaving ? "Salvando..." : "Salvar alteracoes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

async function getResponseError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return data.detail || data.message || fallback;
  } catch {
    return fallback;
  }
}

function carregarImagem(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Arquivo de imagem invalido."));
    };

    image.src = objectUrl;
  });
}

async function otimizarFoto(file: File) {
  const image = await carregarImagem(file);
  const maxSide = 900;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Nao foi possivel processar a imagem.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  for (let quality = 0.82; quality >= 0.45; quality -= 0.08) {
    const result = canvas.toDataURL("image/jpeg", quality);
    if (result.length <= MAX_FOTO_BASE64_LENGTH) {
      return result;
    }
  }

  throw new Error("A imagem ficou grande demais. Tente uma foto menor.");
}

export default Perfil;
