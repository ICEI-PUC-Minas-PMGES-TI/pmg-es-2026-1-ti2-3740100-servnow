import { API_URL, authHeader, getValidAuthSession } from "./auth";

export type PeriodoIndicador = "mes" | "semana" | "ano";

export type IndicadorSeriePonto = {
  label: string;
  valor: number;
  percentual: number | null;
};

export type ParticipacaoCategoria = {
  tipoServico: string;
  ganhoPrestador: number;
  ganhoPlataforma: number;
  percentual: number;
  crescimentoTrimestral: number;
};

export type IndicadorPrestadorResponse = {
  periodo: PeriodoIndicador;
  ganhosPropriosTotal: number;
  ganhosPropriosSerie: IndicadorSeriePonto[];
  avaliacaoMedia: number | null;
  totalAvaliacoes: number;
  efetividadePercentual: number;
  servicosConcluidos: number;
  servicosRecebidos: number;
  efetividadeSerie: IndicadorSeriePonto[];
  participacaoPlataformaPercentual: number;
  crescimentoParticipacaoMensal: number;
  ganhoPrestadorPeriodo: number;
  ganhoPlataformaPeriodo: number;
  participacaoPlataformaSerie: IndicadorSeriePonto[];
  participacaoPorCategoria: ParticipacaoCategoria[];
};

export const METAS_INDICADORES = {
  avaliacaoMedia: 4.0,
  efetividadePercentual: 85,
  crescimentoParticipacaoMensal: 5,
  crescimentoCategoriaTrimestral: 10,
} as const;

export async function buscarIndicadoresPrestador(periodo: PeriodoIndicador): Promise<IndicadorPrestadorResponse> {
  const session = getValidAuthSession();
  if (!session?.token) {
    throw new Error("Sessão expirada.");
  }

  const response = await fetch(`${API_URL}/api/solicitacoes/prestador/indicadores?periodo=${periodo}`, {
    headers: authHeader(session.token),
  });

  if (!response.ok) {
    let detalhe = "Não foi possível carregar os indicadores.";
    try {
      const erro = (await response.json()) as { detail?: string };
      if (erro.detail) {
        detalhe = erro.detail;
      }
    } catch {
      // mantém mensagem padrão
    }
    throw new Error(detalhe);
  }

  return (await response.json()) as IndicadorPrestadorResponse;
}
