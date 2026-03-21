import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../axiosConfig";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Perfil.css";

const DIFICULTAD_COLORS = {
  FACIL:    { bg: "#e8f5e9", text: "#2d5a27", dot: "#4caf50" },
  MODERADO: { bg: "#fff8e1", text: "#e65100", dot: "#ff9800" },
  DIFICIL:  { bg: "#fce4ec", text: "#b71c1c", dot: "#f44336" },
  EXTREMO:  { bg: "#f3e5f5", text: "#4a148c", dot: "#9c27b0" },
};
const DIFICULTAD_LABELS = { FACIL: "Fácil", MODERADO: "Moderado", DIFICIL: "Difícil", EXTREMO: "Extremo" };
const RUTA_GRADIENTS = [
  "linear-gradient(135deg, #1e3d1a 0%, #4a7c59 100%)",
  "linear-gradient(135deg, #2d5a27 0%, #b5d5a0 100%)",
  "linear-gradient(135deg, #0d1f0d 0%, #3a6b4a 100%)",
  "linear-gradient(135deg, #1a3a1a 0%, #6a9b6a 100%)",
];
const AVATAR_COLORS = [
  ["#2d5a27", "#b5d5a0"], ["#1e3d2f", "#4a7c59"],
  ["#0d2a1a", "#3a6b4a"], ["#1a3a2a", "#5a8a6a"],
];

function AvatarIcon({ username, size = 80, fontSize = "2rem" }) {
  const idx = username ? username.charCodeAt(0) % AVATAR_COLORS.length : 0;
  const [from, to] = AVATAR_COLORS[idx];
  return (
    <div
      className="avatar-icon"
      style={{ width: size, height: size, fontSize, background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {username ? username[0].toUpperCase() : "?"}
    </div>
  );
}

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [rutasFavoritas, setRutasFavoritas] = useState([]);
  const [cargandoFavs, setCargandoFavs] = useState(false);
  const [misRutas, setMisRutas] = useState([]);
  const [cargandoMisRutas, setCargandoMisRutas] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [misRecorridos, setMisRecorridos] = useState([]);
  const [cargandoRecorridos, setCargandoRecorridos] = useState(false);
  const [tab, setTab] = useState("favoritas");
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", bio: "" });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fotoRef = useRef(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(u);
      setUser(parsed);
      setFormData({ first_name: parsed.first_name || "", last_name: parsed.last_name || "", email: parsed.email || "", bio: parsed.bio || "" });
      setFotoPreview(parsed.foto_perfil || null);
    } catch { navigate("/login"); }
  }, [navigate]);

  useEffect(() => {
    const fetchFavoritas = async () => {
      setCargandoFavs(true);
      try {
        const favRes = await api.get("/api/rutas/favoritas/");
        const favIds = favRes.data.favoritas || [];
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        if (u.id) localStorage.setItem(`favoritos_${u.id}`, JSON.stringify(favIds));
        if (favIds.length === 0) { setRutasFavoritas([]); return; }
        const rutasRes = await api.get("/api/rutas/");
        const todasRutas = rutasRes.data?.rutas || rutasRes.data;
        setRutasFavoritas(todasRutas.filter((r) => favIds.includes(r.id)));
      } catch {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        const favIds = JSON.parse(localStorage.getItem(`favoritos_${u.id}`) || "[]");
        if (favIds.length > 0) {
          try {
            const rutasRes = await api.get("/api/rutas/");
            const todasRutas = rutasRes.data?.rutas || rutasRes.data;
            setRutasFavoritas(todasRutas.filter((r) => favIds.includes(r.id)));
          } catch {}
        }
      } finally {
        setCargandoFavs(false);
      }
    };
    fetchFavoritas();
  }, []);

  useEffect(() => {
    const fetchMisRutas = async () => {
      setCargandoMisRutas(true);
      try {
        const res = await api.get("/api/rutas/mis-rutas/");
        setMisRutas(res.data?.rutas || []);
      } catch {}
      finally { setCargandoMisRutas(false); }
    };
    fetchMisRutas();
  }, []);

  useEffect(() => {
    const fetchMisRecorridos = async () => {
      setCargandoRecorridos(true);
      try {
        const res = await api.get("/api/rutas/mis-recorridos/");
        setMisRecorridos(res.data?.recorridos || []);
      } catch {}
      finally { setCargandoRecorridos(false); }
    };
    fetchMisRecorridos();
  }, []);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const formDataObj = new FormData();
      formDataObj.append("first_name", formData.first_name);
      formDataObj.append("last_name", formData.last_name);
      formDataObj.append("email", formData.email);
      formDataObj.append("bio", formData.bio);
      if (fotoFile) formDataObj.append("foto_perfil", fotoFile);
      const res = await api.patch("/api/auth/perfil/editar/", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedUser = res.data.user || res.data;
      const merged = { ...JSON.parse(localStorage.getItem("user") || "{}"), ...updatedUser };
      localStorage.setItem("user", JSON.stringify(merged));
      setUser(merged);
      setFormData({ first_name: merged.first_name || "", last_name: merged.last_name || "", email: merged.email || "", bio: merged.bio || "" });
      setFotoPreview(merged.foto_perfil || null);
      setFotoFile(null);
      setMensaje({ tipo: "ok", texto: "Perfil actualizado correctamente." });
      setEditando(false);
      window.dispatchEvent(new Event("userUpdated"));
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.response?.data?.error || "Error al guardar." });
    } finally {
      setGuardando(false);
    }
  };

  const handleQuitarFavorito = async (rutaId) => {
    try { await api.post(`/api/rutas/${rutaId}/favorita/`); } catch {}
    setRutasFavoritas((prev) => prev.filter((r) => r.id !== rutaId));
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const favKey = `favoritos_${u.id}`;
    const favIds = JSON.parse(localStorage.getItem(favKey) || "[]");
    localStorage.setItem(favKey, JSON.stringify(favIds.filter((id) => id !== rutaId)));
  };

  const stats = [
    { label: "Rutas favoritas", value: rutasFavoritas.length, icon: "❤️" },
    { label: "Km totales", value: rutasFavoritas.reduce((acc, r) => acc + parseFloat(r.longitud || 0), 0).toFixed(1), icon: "📏" },
    { label: "Fáciles", value: rutasFavoritas.filter((r) => r.dificultad === "FACIL").length, icon: "🟢" },
    { label: "Difíciles", value: rutasFavoritas.filter((r) => r.dificultad === "DIFICIL" || r.dificultad === "EXTREMO").length, icon: "🔴" },
  ];

  if (!user) return null;

  return (
    <div className="perfil-page">
      <Navbar />

      <div className="perfil-hero">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="perfil-hero-orb" style={{
            width:  [350, 200, 280][i],
            height: [350, 200, 280][i],
            background: `rgba(181,213,160,${[.04, .06, .03][i]})`,
            top:  ["-20%", "30%", "10%"][i],
            left: ["-5%",  "70%", "40%"][i],
          }} />
        ))}

        <div className="perfil-hero-inner">
          <div className="perfil-hero-card">
            {user.foto_perfil
              ? <img src={user.foto_perfil} alt={user.username} className="perfil-hero-foto" />
              : <AvatarIcon username={user.username} size={88} fontSize="2.2rem" />
            }
            <div className="perfil-hero-info">
              <div className="perfil-hero-subtitulo">Caminante de Popayán</div>
              <h1 className="perfil-hero-nombre">
                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
              </h1>
              <p className="perfil-hero-username">@{user.username} · {user.email}</p>
            </div>
          </div>

          <div className="perfil-stats-bar">
            {stats.map((s) => (
              <div key={s.label} className="perfil-stat-item">
                <div className="perfil-stat-icon">{s.icon}</div>
                <div className="perfil-stat-value">{s.value}</div>
                <div className="perfil-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="perfil-tabs">
            {[
              { key: "favoritas",  label: "❤️ Mis Favoritas" },
              { key: "misrutas",   label: "🗺️ Mis Rutas" },
              { key: "recorridos", label: "🥾 Recorridos" },
              { key: "info",       label: "👤 Mi Información" },
              { key: "actividad",  label: "📊 Actividad" },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`tab-btn ${tab === t.key ? "active" : ""}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="perfil-contenido">

        {mensaje && (
          <div className={`perfil-mensaje ${mensaje.tipo}`}>
            {mensaje.tipo === "ok" ? "✅" : "❌"} {mensaje.texto}
          </div>
        )}

        {/* ── Tab Favoritas ── */}
        {tab === "favoritas" && (
          <div className="tab-content">
            <div className="seccion-header">
              <div>
                <h2 className="seccion-titulo">Mis Rutas Favoritas</h2>
                <p className="seccion-subtitulo">
                  {rutasFavoritas.length} ruta{rutasFavoritas.length !== 1 ? "s" : ""} guardada{rutasFavoritas.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Link to="/rutas" className="btn-primario">+ Explorar rutas</Link>
            </div>

            {cargandoFavs && <div className="spinner-wrap"><div className="spinner" /></div>}

            {!cargandoFavs && rutasFavoritas.length === 0 && (
              <div className="estado-vacio">
                <div className="estado-vacio-icono">🌿</div>
                <h3 className="estado-vacio-titulo">Aún no tienes favoritas</h3>
                <p className="estado-vacio-texto">Explora las rutas y guarda las que más te gusten.</p>
                <Link to="/rutas" className="btn-primario-lg">Ver rutas</Link>
              </div>
            )}

            {!cargandoFavs && rutasFavoritas.length > 0 && (
              <div className="rutas-grid">
                {rutasFavoritas.map((ruta, i) => {
                  const diff = DIFICULTAD_COLORS[ruta.dificultad] || DIFICULTAD_COLORS.MODERADO;
                  return (
                    <div key={ruta.id} className="ruta-card fav-card">
                      <div className="ruta-card-imagen" style={{ background: ruta.imagen_url ? "transparent" : RUTA_GRADIENTS[i % RUTA_GRADIENTS.length] }}>
                        {ruta.imagen_url ? <img src={ruta.imagen_url} alt={ruta.nombre_ruta} /> : <span className="ruta-card-emoji">🏔️</span>}
                        <button className="fav-remove" onClick={() => handleQuitarFavorito(ruta.id)} title="Quitar de favoritos">✕</button>
                      </div>
                      <div className="ruta-card-body">
                        <div className="ruta-card-header">
                          <h4 className="ruta-card-nombre">{ruta.nombre_ruta}</h4>
                          <span className="dificultad-badge" style={{ background: diff.bg, color: diff.text }}>
                            <span className="dificultad-dot" style={{ background: diff.dot }} />
                            {DIFICULTAD_LABELS[ruta.dificultad]}
                          </span>
                        </div>
                        <div className="ruta-card-meta">
                          <span className="ruta-meta-km">📏 {ruta.longitud} km</span>
                          {ruta.duracion_estimada && <span className="ruta-meta-tiempo">⏱ {ruta.duracion_estimada}</span>}
                        </div>
                        <Link to={`/rutas/${ruta.id}`} className="btn-ver-ruta">Ver ruta →</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab Mis Rutas ── */}
        {tab === "misrutas" && (
          <div className="tab-content">
            <div className="seccion-header">
              <div>
                <h2 className="seccion-titulo">Mis Rutas Creadas</h2>
                <p className="seccion-subtitulo">
                  {misRutas.length} ruta{misRutas.length !== 1 ? "s" : ""} creada{misRutas.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {cargandoMisRutas && <div className="spinner-wrap"><div className="spinner" /></div>}

            {!cargandoMisRutas && misRutas.length === 0 && (
              <div className="estado-vacio">
                <div className="estado-vacio-icono">🏔️</div>
                <h3 className="estado-vacio-titulo">Aún no has creado rutas</h3>
                <p className="estado-vacio-texto">Comparte un sendero con la comunidad.</p>
                <Link to="/rutas?crear=true" className="btn-primario-lg">Crear ruta</Link>
              </div>
            )}

            {!cargandoMisRutas && misRutas.length > 0 && (
              <div className="rutas-grid">
                {misRutas.map((ruta, i) => {
                  const diff = DIFICULTAD_COLORS[ruta.dificultad] || DIFICULTAD_COLORS.MODERADO;
                  const estaEliminando = eliminando === ruta.id;
                  return (
                    <div key={ruta.id} className="ruta-card" style={{ opacity: estaEliminando ? 0.5 : 1 }}>
                      <div className="ruta-card-imagen" style={{ background: ruta.imagen_url ? "transparent" : RUTA_GRADIENTS[i % RUTA_GRADIENTS.length] }}>
                        {ruta.imagen_url ? <img src={ruta.imagen_url} alt={ruta.nombre_ruta} /> : <span className="ruta-card-emoji">🏔️</span>}
                        <div className="dificultad-badge-top">
                          <span className="dificultad-badge-inline" style={{ background: diff.bg, color: diff.text }}>
                            <span className="dificultad-dot" style={{ background: diff.dot }} />
                            {DIFICULTAD_LABELS[ruta.dificultad]}
                          </span>
                        </div>
                      </div>
                      <div className="ruta-card-body">
                        <h4 className="ruta-card-nombre" style={{ marginBottom: 8 }}>{ruta.nombre_ruta}</h4>
                        <div className="ruta-card-meta">
                          <span className="ruta-meta-km">📏 {ruta.longitud} km</span>
                          {ruta.duracion_estimada && <span className="ruta-meta-tiempo">⏱ {ruta.duracion_estimada}</span>}
                          <span className="ruta-meta-vistas">👁 {ruta.vistas || 0}</span>
                        </div>
                        <div className="ruta-card-acciones">
                          <Link to={`/rutas/${ruta.id}`} className="btn-ver-ruta-flex">Ver ruta →</Link>
                          <button
                            className="btn-eliminar"
                            onClick={async () => {
                              if (!window.confirm(`¿Eliminar "${ruta.nombre_ruta}"?`)) return;
                              setEliminando(ruta.id);
                              try {
                                await api.delete(`/api/rutas/${ruta.id}/eliminar/`);
                                setMisRutas((prev) => prev.filter((r) => r.id !== ruta.id));
                              } catch {
                                alert("No se pudo eliminar la ruta.");
                              } finally { setEliminando(null); }
                            }}
                          >
                            {estaEliminando ? "..." : "🗑️"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab Recorridos ── */}
        {tab === "recorridos" && (
          <div className="tab-content">
            <div className="seccion-header">
              <div>
                <h2 className="seccion-titulo">Mis Recorridos</h2>
                <p className="seccion-subtitulo">
                  {misRecorridos.length} recorrido{misRecorridos.length !== 1 ? "s" : ""} completado{misRecorridos.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Link to="/rutas" className="btn-primario">+ Explorar rutas</Link>
            </div>

            {cargandoRecorridos && <div className="spinner-wrap"><div className="spinner" /></div>}

            {!cargandoRecorridos && misRecorridos.length === 0 && (
              <div className="estado-vacio">
                <div className="estado-vacio-icono">🥾</div>
                <h3 className="estado-vacio-titulo">Aún no has completado recorridos</h3>
                <p className="estado-vacio-texto">Inicia un recorrido GPS desde cualquier ruta.</p>
                <Link to="/rutas" className="btn-primario-lg">Ver rutas</Link>
              </div>
            )}

            {!cargandoRecorridos && misRecorridos.length > 0 && (
              <>
                <div className="recorridos-resumen">
                  {[
                    { icon: "🥾", label: "Recorridos",  value: misRecorridos.length },
                    { icon: "📏", label: "Km totales",   value: `${misRecorridos.reduce((a, r) => a + parseFloat(r.distancia_km || 0), 0).toFixed(1)} km` },
                    { icon: "⭐", label: "Pts ganados",  value: misRecorridos.reduce((a, r) => a + (r.puntos_ganados || 0), 0) },
                  ].map((s) => (
                    <div key={s.label} className="recorridos-stat">
                      <div className="recorridos-stat-icon">{s.icon}</div>
                      <div className="recorridos-stat-valor">{s.value}</div>
                      <div className="recorridos-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="recorridos-lista">
                  {misRecorridos.map((r) => {
                    const diff = DIFICULTAD_COLORS[r.ruta_dificultad] || DIFICULTAD_COLORS.MODERADO;
                    const mins = Math.floor(r.tiempo_segundos / 60);
                    const segs = r.tiempo_segundos % 60;
                    const tiempoStr = mins > 0 ? `${mins}m ${segs}s` : `${segs}s`;
                    return (
                      <div key={r.id} className="recorrido-item">
                        <div className="recorrido-item-left">
                          <div className="recorrido-item-nombre">{r.ruta_nombre}</div>
                          <div className="recorrido-item-fecha">
                            {new Date(r.fecha).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
                          </div>
                          <span className="dificultad-badge" style={{ background: diff.bg, color: diff.text, marginTop: 6, display: "inline-flex" }}>
                            <span className="dificultad-dot" style={{ background: diff.dot }} />
                            {DIFICULTAD_LABELS[r.ruta_dificultad]}
                          </span>
                        </div>
                        <div className="recorrido-item-right">
                          <div className="recorrido-item-stat"><span>📏</span> {parseFloat(r.distancia_km).toFixed(2)} km</div>
                          <div className="recorrido-item-stat"><span>⏱</span> {tiempoStr}</div>
                          <div className="recorrido-item-stat recorrido-item-pts"><span>⭐</span> {r.puntos_ganados} pts</div>
                        </div>
                        <Link to={`/rutas/${r.ruta_id}`} className="recorrido-item-btn">Ver ruta →</Link>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Tab Info ── */}
        {tab === "info" && (
          <div className="tab-content-info">
            <div className="seccion-header-info">
              <h2 className="seccion-titulo">Mi Información</h2>
              <button onClick={() => setEditando(!editando)} className={`btn-editar ${editando ? "cancelar" : ""}`}>
                {editando ? "✕ Cancelar" : "✏️ Editar perfil"}
              </button>
            </div>
            <p className="seccion-subtitulo-mb">
              {editando ? "Edita tu información personal." : "Tu información de cuenta."}
            </p>

            <div className="perfil-form-card">
              <div className="form-group-foto">
                <label className="form-label-foto">Foto de Perfil</label>
                <div className="form-foto-wrap">
                  {fotoPreview
                    ? <img src={fotoPreview} alt="foto" className="form-foto-preview" />
                    : <AvatarIcon username={user.username} size={72} fontSize="1.6rem" />
                  }
                  {editando && (
                    <div>
                      <input ref={fotoRef} type="file" accept="image/*" onChange={handleFotoChange} style={{ display: "none" }} />
                      <button onClick={() => fotoRef.current.click()} className="btn-cambiar-foto">📷 Cambiar foto</button>
                      {fotoFile && <div className="form-foto-nombre">✓ {fotoFile.name}</div>}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">Nombre</label>
                  <input className="input-field" value={formData.first_name} disabled={!editando} onChange={(e) => setFormData((f) => ({ ...f, first_name: e.target.value }))} placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="form-label">Apellido</label>
                  <input className="input-field" value={formData.last_name} disabled={!editando} onChange={(e) => setFormData((f) => ({ ...f, last_name: e.target.value }))} placeholder="Tu apellido" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Usuario</label>
                <input className="input-field" value={user.username} disabled />
                <p className="form-hint">El nombre de usuario no se puede cambiar.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input className="input-field" value={formData.email} disabled={!editando} type="email" onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))} placeholder="tu@correo.com" />
              </div>

              <div className="form-group" style={{ marginBottom: 28 }}>
                <label className="form-label">Bio</label>
                {editando
                  ? <textarea className="textarea-field" value={formData.bio} rows={3} onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))} placeholder="Cuéntale a la comunidad sobre ti y tu pasión por el senderismo..." />
                  : <p className={`form-bio-texto ${formData.bio ? "form-bio-texto-activo" : "form-bio-vacio"}`}>{formData.bio || "Sin bio todavía."}</p>
                }
              </div>

              {editando && (
                <button onClick={handleGuardar} disabled={guardando} className="btn-guardar">
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Tab Actividad ── */}
        {tab === "actividad" && (
          <div className="tab-content">
            <h2 className="seccion-titulo" style={{ marginBottom: 8 }}>Mi Actividad</h2>
            <p className="seccion-subtitulo-mb">Resumen de tu actividad en Walk App.</p>

            <div className="actividad-grid">
              {[
                { icon: "❤️", label: "Rutas favoritas", value: rutasFavoritas.length,                                                                    color: "#e57373" },
                { icon: "📏", label: "Km en favoritas", value: `${rutasFavoritas.reduce((acc, r) => acc + parseFloat(r.longitud || 0), 0).toFixed(1)} km`, color: "#4a7c59" },
                { icon: "🟢", label: "Fáciles",         value: rutasFavoritas.filter((r) => r.dificultad === "FACIL").length,                             color: "#4caf50" },
                { icon: "🟡", label: "Moderadas",       value: rutasFavoritas.filter((r) => r.dificultad === "MODERADO").length,                          color: "#ff9800" },
                { icon: "🔴", label: "Difíciles",       value: rutasFavoritas.filter((r) => r.dificultad === "DIFICIL").length,                           color: "#f44336" },
                { icon: "🟣", label: "Extremas",        value: rutasFavoritas.filter((r) => r.dificultad === "EXTREMO").length,                           color: "#9c27b0" },
              ].map((s) => (
                <div key={s.label} className="actividad-card">
                  <div className="actividad-icono" style={{ background: `${s.color}18` }}>{s.icon}</div>
                  <div>
                    <div className="actividad-valor">{s.value}</div>
                    <div className="actividad-etiqueta">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {rutasFavoritas.length > 0 && (
              <div className="distribucion-card">
                <h3 className="distribucion-titulo">Distribución por dificultad</h3>
                {[
                  { key: "FACIL",    label: "Fácil",    color: "#4caf50" },
                  { key: "MODERADO", label: "Moderado", color: "#ff9800" },
                  { key: "DIFICIL",  label: "Difícil",  color: "#f44336" },
                  { key: "EXTREMO",  label: "Extremo",  color: "#9c27b0" },
                ].map((d) => {
                  const count = rutasFavoritas.filter((r) => r.dificultad === d.key).length;
                  const pct = rutasFavoritas.length > 0 ? (count / rutasFavoritas.length) * 100 : 0;
                  return (
                    <div key={d.key} className="barra-row">
                      <div className="barra-header">
                        <span className="barra-label">{d.label}</span>
                        <span className="barra-count">{count} ruta{count !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="barra-track">
                        <div className="barra-fill" style={{ width: `${pct}%`, background: d.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {rutasFavoritas.length === 0 && (
              <div className="actividad-vacio">
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>📊</div>
                <p>Guarda algunas rutas para ver tu actividad aquí.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}