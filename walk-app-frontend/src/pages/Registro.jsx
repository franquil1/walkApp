import { useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

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
    try {
      setCargando(true);
      await axios.post(`${API_BASE}/api/auth/registro/`, form);
      setExito("¡Cuenta creada! Revisa tu correo para activarla.");
      setForm({ username: "", email: "", password1: "", password2: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear la cuenta.");
    } finally {
      setCargando(false);
    }
  };

  // Indicador de fortaleza de contraseña
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0d1f0d 0%, #1e3d1a 50%, #2d5a27 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Lora', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input { font-family: 'DM Sans', sans-serif; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .input-field:focus { outline: none; border-color: #4a7c59 !important; box-shadow: 0 0 0 3px rgba(74,124,89,0.15); }
        .btn-submit:hover { background: #1e3d1a !important; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(45,90,39,0.4) !important; }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none !important; }
      `}</style>

      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          position: "fixed",
          width: [300, 200, 150, 250][i], height: [300, 200, 150, 250][i],
          borderRadius: "50%",
          background: `rgba(181,213,160,${[0.04, 0.06, 0.05, 0.03][i]})`,
          top: ["5%", "60%", "30%", "-5%"][i],
          left: ["-5%", "70%", "-8%", "65%"][i],
          animation: `float ${[7, 9, 6, 8][i]}s ease-in-out infinite`,
          animationDelay: `${i * 0.7}s`,
          pointerEvents: "none",
        }} />
      ))}

      <div style={{ width: "100%", maxWidth: 480, animation: "fadeIn 0.6s ease forwards" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #4a7c59, #b5d5a0)", borderRadius: "50% 20% 50% 20%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>🌿</div>
            <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.6rem", color: "#f7f5f0" }}>Walk App</span>
          </a>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "rgba(247,245,240,0.55)", marginTop: 8 }}>
            Popayán · Colombia
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(247,245,240,0.97)", borderRadius: 6, padding: "48px 44px", boxShadow: "0 25px 60px rgba(0,0,0,0.35)" }}>
          <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.9rem", color: "#1a2e1a", marginBottom: 8 }}>Crear cuenta</h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.95rem", color: "#6a7a6a", marginBottom: 36 }}>
            Únete a la comunidad de caminantes de Popayán
          </p>

          {/* Error */}
          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid rgba(244,67,54,0.3)", borderRadius: 4, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <span>⚠️</span>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#c62828" }}>{error}</p>
            </div>
          )}

          {/* Éxito */}
          {exito && (
            <div style={{ background: "#f1f8f1", border: "1px solid rgba(74,124,89,0.3)", borderRadius: 4, padding: "16px", marginBottom: 24 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", color: "#2d5a27", fontWeight: 500, marginBottom: 8 }}>✅ {exito}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#4a7a4a" }}>
                Una vez activada tu cuenta, podrás{" "}
                <a href="/login" style={{ color: "#2d5a27", fontWeight: 600 }}>iniciar sesión aquí</a>.
              </p>
            </div>
          )}

          {!exito && (
            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.85rem", color: "#1a2e1a", display: "block", marginBottom: 8, letterSpacing: "0.03em" }}>
                  Nombre de usuario
                </label>
                <input type="text" name="username" value={form.username} onChange={handleChange}
                  placeholder="Ej: caminante_popayan"
                  className="input-field"
                  style={{ width: "100%", padding: "13px 16px", border: "1.5px solid rgba(74,124,89,0.25)", borderRadius: 3, fontSize: "0.95rem", color: "#1a2e1a", background: "#f7f5f0", transition: "all 0.2s" }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.85rem", color: "#1a2e1a", display: "block", marginBottom: 8, letterSpacing: "0.03em" }}>
                  Correo electrónico
                </label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="tucorreo@ejemplo.com"
                  className="input-field"
                  style={{ width: "100%", padding: "13px 16px", border: "1.5px solid rgba(74,124,89,0.25)", borderRadius: 3, fontSize: "0.95rem", color: "#1a2e1a", background: "#f7f5f0", transition: "all 0.2s" }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.85rem", color: "#1a2e1a", display: "block", marginBottom: 8, letterSpacing: "0.03em" }}>
                  Contraseña
                </label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} name="password1" value={form.password1} onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className="input-field"
                    style={{ width: "100%", padding: "13px 44px 13px 16px", border: "1.5px solid rgba(74,124,89,0.25)", borderRadius: 3, fontSize: "0.95rem", color: "#1a2e1a", background: "#f7f5f0", transition: "all 0.2s" }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#6a7a6a" }}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Indicador de fortaleza */}
              {form.password1 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.level ? strength.color : "rgba(74,124,89,0.15)", transition: "background 0.3s" }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: strength.color, fontWeight: 500 }}>
                    Contraseña {strength.label}
                  </span>
                </div>
              )}

              {/* Confirm Password */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.85rem", color: "#1a2e1a", display: "block", marginBottom: 8, letterSpacing: "0.03em" }}>
                  Confirmar contraseña
                </label>
                <input type={showPassword ? "text" : "password"} name="password2" value={form.password2} onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  className="input-field"
                  style={{ width: "100%", padding: "13px 16px", border: `1.5px solid ${form.password2 && form.password1 !== form.password2 ? "rgba(244,67,54,0.5)" : "rgba(74,124,89,0.25)"}`, borderRadius: 3, fontSize: "0.95rem", color: "#1a2e1a", background: "#f7f5f0", transition: "all 0.2s" }}
                />
                {form.password2 && form.password1 !== form.password2 && (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#f44336", marginTop: 6 }}>Las contraseñas no coinciden</p>
                )}
              </div>

              <button type="submit" disabled={cargando} className="btn-submit"
                style={{ width: "100%", padding: "15px", background: "#2d5a27", color: "#f7f5f0", border: "none", borderRadius: 3, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "all 0.3s", letterSpacing: "0.04em", boxShadow: "0 4px 15px rgba(45,90,39,0.25)" }}>
                {cargando ? "Creando cuenta..." : "Crear Cuenta Gratis"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(74,124,89,0.15)" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "#9a9a9a" }}>¿Ya tienes cuenta?</span>
            <div style={{ flex: 1, height: 1, background: "rgba(74,124,89,0.15)" }} />
          </div>

          <a href="/login"
            style={{ display: "block", textAlign: "center", padding: "14px", border: "2px solid #2d5a27", color: "#2d5a27", textDecoration: "none", borderRadius: 3, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.95rem", transition: "all 0.3s", letterSpacing: "0.04em" }}
            onMouseEnter={(e) => { e.target.style.background = "#2d5a27"; e.target.style.color = "#f7f5f0"; }}
            onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#2d5a27"; }}
          >
            Iniciar Sesión
          </a>
        </div>

        <p style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(247,245,240,0.4)", marginTop: 24 }}>
          © 2025 Walk App · Popayán, Colombia
        </p>
      </div>
    </div>
  );
}