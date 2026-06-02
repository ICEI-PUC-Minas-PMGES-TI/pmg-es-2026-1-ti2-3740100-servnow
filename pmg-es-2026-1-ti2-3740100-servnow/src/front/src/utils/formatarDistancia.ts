export function formatarDistancia(
  distanciaKm: number | null | undefined,
  distanciaLinhaReta?: boolean | null,
) {
  if (distanciaKm == null || !Number.isFinite(distanciaKm)) {
    return "Distancia indisponível — complete seu Endereço no perfil";
  }
  if (distanciaLinhaReta) {
    return `~${distanciaKm.toFixed(1)} km`;
  }
  return `~${distanciaKm.toFixed(1)} km (rota de carro)`;
}
