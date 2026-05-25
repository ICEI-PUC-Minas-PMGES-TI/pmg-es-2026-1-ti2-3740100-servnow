export function getStatusClass(status: string) {
  if (status === "AGENDADA") return "agendado";
  if (status === "CONCLUIDA") return "concluido";
  return "aguardando";
}

export function getStatusLabel(status: string) {
  if (status === "AGENDADA") return "Agendada";
  if (status === "CONCLUIDA") return "Concluida";
  if (status === "PUBLICADO") return "Publicada";
  return "Aguardando propostas";
}

export function getFaixaPrecoLabel(faixaPreco: string) {
  const labels: Record<string, string> = {
    ATE_150: "Ate R$ 150",
    DE_150_A_300: "R$ 150 a R$ 300",
    DE_300_A_600: "R$ 300 a R$ 600",
    DE_600_A_1000: "R$ 600 a R$ 1.000",
    ACIMA_1000: "Acima de R$ 1.000",
  };

  return labels[faixaPreco] ?? faixaPreco;
}

export function formatarDataSolicitacao(value: string) {
  const [ano, mes, dia] = value.split("-");
  if (!ano || !mes || !dia) {
    return value;
  }
  return `${dia}/${mes}/${ano}`;
}
