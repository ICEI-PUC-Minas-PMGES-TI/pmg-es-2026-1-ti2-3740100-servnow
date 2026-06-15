import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import "../Login/Login.css";

import { API_URL } from "../../../services/auth";

export function RedefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não conferem.");
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha: senha }),
      });

      if (!response.ok && response.status !== 204) {
        const data = (await response.json().catch(() => ({}))) as { detail?: string };
        throw new Error(data.detail || "Não foi possível redefinir a senha.");
      }

      setOk(true);
      window.setTimeout(() => navigate("/login"), 1800);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível redefinir a senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-form-side" style={{ gridColumn: "1 / -1" }}>
        <div className="login-form-wrapper">
          <h1>Criar nova senha</h1>
          <p className="login-sub">Defina uma nova senha para acessar a sua conta.</p>

          {!token ? (
            <p className="login-feedback error">
              Link inválido. Solicite a recuperação de senha novamente.
            </p>
          ) : ok ? (
            <p className="login-feedback success">
              Senha redefinida com sucesso! Redirecionando para o login...
            </p>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nova senha</label>
                <div className="input-wrapper">
                  <Lock size={17} className="input-icon" />
                  <input
                    type={mostrar ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <button type="button" className="toggle-password" onClick={() => setMostrar((c) => !c)}>
                    {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirmar senha</label>
                <div className="input-wrapper">
                  <Lock size={17} className="input-icon" />
                  <input
                    type={mostrar ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    required
                  />
                </div>
              </div>

              {erro && <p className="login-feedback error">{erro}</p>}

              <button type="submit" className="btn-login" disabled={carregando}>
                {carregando ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          )}

          <p className="login-register" style={{ marginTop: 18 }}>
            <Link to="/login">Voltar para o login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RedefinirSenha;
