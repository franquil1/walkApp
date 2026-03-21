import { useState } from "react";
import api from "../axiosConfig";
import "./Registro.css";

export default function Registro() {
  const [form, setForm] = useState({ username: "", email: "", password1: "", password2: "" });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password1 || !form.password2) {
      setError("Completa todos los campos.");
      return;
    }
    if (form.password1 !== form.password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.password1.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    try {
      setCargando(true);
      await api.post("/api/auth/registro/", {
        username: form.username,
        email: form.email,
        password: form.password1,
      });
      setExito("¡Cuenta creada! Revisa tu correo para activarla.");
      setForm({ username: "", email: "", password1: "", password2: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear la cuenta.");
    } finally {
      setCargando(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: score, label: "Débil", color: "#f44336" };
    if (score === 2) return { level: score, label: "Regular", color: "#ff9800" };
    if (score === 3) return { level: score, label: "Buena", color: "#4caf50" };
    return { level: score, label: "Fuerte", color: "#2d5a27" };
  };

  const strength = getPasswordStrength(form.password1);

  return (
    <div className="registro-page">
      <div className="registro-orb registro-orb--1" />
      <div className="registro-orb registro-orb--2" />
      <div className="registro-orb registro-orb--3" />
      <div className="registro-orb registro-orb--4" />

      <div className="registro-wrapper">

        <div className="registro-header">
          <a href="/" className="registro-logo-link">
            <div className="registro-logo-icon">🌿</div>
            <span className="registro-logo-name">Walk App</span>
          </a>
          <p className="registro-location">Popayán · Colombia</p>
        </div>

        <div className="registro-card">
          <h1 className="registro-card__title">Crear cuenta</h1>
          <p className="registro-card__subtitle">Únete a la comunidad de caminantes de Popayán</p>

          {error && (
            <div className="registro-error">
              <span>⚠️</span>
              <p className="registro-error__text">{error}</p>
            </div>
          )}

          {exito && (
            <div className="registro-exito">
              <p className="registro-exito__title">✅ {exito}</p>
              <p className="registro-exito__text">
                Una vez activada tu cuenta, podrás{" "}
                <a href="/login" className="registro-exito__link">iniciar sesión aquí</a>.
              </p>
            </div>
          )}

          {!exito && (
            <form onSubmit={handleSubmit}>

              <div className="registro-field">
                <label className="registro-label">Nombre de usuario</label>
                <input type="text" name="username" value={form.username}
                  onChange={handleChange} placeholder="Ej: caminante_popayan"
                  className="registro-input" />
              </div>

              <div className="registro-field">
                <label className="registro-label">Correo electrónico</label>
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="tucorreo@ejemplo.com"
                  className="registro-input" />
              </div>

              <div className="registro-field">
                <label className="registro-label">Contraseña</label>
                <div className="registro-password-wrapper">
                  <input type={showPassword ? "text" : "password"} name="password1"
                    value={form.password1} onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className="registro-input registro-input--password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="registro-toggle-password">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {form.password1 && (
                <div className="registro-strength">
                  <div className="registro-strength__bars">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="registro-strength__bar"
                        style={{ background: i <= strength.level ? strength.color : undefined }} />
                    ))}
                  </div>
                  <span className="registro-strength__label" style={{ color: strength.color }}>
                    Contraseña {strength.label}
                  </span>
                </div>
              )}

              <div className="registro-field registro-field--password-confirm">
                <label className="registro-label">Confirmar contraseña</label>
                <input type={showPassword ? "text" : "password"} name="password2"
                  value={form.password2} onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  className={`registro-input ${form.password2 && form.password1 !== form.password2 ? "registro-input--error" : ""}`} />
                {form.password2 && form.password1 !== form.password2 && (
                  <p className="registro-password-mismatch">Las contraseñas no coinciden</p>
                )}
              </div>

              <button type="submit" disabled={cargando} className="registro-btn-submit">
                {cargando ? "Creando cuenta..." : "Crear Cuenta Gratis"}
              </button>
            </form>
          )}

          <div className="registro-divider">
            <div className="registro-divider__line" />
            <span className="registro-divider__text">¿Ya tienes cuenta?</span>
            <div className="registro-divider__line" />
          </div>

          <a href="/login" className="registro-btn-login">Iniciar Sesión</a>
        </div>

        <p className="registro-footer">© 2025 Walk App · Popayán, Colombia</p>
      </div>
    </div>
  );
}