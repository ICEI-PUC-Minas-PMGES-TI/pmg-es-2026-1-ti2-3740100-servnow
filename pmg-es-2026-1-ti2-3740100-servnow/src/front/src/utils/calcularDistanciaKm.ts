const RAIO_TERRA_KM = 6371;

/** Distancia em linha reta (Haversine), mesma logica do backend. */
export function calcularDistanciaKm(
  latOrigem: number,
  lonOrigem: number,
  latDestino: number,
  lonDestino: number,
): number | null {
  if (![latOrigem, lonOrigem, latDestino, lonDestino].every(Number.isFinite)) {
    return null;
  }

  const lat1 = (latOrigem * Math.PI) / 180;
  const lat2 = (latDestino * Math.PI) / 180;
  const deltaLat = ((latDestino - latOrigem) * Math.PI) / 180;
  const deltaLon = ((lonDestino - lonOrigem) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(RAIO_TERRA_KM * c * 10) / 10;
}
