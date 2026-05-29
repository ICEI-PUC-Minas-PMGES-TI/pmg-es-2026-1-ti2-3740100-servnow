export function formatarNotaAvaliacao(nota: number): string {
  return nota.toFixed(2).replace(".", ",");
}

export function formatarQuantidadeAvaliacoes(total: number): string {
  return `${total} ${total === 1 ? "avaliacao" : "avaliacoes"}`;
}

export function formatarRotuloAvaliacoes(media: number | null, total: number): string {
  if (media == null || total <= 0) {
    return "Sem avaliacoes na plataforma";
  }
  return `Nota: ${formatarNotaAvaliacao(media)} · ${formatarQuantidadeAvaliacoes(total)}`;
}
