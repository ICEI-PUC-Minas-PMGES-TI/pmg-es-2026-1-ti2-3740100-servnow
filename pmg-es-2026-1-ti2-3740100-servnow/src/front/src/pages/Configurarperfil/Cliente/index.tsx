import type { ChangeEvent } from "react";
import { Building, Hash, Image as ImageIcon, MapPin } from "lucide-react";

import type { FormState } from "../../Perfil";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type ClientePerfilProps = {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  handleFotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ClientePerfil({
  form,
  updateField,
  handleFotoChange,
}: ClientePerfilProps) {
  return (
    <>
      <section className="workspace-card workspace-section">
        <h2>Endereco</h2>

        <div className="perfil-grid">
          <label className="form-field">
            <span className="form-label">CEP</span>
            <div className="form-control">
              <Hash size={16} />
              <input
                type="text"
                value={form.cep}
                onChange={(event) => updateField("cep", event.target.value)}
                placeholder="00000-000"
              />
            </div>
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

      <section className="workspace-card workspace-section">
        <h2>Foto do local</h2>
        <p className="workspace-hint">Adicione uma foto do imovel para que o prestador encontre o local com facilidade.</p>

        <label className="perfil-upload">
          <ImageIcon size={18} />
          <span>{form.fotoBase64 ? "Trocar foto" : "Selecionar foto"}</span>
          <input type="file" accept="image/*" onChange={handleFotoChange} />
        </label>

        {form.fotoBase64 && (
          <div className="perfil-foto-preview">
            <img src={form.fotoBase64} alt="Pre-visualizacao do local" />
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
  );
}

export default ClientePerfil;
