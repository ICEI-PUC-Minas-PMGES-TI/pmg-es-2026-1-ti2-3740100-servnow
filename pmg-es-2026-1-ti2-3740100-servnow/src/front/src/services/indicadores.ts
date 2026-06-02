import { API_URL, authHeader, getValidAuthSession } from "./auth";

export type PeriodoIndicador = "mes" | "semana";

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
};

export type IndicadorPrestadorResponse = {
  periodo: PeriodoIndicador;
  ganhosPropriosTotal: number;
  ganhosPropriosSerie: IndicadorSeriePonto[];
  efetividadePercentual: number;
  servicosConcluidos: number;
  servicosConcluidosPlataforma: number;
  efetividadeSerie: IndicadorSeriePonto[];
  participacaoPlataformaPercentual: number;
  ganhoPrestadorPeriodo: number;
  ganhoPlataformaPeriodo: number;
  participacaoPlataformaSerie: IndicadorSeriePonto[];
  participacaoPorCategoria: ParticipacaoCategoria[];
};

export async function buscarIndicadoresPrestador(periodo: PeriodoIndicador): Promise<IndicadorPrestadorResponse> {
  const session = getValidAuthSession();
  if (!session?.token) {
    throw new Error("Sessão expirada.");
  }

  const response = await fetch(`${API_URL}/api/solicitacoes/prestador/indicadores?periodo=${periodo}`, {
    headers: authHeader(session.token),
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os indicadores.");
  }

  return (await response.json()) as IndicadorPrestadorResponse;
}
