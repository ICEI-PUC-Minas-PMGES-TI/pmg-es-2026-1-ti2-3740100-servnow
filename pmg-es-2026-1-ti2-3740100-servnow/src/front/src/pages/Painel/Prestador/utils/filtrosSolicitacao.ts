import type { SolicitacaoServicoResponse } from "../../../../services/auth";

export type OportunidadeSolicitacao = SolicitacaoServicoResponse & {
  distanciaKm: number | null;
  tipoFiltro: string;
  valorEstimado: number;
};

const TIPO_PARA_FILTRO: Record<string, string> = {
  ELETRICO: "eletrica",
  HIDRAULICO: "hidraulica",
  PINTURA: "pintura",
  MONTAGEM: "móveis",
  MANUTENCAO_GERAL: "manutencao",
  ELETRODOMESTICOS: "eletro",
};

const FAIXA_PARA_VALOR: Record<string, number> = {
  ATE_150: 120,
  DE_150_A_300: 220,
  DE_300_A_600: 450,
  DE_600_A_1000: 800,
  ACIMA_1000: 1200,
};

export function enriquecerSolicitacao(item: SolicitacaoServicoResponse): OportunidadeSolicitacao {
  return {
    ...item,
    distanciaKm: item.distanciaKm ?? null,
    tipoFiltro: TIPO_PARA_FILTRO[item.tipoServico] ?? "manutencao",
    valorEstimado: FAIXA_PARA_VALOR[item.faixaPreco] ?? 200,
  };
}

export function filtrarOportunidades(
  lista: OportunidadeSolicitacao[],
  opcoes: {
    busca: string;
    tipo: string;
    preco: string;
    distancia: string;
  },
): OportunidadeSolicitacao[] {
  return lista.filter((item) => {
    if (opcoes.tipo && item.tipoFiltro !== opcoes.tipo) {
      return false;
    }

    if (opcoes.busca) {
      const termo = opcoes.busca.toLowerCase();
      const titulo = `${item.tipoServico} ${item.clienteNome} ${item.endereco}`.toLowerCase();
      if (!titulo.includes(termo)) {
        return false;
      }
    }

    if (opcoes.preco) {
      const valor = item.valorEstimado;
      if (opcoes.preco === "0-150" && valor > 150) return false;
      if (opcoes.preco === "150-300" && (valor < 150 || valor > 300)) return false;
      if (opcoes.preco === "300-600" && (valor < 300 || valor > 600)) return false;
      if (opcoes.preco === "600+" && valor < 600) return false;
    }

    if (opcoes.distancia) {
      if (item.distanciaKm == null) return false;
      const dist = item.distanciaKm;
      if (opcoes.distancia === "0-2" && dist > 2) return false;
      if (opcoes.distancia === "2-5" && (dist < 2 || dist > 5)) return false;
      if (opcoes.distancia === "5-10" && (dist < 5 || dist > 10)) return false;
      if (opcoes.distancia === "10+" && dist < 10) return false;
    }

    return true;
  });
}

export { formatarDistancia } from "../../../../utils/formatarDistancia";

export function getFaixaPrecoLabel(faixaPreco: string) {
  const labels: Record<string, string> = {
    ATE_150: "Até R$ 150",
    DE_150_A_300: "R$ 150 a R$ 300",
    DE_300_A_600: "R$ 300 a R$ 600",
    DE_600_A_1000: "R$ 600 a R$ 1.000",
    ACIMA_1000: "Acima de R$ 1.000",
  };

  return labels[faixaPreco] ?? faixaPreco;
}

export function formatarData(value: string) {
  const [ano, mes, dia] = value.split("-");
  if (!ano || !mes || !dia) {
    return value;
  }
  return `${dia}/${mes}/${ano}`;
}
