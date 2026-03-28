import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import Layout from "./Layout/Layout";
import "./App.css";
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;