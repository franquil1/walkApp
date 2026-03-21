import { useState, useEffect } from "react";
import "./ClimaWidget.css";

const WMO_CODES = {
  0:  { label: "Despejado",            emoji: "☀️",  color: "#f59e0b" },
  1:  { label: "Mayormente despejado", emoji: "🌤️", color: "#f59e0b" },
  2:  { label: "Parcialmente nublado", emoji: "⛅",  color: "#94a3b8" },
  3:  { label: "Nublado",              emoji: "☁️",  color: "#64748b" },
  45: { label: "Neblina",              emoji: "🌫️",  color: "#94a3b8" },
  48: { label: "Neblina helada",       emoji: "🌫️",  color: "#94a3b8" },
  51: { label: "Llovizna leve",        emoji: "🌦️",  color: "#60a5fa" },
  53: { label: "Llovizna",             emoji: "🌧️",  color: "#3b82f6" },
  55: { label: "Llovizna intensa",     emoji: "🌧️",  color: "#2563eb" },
  61: { label: "Lluvia leve",          emoji: "🌧️",  color: "#3b82f6" },
  63: { label: "Lluvia moderada",      emoji: "🌧️",  color: "#2563eb" },
  65: { label: "Lluvia intensa",       emoji: "⛈️",  color: "#1d4ed8" },
  80: { label: "Chubascos",            emoji: "🌦️",  color: "#60a5fa" },
  81: { label: "Chubascos moderados",  emoji: "🌧️",  color: "#3b82f6" },
  82: { label: "Chubascos fuertes",    emoji: "⛈️",  color: "#1d4ed8" },
  95: { label: "Tormenta",             emoji: "⛈️",  color: "#7c3aed" },
  96: { label: "Tormenta con granizo", emoji: "⛈️",  color: "#6d28d9" },
};

function getWMO(code) {
  return WMO_CODES[code] || { label: "Variable", emoji: "🌡️", color: "#64748b" };
}

function getConsejo(code, temp) {
  if (code === 0 || code === 1)         return { texto: "Condiciones ideales para senderismo",      icon: "✅", color: "#2d5a27" };
  if (code === 2 || code === 3)         return { texto: "Buenas condiciones, lleva ropa de abrigo", icon: "🧥", color: "#4a7c59" };
  if ([45, 48].includes(code))          return { texto: "Visibilidad reducida, ten precaución",     icon: "⚠️", color: "#d97706" };
  if (code >= 51 && code <= 65)         return { texto: "Lluvia esperada, lleva impermeable",       icon: "🌂", color: "#2563eb" };
  if (code >= 80 && code <= 82)         return { texto: "Chubascos, no recomendado salir hoy",      icon: "⛔", color: "#dc2626" };
  if (code >= 95)                       return { texto: "Tormenta eléctrica, NO salir al sendero",  icon: "🚫", color: "#dc2626" };
  if (temp < 10)                        return { texto: "Temperatura baja, abrígate bien",          icon: "🧤", color: "#0284c7" };
  return { texto: "Revisa el clima antes de salir", icon: "📍", color: "#6a7a6a" };
}

export default function ClimaWidget({ lat, lng, nombreRuta }) {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const coordLat = lat || 2.4448;
  const coordLng = lng || -76.6147;

  useEffect(() => {
    const fetchClima = async () => {
      try {
        setCargando(true); setError(false);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordLat}&longitude=${coordLng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=America%2FBogota&forecast_days=4`;
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        setClima(await res.json());
      } catch { setError(true); }
      finally { setCargando(false); }
    };
    fetchClima();
  }, [coordLat, coordLng]);

  if (cargando) return (
    <div className="clima-skeleton">
      <div className="clima-skeleton-header">
        <div className="clima-skeleton-circle-sm clima-skeleton-block" />
        <div className="clima-skeleton-line clima-skeleton-block" />
      </div>
      <div className="clima-skeleton-body">
        <div className="clima-skeleton-circle-lg clima-skeleton-block" />
        <div>
          <div className="clima-skeleton-temp clima-skeleton-block" />
          <div className="clima-skeleton-desc clima-skeleton-block" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="clima-error">
      <span style={{ fontSize: "1.5rem" }}>🌡️</span>
      <p className="clima-error-texto">No se pudo cargar el clima. Verifica tu conexión.</p>
    </div>
  );

  const current = clima.current;
  const daily   = clima.daily;
  const wmo     = getWMO(current.weather_code);
  const consejo = getConsejo(current.weather_code, current.temperature_2m);
  const dias    = ["Hoy", "Mañana", "Pasado", "En 3 días"];

  return (
    <div className="clima-card">
      {/* Header */}
      <div className="clima-header">
        <div className="clima-header-left">
          <span style={{ fontSize: "1.1rem" }}>🌤️</span>
          <h2 className="clima-header-titulo">Clima en la ruta</h2>
        </div>
        <span className="clima-header-live">
          <span className="clima-live-dot" />
          En tiempo real
        </span>
      </div>

      <div className="clima-body">
        {/* Clima actual */}
        <div className="clima-actual">
          <div className="clima-emoji">{wmo.emoji}</div>
          <div className="clima-temp-wrap">
            <div className="clima-temp">{Math.round(current.temperature_2m)}°C</div>
            <div className="clima-label">{wmo.label}</div>
            <div className="clima-sensacion">Sensación térmica {Math.round(current.apparent_temperature)}°C</div>
          </div>
          <div className="clima-stats">
            <div className="clima-stat-item">
              <span style={{ fontSize: "0.9rem" }}>💧</span>
              <span className="clima-stat-valor">{current.relative_humidity_2m}%</span>
            </div>
            <div className="clima-stat-item">
              <span style={{ fontSize: "0.9rem" }}>💨</span>
              <span className="clima-stat-valor">{Math.round(current.wind_speed_10m)} km/h</span>
            </div>
          </div>
        </div>

        {/* Consejo */}
        <div className="clima-consejo" style={{ background: `${consejo.color}12`, border: `1px solid ${consejo.color}30` }}>
          <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{consejo.icon}</span>
          <p className="clima-consejo-texto" style={{ color: consejo.color }}>{consejo.texto}</p>
        </div>

        {/* Pronóstico */}
        <p className="clima-pronostico-titulo">Próximos días</p>
        <div className="clima-pronostico-grid">
          {daily.weather_code.slice(0, 4).map((code, i) => {
            const dWmo   = getWMO(code);
            const precip = daily.precipitation_probability_max[i];
            const esHoy  = i === 0;
            return (
              <div key={i} className={`clima-dia-card ${esHoy ? "hoy" : "otro"}`}>
                <div className={`clima-dia-label ${esHoy ? "hoy" : "otro"}`}>{dias[i]}</div>
                <div className="clima-dia-emoji">{dWmo.emoji}</div>
                <div className="clima-dia-max">{Math.round(daily.temperature_2m_max[i])}°</div>
                <div className="clima-dia-min">{Math.round(daily.temperature_2m_min[i])}°</div>
                {precip > 0 && <div className="clima-dia-precip">💧{precip}%</div>}
              </div>
            );
          })}
        </div>

        <p className="clima-fuente">Datos: Open-Meteo · Popayán, Colombia</p>
      </div>
    </div>
  );
}