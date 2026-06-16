import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import "../../Login/Login.css";

import { API_URL } from "../../../services/auth";

export function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/esqueci-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok && response.status !== 204) {
        const data = (await response.json().catch(() => ({}))) as { detail?: string };
        throw new Error(data.detail || "Não foi possível enviar o e-mail.");
      }

      setEnviado(true);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível enviar o e-mail.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-form-side" style={{ gridColumn: "1 / -1" }}>
        <div className="login-form-wrapper">
          <h1>Recuperar senha</h1>
          <p className="login-sub">
            Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
          </p>

          {enviado ? (
            <p className="login-feedback success">
              Se existir uma conta com esse e-mail, enviamos um link de redefinição. Confira sua caixa
              de entrada (e a pasta de spam).
            </p>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>E-mail</label>
                <div className="input-wrapper">
                  <Mail size={17} className="input-icon" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {erro && <p className="login-feedback error">{erro}</p>}

              <button type="submit" className="btn-login" disabled={carregando}>
                {carregando ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          )}

          <p className="login-register" style={{ marginTop: 18 }}>
            <Link to="/login">
              <ArrowLeft size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EsqueciSenha;
