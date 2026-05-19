import type { ChangeEvent } from "react";
import { Clock, FileText, MapPin } from "lucide-react";

import type { FormState } from "../../../Components/Perfil";

const TIPOS_SERVICO = [
  { value: "ELETRICO", label: "Eletrico" },
  { value: "HIDRAULICO", label: "Hidraulico" },
  { value: "PINTURA", label: "Pintura" },
  { value: "MONTAGEM", label: "Montagem" },
  { value: "LIMPEZA", label: "Limpeza" },
  { value: "MANUTENCAO_GERAL", label: "Manutencao geral" },
];

const DIAS_SEMANA = [
  { value: "SEGUNDA", label: "Segunda" },
  { value: "TERCA", label: "Terca" },
  { value: "QUARTA", label: "Quarta" },
  { value: "QUINTA", label: "Quinta" },
  { value: "SEXTA", label: "Sexta" },
  { value: "SABADO", label: "Sabado" },
  { value: "DOMINGO", label: "Domingo" },
];

type PrestadorPerfilProps = {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  toggleEspecialidade: (value: string) => void;
  toggleDiaDisponivel: (value: string) => void;
  handleDocumentoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  removerDocumento: () => void;
};

export function PrestadorPerfil({
  form,
  updateField,
  toggleEspecialidade,
  toggleDiaDisponivel,
  handleDocumentoChange,
  removerDocumento,
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

      <section className="workspace-card workspace-section">
        <h2>Disponibilidade</h2>
        <p className="workspace-hint">Informe quando voce costuma atender chamados.</p>

        <div className="perfil-checkboxes">
          {DIAS_SEMANA.map((dia) => {
            const ativo = form.diasDisponiveis.includes(dia.value);
            return (
              <button
                type="button"
                key={dia.value}
                className={`perfil-tag ${ativo ? "ativo" : ""}`}
                onClick={() => toggleDiaDisponivel(dia.value)}
              >
                {dia.label}
              </button>
            );
          })}
        </div>

        <div className="perfil-grid perfil-grid-spaced">
          <label className="form-field">
            <span className="form-label">Horario de inicio</span>
            <div className="form-control">
              <Clock size={16} />
              <input
                type="time"
                value={form.horarioInicio}
                onChange={(event) => updateField("horarioInicio", event.target.value)}
              />
            </div>
          </label>

          <label className="form-field">
            <span className="form-label">Horario de fim</span>
            <div className="form-control">
              <Clock size={16} />
              <input
                type="time"
                value={form.horarioFim}
                onChange={(event) => updateField("horarioFim", event.target.value)}
              />
            </div>
          </label>

          <label className="form-field">
            <span className="form-label">Raio de atendimento (km)</span>
            <div className="form-control">
              <MapPin size={16} />
              <input
                type="number"
                min={1}
                max={30}
                value={form.raioAtendimentoKm}
                onChange={(event) => updateField("raioAtendimentoKm", event.target.value)}
                placeholder="1 a 30"
              />
            </div>
          </label>
        </div>
      </section>

      <section className="workspace-card workspace-section">
        <h2>Documento de identidade</h2>
        <p className="workspace-hint">Envie um PDF ou imagem com tamanho maximo de 5 MB.</p>

        <label className="perfil-upload">
          <FileText size={18} />
          <span>{form.documentoPreview ? "Trocar documento" : "Selecionar documento"}</span>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleDocumentoChange}
          />
        </label>

        {form.documentoPreview && (
          <div className="perfil-documento-preview">
            {form.documentoEhPdf ? (
              <iframe
                src={form.documentoPreview}
                title="Pre-visualizacao do documento de identidade"
              />
            ) : (
              <img
                src={form.documentoPreview}
                alt="Pre-visualizacao do documento de identidade"
              />
            )}

            <button
              type="button"
              className="perfil-foto-remover perfil-documento-remover"
              onClick={removerDocumento}
            >
              Remover documento
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export default PrestadorPerfil;
