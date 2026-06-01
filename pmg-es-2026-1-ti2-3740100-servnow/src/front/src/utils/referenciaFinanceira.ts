import type { SolicitacaoServicoResponse } from "../services/auth";

/** Data de referencia para gastos/ganhos: conclusao, data agendada ou aceite. */
export function dataReferenciaFinanceira(item: SolicitacaoServicoResponse): Date | null {
  if (item.concluidoEm) {
    const d = new Date(item.concluidoEm);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (item.data) {
    const [ano, mes, dia] = item.data.slice(0, 10).split("-").map(Number);
    if (ano && mes && dia) {
      return new Date(ano, mes - 1, dia);
    }
  }
  if (item.aceitoEm) {
    const d = new Date(item.aceitoEm);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function chaveMesReferencia(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}
