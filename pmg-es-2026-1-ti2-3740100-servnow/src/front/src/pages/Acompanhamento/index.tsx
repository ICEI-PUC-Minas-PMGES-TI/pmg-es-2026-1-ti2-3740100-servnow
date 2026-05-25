import { useNavigate } from "react-router-dom";

import { Header } from "../../Components/Header/Header";
import { clearAuthSession, getAuthSession } from "../../services/auth";

import { Acompanhamento as AcompanhamentoCliente } from "../Painel/Cliente/Acompanhamento";
import { Acompanhamento as AcompanhamentoPrestador } from "../Painel/Prestador/Acompanhamento";

import "../../Components/Painel/PainelCliente.css";

export function AcompanhamentoPage() {
  const navigate = useNavigate();
  const session = getAuthSession();

  function handleLogout() {
    clearAuthSession();
    navigate("/login");
  }

  if (!session) {
    return null;
  }

  const isCliente = session.tipoUsuario === "CLIENTE";

  return (
    <>
      <Header onLogout={handleLogout} />

      <div className="painel-cliente">
        <main
          className="painel-content"
          style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}
        >
          {isCliente ? <AcompanhamentoCliente /> : <AcompanhamentoPrestador />}
        </main>
      </div>
    </>
  );
}

export default AcompanhamentoPage;
