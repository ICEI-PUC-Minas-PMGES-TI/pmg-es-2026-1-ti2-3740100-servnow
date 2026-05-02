import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Home } from "./pages/Home";
import Layout from "./Layout/Layout";
import { Login } from "./pages/Home/Login";
import { Cadastro } from "./pages/Home/Cadastro";

import { getAuthSession } from "./services/auth";
import { applyTheme, getStoredTheme } from "./services/theme";
import "react-toastify/dist/ReactToastify.css";
import "./global.css";

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getAuthSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getAuthSession();

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
     
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={2600}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
