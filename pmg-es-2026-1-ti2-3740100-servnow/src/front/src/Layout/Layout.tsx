import { Outlet, useNavigate } from "react-router-dom";
import { Footer } from "../Components/Footer/Footer";
import { Header } from "../Components/Header/Header";
import { clearAuthSession } from "../services/auth";
const Layout = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header
        onLogout={() => {
          clearAuthSession();
          navigate("/login");
        }}
      />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
export default Layout;
