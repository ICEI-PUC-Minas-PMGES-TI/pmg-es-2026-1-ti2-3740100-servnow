export type EnderecoClienteItem = {
  clientKey: string;
  id?: number;
  rotulo: string;
  rua: string;
  numero: string;
  cep: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  fotoPreview: string | null;
  fotoPendente: File | null;
  removerFoto: boolean;
  principal: boolean;
};

export type ChavePixItem = {
  clientKey: string;
  id?: number;
  rotulo: string;
  chave: string;
  tipo: "EMAIL" | "CPF" | "TELEFONE" | "ALEATORIA" | "OUTRA";
  principal: boolean;
};

export function criarEnderecoCliente(principal = false): EnderecoClienteItem {
  return {
    clientKey: crypto.randomUUID(),
    rotulo: principal ? "Principal" : "",
    rua: "",
    numero: "",
    cep: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    fotoPreview: null,
    fotoPendente: null,
    removerFoto: false,
    principal,
  };
}

export function criarChavePix(principal = false): ChavePixItem {
  return {
    clientKey: crypto.randomUUID(),
    rotulo: principal ? "Principal" : "",
    chave: "",
    tipo: "EMAIL",
    principal,
  };
}
