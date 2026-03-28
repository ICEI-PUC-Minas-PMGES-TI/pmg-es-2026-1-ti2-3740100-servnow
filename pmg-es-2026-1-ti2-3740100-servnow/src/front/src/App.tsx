import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import Layout from "./Layout/Layout";
import { Login } from "./pages/Home/Login";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Rotas COM header e footer */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* Rotas SEM header e footer */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;