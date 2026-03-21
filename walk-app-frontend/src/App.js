import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Comunidad from "./pages/Comunidad";
import Juegos from "./pages/Juegos";
import Rutas from "./pages/Rutas";
import Ranking from "./pages/Ranking";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";
import DetalleRuta from "./pages/DetalleRuta";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import SOSButton from "./components/SOSButton";
import ActivarCuenta from "./pages/ActivarCuenta";

function App() {
  const isAuthenticated = !!localStorage.getItem("access_token");

  return (
    <>
      {isAuthenticated && <SOSButton />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/juegos" element={<Juegos />} />
        <Route path="/rutas" element={<Rutas />} />
        <Route path="/rutas/:id" element={<DetalleRuta />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/dashboard" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/activar/:uidb64/:token" element={<ActivarCuenta />} />
      </Routes>
    </>
  );
}

export default App;