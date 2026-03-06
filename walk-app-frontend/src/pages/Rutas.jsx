import { useState, useEffect, useRef, useCallback } from "react";
import api from "../axiosConfig";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


const DIFICULTAD_COLORS = {
  FACIL: { bg: "#e8f5e9", text: "#2d5a27", border: "#a5d6a7", dot: "#4caf50" },
  MODERADO: { bg: "#fff8e1", text: "#e65100", border: "#ffcc80", dot: "#ff9800" },
  DIFICIL: { bg: "#fce4ec", text: "#b71c1c", border: "#f48fb1", dot: "#f44336" },
  EXTREMO: { bg: "#f3e5f5", text: "#4a148c", border: "#ce93d8", dot: "#9c27b0" },
};

const DIFICULTAD_LABELS = {
  FACIL: "Fácil", MODERADO: "Moderado", DIFICIL: "Difícil", EXTREMO: "Extremo",
};

const RUTA_GRADIENTS = [
  "linear-gradient(135deg, #1e3d1a 0%, #4a7c59 100%)",
  "linear-gradient(135deg, #2d5a27 0%, #b5d5a0 100%)",
  "linear-gradient(135deg, #0d1f0d 0%, #3a6b4a 100%)",
  "linear-gradient(135deg, #1a3a1a 0%, #6a9b6a 100%)",
  "linear-gradient(135deg, #2a4a2a 0%, #5a8a5a 100%)",
  "linear-gradient(135deg, #0a2a0a 0%, #4a7c59 100%)",
];

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(74,124,89,0.1)" }}>
      <div style={{ height: 200, background: "linear-gradient(90deg, #f0ede6 25%, #e8e5de 50%, #f0ede6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ padding: "24px 28px" }}>
        <div style={{ height: 20, width: "70%", background: "linear-gradient(90deg, #f0ede6 25%, #e8e5de 50%, #f0ede6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4, marginBottom: 12 }} />
        <div style={{ height: 14, width: "100%", background: "linear-gradient(90deg, #f0ede6 25%, #e8e5de 50%, #f0ede6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 14, width: "60%", background: "linear-gradient(90deg, #f0ede6 25%, #e8e5de 50%, #f0ede6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4, marginBottom: 20 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ height: 16, width: "30%", background: "linear-gradient(90deg, #f0ede6 25%, #e8e5de 50%, #f0ede6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4 }} />
          <div style={{ height: 32, width: "40%", background: "linear-gradient(90deg, #f0ede6 25%, #e8e5de 50%, #f0ede6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

function RutaCardGrid({ ruta, index, favoritos, onToggleFavorito, user }) {
  const [hovered, setHovered] = useState(false);
  const isFav = favoritos.includes(ruta.id);
  const diff = DIFICULTAD_COLORS[ruta.dificultad] || DIFICULTAD_COLORS.MODERADO;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 6, overflow: "hidden",
        boxShadow: hovered ? "0 24px 60px rgba(26,46,26,0.18)" : "0 4px 20px rgba(26,46,26,0.07)",
        transform: hovered ? "translateY(-8px)" : "none",
        transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        border: "1px solid rgba(74,124,89,0.1)",
        cursor: "pointer",
        position: "relative",
      }}
    >
      {/* Imagen */}
      <div style={{
        height: 210, position: "relative", overflow: "hidden",
        background: ruta.imagen_url ? "transparent" : RUTA_GRADIENTS[index % RUTA_GRADIENTS.length],
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {ruta.imagen_url ? (
          <img src={ruta.imagen_url} alt={ruta.nombre_ruta}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: hovered ? "scale(1.05)" : "scale(1)" }} />
        ) : (
          <>
            <svg viewBox="0 0 400 210" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2 }}>
              <path d="M0,140 Q100,60 200,100 Q300,140 400,60 L400,210 L0,210 Z" fill="rgba(255,255,255,0.3)" />
              <path d="M0,170 Q120,100 240,140 Q320,165 400,100 L400,210 L0,210 Z" fill="rgba(255,255,255,0.2)" />
              <circle cx="80" cy="80" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              <circle cx="320" cy="120" r="25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            </svg>
            <span style={{ fontSize: "4rem", position: "relative", zIndex: 1, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>🏔️</span>
          </>
        )}

        {/* Overlay gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Badge dificultad */}
        <div style={{ position: "absolute", top: 14, left: 14 }}>
          <span style={{
            background: diff.bg, color: diff.text, border: `1px solid ${diff.border}`,
            fontSize: "0.7rem", fontWeight: 700, padding: "4px 10px", borderRadius: 20,
            letterSpacing: "0.06em", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: diff.dot, display: "inline-block" }} />
            {DIFICULTAD_LABELS[ruta.dificultad] || ruta.dificultad}
          </span>
        </div>

        {/* Favorito */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorito(ruta.id); }}
          style={{
            position: "absolute", top: 14, right: 14,
            background: isFav ? "rgba(224,87,74,0.9)" : "rgba(255,255,255,0.15)",
            border: isFav ? "none" : "1px solid rgba(255,255,255,0.4)",
            backdropFilter: "blur(8px)", borderRadius: "50%",
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: user ? "pointer" : "not-allowed",
            fontSize: "1rem", transition: "all 0.3s",
            transform: isFav ? "scale(1.1)" : "scale(1)",
          }}
          title={user ? (isFav ? "Quitar de favoritos" : "Guardar en favoritos") : "Inicia sesión para guardar"}
        >
          {isFav ? "❤️" : "🤍"}
        </button>

        {/* Vistas */}
        <div style={{ position: "absolute", bottom: 12, left: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", padding: "3px 8px", borderRadius: 12 }}>
            👁 {ruta.vistas || 0} vistas
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "22px 24px 24px" }}>
        <h3 style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "1.15rem", color: "#1a2e1a", marginBottom: 8, lineHeight: 1.3 }}>
          {ruta.nombre_ruta}
        </h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.88rem", color: "#6a7a6a", lineHeight: 1.65, marginBottom: 18, minHeight: 42 }}>
          {ruta.descripcion ? ruta.descripcion.substring(0, 90) + (ruta.descripcion.length > 90 ? "..." : "") : "Sin descripción disponible."}
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid rgba(74,124,89,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.85rem" }}>📏</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#2d5a27" }}>{ruta.longitud} km</span>
          </div>
          {ruta.duracion_estimada && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.85rem" }}>⏱</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.85rem", color: "#6a7a6a" }}>{ruta.duracion_estimada}</span>
            </div>
          )}
          {ruta.ubicacion && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
              <span style={{ fontSize: "0.8rem" }}>📍</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.78rem", color: "#6a7a6a" }}>{ruta.ubicacion.substring(0, 20)}{ruta.ubicacion.length > 20 ? "..." : ""}</span>
            </div>
          )}
        </div>

        <a href={`/rutas/${ruta.id}/`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "11px 0", background: hovered ? "#1e3d1a" : "#2d5a27",
            color: "#f7f5f0", textDecoration: "none", borderRadius: 3,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem",
            transition: "all 0.3s", letterSpacing: "0.04em",
          }}
        >
          Ver Ruta →
        </a>
      </div>
    </div>
  );
}

function RutaCardList({ ruta, index, favoritos, onToggleFavorito, user }) {
  const [hovered, setHovered] = useState(false);
  const isFav = favoritos.includes(ruta.id);
  const diff = DIFICULTAD_COLORS[ruta.dificultad] || DIFICULTAD_COLORS.MODERADO;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 6, overflow: "hidden",
        boxShadow: hovered ? "0 12px 40px rgba(26,46,26,0.14)" : "0 2px 12px rgba(26,46,26,0.06)",
        transform: hovered ? "translateX(6px)" : "none",
        transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        border: "1px solid rgba(74,124,89,0.1)",
        display: "grid", gridTemplateColumns: "200px 1fr",
        cursor: "pointer",
      }}
    >
      {/* Imagen */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: ruta.imagen_url ? "transparent" : RUTA_GRADIENTS[index % RUTA_GRADIENTS.length],
        display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140,
      }}>
        {ruta.imagen_url ? (
          <img src={ruta.imagen_url} alt={ruta.nombre_ruta}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: hovered ? "scale(1.08)" : "scale(1)" }} />
        ) : (
          <span style={{ fontSize: "3rem", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>🏔️</span>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(255,255,255,0.05) 100%)", pointerEvents: "none" }} />
      </div>

      {/* Info */}
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, gap: 12 }}>
            <h3 style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "1.1rem", color: "#1a2e1a", lineHeight: 1.3 }}>
              {ruta.nombre_ruta}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{
                background: diff.bg, color: diff.text, border: `1px solid ${diff.border}`,
                fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                letterSpacing: "0.06em", textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans', sans-serif",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: diff.dot }} />
                {DIFICULTAD_LABELS[ruta.dificultad] || ruta.dificultad}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorito(ruta.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: 0, transition: "transform 0.2s", transform: isFav ? "scale(1.2)" : "scale(1)" }}
              >
                {isFav ? "❤️" : "🤍"}
              </button>
            </div>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.88rem", color: "#6a7a6a", lineHeight: 1.65, marginBottom: 14 }}>
            {ruta.descripcion ? ruta.descripcion.substring(0, 120) + (ruta.descripcion.length > 120 ? "..." : "") : "Sin descripción."}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.82rem", color: "#2d5a27" }}>📏 {ruta.longitud} km</span>
            {ruta.duracion_estimada && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#6a7a6a" }}>⏱ {ruta.duracion_estimada}</span>}
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#9a9a9a" }}>👁 {ruta.vistas || 0}</span>
          </div>
          <a href={`/rutas/${ruta.id}/`}
            style={{ padding: "8px 20px", background: hovered ? "#1e3d1a" : "#2d5a27", color: "#f7f5f0", textDecoration: "none", borderRadius: 3, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.82rem", transition: "background 0.2s" }}
          >Ver Ruta →</a>
        </div>
      </div>
    </div>
  );
}

export default function Rutas() {
  const [rutas, setRutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState({ dificultad: "", buscar: "", orden: "" });
  const [vista, setVista] = useState("grid");
  const [favoritos, setFavoritos] = useState([]);
  const [user, setUser] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalRutas, setTotalRutas] = useState(0);
  const RUTAS_POR_PAGINA = 9;
  const headerRef = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) try { setUser(JSON.parse(u)); } catch {}
    const favs = localStorage.getItem("favoritos");
    if (favs) try { setFavoritos(JSON.parse(favs)); } catch {}
  }, []);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        setCargando(true);
        setError(null);
        const params = {};
        if (filtro.dificultad) params.dificultad = filtro.dificultad;
        if (filtro.buscar) params.buscar = filtro.buscar;
        const res = await api.get("/api/rutas/", { params });
        let data = res.data;
        if (filtro.orden === "distancia_asc") data = [...data].sort((a, b) => a.longitud - b.longitud);
        if (filtro.orden === "distancia_desc") data = [...data].sort((a, b) => b.longitud - a.longitud);
        if (filtro.orden === "dificultad") {
          const order = { FACIL: 1, MODERADO: 2, DIFICIL: 3, EXTREMO: 4 };
          data = [...data].sort((a, b) => (order[a.dificultad] || 2) - (order[b.dificultad] || 2));
        }
        if (filtro.orden === "vistas") data = [...data].sort((a, b) => (b.vistas || 0) - (a.vistas || 0));
        setTotalRutas(data.length);
        setRutas(data);
        setPagina(1);
      } catch {
        setError("No se pudieron cargar las rutas.");
      } finally {
        setCargando(false);
      }
    };
    fetchRutas();
  }, [filtro]);

  const handleToggleFavorito = useCallback((rutaId) => {
    if (!user) { window.location.href = "/login"; return; }
    setFavoritos((prev) => {
      const next = prev.includes(rutaId) ? prev.filter((id) => id !== rutaId) : [...prev, rutaId];
      localStorage.setItem("favoritos", JSON.stringify(next));
      return next;
    });
  }, [user]);

  const rutasPaginadas = rutas.slice((pagina - 1) * RUTAS_POR_PAGINA, pagina * RUTAS_POR_PAGINA);
  const totalPaginas = Math.ceil(totalRutas / RUTAS_POR_PAGINA);

  const DIFICULTADES = ["", "FACIL", "MODERADO", "DIFICIL", "EXTREMO"];
  const conteosDificultad = DIFICULTADES.slice(1).reduce((acc, d) => {
    acc[d] = rutas.filter((r) => r.dificultad === d).length;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif", background: "#f7f5f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .filter-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 24px; border: 1.5px solid rgba(74,124,89,0.25); background: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.25s; color: #4a5a4a; }
        .filter-chip:hover { border-color: #4a7c59; color: #2d5a27; background: rgba(74,124,89,0.05); }
        .filter-chip.active { border-color: #2d5a27; background: #2d5a27; color: #f7f5f0; }
        .page-btn { width: 36px; height: 36px; border-radius: 3px; border: 1.5px solid rgba(74,124,89,0.2); background: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500; cursor: pointer; transition: all 0.2s; color: #4a5a4a; display: flex; align-items: center; justify-content: center; }
        .page-btn:hover { border-color: #4a7c59; color: #2d5a27; }
        .page-btn.active { border-color: #2d5a27; background: #2d5a27; color: #f7f5f0; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        input:focus, select:focus { outline: none; border-color: #4a7c59 !important; box-shadow: 0 0 0 3px rgba(74,124,89,0.12); }
        .ruta-card-anim { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      <Navbar />

      {/* HERO HEADER */}
      <div ref={headerRef} style={{
        background: "linear-gradient(160deg, #0d1f0d 0%, #1e3d1a 50%, #2d5a27 100%)",
        paddingTop: 120, paddingBottom: 60, paddingLeft: 48, paddingRight: 48,
        position: "relative", overflow: "hidden",
      }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: [400, 300, 200, 350][i], height: [400, 300, 200, 350][i],
            borderRadius: "50%",
            background: `rgba(181,213,160,${[0.04, 0.05, 0.07, 0.03][i]})`,
            top: ["-20%", "40%", "10%", "-10%"][i],
            left: ["-5%", "60%", "80%", "40%"][i],
            pointerEvents: "none",
          }} />
        ))}
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.8rem", letterSpacing: "0.25em", color: "#b5d5a0", textTransform: "uppercase", marginBottom: 16 }}>
            Popayán · Colombia
          </div>
          <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "#f7f5f0", lineHeight: 1.15, marginBottom: 16 }}>
            Explora Todos los <em style={{ color: "#b5d5a0" }}>Senderos</em>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1.05rem", color: "rgba(247,245,240,0.65)", marginBottom: 36 }}>
            Descubre rutas únicas en los alrededores de Popayán, desde caminatas fáciles hasta senderos extremos.
          </p>

          {/* Stats rápidos */}
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { num: totalRutas, label: "Rutas totales", icon: "🗺️" },
              { num: conteosDificultad.FACIL || 0, label: "Rutas fáciles", icon: "🟢" },
              { num: conteosDificultad.DIFICIL || 0 + (conteosDificultad.EXTREMO || 0), label: "Rutas difíciles", icon: "🔴" },
              { num: favoritos.length, label: "Mis favoritas", icon: "❤️" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.5rem", color: "#f7f5f0", lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(247,245,240,0.5)", marginTop: 2, letterSpacing: "0.05em" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 48px 80px" }}>

        {/* BARRA DE FILTROS */}
        <div style={{ background: "#fff", borderRadius: 6, padding: "24px 28px", marginBottom: 32, boxShadow: "0 4px 20px rgba(26,46,26,0.08)", border: "1px solid rgba(74,124,89,0.1)" }}>
          {/* Búsqueda y orden */}
          <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 2, minWidth: 200, position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "0.95rem", pointerEvents: "none" }}>🔍</span>
              <input
                value={filtro.buscar}
                onChange={(e) => setFiltro((f) => ({ ...f, buscar: e.target.value }))}
                placeholder="Buscar por nombre de ruta..."
                style={{ width: "100%", padding: "11px 16px 11px 40px", border: "1.5px solid rgba(74,124,89,0.2)", borderRadius: 3, fontSize: "0.9rem", color: "#1a2e1a", background: "#f7f5f0", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}
              />
            </div>
            <select
              value={filtro.orden}
              onChange={(e) => setFiltro((f) => ({ ...f, orden: e.target.value }))}
              style={{ flex: 1, minWidth: 180, padding: "11px 16px", border: "1.5px solid rgba(74,124,89,0.2)", borderRadius: 3, fontSize: "0.9rem", color: "#1a2e1a", background: "#f7f5f0", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
            >
              <option value="">Ordenar por...</option>
              <option value="distancia_asc">Distancia: menor a mayor</option>
              <option value="distancia_desc">Distancia: mayor a menor</option>
              <option value="dificultad">Dificultad</option>
              <option value="vistas">Más visitadas</option>
            </select>

            {/* Toggle vista */}
            <div style={{ display: "flex", gap: 4, background: "#f7f5f0", padding: 4, borderRadius: 4, border: "1px solid rgba(74,124,89,0.15)" }}>
              {[
                { key: "grid", icon: "⊞", title: "Vista grid" },
                { key: "list", icon: "☰", title: "Vista lista" },
              ].map((v) => (
                <button key={v.key} onClick={() => setVista(v.key)} title={v.title}
                  style={{ padding: "8px 14px", borderRadius: 3, border: "none", background: vista === v.key ? "#2d5a27" : "transparent", color: vista === v.key ? "#f7f5f0" : "#6a7a6a", cursor: "pointer", fontSize: "1rem", transition: "all 0.2s", fontWeight: vista === v.key ? 600 : 400 }}>
                  {v.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Chips de dificultad */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "#9a9a9a", marginRight: 4 }}>Dificultad:</span>
            {[
              { value: "", label: "Todas" },
              { value: "FACIL", label: "🟢 Fácil" },
              { value: "MODERADO", label: "🟡 Moderado" },
              { value: "DIFICIL", label: "🔴 Difícil" },
              { value: "EXTREMO", label: "🟣 Extremo" },
            ].map((chip) => (
              <button key={chip.value} onClick={() => setFiltro((f) => ({ ...f, dificultad: chip.value }))}
                className={`filter-chip ${filtro.dificultad === chip.value ? "active" : ""}`}>
                {chip.label}
                {chip.value && conteosDificultad[chip.value] !== undefined && (
                  <span style={{ background: filtro.dificultad === chip.value ? "rgba(255,255,255,0.25)" : "rgba(74,124,89,0.1)", borderRadius: 10, padding: "1px 6px", fontSize: "0.72rem" }}>
                    {conteosDificultad[chip.value]}
                  </span>
                )}
              </button>
            ))}
            {(filtro.buscar || filtro.dificultad || filtro.orden) && (
              <button onClick={() => setFiltro({ dificultad: "", buscar: "", orden: "" })}
                style={{ marginLeft: "auto", padding: "7px 16px", background: "transparent", border: "1.5px solid rgba(244,67,54,0.3)", borderRadius: 24, color: "#e57373", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 500, transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,67,54,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                ✕ Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Contador */}
        {!cargando && !error && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#6a7a6a" }}>
              Mostrando <strong style={{ color: "#2d5a27" }}>{rutasPaginadas.length}</strong> de <strong style={{ color: "#2d5a27" }}>{totalRutas}</strong> rutas
              {filtro.buscar && <> para "<em>{filtro.buscar}</em>"</>}
            </p>
            {totalPaginas > 1 && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#9a9a9a" }}>
                Página {pagina} de {totalPaginas}
              </p>
            )}
          </div>
        )}

        {/* SKELETON */}
        {cargando && (
          <div style={{ display: "grid", gridTemplateColumns: vista === "grid" ? "repeat(auto-fill, minmax(320px, 1fr))" : "1fr", gap: 24 }}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "#fff", border: "1px solid rgba(244,67,54,0.15)", borderRadius: 6 }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: "1.3rem", color: "#c62828", marginBottom: 8 }}>Error al cargar las rutas</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6a7a6a", marginBottom: 24 }}>{error}</p>
            <button onClick={() => setFiltro({ ...filtro })}
              style={{ padding: "12px 28px", background: "#2d5a27", color: "#f7f5f0", border: "none", borderRadius: 3, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" }}>
              Reintentar
            </button>
          </div>
        )}

        {/* GRID */}
        {!cargando && !error && vista === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {rutasPaginadas.map((ruta, i) => (
              <div key={ruta.id} className="ruta-card-anim" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                <RutaCardGrid ruta={ruta} index={i} favoritos={favoritos} onToggleFavorito={handleToggleFavorito} user={user} />
              </div>
            ))}
          </div>
        )}

        {/* LISTA */}
        {!cargando && !error && vista === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {rutasPaginadas.map((ruta, i) => (
              <div key={ruta.id} className="ruta-card-anim" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <RutaCardList ruta={ruta} index={i} favoritos={favoritos} onToggleFavorito={handleToggleFavorito} user={user} />
              </div>
            ))}
          </div>
        )}

        {/* VACÍO */}
        {!cargando && !error && rutas.length === 0 && (
          <div style={{ textAlign: "center", padding: "100px 40px", background: "#fff", borderRadius: 6, border: "1px solid rgba(74,124,89,0.1)" }}>
            <div style={{ fontSize: "4rem", marginBottom: 20 }}>🌿</div>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: "1.5rem", color: "#1a2e1a", marginBottom: 12 }}>No encontramos rutas</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: "#6a7a6a", marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
              No hay rutas que coincidan con tu búsqueda. Intenta con otros filtros.
            </p>
            <button onClick={() => setFiltro({ dificultad: "", buscar: "", orden: "" })}
              style={{ padding: "12px 32px", background: "#2d5a27", color: "#f7f5f0", border: "none", borderRadius: 3, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" }}>
              Ver todas las rutas
            </button>
          </div>
        )}

        {/* PAGINACIÓN */}
        {!cargando && !error && totalPaginas > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 48 }}>
            <button className="page-btn" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>←</button>
            {[...Array(totalPaginas)].map((_, i) => (
              <button key={i} className={`page-btn ${pagina === i + 1 ? "active" : ""}`} onClick={() => setPagina(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="page-btn" disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>→</button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}