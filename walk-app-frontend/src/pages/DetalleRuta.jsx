import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ClimaWidget from "../components/ClimaWidget";
import ComentariosRuta from "../components/ComentariosRuta";
import "./DetalleRuta.css";

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
    <div className="detalle-map-wrapper">
      <div ref={mapRef} className="detalle-map-container" />
      <div className="detalle-map-legend">
        {inicio && (
          <div className={`detalle-map-legend__item ${fin ? "detalle-map-legend__item--mb" : ""}`}>
            <div className="detalle-map-legend__dot detalle-map-legend__dot--inicio" />
            <span className="detalle-map-legend__text">Inicio</span>
          </div>
        )}
        {fin && fin.toString() !== inicio?.toString() && (
          <div className="detalle-map-legend__item">
            <div className="detalle-map-legend__dot detalle-map-legend__dot--fin" />
            <span className="detalle-map-legend__text">Final</span>
          </div>
        )}
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
        setRutasRelacionadas((allRes.data.rutas || []).filter((r) => r.id !== parseInt(id) && r.dificultad === res.data.dificultad).slice(0, 3));
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
    <div className="detalle-page">
      <Navbar />
      <div className="detalle-loading">
        <div className="detalle-spinner" />
        <p className="detalle-loading__text">Cargando ruta...</p>
      </div>
    </div>
  );

  if (error || !ruta) return (
    <div className="detalle-page">
      <Navbar />
      <div className="detalle-error-page">
        <div className="detalle-error-page__icon">🏔️</div>
        <h2 className="detalle-error-page__title">Ruta no encontrada</h2>
        <p className="detalle-error-page__text">La ruta que buscas no existe o fue eliminada.</p>
        <Link to="/rutas" className="detalle-error-page__btn">Ver todas las rutas</Link>
      </div>
    </div>
  );

  return (
    <div className="detalle-page">
      <Navbar />

      {}
      <div className={`detalle-hero ${!ruta.imagen_url ? "detalle-hero--gradient" : ""}`}>
        {ruta.imagen_url ? (
          <img src={ruta.imagen_url} alt={ruta.nombre_ruta} className="detalle-hero__img" />
        ) : (
          <>
            <div className="detalle-hero__orb detalle-hero__orb--1" />
            <div className="detalle-hero__orb detalle-hero__orb--2" />
            <div className="detalle-hero__orb detalle-hero__orb--3" />
            <div className="detalle-hero__orb detalle-hero__orb--4" />
            <span className="detalle-hero__placeholder-icon">🏔️</span>
          </>
        )}
        <div className="detalle-hero__overlay" />

        <div className="detalle-hero__breadcrumb">
          <Link to="/" className="detalle-hero__breadcrumb-link">Inicio</Link>
          <span className="detalle-hero__breadcrumb-sep">›</span>
          <Link to="/rutas" className="detalle-hero__breadcrumb-link">Rutas</Link>
          <span className="detalle-hero__breadcrumb-sep">›</span>
          <span className="detalle-hero__breadcrumb-current">{ruta.nombre_ruta}</span>
        </div>

        <div className="detalle-hero__bottom">
          <div>
            <div className="detalle-hero__meta">
              <span className="detalle-hero__badge" style={{ background: diff.bg, color: diff.text, border: `1px solid ${diff.border}` }}>
                <span className="detalle-hero__badge-dot" style={{ background: diff.dot }} />
                {diff.label}
              </span>
              <span className="detalle-hero__views">👁 {ruta.vistas || 0} vistas</span>
            </div>
            <h1 className="detalle-hero__title">{ruta.nombre_ruta}</h1>
          </div>
          <div className="detalle-hero__actions">
            <button onClick={handleToggleFavorito} className={`action-btn action-btn--guardar ${favorito ? "active" : ""}`}>
              {favorito ? "❤️ Guardada" : "🤍 Guardar"}
            </button>
            <button onClick={handleCompartir} className={`action-btn action-btn--compartir ${copiado ? "active" : ""}`}>
              {copiado ? "✅ Copiado" : "🔗 Compartir"}
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="detalle-content">
        <div className="detalle-grid">
          <div className="detalle-main">

            {}
            <div className="info-card info-card--mb">
              <h2 className="info-card__title">Sobre esta ruta</h2>
              <p className="info-card__text">{ruta.descripcion || "Sin descripción disponible."}</p>
            </div>

            {}
            <div className="detalle-stats">
              {[
                { icon: "📏", label: "Distancia", value: `${ruta.longitud} km` },
                { icon: "⏱", label: "Duración", value: ruta.duracion_estimada || "—" },
                { icon: diff.icon, label: "Dificultad", value: diff.label },
              ].map((s) => (
                <div key={s.label} className="info-card stat-card">
                  <div className="stat-card__icon">{s.icon}</div>
                  <div className="stat-card__value">{s.value}</div>
                  <div className="stat-card__label">{s.label}</div>
                </div>
              ))}
            </div>

            {}
            <div className="info-card info-card--mb">
              <h2 className="info-card__title">🗺️ Mapa de la ruta</h2>
              {tieneMapaData ? (
                <MapaLeaflet inicio={coordInicio} fin={coordFin} coordenadasRuta={ruta.coordenadas_ruta} />
              ) : (
                <div className="detalle-map-empty">
                  <span className="detalle-map-empty__icon">📍</span>
                  <p className="detalle-map-empty__text">Coordenadas no disponibles para esta ruta.</p>
                </div>
              )}
              {ruta.ubicacion_inicio && (
                <div className="detalle-map-coords">
                  <span className="detalle-map-coords__inicio">🚀 Inicio: {ruta.ubicacion_inicio}</span>
                  {ruta.ubicacion_fin && ruta.ubicacion_fin !== ruta.ubicacion_inicio && (
                    <span className="detalle-map-coords__fin">🏁 Fin: {ruta.ubicacion_fin}</span>
                  )}
                </div>
              )}
            </div>

            {}
            <div className="detalle-clima">
              <ClimaWidget
                lat={coordInicio ? coordInicio[0] : null}
                lng={coordInicio ? coordInicio[1] : null}
                nombreRuta={ruta.nombre_ruta}
              />
            </div>

            {}
            {ruta.puntos_interes && (
              <div className="info-card info-card--mb">
                <h2 className="info-card__title">📍 Puntos de interés</h2>
                <p className="info-card__text">{ruta.puntos_interes}</p>
              </div>
            )}

            {}
            {rutasRelacionadas.length > 0 && (
              <div>
                <h2 className="detalle-related__title">Rutas similares</h2>
                <div className="detalle-related__grid">
                  {rutasRelacionadas.map((r, i) => {
                    const rd = DIFICULTAD_CONFIG[r.dificultad] || DIFICULTAD_CONFIG.MODERADO;
                    const thumbBg = ["#1e3d1a","#2d5a27","#0d1f0d"][i % 3];
                    return (
                      <Link key={r.id} to={`/rutas/${r.id}`} className="related-card">
                        <div className="related-card__thumb" style={{ background: `linear-gradient(135deg, ${thumbBg}, #4a7c59)` }}>
                          <span className="related-card__thumb-icon">🏔️</span>
                        </div>
                        <div className="related-card__body">
                          <h4 className="related-card__name">{r.nombre_ruta}</h4>
                          <div className="related-card__footer">
                            <span className="related-card__distance">📏 {r.longitud} km</span>
                            <span className="related-card__badge" style={{ background: rd.bg, color: rd.text }}>{rd.label}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {}
            <div className="detalle-comments">
              <ComentariosRuta rutaId={id} />
            </div>
          </div>

          {}
          <div className="detalle-sidebar">
            <div className="info-card sidebar-card">
              <h3 className="sidebar-card__title">Información de la ruta</h3>
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
                    <span className="stat-item__icon">{item.icon}</span>
                    <div className="stat-item__content">
                      <div className="stat-item__label">{item.label}</div>
                      <div className="stat-item__value">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-cta">
              <div className="sidebar-cta__icon">🥾</div>
              <h3 className="sidebar-cta__title">¿Listo para salir?</h3>
              <p className="sidebar-cta__text">Guarda esta ruta en tus favoritas y empieza tu aventura.</p>
              <button onClick={handleToggleFavorito}
                className={`sidebar-cta__btn-fav ${favorito ? "sidebar-cta__btn-fav--on" : "sidebar-cta__btn-fav--off"}`}>
                {favorito ? "❤️ En tus favoritas" : "🤍 Guardar en favoritas"}
              </button>
              <Link to={`/rutas/${id}/recorrido`} className="sidebar-cta__btn-iniciar">
                🥾 Iniciar recorrido
              </Link>
              <Link to="/rutas" className="sidebar-cta__btn-back">← Ver todas las rutas</Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}