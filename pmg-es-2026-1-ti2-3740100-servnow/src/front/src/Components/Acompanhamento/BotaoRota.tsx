import { MapPin, Navigation } from "lucide-react";

type BotaoRotaProps = {
  endereco: string;
};

/**
 * Botoes que abrem a rota ate o endereco informado no Google Maps ou no Waze.
 * Usa os apps/sites de navegacao com o endereco como destino.
 */
export function BotaoRota({ endereco }: BotaoRotaProps) {
  const enderecoLimpo = endereco?.trim();

  if (!enderecoLimpo) {
    return null;
  }

  const destino = encodeURIComponent(enderecoLimpo);
  const urlGoogleMaps = `https://www.google.com/maps/dir/?api=1&destination=${destino}&travelmode=driving`;
  const urlWaze = `https://waze.com/ul?q=${destino}&navigate=yes`;

  function abrir(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="acomp-rota">
      <span className="acomp-rota-label">
        <MapPin size={14} /> {enderecoLimpo}
      </span>
      <div className="acomp-rota-botoes">
        <button type="button" className="acomp-rota-btn google" onClick={() => abrir(urlGoogleMaps)}>
          <Navigation size={15} />
          Rota no Google Maps
        </button>
        <button type="button" className="acomp-rota-btn waze" onClick={() => abrir(urlWaze)}>
          <Navigation size={15} />
          Rota no Waze
        </button>
      </div>
    </div>
  );
}

export default BotaoRota;
