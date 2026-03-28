import { createBrowserRouter, Outlet } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Home/Login";
// Removi o Layout do lucide-react pois ele é um ícone!

export const router = createBrowserRouter([
  {
    path: "/",

    element: <div className="app-layout"><Outlet /></div>, 
    children: [
      {
        path: "/", // Página inicial
        element: <Home />,
      },
      {
        path: "/login", 
        element: <Login />,
      },
    ],
  },
]);