import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Building, Hash, Home, LoaderCircle, MapPin } from "lucide-react";

import type { FormState } from "./index";

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

type EnderecoPerfilSectionProps = {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  hint?: string;
};

export function EnderecoPerfilSection({ form, updateField, hint }: EnderecoPerfilSectionProps) {
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "found" | "not-found" | "error">("idle");
  const cepDigits = onlyDigits(form.cep);

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

        updateField("cep", data.cep ?? formatCep(cepDigits));
        updateField("rua", data.logradouro ?? "");
        updateField("bairro", data.bairro ?? "");
        updateField("cidade", data.localidade ?? "");
        updateField("estado", data.uf ?? "");
        setCepStatus("found");
      } catch {
        if (!controller.signal.aborted) {
          setCepStatus("error");
        }
      }
    }

    void buscarEnderecoPorCep();

    return () => controller.abort();
  }, [cepDigits, updateField]);

  function handleCepChange(event: ChangeEvent<HTMLInputElement>) {
    updateField("cep", formatCep(event.target.value));
  }

  return (
    <section className="workspace-card workspace-section">
      <h2>Endereco</h2>
      {hint && <p className="workspace-hint">{hint}</p>}

      <div className="perfil-grid">
        <label className="form-field perfil-field-cep">
          <span className="form-label">CEP</span>
          <div className="form-control">
            {cepStatus === "loading" ? <LoaderCircle className="perfil-spin" size={16} /> : <Hash size={16} />}
            <input
              type="text"
              value={form.cep}
              onChange={handleCepChange}
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
            />
          </div>
          {cepStatus === "not-found" && <span className="perfil-cep-feedback">CEP nao encontrado.</span>}
          {cepStatus === "error" && <span className="perfil-cep-feedback">Nao foi possivel consultar o CEP.</span>}
        </label>

        <label className="form-field perfil-field-wide">
          <span className="form-label">Rua</span>
          <div className="form-control">
            <MapPin size={16} />
            <input
              type="text"
              value={form.rua}
              onChange={(event) => updateField("rua", event.target.value)}
              placeholder="Nome da rua ou avenida"
            />
          </div>
        </label>

        <label className="form-field">
          <span className="form-label">Numero</span>
          <div className="form-control">
            <input
              type="text"
              value={form.numero}
              onChange={(event) => updateField("numero", event.target.value)}
              placeholder="Ex: 123"
            />
          </div>
        </label>

        <label className="form-field">
          <span className="form-label">Complemento (opcional)</span>
          <div className="form-control">
            <Home size={16} />
            <input
              type="text"
              value={form.complemento}
              onChange={(event) => updateField("complemento", event.target.value)}
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
              value={form.bairro}
              onChange={(event) => updateField("bairro", event.target.value)}
              placeholder="Bairro"
            />
          </div>
        </label>

        <label className="form-field">
          <span className="form-label">Cidade</span>
          <div className="form-control">
            <input
              type="text"
              value={form.cidade}
              onChange={(event) => updateField("cidade", event.target.value)}
              placeholder="Cidade"
            />
          </div>
        </label>

        <label className="form-field">
          <span className="form-label">Estado</span>
          <div className="form-control">
            <select value={form.estado} onChange={(event) => updateField("estado", event.target.value)}>
              <option value="">UF</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>
    </section>
  );
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
