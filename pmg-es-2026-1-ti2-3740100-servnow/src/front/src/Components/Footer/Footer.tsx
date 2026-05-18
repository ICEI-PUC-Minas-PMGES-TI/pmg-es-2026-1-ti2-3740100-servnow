import { Link } from "react-router-dom";
import "./Footer.css";

const footerGroups = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", to: "/funcionalidades" },
      { label: "Planos", to: "/planos" },
      { label: "Segurança", to: "/seguranca" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", to: "/sobre" },
      { label: "Carreiras", to: "/carreiras" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { label: "Central de ajuda", to: "/ajuda" },
      { label: "Contato", to: "/contato" },
      { label: "Status", to: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidade", to: "/privacidade" },
      { label: "Termos", to: "/termos" },
      { label: "Cookies", to: "/cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>Servnow</h2>
          <p>
            Plataforma para conectar clientes e prestadores de serviços com uma
            experiência simples, segura e confiável.
          </p>
        </div>

        <div className="footer-grid">
          {footerGroups.map((group) => (
            <div className="footer-col" key={group.title}>
              <span>{group.title}</span>
              {group.links.map((link) => (
                <Link to={link.to} key={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Servnow</p>

        <div className="footer-socials">
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
          <a href="#">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
