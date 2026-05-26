export function labelEtapaAcompanhamento(etapa: string | null | undefined): string {
  switch (etapa) {
    case "AGUARDANDO_CHEGADA":
      return "Aguardando chegada";
    case "EM_ANDAMENTO":
      return "Em andamento";
    case "AGUARDANDO_PAGAMENTO":
      return "Aguardando pagamento";
    case "AGUARDANDO_AVALIACAO":
      return "Aguardando avaliacao";
    case "CONCLUIDA":
      return "Concluido";
    default:
      return "Nao iniciado";
  }
}

export function formatarHorarioAcompanhamento(iso: string | null | undefined): string {
  if (!iso) {
    return "--:--";
  }
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return "--:--";
  }
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatarDataHoraAcompanhamento(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return iso;
  }
  const hoje = new Date();
  const mesmoDia =
    data.getDate() === hoje.getDate()
    && data.getMonth() === hoje.getMonth()
    && data.getFullYear() === hoje.getFullYear();
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return mesmoDia ? `${hora} - Hoje` : `${hora} - ${data.toLocaleDateString("pt-BR")}`;
}
