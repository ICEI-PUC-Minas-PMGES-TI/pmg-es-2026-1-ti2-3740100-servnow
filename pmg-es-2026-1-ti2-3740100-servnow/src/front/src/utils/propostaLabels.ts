import type { PropostaServicoResponse } from "../services/auth";

export type StatusProposta = PropostaServicoResponse["status"];

export function getPropostaStatusClass(status: StatusProposta) {
  if (status === "ACEITA") return "aceita";
  if (status === "RECUSADA") return "recusada";
  if (status === "CANCELADA") return "cancelada";
  return "aguardando";
}

export function getPropostaStatusLabel(status: StatusProposta) {
  const labels: Record<StatusProposta, string> = {
    PENDENTE: "Pendente",
    ACEITA: "Aceita",
    RECUSADA: "Recusada",
    CANCELADA: "Cancelada",
  };
  return labels[status];
}

export function getPropostaCardClass(status: StatusProposta) {
  if (status === "ACEITA") return "painel-proposta-card-aceita";
  if (status === "RECUSADA") return "painel-proposta-card-recusada";
  if (status === "CANCELADA") return "painel-proposta-card-cancelada";
  return "";
}
