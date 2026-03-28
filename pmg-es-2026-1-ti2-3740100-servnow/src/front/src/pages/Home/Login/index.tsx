import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import "./Login.css";

import loginImg from "../../../assets/login.svg";

type UserType = "cliente" | "prestador";

export function Login() {
  const [userType, setUserType] = useState<UserType>("cliente");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-page">

      {/* LADO ESQUERDO — imagem */}
      <div className="login-visual">
        <div className="login-visual-content">
          <span className="login-visual-badge">Plataforma de serviços #1 do Brasil</span>
          <h2>Bem-vindo de volta à Servnow</h2>
          <p>Conectamos clientes e prestadores de forma rápida, segura e sem complicação.</p>

          <div className="login-img-placeholder">
            <img src={loginImg} alt="Login illustration" />
          </div>
        </div>
      </div>

      {/* LADO DIREITO — formulário */}
      <div className="login-form-side">
        <div className="login-form-wrapper">

          {/* TOGGLE */}
          <div className="login-toggle">
            <button
              className={`toggle-btn ${userType === "cliente" ? "active" : ""}`}
              onClick={() => setUserType("cliente")}
            >
              Sou cliente
            </button>
            <button
              className={`toggle-btn ${userType === "prestador" ? "active" : ""}`}
              onClick={() => setUserType("prestador")}
            >
              Sou prestador
            </button>
          </div>

          {/* TÍTULO */}
          <h1>Entrar na conta</h1>
          <p className="login-sub">
            {userType === "cliente"
              ? "Acesse e encontre o profissional ideal para você."
              : "Acesse e gerencie seus serviços e clientes."}
          </p>

          {/* FORM */}
          <form className="login-form" onSubmit={(e) => e.preventDefault()}>

            <div className="form-group">
              <label>E-mail</label>
              <div className="input-wrapper">
                <Mail size={17} className="input-icon" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Senha</label>
                <Link to="/esqueci-senha" className="forgot-link">Esqueceu a senha?</Link>
              </div>
              <div className="input-wrapper">
                <Lock size={17} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login">
              Entrar <ArrowRight size={16} />
            </button>

          </form>

          {/* DIVIDER */}
          <div className="login-divider">
            <span />
            <p>ou</p>
            <span />
          </div>

          {/* CADASTRO */}
          <p className="login-register">
            Ainda não tem conta?{" "}
            <Link to={userType === "cliente" ? "/cadastro" : "/cadastro-prestador"}>
              Cadastre-se grátis
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}