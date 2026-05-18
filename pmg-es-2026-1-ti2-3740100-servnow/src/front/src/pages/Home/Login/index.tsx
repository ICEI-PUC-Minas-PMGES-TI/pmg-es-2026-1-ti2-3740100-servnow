import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import "./Login.css";

import loginImg from "../../../assets/login.svg";
import {
  API_URL,
  authHeader,
  clearAuthSession,
  getDashboardRoute,
  saveAuthSession,
  type AuthResponse,
} from "../../../services/auth";

type UserType = "cliente" | "prestador";

export function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>("cliente");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha: password,
          tipoUsuario: userType,
        }),
      });

      const data = (await response.json()) as AuthResponse | { detail?: string };

      if (!response.ok) {
        throw new Error("detail" in data ? data.detail || "Nao foi possivel fazer login." : "Nao foi possivel fazer login.");
      }

      const loginData = data as AuthResponse;
      const validationResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: authHeader(loginData.token),
      });

      if (!validationResponse.ok) {
        clearAuthSession();
        throw new Error("Login retornou um token que o backend nao aceitou. Reinicie o backend e tente novamente.");
      }

      saveAuthSession(loginData);
      setSuccessMessage(`Login realizado como ${loginData.tipoUsuario.toLowerCase()}.`);
      setEmail("");
      setPassword("");
      window.setTimeout(() => {
        navigate(getDashboardRoute(loginData.tipoUsuario));
      }, 500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel fazer login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-visual-content">
          <span className="login-visual-badge">Plataforma de servicos #1 do Brasil</span>
          <h2>Bem-vindo de volta a Servnow</h2>
          <p>Conectamos clientes e prestadores de forma rapida, segura e sem complicacao.</p>

          <div className="login-img-placeholder">
            <img src={loginImg} alt="Login illustration" />
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-form-wrapper">
          <div className="login-toggle">
            <button
              type="button"
              className={`toggle-btn ${userType === "cliente" ? "active" : ""}`}
              onClick={() => setUserType("cliente")}
            >
              Sou cliente
            </button>
            <button
              type="button"
              className={`toggle-btn ${userType === "prestador" ? "active" : ""}`}
              onClick={() => setUserType("prestador")}
            >
              Sou prestador
            </button>
          </div>

          <h1>Entrar na conta</h1>
          <p className="login-sub">
            {userType === "cliente"
              ? "Acesse e encontre o profissional ideal para voce."
              : "Acesse e gerencie seus servicos e clientes."}
          </p>

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

            <div className="form-group">
              <div className="label-row">
                <label>Senha</label>
                <Link to="/esqueci-senha" className="forgot-link">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="input-wrapper">
                <Lock size={17} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {errorMessage && <p className="login-feedback error">{errorMessage}</p>}
            {successMessage && <p className="login-feedback success">{successMessage}</p>}

            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"} <ArrowRight size={16} />
            </button>
          </form>

          <div className="login-divider">
            <span />
            <p>ou</p>
            <span />
          </div>

          <p className="login-register">
            Ainda nao tem conta?{" "}
            <Link to="/cadastro">
              Cadastre-se gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
