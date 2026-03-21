import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ActivarCuenta.css";

export default function ActivarCuenta() {
  const { uidb64, token } = useParams();
  const [estado, setEstado] = useState("cargando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const activar = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/auth/activar/${uidb64}/${token}/`);
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setEstado("exito");
        setMensaje(res.data.mensaje);
        setTimeout(() => { window.location.href = "/"; }, 3000);
      } catch (err) {
        setEstado("error");
        setMensaje(err.response?.data?.error || "El enlace de activación no es válido o ya expiró.");
      }
    };
    activar();
  }, [uidb64, token]);

  return (
    <div className="activar-page">
      <div className="activar-orb activar-orb--1" />
      <div className="activar-orb activar-orb--2" />
      <div className="activar-orb activar-orb--3" />
      <div className="activar-orb activar-orb--4" />

      <div className="activar-wrapper">
        <div className="activar-header">
          <a href="/" className="activar-logo-link">
            <div className="activar-logo-icon">🌿</div>
            <span className="activar-logo-name">Walk App</span>
          </a>
          <p className="activar-location">Popayán · Colombia</p>
        </div>

        <div className="activar-card">

          {}
          {estado === "cargando" && (
            <>
              <div className="activar-spinner" />
              <h2 className="activar-card__title">Activando tu cuenta...</h2>
              <p className="activar-card__text">Por favor espera un momento.</p>
            </>
          )}

          {}
          {estado === "exito" && (
            <>
              <span className="activar-exito__icon">✅</span>
              <h2 className="activar-card__title">¡Cuenta activada!</h2>
              <p className="activar-exito__text">
                {mensaje || "Tu cuenta ha sido activada correctamente."}<br />
                Serás redirigido al inicio en unos segundos...
              </p>
              <div className="activar-exito__banner">
                <p className="activar-exito__banner-text">🥾 Ya puedes explorar las rutas de Popayán</p>
              </div>
              <a href="/" className="activar-btn-inicio">Ir al inicio →</a>
            </>
          )}

          {}
          {estado === "error" && (
            <>
              <span className="activar-error__icon">❌</span>
              <h2 className="activar-card__title">Enlace inválido</h2>
              <div className="activar-error__msg">
                <p className="activar-error__msg-text">{mensaje}</p>
              </div>
              <p className="activar-error__hint">
                El enlace puede haber expirado o ya fue usado. Intenta registrarte de nuevo.
              </p>
              <a href="/registro" className="activar-btn-registro">Registrarse de nuevo</a>
              <a href="/login" className="activar-btn-login">Ya tengo cuenta — Iniciar sesión</a>
            </>
          )}
        </div>

        <p className="activar-footer">© 2025 Walk App · Popayán, Colombia</p>
      </div>
    </div>
  );
}