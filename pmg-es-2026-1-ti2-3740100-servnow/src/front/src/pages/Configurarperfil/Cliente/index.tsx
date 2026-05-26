import type { ChangeEvent } from "react";
import { Image as ImageIcon } from "lucide-react";

import type { FormState } from "../../../Components/Perfil";
import { EnderecoPerfilSection } from "../../../Components/Perfil/EnderecoPerfilSection";

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
      <EnderecoPerfilSection
        form={form}
        updateField={updateField}
        hint="Endereco onde voce costuma solicitar servicos."
      />

      <section className="workspace-card workspace-section">
        <h2>Foto do local</h2>
        <p className="workspace-hint">Adicione uma foto do imovel para que o prestador encontre o local com facilidade.</p>

        <label className="home-button home-button-primary perfil-upload">
          <ImageIcon size={18} />
          <span>{form.fotoLocalPreview ? "Trocar foto" : "Selecionar foto"}</span>
          <input type="file" accept="image/*" onChange={handleFotoChange} />
        </label>

        {form.fotoLocalPreview && (
          <div className="perfil-foto-preview">
            <img src={form.fotoLocalPreview} alt="Pre-visualizacao do local" />
            <button
              type="button"
              className="perfil-foto-remover"
              onClick={() => {
                if (form.fotoLocalPreview?.startsWith("blob:")) {
                  URL.revokeObjectURL(form.fotoLocalPreview);
                }
                updateField("fotoLocalPreview", null);
                updateField("fotoLocalPendente", null);
                updateField("removerFotoLocal", true);
              }}
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
