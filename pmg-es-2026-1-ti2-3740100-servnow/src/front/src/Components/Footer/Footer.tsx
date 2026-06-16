import { Link } from "react-router-dom";
import "./Footer.css";

const footerGroups = [
  {
    title: "Para clientes",
    links: [
      { label: "Criar conta", to: "/cadastro?tipo=cliente" },
      { label: "Entrar", to: "/login" },
      { label: "Painel", to: "/painel/cliente" },
    ],
  },
  {
    title: "Para prestadores",
    links: [
      { label: "Criar perfil", to: "/cadastro?tipo=prestador" },
      { label: "Entrar", to: "/login" },
      { label: "Painel", to: "/painel/prestador" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { label: "Início", to: "/" },
      { label: "Acompanhamento", to: "/acompanhamento" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>ServNow</h2>
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
                <Link to={link.to} key={`${group.title}-${link.to}`}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ServNow</p>
        <p className="footer-legal-note">Termos, privacidade e central de ajuda em breve.</p>
      </div>
    </footer>
  );
}
