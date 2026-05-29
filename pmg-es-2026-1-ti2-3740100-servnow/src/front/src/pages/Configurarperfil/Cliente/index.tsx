import type { ChangeEvent } from "react";
import { MapPin, Plus } from "lucide-react";

import { EnderecoClienteCard } from "../../../Components/Perfil/EnderecoClienteCard";
import { PagamentosClienteSection } from "../../../Components/Perfil/PagamentosClienteSection";
import type { ChavePixItem, EnderecoClienteItem } from "../../../Components/Perfil/clienteCadastroTypes";
import { criarEnderecoCliente } from "../../../Components/Perfil/clienteCadastroTypes";

type ClientePerfilProps = {
  enderecos: EnderecoClienteItem[];
  chavesPix: ChavePixItem[];
  onEnderecosChange: (enderecos: EnderecoClienteItem[]) => void;
  onChavesPixChange: (chaves: ChavePixItem[]) => void;
  onFotoEnderecoChange: (clientKey: string, event: ChangeEvent<HTMLInputElement>) => void;
};

export function ClientePerfil({
  enderecos,
  chavesPix,
  onEnderecosChange,
  onChavesPixChange,
  onFotoEnderecoChange,
}: ClientePerfilProps) {
  function atualizarEndereco(clientKey: string, atualizado: EnderecoClienteItem) {
    onEnderecosChange(enderecos.map((item) => (item.clientKey === clientKey ? atualizado : item)));
  }

  function adicionarEndereco() {
    onEnderecosChange([...enderecos, criarEnderecoCliente(false)]);
  }

  function removerEndereco(clientKey: string) {
    const restantes = enderecos.filter((item) => item.clientKey !== clientKey);
    if (restantes.length > 0 && !restantes.some((item) => item.principal)) {
      restantes[0] = { ...restantes[0], principal: true };
    }
    onEnderecosChange(restantes);
  }

  function selecionarEnderecoPrincipal(clientKey: string) {
    onEnderecosChange(enderecos.map((item) => ({ ...item, principal: item.clientKey === clientKey })));
  }

  return (
    <>
      <section className="workspace-card workspace-section">
        <div className="perfil-section-header">
          <div>
            <h2>
              <MapPin size={20} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />
              Enderecos
            </h2>
            <p className="workspace-hint">
              Cadastre os locais onde voce solicita servicos. A foto fica em cada endereco.
            </p>
          </div>
          <button type="button" className="home-button home-button-secondary" onClick={adicionarEndereco}>
            <Plus size={16} />
            Novo endereco
          </button>
        </div>

        {enderecos.map((endereco, indice) => (
          <EnderecoClienteCard
            key={endereco.clientKey}
            endereco={endereco}
            indice={indice}
            podeRemover={enderecos.length > 1}
            onChange={(atualizado) => atualizarEndereco(endereco.clientKey, atualizado)}
            onRemover={() => removerEndereco(endereco.clientKey)}
            onSelecionarPrincipal={() => selecionarEnderecoPrincipal(endereco.clientKey)}
            onFotoChange={(event) => onFotoEnderecoChange(endereco.clientKey, event)}
          />
        ))}
      </section>

      <PagamentosClienteSection chavesPix={chavesPix} onChange={onChavesPixChange} />
    </>
  );
}

export default ClientePerfil;
