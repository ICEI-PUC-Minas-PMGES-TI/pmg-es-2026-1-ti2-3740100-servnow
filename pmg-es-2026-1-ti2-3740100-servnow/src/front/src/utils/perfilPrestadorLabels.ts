/** Labels exibidos no perfil do prestador (valores gravados como CSV no banco). */

const ESPECIALIDADE_LABELS: Record<string, string> = {
  ELETRICO: "Elétrico",
  HIDRAULICO: "Hidráulico",
  PINTURA: "Pintura",
  MONTAGEM: "Montagem",
  LIMPEZA: "Limpeza",
  MANUTENCAO_GERAL: "Manutenção geral",
};

const DIA_SEMANA_LABELS: Record<string, string> = {
  SEGUNDA: "Segunda",
  TERCA: "Terça",
  QUARTA: "Quarta",
  QUINTA: "Quinta",
  SEXTA: "Sexta",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
  SEG: "Segunda",
  TER: "Terça",
  QUA: "Quarta",
  QUI: "Quinta",
  SEX: "Sexta",
  SAB: "Sábado",
  DOM: "Domingo",
};

function normalizarCodigo(valor: string) {
  return valor.trim().toUpperCase().replace(/\s+/g, "_");
}

function labelOuFallback(codigo: string, mapa: Record<string, string>) {
  const chave = normalizarCodigo(codigo);
  if (mapa[chave]) {
    return mapa[chave];
  }
  return codigo
    .trim()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function formatarListaCsv(
  valor: string | null | undefined,
  mapa: Record<string, string>,
): string | null {
  if (!valor?.trim()) {
    return null;
  }

  const itens = valor
    .split(",")
    .map((item) => labelOuFallback(item, mapa))
    .filter(Boolean);

  return itens.length > 0 ? itens.join(", ") : null;
}

export function formatarEspecialidades(valor: string | null | undefined) {
  return formatarListaCsv(valor, ESPECIALIDADE_LABELS);
}

export function formatarDiasDisponiveis(valor: string | null | undefined) {
  return formatarListaCsv(valor, DIA_SEMANA_LABELS);
}
