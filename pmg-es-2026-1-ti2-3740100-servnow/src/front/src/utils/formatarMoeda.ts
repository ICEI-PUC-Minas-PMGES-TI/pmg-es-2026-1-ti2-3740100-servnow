export function formatarMoedaBrl(valor: number | null | undefined) {
  if (valor == null || !Number.isFinite(valor)) {
    return "Valor não informado";
  }

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
