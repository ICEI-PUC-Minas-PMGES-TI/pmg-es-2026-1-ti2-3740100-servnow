import { ArrowLeft, Image as ImageIcon, User } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { ClientePerfil } from "../../pages/Configurarperfil/Cliente";
import { PrestadorPerfil } from "../../pages/Configurarperfil/Prestador";
import {
  PerfilBotaoCancelar,
  PerfilBotaoRemover,
  PerfilBotaoSalvar,
  PerfilBotaoUpload,
} from "./PerfilBotoes";
import {
  criarChavePix,
  criarEnderecoCliente,
  type ChavePixItem,
  type EnderecoClienteItem,
} from "./clienteCadastroTypes";
import {
    API_URL,
    authHeaders,
    clearAuthSession,
    getAuthSession,
    saveAuthSession,
    type ClienteCadastroSyncRequest,
    type PerfilResponse,
    type PerfilUpdateRequest,
} from "../../services/auth";
import { enviarFotoEnderecoCliente, sincronizarCadastrosCliente } from "../../services/clienteCadastro";
import { carregarArquivoAutenticado } from "../../utils/arquivoAutenticado";
import { otimizarImagemParaUpload } from "../../utils/otimizarImagemArquivo";
import { Header } from "../Header/Header";
import "./Perfil.css";

export type FormState = {
  nome: string;
  rua: string;
  numero: string;
  cep: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  fotoPerfilPreview: string | null;
  fotoPerfilPendente: File | null;
  removerFotoPerfil: boolean;
  fotoPerfilAjusteX: string;
  fotoPerfilAjusteY: string;
  fotoPerfilEnquadramento: "cover" | "contain";
  fotoLocalPreview: string | null;
  fotoLocalPendente: File | null;
  removerFotoLocal: boolean;
  descricaoProfissional: string;
  especialidades: string[];
  diasDisponiveis: string[];
  horarioInicio: string;
  horarioFim: string;
  raioAtendimentoKm: string;
  documentoPreview: string | null;
  documentoPendente: File | null;
  documentoEhPdf: boolean;
  removerDocumentoIdentidade: boolean;
  enderecos: EnderecoClienteItem[];
  chavesPix: ChavePixItem[];
};

const initialState: FormState = {
  nome: "",
  rua: "",
  numero: "",
  cep: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  fotoPerfilPreview: null,
  fotoPerfilPendente: null,
  removerFotoPerfil: false,
  fotoPerfilAjusteX: "50",
  fotoPerfilAjusteY: "50",
  fotoPerfilEnquadramento: "cover",
  fotoLocalPreview: null,
  fotoLocalPendente: null,
  removerFotoLocal: false,
  descricaoProfissional: "",
  especialidades: [],
  diasDisponiveis: [],
  horarioInicio: "",
  horarioFim: "",
  raioAtendimentoKm: "",
  documentoPreview: null,
  documentoPendente: null,
  documentoEhPdf: false,
  removerDocumentoIdentidade: false,
  enderecos: [criarEnderecoCliente(true)],
  chavesPix: [],
};

const MAX_FOTO_FILE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENTO_FILE_BYTES = 5 * 1024 * 1024;

export function Perfil() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const isCliente = session?.tipoUsuario === "CLIENTE";
  const [form, setForm] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const descricaoPreenchida = form.descricaoProfissional.trim().length > 0;
  const podeSalvar = isCliente || descricaoPreenchida;

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
          toast.error("Sessão expirada. Entre novamente.");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(await getResponseError(response, "Não foi possível carregar o perfil."));
        }

        const data = (await response.json()) as PerfilResponse;

        let enderecos: EnderecoClienteItem[] = [criarEnderecoCliente(true)];
        let chavesPix: ChavePixItem[] = [];

        if (session.tipoUsuario === "CLIENTE") {
          if (data.enderecos && data.enderecos.length > 0) {
            enderecos = data.enderecos.map((item) => ({
              clientKey: crypto.randomUUID(),
              id: item.id,
              rotulo: item.rotulo ?? "",
              rua: item.rua ?? "",
              numero: item.numero ?? "",
              cep: item.cep ?? "",
              complemento: item.complemento ?? "",
              bairro: item.bairro ?? "",
              cidade: item.cidade ?? "",
              estado: item.estado ?? "",
              fotoPreview: null,
              fotoPendente: null,
              removerFoto: false,
              principal: item.principal,
            }));
          } else if (data.cep) {
            enderecos = [{
              clientKey: crypto.randomUUID(),
              rotulo: "Principal",
              rua: data.rua ?? "",
              numero: data.numero ?? "",
              cep: data.cep ?? "",
              complemento: data.complemento ?? "",
              bairro: data.bairro ?? "",
              cidade: data.cidade ?? "",
              estado: data.estado ?? "",
              fotoPreview: null,
              fotoPendente: null,
              removerFoto: false,
              principal: true,
            }];
          }
        } else {
          chavesPix = data.chavePix
            ? [{ ...criarChavePix(true), chave: data.chavePix, rotulo: "Principal" }]
            : [criarChavePix(true)];
        }

        setForm({
          nome: data.nome ?? "",
          rua: data.rua ?? "",
          numero: data.numero ?? "",
          cep: data.cep ?? "",
          complemento: data.complemento ?? "",
          bairro: data.bairro ?? "",
          cidade: data.cidade ?? "",
          estado: data.estado ?? "",
          fotoPerfilPreview: null,
          fotoPerfilPendente: null,
          removerFotoPerfil: false,
          fotoPerfilAjusteX: String(data.fotoPerfilAjusteX ?? 50),
          fotoPerfilAjusteY: String(data.fotoPerfilAjusteY ?? 50),
          fotoPerfilEnquadramento: data.fotoPerfilEnquadramento ?? "cover",
          fotoLocalPreview: null,
          fotoLocalPendente: null,
          removerFotoLocal: false,
          descricaoProfissional: data.descricaoProfissional ?? "",
          especialidades: data.especialidades
            ? data.especialidades.split(",").map((item) => item.trim()).filter(Boolean)
            : [],
          diasDisponiveis: data.diasDisponiveis
            ? data.diasDisponiveis.split(",").map((item) => item.trim()).filter(Boolean)
            : [],
          horarioInicio: data.horarioInicio ?? "",
          horarioFim: data.horarioFim ?? "",
          raioAtendimentoKm: data.raioAtendimentoKm ? String(data.raioAtendimentoKm) : "",
          documentoPreview: null,
          documentoPendente: null,
          documentoEhPdf: false,
          removerDocumentoIdentidade: false,
          enderecos,
          chavesPix,
        });
        setIsLoading(false);

        void (async () => {
          const fotoPerfilArquivo = data.fotoPerfilUrl
            ? await carregarArquivoAutenticado(data.fotoPerfilUrl, session.token).catch(() => null)
            : null;
          const documentoArquivo =
            session.tipoUsuario === "PRESTADOR" && data.documentoIdentidadeUrl
              ? await carregarArquivoAutenticado(data.documentoIdentidadeUrl, session.token).catch(() => null)
              : null;

          let enderecosComFoto = enderecos;
          if (session.tipoUsuario === "CLIENTE" && data.enderecos && data.enderecos.length > 0) {
            enderecosComFoto = await Promise.all(
              enderecos.map(async (item, index) => {
                const origem = data.enderecos?.[index];
                if (!origem?.fotoUrl) return item;
                const foto = await carregarArquivoAutenticado(origem.fotoUrl, session.token).catch(() => null);
                return foto ? { ...item, fotoPreview: foto.url } : item;
              }),
            );
          } else if (session.tipoUsuario === "CLIENTE" && data.fotoLocalUrl && enderecos.length === 1 && !enderecos[0].id) {
            const fotoLocal = await carregarArquivoAutenticado(data.fotoLocalUrl, session.token).catch(() => null);
            if (fotoLocal) {
              enderecosComFoto = [{ ...enderecos[0], fotoPreview: fotoLocal.url }];
            }
          }

          setForm((current) => ({
            ...current,
            fotoPerfilPreview: fotoPerfilArquivo?.url ?? current.fotoPerfilPreview,
            documentoPreview: documentoArquivo?.url ?? current.documentoPreview,
            documentoEhPdf: documentoArquivo?.mimeType === "application/pdf",
            enderecos: enderecosComFoto,
          }));
        })();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar perfil.");
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

  function toggleDiaDisponivel(value: string) {
    setForm((current) => {
      const exists = current.diasDisponiveis.includes(value);
      return {
        ...current,
        diasDisponiveis: exists
          ? current.diasDisponiveis.filter((item) => item !== value)
          : [...current.diasDisponiveis, value],
      };
    });
  }

  function revogarPreview(preview: string | null) {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
  }

  async function handleFotoPerfilChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FOTO_FILE_BYTES) {
      toast.error("A imagem precisa ter no máximo 5 MB.");
      return;
    }

    try {
      const otimizado = await otimizarImagemParaUpload(file);
      setForm((current) => {
        revogarPreview(current.fotoPerfilPreview);
        return {
          ...current,
          fotoPerfilPendente: otimizado,
          fotoPerfilPreview: URL.createObjectURL(otimizado),
          removerFotoPerfil: false,
          fotoPerfilAjusteX: "50",
          fotoPerfilAjusteY: "50",
          fotoPerfilEnquadramento: "cover",
        };
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar a imagem.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleFotoEnderecoChange(clientKey: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FOTO_FILE_BYTES) {
      toast.error("A imagem precisa ter no máximo 5 MB.");
      return;
    }

    try {
      const otimizado = await otimizarImagemParaUpload(file);
      setForm((current) => ({
        ...current,
        enderecos: current.enderecos.map((item) => {
          if (item.clientKey !== clientKey) return item;
          if (item.fotoPreview?.startsWith("blob:")) {
            URL.revokeObjectURL(item.fotoPreview);
          }
          return {
            ...item,
            fotoPendente: otimizado,
            fotoPreview: URL.createObjectURL(otimizado),
            removerFoto: false,
          };
        }),
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar a imagem.");
    } finally {
      event.target.value = "";
    }
  }

  function removerFotoPerfil() {
    setForm((current) => {
      revogarPreview(current.fotoPerfilPreview);
      return {
        ...current,
        fotoPerfilPreview: null,
        fotoPerfilPendente: null,
        removerFotoPerfil: true,
      };
    });
  }

  async function handleDocumentoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const isValidType = file.type === "application/pdf" || file.type.startsWith("image/");

    if (!isValidType) {
      toast.error("O documento precisa ser PDF ou imagem.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_DOCUMENTO_FILE_BYTES) {
      toast.error("O documento precisa ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    setForm((current) => {
      revogarPreview(current.documentoPreview);
      return {
        ...current,
        documentoPendente: file,
        documentoPreview: URL.createObjectURL(file),
        documentoEhPdf: file.type === "application/pdf",
        removerDocumentoIdentidade: false,
      };
    });
    event.target.value = "";
  }

  function removerDocumentoIdentidade() {
    setForm((current) => {
      revogarPreview(current.documentoPreview);
      return {
        ...current,
        documentoPreview: null,
        documentoPendente: null,
        documentoEhPdf: false,
        removerDocumentoIdentidade: true,
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.token) {
      toast.error("Sessao expirou. Entre novamente.");
      navigate("/login");
      return;
    }

    if (!form.nome.trim()) {
      toast.error("O nome e obrigatório.");
      return;
    }

    if (session.tipoUsuario === "CLIENTE") {
      if (!validarCadastrosCliente(form)) {
        return;
      }
    } else if (!validarEndereco(form)) {
      return;
    }

    if (session.tipoUsuario === "PRESTADOR" && !validarPerfilPrestador(form)) {
      return;
    }

    setIsSaving(true);

    const payload: PerfilUpdateRequest = session.tipoUsuario === "CLIENTE"
      ? {
          nome: form.nome.trim(),
          fotoPerfilAjusteX: Number(form.fotoPerfilAjusteX),
          fotoPerfilAjusteY: Number(form.fotoPerfilAjusteY),
          fotoPerfilEnquadramento: form.fotoPerfilEnquadramento,
          removerFotoPerfil: form.removerFotoPerfil,
        }
      : {
          nome: form.nome.trim(),
          rua: form.rua,
          numero: form.numero,
          cep: form.cep,
          complemento: form.complemento,
          bairro: form.bairro,
          cidade: form.cidade,
          estado: form.estado,
          fotoPerfilAjusteX: Number(form.fotoPerfilAjusteX),
          fotoPerfilAjusteY: Number(form.fotoPerfilAjusteY),
          fotoPerfilEnquadramento: form.fotoPerfilEnquadramento,
          removerFotoPerfil: form.removerFotoPerfil,
          descricaoProfissional: form.descricaoProfissional,
          especialidades: form.especialidades.join(","),
          diasDisponiveis: form.diasDisponiveis.join(","),
          horarioInicio: form.horarioInicio,
          horarioFim: form.horarioFim,
          raioAtendimentoKm: Number(form.raioAtendimentoKm),
          removerDocumentoIdentidade: form.removerDocumentoIdentidade,
          chavePix: resolverChavePixPrincipal(form.chavesPix),
        };

    const formData = new FormData();
    formData.append("dados", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    if (form.fotoPerfilPendente) {
      formData.append("fotoPerfil", form.fotoPerfilPendente);
    }
    if (session.tipoUsuario === "PRESTADOR" && form.documentoPendente) {
      formData.append("documentoIdentidade", form.documentoPendente);
    }

    try {
      const endpoint = `${API_URL}/api/perfil/${session.tipoUsuario === "CLIENTE" ? "cliente" : "prestador"}`;
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: authHeaders(session.token),
        body: formData,
      });

      if (response.status === 401) {
        clearAuthSession();
        toast.error("Sessão expirada. Entre novamente.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(await getResponseError(response, "Não foi possível salvar o perfil."));
      }

      let perfilAtualizado = (await response.json()) as PerfilResponse;

      if (session.tipoUsuario === "CLIENTE") {
        const cadastrosPayload: ClienteCadastroSyncRequest = {
          enderecos: form.enderecos.map((item) => ({
            id: item.id,
            rotulo: item.rotulo || undefined,
            rua: item.rua.trim(),
            numero: item.numero.trim(),
            cep: item.cep,
            complemento: item.complemento || undefined,
            bairro: item.bairro.trim(),
            cidade: item.cidade.trim(),
            estado: item.estado.trim(),
            principal: item.principal,
            removerFoto: item.removerFoto,
          })),
          chavesPix: [],
        };

        for (const item of form.enderecos) {
          if (item.id && item.fotoPendente) {
            await enviarFotoEnderecoCliente(session.token, item.id, item.fotoPendente);
          }
        }

        perfilAtualizado = await sincronizarCadastrosCliente(session.token, cadastrosPayload);

        for (const item of form.enderecos) {
          if (item.fotoPendente && !item.id) {
            const salvo = perfilAtualizado.enderecos?.find(
              (e) =>
                e.rua === item.rua.trim() &&
                e.numero === item.numero.trim() &&
                e.cep.replace(/\D/g, "") === item.cep.replace(/\D/g, ""),
            );
            if (salvo?.id) {
              await enviarFotoEnderecoCliente(session.token, salvo.id, item.fotoPendente);
            }
          }
        }
      }

      saveAuthSession({
        ...session,
        nome: perfilAtualizado.nome,
        email: perfilAtualizado.email,
        fotoPerfilUrl: perfilAtualizado.fotoPerfilUrl,
        fotoPerfilAjusteX: perfilAtualizado.fotoPerfilAjusteX,
        fotoPerfilAjusteY: perfilAtualizado.fotoPerfilAjusteY,
        fotoPerfilEnquadramento: perfilAtualizado.fotoPerfilEnquadramento,
      });
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
                ? "Atualize seus dados e o Endereço onde você costuma solicitar serviços."
                : "Atualize seu perfil profissional e o Endereço da sua base para calcular distâncias até as solicitações."}
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

                  <PerfilBotaoUpload
                    icone={<ImageIcon size={18} />}
                    texto={form.fotoPerfilPreview ? "Trocar foto" : "Selecionar foto"}
                    accept="image/*"
                    onChange={handleFotoPerfilChange}
                  />

                  {form.fotoPerfilPreview && (
                    <>
                      <div className="perfil-logo-editor">
                        <div className="perfil-logo-preview">
                          <img
                            src={form.fotoPerfilPreview}
                            alt="Pré-visualização da foto de perfil"
                            style={{
                              objectFit: form.fotoPerfilEnquadramento,
                              objectPosition: `${form.fotoPerfilAjusteX}% ${form.fotoPerfilAjusteY}%`,
                            }}
                          />
                        </div>

                        <div className="perfil-logo-controls">
                          <label className="perfil-logo-control">
                            <span>Enquadramento</span>
                            <select
                              value={form.fotoPerfilEnquadramento}
                              onChange={(event) => updateField(
                                "fotoPerfilEnquadramento",
                                event.target.value as FormState["fotoPerfilEnquadramento"],
                              )}
                            >
                              <option value="cover">Preencher</option>
                              <option value="contain">Mostrar inteira</option>
                            </select>
                          </label>

                          <label className="perfil-logo-control">
                            <span>Horizontal</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={form.fotoPerfilAjusteX}
                              onChange={(event) => updateField("fotoPerfilAjusteX", event.target.value)}
                            />
                          </label>

                          <label className="perfil-logo-control">
                            <span>Vertical</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={form.fotoPerfilAjusteY}
                              onChange={(event) => updateField("fotoPerfilAjusteY", event.target.value)}
                            />
                          </label>
                        </div>
                      </div>

                      <PerfilBotaoRemover onClick={removerFotoPerfil}>
                        Remover foto
                      </PerfilBotaoRemover>
                    </>
                  )}
                </div>
              </section>

              {isCliente ? (
                <ClientePerfil
                  enderecos={form.enderecos}
                  onEnderecosChange={(enderecos) => setForm((current) => ({ ...current, enderecos }))}
                  onFotoEnderecoChange={handleFotoEnderecoChange}
                />
              ) : (
                <PrestadorPerfil
                  form={form}
                  chavesPix={form.chavesPix}
                  updateField={updateField}
                  onChavesPixChange={(chavesPix) => setForm((current) => ({ ...current, chavesPix }))}
                  toggleEspecialidade={toggleEspecialidade}
                  toggleDiaDisponivel={toggleDiaDisponivel}
                  handleDocumentoChange={handleDocumentoChange}
                  removerDocumento={removerDocumentoIdentidade}
                />
              )}

              <div className="form-actions perfil-actions">
                <PerfilBotaoCancelar onClick={() => navigate(-1)} disabled={isSaving} />
                <PerfilBotaoSalvar
                  disabled={isSaving || !podeSalvar}
                  loading={isSaving}
                  title={!podeSalvar ? "Preencha a descrição profissional para salvar." : undefined}
                />
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

function validarCadastrosCliente(form: FormState) {
  if (form.enderecos.length === 0) {
    toast.error("Cadastre pelo menos um Endereço.");
    return false;
  }

  const principaisEndereco = form.enderecos.filter((item) => item.principal).length;
  if (principaisEndereco !== 1) {
    toast.error("Selecione exatamente um Endereço principal.");
    return false;
  }

  for (const [indice, item] of form.enderecos.entries()) {
    const cep = item.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      toast.error(`Endereco ${indice + 1}: informe um CEP válido.`);
      return false;
    }
    if (!item.rua.trim() || !item.numero.trim() || !item.bairro.trim() || !item.cidade.trim() || !item.estado.trim()) {
      toast.error(`Endereco ${indice + 1}: preencha rua, número, bairro, cidade e estado.`);
      return false;
    }
  }

  return true;
}

function validarEndereco(form: FormState) {
  const cep = form.cep.replace(/\D/g, "");
  if (cep.length !== 8) {
    toast.error("Informe um CEP válido com 8 dígitos.");
    return false;
  }
  if (!form.rua.trim() || !form.numero.trim() || !form.bairro.trim() || !form.cidade.trim() || !form.estado.trim()) {
    toast.error("Preencha rua, número, bairro, cidade e estado.");
    return false;
  }
  return true;
}

function validarPerfilPrestador(form: FormState) {
  if (!form.descricaoProfissional.trim()) {
    toast.error("Preencha a descrição profissional para salvar o perfil.");
    return false;
  }

  if (form.especialidades.length === 0) {
    toast.error("Escolha pelo menos um tipo de serviço.");
    return false;
  }

  if (form.diasDisponiveis.length === 0) {
    toast.error("Selecione pelo menos um dia disponível.");
    return false;
  }

  if (!form.horarioInicio || !form.horarioFim || form.horarioInicio >= form.horarioFim) {
    toast.error("Informe um horário de Início anterior ao horário de fim.");
    return false;
  }

  const raio = Number(form.raioAtendimentoKm);
  if (!Number.isInteger(raio) || raio < 1 || raio > 30) {
    toast.error("O raio de atendimento deve estar entre 1 e 30 km.");
    return false;
  }

  if (!form.documentoPendente && !form.documentoPreview) {
    toast.error("Envie seu documento de identidade.");
    return false;
  }

  const chavePix = resolverChavePixPrincipal(form.chavesPix);
  if (!chavePix) {
    toast.error("Cadastre uma chave PIX para receber pagamentos.");
    return false;
  }

  const chavesPreenchidas = form.chavesPix.filter((item) => item.chave.trim());
  if (chavesPreenchidas.filter((item) => item.principal).length !== 1) {
    toast.error("Selecione exatamente uma chave PIX principal.");
    return false;
  }

  return true;
}

function resolverChavePixPrincipal(chavesPix: ChavePixItem[]): string | null {
  const preenchidas = chavesPix.filter((item) => item.chave.trim());
  if (preenchidas.length === 0) {
    return null;
  }
  const principal = preenchidas.find((item) => item.principal) ?? preenchidas[0];
  return principal.chave.trim();
}

export default Perfil;
