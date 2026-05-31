import type { ChangeEvent, ReactNode } from "react";
import { Save, Trash2 } from "lucide-react";

type PerfilBotaoAdicionarProps = {
  onClick: () => void;
  children: ReactNode;
};

export function PerfilBotaoAdicionar({ onClick, children }: PerfilBotaoAdicionarProps) {
  return (
    <button type="button" className="perfil-btn perfil-btn-primary perfil-btn-adicionar" onClick={onClick}>
      {children}
    </button>
  );
}

type PerfilBotaoUploadProps = {
  icone: ReactNode;
  texto: string;
  accept?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function PerfilBotaoUpload({ icone, texto, accept, onChange }: PerfilBotaoUploadProps) {
  return (
    <label className="perfil-btn perfil-btn-primary perfil-btn-upload">
      {icone}
      <span>{texto}</span>
      <input type="file" accept={accept} onChange={onChange} />
    </label>
  );
}

type PerfilBotaoRemoverProps = {
  onClick: () => void;
  children: ReactNode;
};

export function PerfilBotaoRemover({ onClick, children }: PerfilBotaoRemoverProps) {
  return (
    <button type="button" className="perfil-btn-remover" onClick={onClick}>
      <Trash2 size={16} />
      <span>{children}</span>
    </button>
  );
}

type PerfilBotaoCancelarProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function PerfilBotaoCancelar({ onClick, disabled }: PerfilBotaoCancelarProps) {
  return (
    <button type="button" className="perfil-btn perfil-btn-secondary" onClick={onClick} disabled={disabled}>
      Cancelar
    </button>
  );
}

type PerfilBotaoSalvarProps = {
  disabled?: boolean;
  loading?: boolean;
  title?: string;
};

export function PerfilBotaoSalvar({ disabled, loading, title }: PerfilBotaoSalvarProps) {
  return (
    <button type="submit" className="perfil-btn perfil-btn-primary" disabled={disabled} title={title}>
      <Save size={16} />
      <span>{loading ? "Salvando..." : "Salvar alterações"}</span>
    </button>
  );
}
