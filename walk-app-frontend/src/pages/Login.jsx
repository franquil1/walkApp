import { useState } from "react";
import api from "../axiosConfig";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Completa todos los campos.");
      return;
    }
    try {
      setCargando(true);
      const res = await api.post("/api/auth/login/", form);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      try {
        const favRes = await api.get("/api/rutas/favoritas/", {
          headers: { Authorization: `Bearer ${res.data.access}` }
        });
        const userId = res.data.user.id;
        localStorage.setItem(`favoritos_${userId}`, JSON.stringify(favRes.data.favoritas));
        localStorage.removeItem("favoritos");
      } catch { }

      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-orb login-orb--1" />
      <div className="login-orb login-orb--2" />
      <div className="login-orb login-orb--3" />
      <div className="login-orb login-orb--4" />

      <div className="login-wrapper">
        <div className="login-header">
          <a href="/" className="login-logo-link">
            <div className="login-logo-icon">🌿</div>
            <span className="login-logo-name">Walk App</span>
          </a>
          <p className="login-location">Popayán · Colombia</p>
        </div>

        <div className="login-card">
          <h1 className="login-card__title">Bienvenido de nuevo</h1>
          <p className="login-card__subtitle">Inicia sesión para continuar tu aventura</p>

          {error && (
            <div className="login-error">
              <span className="login-error__icon">⚠️</span>
              <p className="login-error__text">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Usuario</label>
              <input type="text" name="username" value={form.username}
                onChange={handleChange} placeholder="Tu nombre de usuario"
                className="login-input" />
            </div>

            <div className="login-field login-field--password">
              <div className="login-label-row">
                <label className="login-label">Contraseña</label>
                <a href="/recuperar-contrasena" className="login-forgot">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="login-password-wrapper">
                <input type={showPassword ? "text" : "password"} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Tu contraseña"
                  className="login-input login-input--password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="login-toggle-password">
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={cargando} className="login-btn-submit">
              {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="login-divider">
            <div className="login-divider__line" />
            <span className="login-divider__text">¿No tienes cuenta?</span>
            <div className="login-divider__line" />
          </div>

          <a href="/registro" className="login-btn-register">Crear una cuenta</a>
        </div>

        <p className="login-footer">© 2025 Walk App · Popayán, Colombia</p>
      </div>
    </div>
  );
}