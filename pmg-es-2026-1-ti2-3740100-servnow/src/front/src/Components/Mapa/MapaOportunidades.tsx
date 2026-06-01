import { useMemo } from "react";
import { MapPin } from "lucide-react";

import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/Components/ui/map";
import {
  formatarData,
  formatarDistancia,
  type OportunidadeSolicitacao,
} from "../../pages/Painel/Prestador/utils/filtrosSolicitacao";
import { TIPOS_SERVICO_MAP } from "../../utils/tiposServico";
import "./MapaOportunidades.css";

const CENTRO_PADRAO: [number, number] = [-43.9345, -19.9167];

type MapaOportunidadesProps = {
  oportunidades: OportunidadeSolicitacao[];
  onSelecionar: (item: OportunidadeSolicitacao) => void;
  semLocalizacao: number;
};

function temCoordenadas(item: OportunidadeSolicitacao): item is OportunidadeSolicitacao & {
  latitude: number;
  longitude: number;
} {
  return (
    typeof item.latitude === "number" &&
    typeof item.longitude === "number" &&
    Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude)
  );
}

function calcularCentro(pontos: Array<{ longitude: number; latitude: number }>): [number, number] {
  if (pontos.length === 0) {
    return CENTRO_PADRAO;
  }
  const soma = pontos.reduce(
    (acc, p) => ({ lng: acc.lng + p.longitude, lat: acc.lat + p.latitude }),
    { lng: 0, lat: 0 },
  );
  return [soma.lng / pontos.length, soma.lat / pontos.length];
}

function calcularZoom(quantidade: number): number {
  if (quantidade <= 1) return 14;
  if (quantidade <= 3) return 13;
  if (quantidade <= 8) return 12;
  return 11;
}

export function MapaOportunidades({ oportunidades, onSelecionar, semLocalizacao }: MapaOportunidadesProps) {
  const comCoordenadas = useMemo(() => oportunidades.filter(temCoordenadas), [oportunidades]);

  const center = useMemo(
    () =>
      calcularCentro(
        comCoordenadas.map((item) => ({
          longitude: item.longitude,
          latitude: item.latitude,
        })),
      ),
    [comCoordenadas],
  );

  const zoom = calcularZoom(comCoordenadas.length);

  if (comCoordenadas.length === 0) {
    return (
      <div className="mapa-oportunidades mapa-oportunidades--vazio">
        <MapPin size={28} />
        <p>Nenhuma solicitacao com localizacao disponivel para o mapa.</p>
        {semLocalizacao > 0 && (
          <p className="mapa-oportunidades-aviso">
            {semLocalizacao} solicitacao(oes) sem coordenadas — edite ou crie novas solicitacoes para atualizar o endereco.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mapa-oportunidades">
      {semLocalizacao > 0 && (
        <p className="mapa-oportunidades-aviso">
          {semLocalizacao} solicitacao(oes) nao aparecem no mapa por falta de coordenadas.
        </p>
      )}
      <div className="mapa-oportunidades-container">
        <Map center={center} zoom={zoom} theme="light" className="mapa-oportunidades-map">
          <MapControls showZoom showLocate />
          {comCoordenadas.map((item) => {
            const tipoServico = TIPOS_SERVICO_MAP[item.tipoServico];
            const titulo = tipoServico?.nome ?? item.tipoServico;

            return (
              <MapMarker
                key={item.id}
                longitude={item.longitude}
                latitude={item.latitude}
                onClick={() => onSelecionar(item)}
              >
                <MarkerContent className="mapa-oportunidades-marker">
                  <span className="mapa-oportunidades-marker-dot" />
                </MarkerContent>
                <MarkerPopup closeButton>
                  <div className="mapa-oportunidades-popup">
                    <strong>{titulo}</strong>
                    <p>{item.endereco}</p>
                    <p className="mapa-oportunidades-popup-meta">
                      {formatarDistancia(item.distanciaKm, item.distanciaLinhaReta)}
                    </p>
                    {item.data && (
                      <p className="mapa-oportunidades-popup-meta">
                        {formatarData(item.data)}
                        {item.horario ? ` · ${item.horario}` : ""}
                      </p>
                    )}
                    <button type="button" className="mapa-oportunidades-popup-btn" onClick={() => onSelecionar(item)}>
                      Ver detalhes
                    </button>
                  </div>
                </MarkerPopup>
              </MapMarker>
            );
          })}
        </Map>
      </div>
    </div>
  );
}
