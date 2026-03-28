import { Link } from "react-router-dom";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* MARCA */}
        <div className="footer-brand">
          <h2>ServNow</h2>
          <p>
            Plataforma para conectar clientes e prestadores de serviços com praticidade.
          </p>
        </div>

        {/* LINKS */}
        <div className="footer-grid">

          <div className="footer-col">
            <span>Produto</span>
            <Link to="/funcionalidades">Funcionalidades</Link>
            <Link to="/planos">Planos</Link>
            <Link to="/seguranca">Segurança</Link>
          </div>

          <div className="footer-col">
            <span>Empresa</span>
            <Link to="/sobre">Sobre</Link>
            <Link to="/carreiras">Carreiras</Link>
            <Link to="/blog">Blog</Link>
          </div>

          <div className="footer-col">
            <span>Suporte</span>
            <Link to="/ajuda">Central de ajuda</Link>
            <Link to="/contato">Contato</Link>
            <Link to="/status">Status</Link>
          </div>

          <div className="footer-col">
            <span>Legal</span>
            <Link to="/privacidade">Privacidade</Link>
            <Link to="/termos">Termos</Link>
            <Link to="/cookies">Cookies</Link>
          </div>

        </div>
      </div>

      {/* LINHA FINAL */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ServNow</p>

        <div className="footer-socials">
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
          <a href="#">Twitter</a>
        </div>
      </div>
    </footer>
  );
}