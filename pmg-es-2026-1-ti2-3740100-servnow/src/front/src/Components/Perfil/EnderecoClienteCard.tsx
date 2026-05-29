import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Building, Hash, Home, Image as ImageIcon, LoaderCircle, MapPin, Trash2 } from "lucide-react";

import type { EnderecoClienteItem } from "./clienteCadastroTypes";

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

type EnderecoClienteCardProps = {
  endereco: EnderecoClienteItem;
  indice: number;
  podeRemover: boolean;
  onChange: (atualizado: EnderecoClienteItem) => void;
  onRemover: () => void;
  onSelecionarPrincipal: () => void;
  onFotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function EnderecoClienteCard({
  endereco,
  indice,
  podeRemover,
  onChange,
  onRemover,
  onSelecionarPrincipal,
  onFotoChange,
}: EnderecoClienteCardProps) {
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "found" | "not-found" | "error">("idle");
  const cepDigits = onlyDigits(endereco.cep);

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
        if (!response.ok) throw new Error("erro");
        const data = (await response.json()) as ViaCepResponse;
        if (data.erro) {
          setCepStatus("not-found");
          return;
        }
        onChange({
          ...endereco,
          cep: data.cep ?? formatCep(cepDigits),
          rua: data.logradouro ?? endereco.rua,
          bairro: data.bairro ?? endereco.bairro,
          cidade: data.localidade ?? endereco.cidade,
          estado: data.uf ?? endereco.estado,
        });
        setCepStatus("found");
      } catch {
        if (!controller.signal.aborted) setCepStatus("error");
      }
    }

    void buscarEnderecoPorCep();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepDigits]);

  function patch(partial: Partial<EnderecoClienteItem>) {
    onChange({ ...endereco, ...partial });
  }

  return (
    <article className={`perfil-endereco-card${endereco.principal ? " perfil-endereco-card--principal" : ""}`}>
      <div className="perfil-endereco-card-topo">
        <label className="perfil-endereco-principal">
          <input
            type="radio"
            name="endereco-principal"
            checked={endereco.principal}
            onChange={onSelecionarPrincipal}
          />
          <span>Usar este endereco</span>
        </label>
        {podeRemover && (
          <button type="button" className="perfil-endereco-remover" onClick={onRemover}>
            <Trash2 size={16} />
            Remover
          </button>
        )}
      </div>

      <p className="perfil-endereco-indice">Endereco {indice + 1}</p>

      <div className="perfil-grid">
        <label className="form-field perfil-field-wide">
          <span className="form-label">Apelido (opcional)</span>
          <div className="form-control">
            <Home size={16} />
            <input
              type="text"
              value={endereco.rotulo}
              onChange={(e) => patch({ rotulo: e.target.value })}
              placeholder="Ex: Casa, Trabalho"
            />
          </div>
        </label>

        <label className="form-field perfil-field-cep">
          <span className="form-label">CEP</span>
          <div className="form-control">
            {cepStatus === "loading" ? <LoaderCircle className="perfil-spin" size={16} /> : <Hash size={16} />}
            <input
              type="text"
              value={endereco.cep}
              onChange={(e) => patch({ cep: formatCep(e.target.value) })}
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
            />
          </div>
        </label>

        <label className="form-field perfil-field-wide">
          <span className="form-label">Rua</span>
          <div className="form-control">
            <MapPin size={16} />
            <input
              type="text"
              value={endereco.rua}
              onChange={(e) => patch({ rua: e.target.value })}
              placeholder="Nome da rua"
            />
          </div>
        </label>

        <label className="form-field">
          <span className="form-label">Numero</span>
          <div className="form-control">
            <input
              type="text"
              value={endereco.numero}
              onChange={(e) => patch({ numero: e.target.value })}
              placeholder="123"
            />
          </div>
        </label>

        <label className="form-field">
          <span className="form-label">Complemento</span>
          <div className="form-control">
            <input
              type="text"
              value={endereco.complemento}
              onChange={(e) => patch({ complemento: e.target.value })}
              placeholder="Apto, bloco..."
            />
          </div>
        </label>

        <label className="form-field">
          <span className="form-label">Bairro</span>
          <div className="form-control">
            <Building size={16} />
            <input
              type="text"
              value={endereco.bairro}
              onChange={(e) => patch({ bairro: e.target.value })}
            />
          </div>
        </label>

        <label className="form-field">
          <span className="form-label">Cidade</span>
          <div className="form-control">
            <input
              type="text"
              value={endereco.cidade}
              onChange={(e) => patch({ cidade: e.target.value })}
            />
          </div>
        </label>

        <label className="form-field">
          <span className="form-label">Estado</span>
          <div className="form-control">
            <select value={endereco.estado} onChange={(e) => patch({ estado: e.target.value })}>
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

      <div className="perfil-endereco-foto">
        <h3>Foto do local</h3>
        <p className="workspace-hint">Ajuda o prestador a encontrar o imovel neste endereco.</p>
        <label className="home-button home-button-primary perfil-upload">
          <ImageIcon size={18} />
          <span>{endereco.fotoPreview ? "Trocar foto" : "Selecionar foto"}</span>
          <input type="file" accept="image/*" onChange={onFotoChange} />
        </label>
        {endereco.fotoPreview && (
          <div className="perfil-foto-preview">
            <img src={endereco.fotoPreview} alt="Foto do local" />
            <button
              type="button"
              className="perfil-foto-remover"
              onClick={() => {
                if (endereco.fotoPreview?.startsWith("blob:")) {
                  URL.revokeObjectURL(endereco.fotoPreview);
                }
                patch({ fotoPreview: null, fotoPendente: null, removerFoto: true });
              }}
            >
              Remover foto
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
