import "./ServiceCard.css";

interface ServiceCardProps {
  title: string;
  client: string;
  location: string;
  price: number;
  status: "novo" | "em_andamento" | "concluido";
  distance?: string;
  timeframe?: string;
  onAccept?: () => void;
}

export function ServiceCard({
  title,
  client,
  location,
  price,
  status,
  distance,
  timeframe,
  onAccept
}: ServiceCardProps) {
  return (
    <div className="service-card">
      <div className="service-header">
        <div className="service-title-group">
          <h3>{title}</h3>
          <span className={`service-status ${status}`}>{status.toUpperCase()}</span>
        </div>
        <span className="service-price">R$ {price}</span>
      </div>

      <div className="service-details">
        <div className="detail-row">
          <span className="detail-label">{client}</span>
          <span className="detail-label">{location}</span>
        </div>
        <div className="detail-row">
          {distance && <span className="service-meta">~{distance}</span>}
          {timeframe && <span className="service-meta">{timeframe}</span>}
        </div>
      </div>

      {onAccept && (
        <button className="btn-aceitar" onClick={onAccept}>
          Aceitar
        </button>
      )}
    </div>
  );
}
