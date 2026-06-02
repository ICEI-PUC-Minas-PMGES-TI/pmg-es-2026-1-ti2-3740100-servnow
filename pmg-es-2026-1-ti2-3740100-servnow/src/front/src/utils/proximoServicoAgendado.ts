import type { SolicitacaoServicoResponse } from "../services/auth";
import { TIPOS_SERVICO_MAP } from "./tiposServico";
import { formatarDataSolicitacao } from "./solicitacaoLabels";

export type ResumoProximoServico = {
  item: SolicitacaoServicoResponse;
  titulo: string;
  subtitulo: string;
  ehHoje: boolean;
};

function parseDataHorario(item: SolicitacaoServicoResponse): Date | null {
  if (!item.data) {
    return null;
  }
  const [ano, mes, dia] = item.data.slice(0, 10).split("-").map(Number);
  if (!ano || !mes || !dia) {
    return null;
  }
  const parteHorario = item.horario?.trim().slice(0, 5) ?? "00:00";
  const [hora, minuto] = parteHorario.split(":").map(Number);
  return new Date(ano, mes - 1, dia, hora || 0, minuto || 0, 0, 0);
}

function mesmoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function formatarHorario(horario: string | null): string {
  if (!horario?.trim()) {
    return "";
  }
  const [hora, minuto] = horario.trim().slice(0, 5).split(":");
  if (!hora || minuto === undefined) {
    return horario.trim();
  }
  return `${hora.padStart(2, "0")}:${minuto.padStart(2, "0")}`;
}

function nomeTipoServico(item: SolicitacaoServicoResponse): string {
  return TIPOS_SERVICO_MAP[item.tipoServico]?.nome ?? item.tipoServico;
}

/** Proximo agendamento a partir de hoje (inclusive servicos de hoje). */
export function calcularProximoServicoAgendado(
  agendadas: SolicitacaoServicoResponse[],
  papel: "CLIENTE" | "PRESTADOR" = "CLIENTE",
): ResumoProximoServico | null {
  const agora = new Date();
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

  const ordenados = agendadas
    .map((item) => ({ item, quando: parseDataHorario(item) }))
    .filter((entrada): entrada is { item: SolicitacaoServicoResponse; quando: Date } => entrada.quando != null)
    .filter((entrada) => entrada.quando.getTime() >= inicioHoje.getTime())
    .sort((a, b) => a.quando.getTime() - b.quando.getTime());

  if (ordenados.length === 0) {
    return null;
  }

  const { item, quando } = ordenados[0];
  const tipo = nomeTipoServico(item);
  const horario = formatarHorario(item.horario);
  const ehHoje = mesmoDia(quando, agora);
  const parceiro = papel === "PRESTADOR"
    ? item.clienteNome?.trim()
    : item.prestadorNome?.trim();

  if (ehHoje) {
    const detalhe = parceiro ? `${tipo} · ${parceiro}` : tipo;
    return {
      item,
      ehHoje: true,
      titulo: horario ? `Você tem um serviço às ${horario}` : "Você tem um serviço hoje",
      subtitulo: detalhe,
    };
  }

  const dataCurta = formatarDataSolicitacao(item.data!);
  const quandoTexto = horario ? `${dataCurta} às ${horario}` : dataCurta;
  const detalhe = parceiro ? `${tipo} · ${parceiro}` : tipo;

  return {
    item,
    ehHoje: false,
    titulo: "Próximo serviço",
    subtitulo: `${quandoTexto} · ${detalhe}`,
  };
}
