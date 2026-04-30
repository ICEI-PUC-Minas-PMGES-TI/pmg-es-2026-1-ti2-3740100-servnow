import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../Login/Login.css";

import cadastroClienteImg from "../../../assets/cadastrocliente.svg";
import cadastroPrestadorImg from "../../../assets/imgprestadorcadastro.svg";
import { API_URL, clearAuthSession, type AuthResponse } from "../../../services/auth";

type UserType = "cliente" | "prestador";

export function Cadastro() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>("cliente");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const registerImg = userType === "cliente" ? cadastroClienteImg : cadastroPrestadorImg;
  const registerImgAlt =
    userType === "cliente"
      ? "Cadastro de cliente na plataforma Servnow"
      : "Cadastro de prestador na plataforma Servnow";
  const registerDescription =
    userType === "cliente"
      ? "Cadastre-se como cliente para encontrar profissionais confiaveis, solicitar servicos e acompanhar seus atendimentos em um so lugar."
      : "Cadastre-se como prestador para divulgar seus servicos, receber oportunidades e gerenciar seus atendimentos com praticidade.";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (senha !== confirmacaoSenha) {
      toast.error("As senhas nao coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          tipoUsuario: userType,
        }),
      });

      const data = (await response.json()) as AuthResponse | { detail?: string };

      if (!response.ok) {
        throw new Error("detail" in data ? data.detail || "Nao foi possivel concluir o cadastro." : "Nao foi possivel concluir o cadastro.");
      }

      const registerData = data as AuthResponse;
      clearAuthSession();
      toast.success(`Conta criada com sucesso como ${registerData.tipoUsuario.toLowerCase()}. Faca login para acessar.`);
      setNome("");
      setEmail("");
      setSenha("");
      setConfirmacaoSenha("");

      window.setTimeout(() => {
        navigate("/login");
      }, 700);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel concluir o cadastro.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-visual-content">
          <span className="login-visual-badge">Comece agora na Servnow</span>
          <h2>Crie sua conta e escolha como quer entrar</h2>
          <p>{registerDescription}</p>

          <div className="login-img-placeholder">
            <img src={registerImg} alt={registerImgAlt} />
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

          <h1>Criar conta</h1>
          <p className="login-sub">
            {userType === "cliente"
              ? "Cadastre-se para encontrar profissionais confiaveis perto de voce."
              : "Cadastre-se para divulgar seus servicos e atender novos clientes."}
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome completo</label>
              <div className="input-wrapper">
                <User size={17} className="input-icon" />
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>E-mail</label>
              <div className="input-wrapper">
                <Mail size={17} className="input-icon" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>{userType === "cliente" ? "Tipo de conta" : "Perfil profissional"}</label>
              <div className="input-wrapper">
                <Briefcase size={17} className="input-icon" />
                <input
                  type="text"
                  value={userType === "cliente" ? "Cliente" : "Prestador de servicos"}
                  readOnly
                />
              </div>
            </div>

            <div className="form-group">
              <label>Senha</label>
              <div className="input-wrapper">
                <Lock size={17} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  minLength={6}
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

            <div className="form-group">
              <label>Confirmar senha</label>
              <div className="input-wrapper">
                <Lock size={17} className="input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repita sua senha"
                  value={confirmacaoSenha}
                  onChange={(event) => setConfirmacaoSenha(event.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? "Criando conta..." : "Cadastrar"} <ArrowRight size={16} />
            </button>
          </form>

          <div className="login-divider">
            <span />
            <p>ou</p>
            <span />
          </div>

          <p className="login-register">
            Ja tem conta? <Link to="/login">Entrar agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
