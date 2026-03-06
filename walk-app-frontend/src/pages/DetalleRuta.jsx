import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ClimaWidget from "../components/ClimaWidget";
import ComentariosRuta from "../components/ComentariosRuta";


const DIFICULTAD_CONFIG = {
  FACIL:    { label: "Fácil",    bg: "#e8f5e9", text: "#2d5a27", border: "#a5d6a7", dot: "#4caf50", icon: "🟢" },
  MODERADO: { label: "Moderado", bg: "#fff8e1", text: "#e65100", border: "#ffcc80", dot: "#ff9800", icon: "🟡" },
  DIFICIL:  { label: "Difícil",  bg: "#fce4ec", text: "#b71c1c", border: "#f48fb1", dot: "#f44336", icon: "🔴" },
  EXTREMO:  { label: "Extremo",  bg: "#f3e5f5", text: "#4a148c", border: "#ce93d8", dot: "#9c27b0", icon: "🟣" },
};

function parseCoordenadas(str) {
  if (!str) return null;
  const parts = str.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts;
  return null;
}

function MapaLeaflet({ inicio, fin, coordenadasRuta }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;

    const linkCSS = document.createElement("link");
    linkCSS.rel = "stylesheet";
    linkCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(linkCSS);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = window.L;
      if (!mapRef.current || mapInstance.current) return;

      const centro = inicio || fin || [2.4448, -76.6147];
      const map = L.map(mapRef.current, { center: centro, zoom: 15, zoomControl: true, scrollWheelZoom: false });
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const iconoInicio = L.divIcon({
        html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#2d5a27,#4a7c59);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3)"></div>`,
        className: "", iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36],
      });

      const iconoFin = L.divIcon({
        html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#e57373,#f44336);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3)"></div>`,
        className: "", iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36],
      });

      if (inicio) {
        L.marker(inicio, { icon: iconoInicio }).addTo(map)
          .bindPopup(`<div style="font-family:'DM Sans',sans-serif;padding:4px"><strong style="color:#2d5a27">🚀 Punto de inicio</strong><br/><span style="font-size:0.8rem;color:#6a7a6a">${inicio[0].toFixed(4)}, ${inicio[1].toFixed(4)}</span></div>`);
      }

      if (fin && fin.toString() !== inicio?.toString()) {
        L.marker(fin, { icon: iconoFin }).addTo(map)
          .bindPopup(`<div style="font-family:'DM Sans',sans-serif;padding:4px"><strong style="color:#e57373">🏁 Punto final</strong><br/><span style="font-size:0.8rem;color:#6a7a6a">${fin[0].toFixed(4)}, ${fin[1].toFixed(4)}</span></div>`);
      }

      if (coordenadasRuta && Array.isArray(coordenadasRuta) && coordenadasRuta.length > 1) {
        L.polyline(coordenadasRuta, { color: "#2d5a27", weight: 4, opacity: 0.85, lineJoin: "round" }).addTo(map);
        map.fitBounds(L.polyline(coordenadasRuta).getBounds(), { padding: [40, 40] });
      } else if (inicio && fin && fin.toString() !== inicio.toString()) {
        L.polyline([inicio, fin], { color: "#4a7c59", weight: 3, opacity: 0.7, dashArray: "8, 8" }).addTo(map);
        map.fitBounds([inicio, fin], { padding: [60, 60] });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [inicio, fin, coordenadasRuta]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={mapRef} style={{ height: 340, borderRadius: 6, overflow: "hidden", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 1000, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderRadius: 6, padding: "10px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem" }}>
        {inicio && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: fin ? 6 : 0 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2d5a27" }} /><span style={{ color: "#4a5a4a" }}>Inicio</span></div>}
        {fin && fin.toString() !== inicio?.toString() && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f44336" }} /><span style={{ color: "#4a5a4a" }}>Final</span></div>}
      </div>
    </div>
  );
}

export default function DetalleRuta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ruta, setRuta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [favorito, setFavorito] = useState(false);
  const [user, setUser] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [rutasRelacionadas, setRutasRelacionadas] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) try { setUser(JSON.parse(u)); } catch {}
    const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
    setFavorito(favs.includes(parseInt(id)));
  }, [id]);

  useEffect(() => {
    const fetchRuta = async () => {
      try {
        setCargando(true); setError(null);
        const res = await api.get(`/api/rutas/${id}/`);
        setRuta(res.data);
        const allRes = await api.get("/api/rutas/");
        setRutasRelacionadas(allRes.data.filter((r) => r.id !== parseInt(id) && r.dificultad === res.data.dificultad).slice(0, 3));
      } catch { setError("No se pudo cargar la ruta."); }
      finally { setCargando(false); }
    };
    fetchRuta();
  }, [id]);

  const handleToggleFavorito = () => {
    if (!user) { navigate("/login"); return; }
    const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
    const rutaId = parseInt(id);
    const nuevos = favorito ? favs.filter((f) => f !== rutaId) : [...favs, rutaId];
    localStorage.setItem("favoritos", JSON.stringify(nuevos));
    setFavorito(!favorito);
  };

  const handleCompartir = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const diff = ruta ? (DIFICULTAD_CONFIG[ruta.dificultad] || DIFICULTAD_CONFIG.MODERADO) : null;
  const coordInicio = ruta ? parseCoordenadas(ruta.ubicacion_inicio) : null;
  const coordFin = ruta ? parseCoordenadas(ruta.ubicacion_fin) : null;
  const tieneMapaData = coordInicio || coordFin || (ruta?.coordenadas_ruta?.length > 0);

  if (cargando) return (
    <div style={{ fontFamily: "'Lora', serif", background: "#f7f5f0", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 44, height: 44, border: "3px solid rgba(74,124,89,0.2)", borderTop: "3px solid #4a7c59", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6a7a6a" }}>Cargando ruta...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !ruta) return (
    <div style={{ fontFamily: "'Lora', serif", background: "#f7f5f0", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", flexDirection: "column", gap: 16, padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem" }}>🏔️</div>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.8rem", color: "#1a2e1a" }}>Ruta no encontrada</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6a7a6a" }}>La ruta que buscas no existe o fue eliminada.</p>
        <Link to="/rutas" style={{ padding: "12px 28px", background: "#2d5a27", color: "#f7f5f0", textDecoration: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Ver todas las rutas</Link>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif", background: "#f7f5f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .action-btn { display: flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 4px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.25s; border: none; }
        .info-card { background: #fff; border-radius: 6px; padding: 24px; border: 1px solid rgba(74,124,89,0.1); box-shadow: 0 2px 12px rgba(26,46,26,0.05); }
        .stat-item { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid rgba(74,124,89,0.08); }
        .stat-item:last-child { border-bottom: none; padding-bottom: 0; }
        .related-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,46,26,0.12) !important; }
        .leaflet-container { font-family: 'DM Sans', sans-serif !important; }
      `}</style>

      <Navbar />

      {/* HERO */}
      <div style={{ height: "55vh", minHeight: 380, position: "relative", overflow: "hidden", background: ruta.imagen_url ? "transparent" : "linear-gradient(160deg, #0d1f0d 0%, #1e3d1a 50%, #2d5a27 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {ruta.imagen_url
          ? <img src={ruta.imagen_url} alt={ruta.nombre_ruta} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <>{[...Array(4)].map((_, i) => (<div key={i} style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", width: [400,250,180,320][i], height: [400,250,180,320][i], background: `rgba(181,213,160,${[0.05,0.07,0.09,0.04][i]})`, top: ["-20%","50%","20%","-5%"][i], left: ["-5%","65%","75%","35%"][i] }} />))}
            <span style={{ fontSize: "6rem", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))", position: "relative", zIndex: 1 }}>🏔️</span></>
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />
        <div style={{ position: "absolute", top: 90, left: 48, display: "flex", alignItems: "center", gap: 8, zIndex: 2 }}>
          <Link to="/" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Inicio</Link>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
          <Link to="/rutas" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Rutas</Link>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.85)" }}>{ruta.nombre_ruta}</span>
        </div>
        <div style={{ position: "absolute", bottom: 36, left: 48, right: 48, zIndex: 2, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ background: diff.bg, color: diff.text, border: `1px solid ${diff.border}`, fontSize: "0.72rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: diff.dot }} />{diff.label}
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 12 }}>👁 {ruta.vistas || 0} vistas</span>
            </div>
            <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#f7f5f0", lineHeight: 1.15, textShadow: "0 2px 20px rgba(0,0,0,0.4)", maxWidth: 700 }}>{ruta.nombre_ruta}</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleToggleFavorito} className="action-btn" style={{ background: favorito ? "rgba(224,87,74,0.9)" : "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              {favorito ? "❤️ Guardada" : "🤍 Guardar"}
            </button>
            <button onClick={handleCompartir} className="action-btn" style={{ background: copiado ? "rgba(74,124,89,0.9)" : "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              {copiado ? "✅ Copiado" : "🔗 Compartir"}
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 48px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, alignItems: "start" }}>
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            {/* Descripción */}
            <div className="info-card" style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.4rem", color: "#1a2e1a", marginBottom: 16 }}>Sobre esta ruta</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1rem", lineHeight: 1.85, color: "#4a5a4a" }}>{ruta.descripcion || "Sin descripción disponible."}</p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              {[{ icon: "📏", label: "Distancia", value: `${ruta.longitud} km` }, { icon: "⏱", label: "Duración", value: ruta.duracion_estimada || "—" }, { icon: diff.icon, label: "Dificultad", value: diff.label }].map((s) => (
                <div key={s.label} className="info-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "1.1rem", color: "#1a2e1a", marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#9a9a9a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* MAPA */}
            <div className="info-card" style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.4rem", color: "#1a2e1a", marginBottom: 16 }}>🗺️ Mapa de la ruta</h2>
              {tieneMapaData ? (
                <MapaLeaflet inicio={coordInicio} fin={coordFin} coordenadasRuta={ruta.coordenadas_ruta} />
              ) : (
                <div style={{ height: 280, background: "linear-gradient(135deg, #e8f5e9, #f0ede6)", borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, border: "2px dashed rgba(74,124,89,0.2)" }}>
                  <span style={{ fontSize: "2.5rem" }}>📍</span>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#6a7a6a" }}>Coordenadas no disponibles para esta ruta.</p>
                </div>
              )}
              {ruta.ubicacion_inicio && (
                <div style={{ marginTop: 14, display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#4a7c59" }}>🚀 Inicio: {ruta.ubicacion_inicio}</span>
                  {ruta.ubicacion_fin && ruta.ubicacion_fin !== ruta.ubicacion_inicio && (
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#e57373" }}>🏁 Fin: {ruta.ubicacion_fin}</span>
                  )}
                </div>
              )}
            </div>

            {/* CLIMA */}
            <div style={{ marginBottom: 24 }}>
              <ClimaWidget
                lat={coordInicio ? coordInicio[0] : null}
                lng={coordInicio ? coordInicio[1] : null}
                nombreRuta={ruta.nombre_ruta}
              />
            </div>

            {/* Puntos de interés */}
            {ruta.puntos_interes && (
              <div className="info-card" style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.4rem", color: "#1a2e1a", marginBottom: 16 }}>📍 Puntos de interés</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.95rem", lineHeight: 1.8, color: "#4a5a4a" }}>{ruta.puntos_interes}</p>
              </div>
            )}

            {/* Rutas relacionadas */}
            {rutasRelacionadas.length > 0 && (
              <div>
                <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.4rem", color: "#1a2e1a", marginBottom: 20 }}>Rutas similares</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {rutasRelacionadas.map((r, i) => {
                    const rd = DIFICULTAD_CONFIG[r.dificultad] || DIFICULTAD_CONFIG.MODERADO;
                    return (
                      <Link key={r.id} to={`/rutas/${r.id}`} style={{ textDecoration: "none" }}>
                        <div className="related-card" style={{ background: "#fff", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(74,124,89,0.1)", boxShadow: "0 2px 12px rgba(26,46,26,0.06)", transition: "all 0.3s" }}>
                          <div style={{ height: 110, background: `linear-gradient(135deg, ${["#1e3d1a","#2d5a27","#0d1f0d"][i%3]}, #4a7c59)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "2.2rem" }}>🏔️</span>
                          </div>
                          <div style={{ padding: "14px 16px" }}>
                            <h4 style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "0.9rem", color: "#1a2e1a", marginBottom: 6, lineHeight: 1.3 }}>{r.nombre_ruta}</h4>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.78rem", color: "#2d5a27" }}>📏 {r.longitud} km</span>
                              <span style={{ background: rd.bg, color: rd.text, fontSize: "0.62rem", fontWeight: 700, padding: "2px 7px", borderRadius: 10, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{rd.label}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COMENTARIOS Y RATING */}
            <div style={{ marginTop: 40 }}>
              <ComentariosRuta rutaId={id} />
            </div>

          </div>

          {/* SIDEBAR */}
          <div style={{ position: "sticky", top: 90, animation: "fadeUp 0.5s ease 0.1s both" }}>
            <div className="info-card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.1rem", color: "#1a2e1a", marginBottom: 16 }}>Información de la ruta</h3>
              <div>
                {[
                  { icon: "📏", label: "Distancia", value: `${ruta.longitud} km` },
                  { icon: "⏱", label: "Duración", value: ruta.duracion_estimada || "—" },
                  { icon: "💪", label: "Dificultad", value: diff.label },
                  ...(ruta.ubicacion ? [{ icon: "📍", label: "Ubicación", value: ruta.ubicacion }] : []),
                  ...(ruta.ubicacion_inicio ? [{ icon: "🚀", label: "Inicio", value: ruta.ubicacion_inicio }] : []),
                  ...(ruta.ubicacion_fin ? [{ icon: "🏁", label: "Fin", value: ruta.ubicacion_fin }] : []),
                  { icon: "👁", label: "Vistas", value: `${ruta.vistas || 0} veces` },
                  { icon: "📅", label: "Agregada", value: ruta.fecha_creacion ? new Date(ruta.fecha_creacion).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                ].map((item) => (
                  <div key={item.label} className="stat-item">
                    <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#9a9a9a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.88rem", color: "#1a2e1a", wordBreak: "break-word" }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #1e3d1a, #2d5a27)", borderRadius: 6, padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🥾</div>
              <h3 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.1rem", color: "#f7f5f0", marginBottom: 8 }}>¿Listo para salir?</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "rgba(247,245,240,0.65)", marginBottom: 20, lineHeight: 1.6 }}>Guarda esta ruta en tus favoritas y empieza tu aventura.</p>
              <button onClick={handleToggleFavorito} style={{ width: "100%", padding: "12px", background: favorito ? "rgba(224,87,74,0.85)" : "#f7f5f0", color: favorito ? "#fff" : "#1a2e1a", border: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.25s", marginBottom: 10 }}>
                {favorito ? "❤️ En tus favoritas" : "🤍 Guardar en favoritas"}
              </button>
              <Link to="/rutas" style={{ display: "block", padding: "11px", background: "transparent", color: "rgba(247,245,240,0.65)", border: "1px solid rgba(247,245,240,0.2)", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.85rem", textDecoration: "none" }}>← Ver todas las rutas</Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}