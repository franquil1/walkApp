import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../axiosConfig";

// ─── GUARD: solo admins ───────────────────────────────────────────────────────
function useAdminGuard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(u);
      const esAdmin = parsed.es_admin || parsed.is_staff || parsed.rol === "admin";
      if (!esAdmin) { navigate("/"); return; }
      setUser(parsed);
    } catch { navigate("/login"); }
  }, [navigate]);
  return user;
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ username, size = 36 }) {
  const colors = [["#2d5a27","#b5d5a0"],["#7c3aed","#c4b5fd"],["#0369a1","#7dd3fc"],["#b45309","#fcd34d"]];
  const idx = username ? username.charCodeAt(0) % colors.length : 0;
  const [from, to] = colors[idx];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${from},${to})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lora',serif", fontWeight: 700, fontSize: size * 0.38, color: "#f7f5f0", flexShrink: 0 }}>
      {username?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

// ─── ROL BADGE ────────────────────────────────────────────────────────────────
function RolBadge({ rol }) {
  const cfg = {
    admin:   { label: "Admin",   bg: "#7c3aed22", color: "#c4b5fd", border: "#7c3aed44" },
    guia:    { label: "Guía",    bg: "#0369a122", color: "#7dd3fc", border: "#0369a144" },
    usuario: { label: "Usuario", bg: "#2d5a2722", color: "#86efac", border: "#2d5a2744" },
  };
  const c = cfg[rol] || cfg.usuario;
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 10 }}>
      {c.label}
    </span>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ emoji, label, value, sub, color = "#b5d5a0" }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(181,213,160,0.1)", borderRadius: 8, padding: "22px 24px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{emoji}</div>
      <div>
        <div style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.8rem", color: "#f7f5f0", lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.78rem", color: color, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, fontSize: "0.7rem", color: "rgba(247,245,240,0.35)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── MINI BAR CHART ──────────────────────────────────────────────────────────
function BarChart({ data, label }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(181,213,160,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: "100%", background: "linear-gradient(to top,#2d5a27,#b5d5a0)", borderRadius: "3px 3px 0 0", height: `${Math.max((d.count / max) * 70, 3)}px`, transition: "height 0.6s ease", minHeight: 3 }} />
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.55rem", color: "rgba(247,245,240,0.35)" }}>{d.fecha}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECCIÓN DASHBOARD ────────────────────────────────────────────────────────
function SeccionDashboard() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/api/admin/dashboard/").then(r => setData(r.data)).catch(() => {}).finally(() => setCargando(false));
  }, []);

  if (cargando) return <div style={{ padding: 40, textAlign: "center", color: "rgba(247,245,240,0.4)", fontFamily: "'DM Sans',sans-serif" }}>Cargando...</div>;
  if (!data) return null;

  const { resumen, usuarios_por_dia, rutas_top, roles } = data;

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.5rem", color: "#f7f5f0", marginBottom: 24 }}>Panel de Control</h2>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 32 }}>
        <StatCard emoji="👥" label="Usuarios totales" value={resumen.total_usuarios} color="#b5d5a0" />
        <StatCard emoji="🟢" label="Activos hoy" value={resumen.usuarios_activos_hoy} color="#4caf50" />
        <StatCard emoji="🏔️" label="Rutas" value={resumen.total_rutas} color="#7dd3fc" />
        <StatCard emoji="📸" label="Publicaciones" value={resumen.total_publicaciones} color="#fcd34d" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        {/* Gráfica usuarios */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(181,213,160,0.1)", borderRadius: 8, padding: "22px 24px" }}>
          <BarChart data={usuarios_por_dia} label="Usuarios activos · últimos 7 días" />
        </div>

        {/* Top rutas */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(181,213,160,0.1)", borderRadius: 8, padding: "22px 24px" }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(181,213,160,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Top 5 rutas más vistas</p>
          {rutas_top.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "0.78rem", color: "rgba(247,245,240,0.3)", width: 16 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: "#f7f5f0", marginBottom: 3 }}>{r.nombre}</div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(r.vistas / (rutas_top[0]?.vistas || 1)) * 100}%`, background: "linear-gradient(to right,#2d5a27,#b5d5a0)", borderRadius: 2 }} />
                </div>
              </div>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: "rgba(247,245,240,0.5)", minWidth: 40, textAlign: "right" }}>{r.vistas}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribución de roles */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(181,213,160,0.1)", borderRadius: 8, padding: "22px 24px" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(181,213,160,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Distribución de roles</p>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { rol: "usuario", label: "Usuarios", emoji: "🥾", color: "#86efac", count: roles.usuario },
            { rol: "guia",    label: "Guías",    emoji: "🧭", color: "#7dd3fc", count: roles.guia },
            { rol: "admin",   label: "Admins",   emoji: "⚙️", color: "#c4b5fd", count: roles.admin },
          ].map((r) => (
            <div key={r.rol} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "10px 16px" }}>
              <span style={{ fontSize: "1.2rem" }}>{r.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.3rem", color: r.color }}>{r.count}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", color: "rgba(247,245,240,0.4)" }}>{r.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECCIÓN USUARIOS ─────────────────────────────────────────────────────────
function SeccionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [cambiandoRol, setCambiandoRol] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const r = await api.get("/api/admin/usuarios/");
      setUsuarios(r.data.usuarios);
    } catch {} finally { setCargando(false); }
  }, []);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const handleCambiarRol = async (userId, nuevoRol) => {
    setCambiandoRol(userId);
    try {
      await api.patch(`/api/admin/usuarios/${userId}/rol/`, { rol: nuevoRol });
      setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, rol: nuevoRol } : u));
    } catch {} finally { setCambiandoRol(null); }
  };

  const handleEliminar = async (userId, username) => {
    if (!window.confirm(`¿Eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/api/admin/usuarios/${userId}/eliminar/`);
      setUsuarios(prev => prev.filter(u => u.id !== userId));
    } catch {}
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusqueda = u.username.toLowerCase().includes(busqueda.toLowerCase()) || u.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol = filtroRol === "todos" || u.rol === filtroRol;
    return matchBusqueda && matchRol;
  });

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.5rem", color: "#f7f5f0" }}>Usuarios ({usuarios.length})</h2>
        <button onClick={fetchUsuarios} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "7px 14px", color: "rgba(247,245,240,0.6)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", cursor: "pointer" }}>↻ Actualizar</button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por usuario o email..."
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, color: "#f7f5f0", fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", outline: "none" }} />
        <div style={{ display: "flex", gap: 6 }}>
          {["todos","usuario","guia","admin"].map(r => (
            <button key={r} onClick={() => setFiltroRol(r)}
              style={{ padding: "8px 14px", background: filtroRol === r ? "rgba(181,213,160,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${filtroRol === r ? "rgba(181,213,160,0.35)" : "rgba(255,255,255,0.1)"}`, borderRadius: 4, color: filtroRol === r ? "#b5d5a0" : "rgba(247,245,240,0.5)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: filtroRol === r ? 600 : 400, cursor: "pointer" }}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(247,245,240,0.4)", fontFamily: "'DM Sans',sans-serif" }}>Cargando usuarios...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {usuariosFiltrados.map(u => (
            <div key={u.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(181,213,160,0.08)", borderRadius: 6, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", animation: "fadeUp 0.3s ease" }}>
              <Avatar username={u.username} size={38} />
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.88rem", color: "#f7f5f0" }}>{u.username}</span>
                  <RolBadge rol={u.rol} />
                  {!u.is_active && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, padding: "1px 6px" }}>Inactivo</span>}
                </div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: "rgba(247,245,240,0.4)" }}>{u.email}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(247,245,240,0.25)", marginTop: 2 }}>
                  Registrado: {u.date_joined} · Último login: {u.last_login || "Nunca"}
                </div>
              </div>

              {/* Selector de rol */}
              <select value={u.rol} onChange={e => handleCambiarRol(u.id, e.target.value)} disabled={cambiandoRol === u.id}
                style={{ padding: "6px 10px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, color: "#f7f5f0", fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", cursor: "pointer", outline: "none" }}>
                <option value="usuario">Usuario</option>
                <option value="guia">Guía</option>
                <option value="admin">Admin</option>
              </select>

              <button onClick={() => handleEliminar(u.id, u.username)}
                style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.2)", borderRadius: 4, padding: "6px 12px", color: "#f87171", fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(244,67,54,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(244,67,54,0.1)"}>
                🗑️
              </button>
            </div>
          ))}
          {usuariosFiltrados.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "rgba(247,245,240,0.3)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem" }}>No se encontraron usuarios.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SECCIÓN RUTAS ────────────────────────────────────────────────────────────
function SeccionRutas() {
  const [rutas, setRutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroDif, setFiltroDif] = useState("todas");

  const fetchRutas = useCallback(async () => {
    setCargando(true);
    try {
      const r = await api.get("/api/admin/rutas/");
      setRutas(r.data.rutas);
    } catch {} finally { setCargando(false); }
  }, []);

  useEffect(() => { fetchRutas(); }, [fetchRutas]);

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar la ruta "${nombre}"?`)) return;
    try {
      await api.delete(`/api/admin/rutas/${id}/eliminar/`);
      setRutas(prev => prev.filter(r => r.id !== id));
    } catch {}
  };

  const dificultadConfig = {
    FACIL:    { label: "Fácil",    color: "#4caf50", bg: "rgba(76,175,80,0.12)" },
    MODERADO: { label: "Moderado", color: "#ff9800", bg: "rgba(255,152,0,0.12)" },
    DIFICIL:  { label: "Difícil",  color: "#f44336", bg: "rgba(244,67,54,0.12)" },
    EXTREMO:  { label: "Extremo",  color: "#9c27b0", bg: "rgba(156,39,176,0.12)" },
  };

  const rutasFiltradas = rutas.filter(r => {
    const matchBusqueda = r.nombre_ruta.toLowerCase().includes(busqueda.toLowerCase());
    const matchDif = filtroDif === "todas" || r.dificultad === filtroDif;
    return matchBusqueda && matchDif;
  });

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.5rem", color: "#f7f5f0" }}>Rutas ({rutas.length})</h2>
        <button onClick={fetchRutas} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "7px 14px", color: "rgba(247,245,240,0.6)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", cursor: "pointer" }}>↻ Actualizar</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar ruta..."
          style={{ flex: 1, minWidth: 200, padding: "9px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, color: "#f7f5f0", fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", outline: "none" }} />
        <div style={{ display: "flex", gap: 6 }}>
          {["todas","FACIL","MODERADO","DIFICIL","EXTREMO"].map(d => (
            <button key={d} onClick={() => setFiltroDif(d)}
              style={{ padding: "8px 12px", background: filtroDif === d ? "rgba(181,213,160,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${filtroDif === d ? "rgba(181,213,160,0.35)" : "rgba(255,255,255,0.1)"}`, borderRadius: 4, color: filtroDif === d ? "#b5d5a0" : "rgba(247,245,240,0.5)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", cursor: "pointer" }}>
              {d === "todas" ? "Todas" : dificultadConfig[d]?.label}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(247,245,240,0.4)", fontFamily: "'DM Sans',sans-serif" }}>Cargando rutas...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rutasFiltradas.map(r => {
            const dif = dificultadConfig[r.dificultad] || { label: r.dificultad, color: "#9e9e9e", bg: "rgba(158,158,158,0.1)" };
            return (
              <div key={r.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(181,213,160,0.08)", borderRadius: 6, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.88rem", color: "#f7f5f0" }}>{r.nombre_ruta}</span>
                    <span style={{ background: dif.bg, color: dif.color, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 10 }}>{dif.label}</span>
                  </div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "rgba(247,245,240,0.35)", display: "flex", gap: 16 }}>
                    <span>📏 {r.longitud} km</span>
                    <span>👁️ {r.vistas} vistas</span>
                    <span>👤 {r.creada_por}</span>
                    <span>📅 {r.fecha_creacion}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to={`/rutas/${r.id}`}
                    style={{ background: "rgba(181,213,160,0.1)", border: "1px solid rgba(181,213,160,0.2)", borderRadius: 4, padding: "6px 12px", color: "#b5d5a0", fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", textDecoration: "none" }}>
                    Ver →
                  </Link>
                  <button onClick={() => handleEliminar(r.id, r.nombre_ruta)}
                    style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.2)", borderRadius: 4, padding: "6px 12px", color: "#f87171", fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", cursor: "pointer" }}>
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
          {rutasFiltradas.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "rgba(247,245,240,0.3)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem" }}>No se encontraron rutas.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
const SECCIONES = [
  { key: "dashboard", label: "Dashboard",  emoji: "📊" },
  { key: "usuarios",  label: "Usuarios",   emoji: "👥" },
  { key: "rutas",     label: "Rutas",      emoji: "🏔️" },
];

export default function AdminPanel() {
  const user = useAdminGuard();
  const [seccion, setSeccion] = useState("dashboard");

  if (!user) return null;

  return (
    <div style={{ fontFamily: "'Lora',Georgia,serif", background: "#0d1f0d", minHeight: "100vh", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        input::placeholder{color:rgba(247,245,240,0.25);}
        select option{background:#1a2e1a;color:#f7f5f0;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(181,213,160,0.2);border-radius:2px;}
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: 220, background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(181,213,160,0.08)", display: "flex", flexDirection: "column", padding: "28px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid rgba(181,213,160,0.08)" }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#4a7c59,#b5d5a0)", borderRadius: "50% 20% 50% 20%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>🌿</div>
            <span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.05rem", color: "#f7f5f0" }}>Walk App</span>
          </Link>
          <div style={{ marginTop: 10, padding: "6px 10px", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 6 }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", color: "rgba(247,245,240,0.4)", marginBottom: 2 }}>Panel de Admin</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.82rem", color: "#c4b5fd" }}>⚙️ {user.username}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {SECCIONES.map(s => (
            <button key={s.key} onClick={() => setSeccion(s.key)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: seccion === s.key ? "rgba(181,213,160,0.1)" : "transparent", border: `1px solid ${seccion === s.key ? "rgba(181,213,160,0.2)" : "transparent"}`, borderRadius: 6, color: seccion === s.key ? "#b5d5a0" : "rgba(247,245,240,0.5)", fontFamily: "'DM Sans',sans-serif", fontWeight: seccion === s.key ? 600 : 400, fontSize: "0.85rem", cursor: "pointer", textAlign: "left", marginBottom: 4, transition: "all 0.2s" }}>
              <span style={{ fontSize: "1rem" }}>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </nav>

        {/* Volver */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(181,213,160,0.08)" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", color: "rgba(247,245,240,0.4)", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", borderRadius: 6, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#b5d5a0"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(247,245,240,0.4)"}>
            ← Volver al sitio
          </Link>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        {seccion === "dashboard" && <SeccionDashboard />}
        {seccion === "usuarios"  && <SeccionUsuarios />}
        {seccion === "rutas"     && <SeccionRutas />}
      </div>
    </div>
  );
}