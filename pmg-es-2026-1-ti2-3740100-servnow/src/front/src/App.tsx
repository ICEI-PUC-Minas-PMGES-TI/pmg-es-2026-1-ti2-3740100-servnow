import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PainelCliente } from "./Components/Painel";
import { Perfil } from "./Components/Perfil";
import "./global.css";
import Layout from "./Layout/Layout";
import { Home } from "./pages/Home";
import { Cadastro } from "./pages/Cadastro";
import { Login } from "./pages/Login";
import { EsqueciSenha } from "./pages/Home/EsqueciSenha";
import { RedefinirSenha } from "./pages/Home/RedefinirSenha";
import { PainelPrestador } from "./Components/Painel/Prestador";
import { AcompanhamentoPage } from "./pages/Acompanhamento";
import { NotFound } from "./pages/NotFound";
import { getValidAuthSession, getDashboardRoute, type TipoUsuario } from "./services/auth";
import { applyTheme, getStoredTheme } from "./services/theme";

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getValidAuthSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RoleRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role: TipoUsuario;
}) {
  const session = getValidAuthSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.tipoUsuario !== role) {
    return <Navigate to={getDashboardRoute(session.tipoUsuario)} replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getValidAuthSession();

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return (
    <>
      <Routes>
        {/* Rotas COM header e footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Rotas SEM header e footer */}
        <Route
          path="/login"
          element={(
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/cadastro"
          element={(
            <PublicOnlyRoute>
              <Cadastro />
            </PublicOnlyRoute>
          )}
        />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route
          path="/perfil"
          element={(
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/painel/cliente"
          element={(
            <RoleRoute role="CLIENTE">
              <PainelCliente />
            </RoleRoute>
          )}
        />
        <Route
          path="/painel/prestador"
          element={(
            <RoleRoute role="PRESTADOR">
              <PainelPrestador />
            </RoleRoute>
          )}
        />
        <Route
          path="/acompanhamento"
          element={(
            <ProtectedRoute>
              <AcompanhamentoPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/acompanhamento/:solicitacaoId"
          element={(
            <ProtectedRoute>
              <AcompanhamentoPage />
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={2600}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <Analytics />
    </>
  );
}

export default App;
