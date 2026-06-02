import { CreditCard, Plus } from "lucide-react";

import { PerfilBotaoAdicionar, PerfilBotaoRemover } from "./PerfilBotoes";
import type { ChavePixItem } from "./clienteCadastroTypes";

const TIPOS_PIX = [
  { value: "EMAIL", label: "E-mail" },
  { value: "CPF", label: "CPF" },
  { value: "TELEFONE", label: "Telefone" },
  { value: "ALEATORIA", label: "Chave aleatória" },
  { value: "OUTRA", label: "Outra" },
] as const;

type PagamentosClienteSectionProps = {
  chavesPix: ChavePixItem[];
  onChange: (chaves: ChavePixItem[]) => void;
};

export function PagamentosClienteSection({
  chavesPix,
  onChange,
}: PagamentosClienteSectionProps) {
  function atualizarChave(clientKey: string, partial: Partial<ChavePixItem>) {
    onChange(chavesPix.map((item) => (item.clientKey === clientKey ? { ...item, ...partial } : item)));
  }

  function adicionarChave() {
    onChange([...chavesPix, {
      clientKey: crypto.randomUUID(),
      rotulo: "",
      chave: "",
      tipo: "EMAIL",
      principal: chavesPix.length === 0,
    }]);
  }

  function removerChave(clientKey: string) {
    const restantes = chavesPix.filter((item) => item.clientKey !== clientKey);
    if (restantes.length > 0 && !restantes.some((item) => item.principal)) {
      restantes[0] = { ...restantes[0], principal: true };
    }
    onChange(restantes);
  }

  function selecionarPrincipal(clientKey: string) {
    onChange(chavesPix.map((item) => ({ ...item, principal: item.clientKey === clientKey })));
  }

  return (
    <section className="workspace-card workspace-section">
      <div className="perfil-section-header">
        <div>
          <h2>
            <CreditCard size={20} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />
            Pagamentos
          </h2>
          <p className="workspace-hint">
            Cadastre sua chave PIX para receber pagamentos.
          </p>
        </div>
        <PerfilBotaoAdicionar onClick={adicionarChave}>
          <Plus size={16} />
          Nova chave PIX
        </PerfilBotaoAdicionar>
      </div>

      {chavesPix.length === 0 && (
        <p className="perfil-lista-vazia">Nenhuma chave cadastrada. Adicione uma chave para receber pagamentos.</p>
      )}

      {chavesPix.map((chave, indice) => (
        <article
          key={chave.clientKey}
          className={`perfil-pix-card${chave.principal ? " perfil-pix-card--principal" : ""}`}
        >
          <div className="perfil-Endereço-card-topo">
            <label className="perfil-Endereço-principal">
              <input
                type="radio"
                name="pix-principal"
                checked={chave.principal}
                onChange={() => selecionarPrincipal(chave.clientKey)}
              />
              <span>Usar esta chave</span>
            </label>
            <PerfilBotaoRemover onClick={() => removerChave(chave.clientKey)}>
              Remover
            </PerfilBotaoRemover>
          </div>

          <p className="perfil-Endereço-indice">Chave {indice + 1}</p>

          <div className="perfil-grid">
            <label className="form-field">
              <span className="form-label">Apelido (opcional)</span>
              <div className="form-control">
                <input
                  type="text"
                  value={chave.rotulo}
                  onChange={(e) => atualizarChave(chave.clientKey, { rotulo: e.target.value })}
                  placeholder="Ex: Pessoal"
                />
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">Tipo</span>
              <div className="form-control">
                <select
                  value={chave.tipo}
                  onChange={(e) =>
                    atualizarChave(chave.clientKey, { tipo: e.target.value as ChavePixItem["tipo"] })
                  }
                >
                  {TIPOS_PIX.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="form-field perfil-field-wide">
              <span className="form-label">Chave PIX</span>
              <div className="form-control">
                <input
                  type="text"
                  value={chave.chave}
                  onChange={(e) => atualizarChave(chave.clientKey, { chave: e.target.value })}
                  placeholder="Digite a chave PIX"
                />
              </div>
            </label>
          </div>
        </article>
      ))}
    </section>
  );
}
