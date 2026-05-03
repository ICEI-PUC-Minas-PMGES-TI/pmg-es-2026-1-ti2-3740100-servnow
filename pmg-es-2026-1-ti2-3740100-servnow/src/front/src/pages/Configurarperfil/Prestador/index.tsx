import type { FormState } from "../../Perfil";

const TIPOS_SERVICO = [
  { value: "ELETRICO", label: "Eletrico" },
  { value: "HIDRAULICO", label: "Hidraulico" },
  { value: "PINTURA", label: "Pintura" },
  { value: "MONTAGEM", label: "Montagem" },
  { value: "LIMPEZA", label: "Limpeza" },
  { value: "MANUTENCAO_GERAL", label: "Manutencao geral" },
];

type PrestadorPerfilProps = {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  toggleEspecialidade: (value: string) => void;
};

export function PrestadorPerfil({
  form,
  updateField,
  toggleEspecialidade,
}: PrestadorPerfilProps) {
  return (
    <>
      <section className="workspace-card workspace-section">
        <h2>Descricao profissional</h2>
        <p className="workspace-hint">Conte sobre sua experiencia e o que voce faz de melhor (ate 500 caracteres).</p>

        <label className="form-field form-field-full">
          <span className="form-label">Sobre voce</span>
          <div className="form-control form-control-textarea">
            <textarea
              rows={6}
              maxLength={500}
              value={form.descricaoProfissional}
              onChange={(event) => updateField("descricaoProfissional", event.target.value)}
              placeholder="Ex: Eletricista com 10 anos de experiencia em residencias e comercios..."
            />
          </div>
          <small className="form-counter">
            {form.descricaoProfissional.length}/500
          </small>
        </label>
      </section>

      <section className="workspace-card workspace-section">
        <h2>Tipos de servico</h2>
        <p className="workspace-hint">Escolha pelo menos uma especialidade que voce atende.</p>

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
  );
}

export default PrestadorPerfil;
