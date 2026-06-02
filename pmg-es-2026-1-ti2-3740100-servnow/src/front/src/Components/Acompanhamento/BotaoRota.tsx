import { MapPin, Navigation } from "lucide-react";

import { IconeGoogleMaps, IconeWaze } from "./IconesNavegacao";

type BotaoRotaProps = {
  endereco: string;
};

/**
 * Botoes que abrem a rota ate o endereco informado no Google Maps ou no Waze.
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
      <p className="acomp-rota-Endereço">
        <MapPin size={15} aria-hidden="true" />
        <span>{enderecoLimpo}</span>
      </p>

      <div className="acomp-rota-botoes">
        <button
          type="button"
          className="acomp-rota-btn google"
          onClick={() => abrir(urlGoogleMaps)}
          aria-label={`Abrir rota no Google Maps para ${enderecoLimpo}`}
        >
          <IconeGoogleMaps size={20} />
          <span>Google Maps</span>
          <Navigation size={15} className="acomp-rota-btn-seta" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="acomp-rota-btn waze"
          onClick={() => abrir(urlWaze)}
          aria-label={`Abrir rota no Waze para ${enderecoLimpo}`}
        >
          <IconeWaze size={20} />
          <span>Waze</span>
          <Navigation size={15} className="acomp-rota-btn-seta" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default BotaoRota;
