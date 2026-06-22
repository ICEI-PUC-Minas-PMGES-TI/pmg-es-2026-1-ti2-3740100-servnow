export function formatarMetodoPagamento(metodo: string | null | undefined): string {
  switch (metodo) {
    case "PIX":
      return "PIX";
    case "CREDITO":
      return "Cartão de crédito";
    case "DEBITO":
      return "Cartão de débito";
    case "DINHEIRO":
      return "Dinheiro";
    default:
      return "Não informado";
  }
}

export function metodoPagamentoConfirmado(
  metodoPagamento: string | null | undefined,
  metodoPagamentoSelecionado: string | null | undefined,
): string | null {
  return metodoPagamento ?? metodoPagamentoSelecionado ?? null;
}
