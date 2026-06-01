import { useNavigate, useParams } from "react-router-dom";

import { Header } from "../../Components/Header/Header";
import { clearAuthSession, getAuthSession } from "../../services/auth";

import { AcompanhamentoLista } from "../Painel/Acompanhamento/Lista";
import AcompanhamentoCliente from "../Painel/Cliente/Acompanhamento";
import AcompanhamentoPrestador from "../Painel/Prestador/Acompanhamento";

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
  const params = useParams<{ solicitacaoId?: string }>();
  const solicitacaoId = params.solicitacaoId ? Number(params.solicitacaoId) : null;

  return (
    <>
      <Header onLogout={handleLogout} />

      <div className="painel-cliente">
        <main
          className="painel-content"
          style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}
        >
          {solicitacaoId == null ? (
            <AcompanhamentoLista />
          ) : (
            isCliente ? (
              <AcompanhamentoCliente solicitacaoId={solicitacaoId} />
            ) : (
              <AcompanhamentoPrestador solicitacaoId={solicitacaoId} />
            )
          )}
        </main>
      </div>
    </>
  );
}

export default AcompanhamentoPage;
