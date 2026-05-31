import type { ChangeEvent } from "react";
import { Clock, FileText, MapPin } from "lucide-react";

import type { FormState } from "../../../Components/Perfil";
import type { ChavePixItem } from "../../../Components/Perfil/clienteCadastroTypes";
import { EnderecoPerfilSection } from "../../../Components/Perfil/EnderecoPerfilSection";
import { PagamentosClienteSection } from "../../../Components/Perfil/PagamentosClienteSection";
import { PerfilBotaoRemover, PerfilBotaoUpload } from "../../../Components/Perfil/PerfilBotoes";

const TIPOS_SERVICO = [
  { value: "ELETRICO", label: "Elétrico" },
  { value: "HIDRAULICO", label: "Hidráulico" },
  { value: "PINTURA", label: "Pintura" },
  { value: "MONTAGEM", label: "Montagem" },
  { value: "LIMPEZA", label: "Limpeza" },
  { value: "MANUTENCAO_GERAL", label: "Manutenção geral" },
];

const DIAS_SEMANA = [
  { value: "SEGUNDA", label: "Segunda" },
  { value: "TERCA", label: "Terça" },
  { value: "QUARTA", label: "Quarta" },
  { value: "QUINTA", label: "Quinta" },
  { value: "SEXTA", label: "Sexta" },
  { value: "SABADO", label: "Sábado" },
  { value: "DOMINGO", label: "Domingo" },
];

type PrestadorPerfilProps = {
  form: FormState;
  chavesPix: ChavePixItem[];
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onChavesPixChange: (chaves: ChavePixItem[]) => void;
  toggleEspecialidade: (value: string) => void;
  toggleDiaDisponivel: (value: string) => void;
  handleDocumentoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  removerDocumento: () => void;
};

export function PrestadorPerfil({
  form,
  chavesPix,
  updateField,
  onChavesPixChange,
  toggleEspecialidade,
  toggleDiaDisponivel,
  handleDocumentoChange,
  removerDocumento,
}: PrestadorPerfilProps) {
  return (
    <>
      <EnderecoPerfilSection
        form={form}
        updateField={updateField}
        hint="Endereço da sua residência ou base de atendimento, usado para calcular a distância até cada solicitação."
      />

      <section className="workspace-card workspace-section">
        <h2>Descrição profissional</h2>
        <p className="workspace-hint">
          Conte sobre sua experiência e o que você faz de melhor (até 500 caracteres). Obrigatório para salvar o perfil.
        </p>

        <label className="form-field form-field-full">
          <span className="form-label">Sobre você *</span>
          <div className="form-control form-control-textarea">
            <textarea
              rows={6}
              maxLength={500}
              value={form.descricaoProfissional}
              onChange={(event) => updateField("descricaoProfissional", event.target.value)}
              placeholder="Ex.: Eletricista com 10 anos de experiência em residências e comércios..."
            />
          </div>
          <small className="form-counter">
            {form.descricaoProfissional.length}/500
          </small>
        </label>
      </section>

      <section className="workspace-card workspace-section">
        <h2>Tipos de serviço</h2>
        <p className="workspace-hint">Escolha pelo menos uma especialidade que você atende.</p>

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
        <p className="workspace-hint">Informe quando você costuma atender chamados.</p>

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
            <span className="form-label">Horário de início</span>
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
            <span className="form-label">Horário de fim</span>
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

      <PagamentosClienteSection
        chavesPix={chavesPix}
        onChange={onChavesPixChange}
      />

      <section className="workspace-card workspace-section">
        <h2>Documento de identidade</h2>

        <div className="perfil-upload-group">
          <p className="workspace-hint">
            Envie um PDF ou imagem com tamanho máximo de 5 MB.
          </p>

          <PerfilBotaoUpload
            icone={<FileText size={18} />}
            texto={form.documentoPreview ? "Trocar documento" : "Selecionar documento"}
            accept="application/pdf,image/*"
            onChange={handleDocumentoChange}
          />

          {form.documentoPreview && (
            <div className="perfil-documento-preview">
              {form.documentoEhPdf ? (
                <iframe
                  src={form.documentoPreview}
                  title="Pré-visualização do documento de identidade"
                />
              ) : (
                <img
                  src={form.documentoPreview}
                  alt="Pré-visualização do documento de identidade"
                />
              )}

              <PerfilBotaoRemover onClick={removerDocumento}>
                Remover documento
              </PerfilBotaoRemover>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default PrestadorPerfil;
