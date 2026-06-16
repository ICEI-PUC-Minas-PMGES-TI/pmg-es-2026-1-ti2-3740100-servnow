import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import "./NotFound.css";

export function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <span className="not-found-code">404</span>
        <h1>Página não encontrada</h1>
        <p>
          O endereço que você acessou não existe ou foi movido. Volte ao início ou use o menu
          para continuar navegando.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-btn not-found-btn-primary">
            <Home size={18} />
            Ir para o início
          </Link>
          <button type="button" className="not-found-btn not-found-btn-ghost" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
