import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../axiosConfig";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DIFICULTAD_COLORS = {
  FACIL: { bg: "#e8f5e9", text: "#2d5a27", dot: "#4caf50" },
  MODERADO: { bg: "#fff8e1", text: "#e65100", dot: "#ff9800" },
  DIFICIL: { bg: "#fce4ec", text: "#b71c1c", dot: "#f44336" },
  EXTREMO: { bg: "#f3e5f5", text: "#4a148c", dot: "#9c27b0" },
};

const DIFICULTAD_LABELS = {
  FACIL: "Fácil", MODERADO: "Moderado", DIFICIL: "Difícil", EXTREMO: "Extremo",
};

const RUTA_GRADIENTS = [
  "linear-gradient(135deg, #1e3d1a 0%, #4a7c59 100%)",
  "linear-gradient(135deg, #2d5a27 0%, #b5d5a0 100%)",
  "linear-gradient(135deg, #0d1f0d 0%, #3a6b4a 100%)",
  "linear-gradient(135deg, #1a3a1a 0%, #6a9b6a 100%)",
];

function AvatarIcon({ username, size = 80, fontSize = "2rem" }) {
  const colors = [
    ["#2d5a27", "#b5d5a0"], ["#1e3d2f", "#4a7c59"],
    ["#0d2a1a", "#3a6b4a"], ["#1a3a2a", "#5a8a6a"],
  ];
  const idx = username ? username.charCodeAt(0) % colors.length : 0;
  const [from, to] = colors[idx];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Lora', serif", fontWeight: 700, fontSize, color: "#f7f5f0",
      flexShrink: 0, boxShadow: "0 8px 24px rgba(26,46,26,0.25)",
    }}>
      {username ? username[0].toUpperCase() : "?"}
    </div>
  );
}

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [rutasFavoritas, setRutasFavoritas] = useState([]);
  const [cargandoFavs, setCargandoFavs] = useState(false);
  const [tab, setTab] = useState("favoritas");
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "" });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(u);
      setUser(parsed);
      setFormData({ first_name: parsed.first_name || "", last_name: parsed.last_name || "", email: parsed.email || "" });
    } catch { navigate("/login"); }
  }, [navigate]);

  // Cargar rutas favoritas
  useEffect(() => {
    const fetchFavoritas = async () => {
      const favIds = JSON.parse(localStorage.getItem("favoritos") || "[]");
      if (favIds.length === 0) { setRutasFavoritas([]); return; }
      setCargandoFavs(true);
      try {
        const res = await api.get("/api/rutas/");
        const favs = res.data.filter((r) => favIds.includes(r.id));
        setRutasFavoritas(favs);
      } catch {}
      finally { setCargandoFavs(false); }
    };
    fetchFavoritas();
  }, []);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await api.patch("/api/auth/perfil/", formData);
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMensaje({ type: "success", text: "Perfil actualizado correctamente." });
      setEditando(false);
    } catch {
      setMensaje({ type: "error", text: "No se pudo actualizar el perfil." });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleQuitarFavorito = (rutaId) => {
    const favIds = JSON.parse(localStorage.getItem("favoritos") || "[]");
    const nuevos = favIds.filter((id) => id !== rutaId);
    localStorage.setItem("favoritos", JSON.stringify(nuevos));
    setRutasFavoritas((prev) => prev.filter((r) => r.id !== rutaId));
  };

  const stats = [
    { label: "Rutas favoritas", value: rutasFavoritas.length, icon: "❤️" },
    { label: "Km totales", value: rutasFavoritas.reduce((acc, r) => acc + parseFloat(r.longitud || 0), 0).toFixed(1), icon: "📏" },
    { label: "Fáciles", value: rutasFavoritas.filter((r) => r.dificultad === "FACIL").length, icon: "🟢" },
    { label: "Difíciles", value: rutasFavoritas.filter((r) => r.dificultad === "DIFICIL" || r.dificultad === "EXTREMO").length, icon: "🔴" },
  ];

  if (!user) return null;

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif", background: "#f7f5f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .tab-btn { padding: 12px 24px; border: none; background: none; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500; cursor: pointer; color: rgba(247,245,240,0.45); border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab-btn.active { color: #b5d5a0; border-bottom-color: #b5d5a0; }
        .input-field { width: 100%; padding: 11px 16px; border: 1.5px solid rgba(74,124,89,0.2); border-radius: 4px; font-family: 'DM Sans', sans-serif; font-size: 0.92rem; color: #1a2e1a; background: #f7f5f0; transition: all 0.2s; }
        .input-field:focus { outline: none; border-color: #4a7c59; box-shadow: 0 0 0 3px rgba(74,124,89,0.1); }
        .input-field:disabled { background: #f0ede6; color: #9a9a9a; cursor: not-allowed; }
        .fav-card:hover .fav-remove { opacity: 1 !important; }
      `}</style>

      <Navbar />

      {/* HERO */}
      <div style={{ background: "linear-gradient(160deg, #0d1f0d 0%, #1e3d1a 50%, #2d5a27 100%)", paddingTop: 110, paddingBottom: 0, position: "relative", overflow: "hidden" }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", width: [350,200,280][i], height: [350,200,280][i], background: `rgba(181,213,160,${[0.04,0.06,0.03][i]})`, top: ["-20%","30%","10%"][i], left: ["-5%","70%","40%"][i] }} />
        ))}

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 0" }}>
          <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(181,213,160,0.15)", borderRadius: "8px 8px 0 0", padding: "36px 40px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
            <AvatarIcon username={user.username} size={88} fontSize="2.2rem" />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.2em", color: "rgba(181,213,160,0.7)", textTransform: "uppercase", marginBottom: 6 }}>Caminante de Popayán</div>
              <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "2rem", color: "#f7f5f0", lineHeight: 1.2, marginBottom: 6 }}>
                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
              </h1>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "rgba(247,245,240,0.55)" }}>@{user.username} · {user.email}</p>
            </div>
            <button onClick={() => setEditando(!editando)} style={{ padding: "10px 24px", background: editando ? "rgba(244,67,54,0.15)" : "rgba(181,213,160,0.15)", border: `1px solid ${editando ? "rgba(244,67,54,0.3)" : "rgba(181,213,160,0.3)"}`, borderRadius: 4, color: editando ? "#ef9a9a" : "#b5d5a0", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.88rem", cursor: "pointer", transition: "all 0.2s" }}>
              {editando ? "✕ Cancelar" : "✏️ Editar perfil"}
            </button>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", borderLeft: "1px solid rgba(181,213,160,0.15)", borderRight: "1px solid rgba(181,213,160,0.15)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ padding: "20px 24px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(181,213,160,0.1)" : "none" }}>
                <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.6rem", color: "#f7f5f0", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(247,245,240,0.45)", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", borderLeft: "1px solid rgba(181,213,160,0.15)", borderRight: "1px solid rgba(181,213,160,0.15)", background: "rgba(255,255,255,0.03)" }}>
            {[{ key: "favoritas", label: "❤️ Mis Favoritas" }, { key: "info", label: "👤 Mi Información" }, { key: "actividad", label: "📊 Actividad" }].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`tab-btn ${tab === t.key ? "active" : ""}`}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 48px 80px" }}>
        {mensaje && (
          <div style={{ padding: "14px 20px", borderRadius: 4, marginBottom: 24, background: mensaje.type === "success" ? "#e8f5e9" : "#fce4ec", border: `1px solid ${mensaje.type === "success" ? "#a5d6a7" : "#f48fb1"}`, color: mensaje.type === "success" ? "#2d5a27" : "#b71c1c", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", animation: "fadeUp 0.3s ease" }}>
            {mensaje.type === "success" ? "✅" : "❌"} {mensaje.text}
          </div>
        )}

        {/* TAB: FAVORITAS */}
        {tab === "favoritas" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.6rem", color: "#1a2e1a", marginBottom: 4 }}>Mis Rutas Favoritas</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.88rem", color: "#6a7a6a" }}>{rutasFavoritas.length} ruta{rutasFavoritas.length !== 1 ? "s" : ""} guardada{rutasFavoritas.length !== 1 ? "s" : ""}</p>
              </div>
              <Link to="/rutas" style={{ padding: "10px 22px", background: "#2d5a27", color: "#f7f5f0", textDecoration: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem" }}>+ Explorar rutas</Link>
            </div>

            {cargandoFavs && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ width: 36, height: 36, border: "3px solid rgba(74,124,89,0.2)", borderTop: "3px solid #4a7c59", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
              </div>
            )}

            {!cargandoFavs && rutasFavoritas.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 40px", background: "#fff", borderRadius: 6, border: "1px solid rgba(74,124,89,0.1)" }}>
                <div style={{ fontSize: "4rem", marginBottom: 16 }}>🌿</div>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: "1.3rem", color: "#1a2e1a", marginBottom: 10 }}>Aún no tienes favoritas</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: "#6a7a6a", marginBottom: 24 }}>Explora las rutas y guarda las que más te gusten.</p>
                <Link to="/rutas" style={{ padding: "12px 28px", background: "#2d5a27", color: "#f7f5f0", textDecoration: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Ver rutas</Link>
              </div>
            )}

            {!cargandoFavs && rutasFavoritas.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                {rutasFavoritas.map((ruta, i) => {
                  const diff = DIFICULTAD_COLORS[ruta.dificultad] || DIFICULTAD_COLORS.MODERADO;
                  return (
                    <div key={ruta.id} className="fav-card" style={{ background: "#fff", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(74,124,89,0.1)", boxShadow: "0 2px 12px rgba(26,46,26,0.06)", transition: "all 0.3s", position: "relative" }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(26,46,26,0.12)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,46,26,0.06)"; e.currentTarget.style.transform = "none"; }}>
                      <div style={{ height: 160, background: ruta.imagen_url ? "transparent" : RUTA_GRADIENTS[i % RUTA_GRADIENTS.length], position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {ruta.imagen_url ? <img src={ruta.imagen_url} alt={ruta.nombre_ruta} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "3rem" }}>🏔️</span>}
                        <button className="fav-remove" onClick={() => handleQuitarFavorito(ruta.id)} style={{ position: "absolute", top: 10, right: 10, background: "rgba(244,67,54,0.85)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.8rem", color: "#fff", opacity: 0, transition: "opacity 0.2s" }} title="Quitar de favoritos">✕</button>
                      </div>
                      <div style={{ padding: "18px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <h4 style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "1rem", color: "#1a2e1a", lineHeight: 1.3 }}>{ruta.nombre_ruta}</h4>
                          <span style={{ background: diff.bg, color: diff.text, fontSize: "0.65rem", fontWeight: 700, padding: "3px 8px", borderRadius: 20, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", flexShrink: 0, marginLeft: 8, display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: diff.dot }} />{DIFICULTAD_LABELS[ruta.dificultad]}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.82rem", color: "#2d5a27" }}>📏 {ruta.longitud} km</span>
                          {ruta.duracion_estimada && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#6a7a6a" }}>⏱ {ruta.duracion_estimada}</span>}
                        </div>
                        <Link to={`/rutas/${ruta.id}`} style={{ display: "block", textAlign: "center", padding: "9px 0", background: "#f0ede6", color: "#2d5a27", textDecoration: "none", borderRadius: 3, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.82rem" }}>Ver ruta →</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: INFO */}
        {tab === "info" && (
          <div style={{ animation: "fadeUp 0.4s ease", maxWidth: 600 }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.6rem", color: "#1a2e1a", marginBottom: 8 }}>Mi Información</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.88rem", color: "#6a7a6a", marginBottom: 32 }}>{editando ? "Edita tu información personal." : "Tu información de cuenta."}</p>

            <div style={{ background: "#fff", borderRadius: 6, padding: "32px", border: "1px solid rgba(74,124,89,0.1)", boxShadow: "0 2px 12px rgba(26,46,26,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "#4a5a4a", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Nombre</label>
                  <input className="input-field" value={formData.first_name} disabled={!editando} onChange={(e) => setFormData((f) => ({ ...f, first_name: e.target.value }))} placeholder="Tu nombre" />
                </div>
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "#4a5a4a", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Apellido</label>
                  <input className="input-field" value={formData.last_name} disabled={!editando} onChange={(e) => setFormData((f) => ({ ...f, last_name: e.target.value }))} placeholder="Tu apellido" />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "#4a5a4a", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Usuario</label>
                <input className="input-field" value={user.username} disabled />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#9a9a9a", marginTop: 6 }}>El nombre de usuario no se puede cambiar.</p>
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "#4a5a4a", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Correo electrónico</label>
                <input className="input-field" value={formData.email} disabled={!editando} type="email" onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))} placeholder="tu@correo.com" />
              </div>
              {editando && (
                <button onClick={handleGuardar} disabled={guardando} style={{ width: "100%", padding: "13px", background: guardando ? "#6a9b6a" : "#2d5a27", color: "#f7f5f0", border: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.95rem", cursor: guardando ? "not-allowed" : "pointer" }}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB: ACTIVIDAD */}
        {tab === "actividad" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.6rem", color: "#1a2e1a", marginBottom: 8 }}>Mi Actividad</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.88rem", color: "#6a7a6a", marginBottom: 32 }}>Resumen de tu actividad en Walk App.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
              {[
                { icon: "❤️", label: "Rutas favoritas", value: rutasFavoritas.length, color: "#e57373" },
                { icon: "📏", label: "Km en favoritas", value: `${rutasFavoritas.reduce((acc, r) => acc + parseFloat(r.longitud || 0), 0).toFixed(1)} km`, color: "#4a7c59" },
                { icon: "🟢", label: "Fáciles", value: rutasFavoritas.filter((r) => r.dificultad === "FACIL").length, color: "#4caf50" },
                { icon: "🟡", label: "Moderadas", value: rutasFavoritas.filter((r) => r.dificultad === "MODERADO").length, color: "#ff9800" },
                { icon: "🔴", label: "Difíciles", value: rutasFavoritas.filter((r) => r.dificultad === "DIFICIL").length, color: "#f44336" },
                { icon: "🟣", label: "Extremas", value: rutasFavoritas.filter((r) => r.dificultad === "EXTREMO").length, color: "#9c27b0" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 6, padding: "24px", border: "1px solid rgba(74,124,89,0.1)", boxShadow: "0 2px 12px rgba(26,46,26,0.05)", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.5rem", color: "#1a2e1a", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#6a7a6a", marginTop: 4 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {rutasFavoritas.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 6, padding: "28px 32px", border: "1px solid rgba(74,124,89,0.1)", boxShadow: "0 2px 12px rgba(26,46,26,0.05)" }}>
                <h3 style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "1.1rem", color: "#1a2e1a", marginBottom: 20 }}>Distribución por dificultad</h3>
                {[{ key: "FACIL", label: "Fácil", color: "#4caf50" }, { key: "MODERADO", label: "Moderado", color: "#ff9800" }, { key: "DIFICIL", label: "Difícil", color: "#f44336" }, { key: "EXTREMO", label: "Extremo", color: "#9c27b0" }].map((d) => {
                  const count = rutasFavoritas.filter((r) => r.dificultad === d.key).length;
                  const pct = rutasFavoritas.length > 0 ? (count / rutasFavoritas.length) * 100 : 0;
                  return (
                    <div key={d.key} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#4a5a4a", fontWeight: 500 }}>{d.label}</span>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#6a7a6a" }}>{count} ruta{count !== 1 ? "s" : ""}</span>
                      </div>
                      <div style={{ height: 8, background: "#f0ede6", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: 4, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {rutasFavoritas.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 40px", background: "#fff", borderRadius: 6, border: "1px solid rgba(74,124,89,0.1)" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>📊</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6a7a6a" }}>Guarda algunas rutas para ver tu actividad aquí.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}