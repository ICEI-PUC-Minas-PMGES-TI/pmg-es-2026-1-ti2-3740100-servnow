import { useNavigate, useParams } from "react-router-dom";

import { Header } from "../../Components/Header/Header";
import { clearAuthSession, getAuthSession } from "../../services/auth";

import { AcompanhamentoLista } from "../Painel/Acompanhamento/Lista";
import { AcompanhamentoClienteDetalhe } from "../Painel/Cliente/Acompanhamento";
import { AcompanhamentoPrestadorDetalhe } from "../Painel/Prestador/Acompanhamento";

import "../../Components/Painel/PainelCliente.css";

export function AcompanhamentoPage() {
  const navigate = useNavigate();
  const { solicitacaoId } = useParams<{ solicitacaoId?: string }>();
  const session = getAuthSession();

  function handleLogout() {
    clearAuthSession();
    navigate("/login");
  }

  if (!session) {
    return null;
  }

  const isCliente = session.tipoUsuario === "CLIENTE";
  const idNumerico = solicitacaoId ? Number(solicitacaoId) : NaN;
  const exibirDetalhe = Number.isFinite(idNumerico) && idNumerico > 0;

  return (
    <>
      <Header onLogout={handleLogout} />

      <div className="painel-cliente">
        <main
          className="painel-content"
          style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}
        >
          {exibirDetalhe ? (
            isCliente ? (
              <AcompanhamentoClienteDetalhe solicitacaoId={idNumerico} />
            ) : (
              <AcompanhamentoPrestadorDetalhe solicitacaoId={idNumerico} />
            )
          ) : (
            <AcompanhamentoLista />
          )}
        </main>
      </div>
    </>
  );
}

export default AcompanhamentoPage;
