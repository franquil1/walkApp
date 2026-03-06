import { useState, useEffect } from "react";

// Códigos WMO de Open-Meteo → descripción + emoji
const WMO_CODES = {
  0:  { label: "Despejado",        emoji: "☀️",  color: "#f59e0b" },
  1:  { label: "Mayormente despejado", emoji: "🌤️", color: "#f59e0b" },
  2:  { label: "Parcialmente nublado", emoji: "⛅",  color: "#94a3b8" },
  3:  { label: "Nublado",          emoji: "☁️",  color: "#64748b" },
  45: { label: "Neblina",          emoji: "🌫️",  color: "#94a3b8" },
  48: { label: "Neblina helada",   emoji: "🌫️",  color: "#94a3b8" },
  51: { label: "Llovizna leve",    emoji: "🌦️",  color: "#60a5fa" },
  53: { label: "Llovizna",         emoji: "🌧️",  color: "#3b82f6" },
  55: { label: "Llovizna intensa", emoji: "🌧️",  color: "#2563eb" },
  61: { label: "Lluvia leve",      emoji: "🌧️",  color: "#3b82f6" },
  63: { label: "Lluvia moderada",  emoji: "🌧️",  color: "#2563eb" },
  65: { label: "Lluvia intensa",   emoji: "⛈️",  color: "#1d4ed8" },
  80: { label: "Chubascos",        emoji: "🌦️",  color: "#60a5fa" },
  81: { label: "Chubascos moderados", emoji: "🌧️", color: "#3b82f6" },
  82: { label: "Chubascos fuertes",emoji: "⛈️",  color: "#1d4ed8" },
  95: { label: "Tormenta",         emoji: "⛈️",  color: "#7c3aed" },
  96: { label: "Tormenta con granizo", emoji: "⛈️", color: "#6d28d9" },
};

function getWMO(code) {
  return WMO_CODES[code] || { label: "Variable", emoji: "🌡️", color: "#64748b" };
}

// Consejo de senderismo según el clima
function getConsejo(code, temp) {
  if (code === 0 || code === 1) return { texto: "Condiciones ideales para senderismo", icon: "✅", color: "#2d5a27" };
  if (code === 2 || code === 3) return { texto: "Buenas condiciones, lleva ropa de abrigo", icon: "🧥", color: "#4a7c59" };
  if ([45, 48].includes(code))  return { texto: "Visibilidad reducida, ten precaución", icon: "⚠️", color: "#d97706" };
  if (code >= 51 && code <= 65) return { texto: "Lluvia esperada, lleva impermeable", icon: "🌂", color: "#2563eb" };
  if (code >= 80 && code <= 82) return { texto: "Chubascos, no recomendado salir hoy", icon: "⛔", color: "#dc2626" };
  if (code >= 95)               return { texto: "Tormenta eléctrica, NO salir al sendero", icon: "🚫", color: "#dc2626" };
  if (temp < 10)                return { texto: "Temperatura baja, abrígate bien", icon: "🧤", color: "#0284c7" };
  return { texto: "Revisa el clima antes de salir", icon: "📍", color: "#6a7a6a" };
}

export default function ClimaWidget({ lat, lng, nombreRuta }) {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  // Coordenadas: usa las de la ruta o Popayán por defecto
  const coordLat = lat || 2.4448;
  const coordLng = lng || -76.6147;

  useEffect(() => {
    const fetchClima = async () => {
      try {
        setCargando(true);
        setError(false);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordLat}&longitude=${coordLng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=America%2FBogota&forecast_days=4`;
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setClima(data);
      } catch {
        setError(true);
      } finally {
        setCargando(false);
      }
    };
    fetchClima();
  }, [coordLat, coordLng]);

  if (cargando) return (
    <div style={{ background: "#fff", borderRadius: 6, padding: "24px", border: "1px solid rgba(74,124,89,0.1)", boxShadow: "0 2px 12px rgba(26,46,26,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(74,124,89,0.15)", animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 18, width: 160, background: "rgba(74,124,89,0.1)", borderRadius: 4, animation: "shimmer 1.5s infinite" }} />
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(74,124,89,0.1)", animation: "shimmer 1.5s infinite" }} />
        <div>
          <div style={{ height: 36, width: 80, background: "rgba(74,124,89,0.1)", borderRadius: 4, marginBottom: 8, animation: "shimmer 1.5s infinite" }} />
          <div style={{ height: 14, width: 120, background: "rgba(74,124,89,0.08)", borderRadius: 4, animation: "shimmer 1.5s infinite" }} />
        </div>
      </div>
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ background: "#fff", borderRadius: 6, padding: "20px 24px", border: "1px solid rgba(74,124,89,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: "1.5rem" }}>🌡️</span>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#6a7a6a" }}>No se pudo cargar el clima. Verifica tu conexión.</p>
    </div>
  );

  const current = clima.current;
  const daily   = clima.daily;
  const wmo     = getWMO(current.weather_code);
  const consejo = getConsejo(current.weather_code, current.temperature_2m);

  const dias = ["Hoy", "Mañana", "Pasado", "En 3 días"];

  return (
    <div style={{ background: "#fff", borderRadius: 6, border: "1px solid rgba(74,124,89,0.1)", boxShadow: "0 2px 12px rgba(26,46,26,0.05)", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3d1a, #2d5a27)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.1rem" }}>🌤️</span>
          <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "1rem", color: "#f7f5f0" }}>Clima en la ruta</h2>
        </div>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(181,213,160,0.7)", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf50", display: "inline-block" }} />
          En tiempo real
        </span>
      </div>

      <div style={{ padding: "20px 24px" }}>

        {/* Clima actual */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid rgba(74,124,89,0.08)" }}>
          <div style={{ fontSize: "4rem", lineHeight: 1, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}>
            {wmo.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "2.8rem", color: "#1a2e1a", lineHeight: 1, marginBottom: 4 }}>
              {Math.round(current.temperature_2m)}°C
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#6a7a6a", marginBottom: 2 }}>
              {wmo.label}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#9a9a9a" }}>
              Sensación térmica {Math.round(current.apparent_temperature)}°C
            </div>
          </div>
          {/* Stats secundarios */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.9rem" }}>💧</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#4a5a4a", fontWeight: 500 }}>{current.relative_humidity_2m}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.9rem" }}>💨</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#4a5a4a", fontWeight: 500 }}>{Math.round(current.wind_speed_10m)} km/h</span>
            </div>
          </div>
        </div>

        {/* Consejo senderismo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
          background: `${consejo.color}12`, border: `1px solid ${consejo.color}30`,
          borderRadius: 6, marginBottom: 20,
        }}>
          <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{consejo.icon}</span>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: consejo.color, fontWeight: 500, lineHeight: 1.4 }}>
            {consejo.texto}
          </p>
        </div>

        {/* Pronóstico 4 días */}
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "#9a9a9a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Próximos días
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {daily.weather_code.slice(0, 4).map((code, i) => {
              const dWmo = getWMO(code);
              const precip = daily.precipitation_probability_max[i];
              return (
                <div key={i} style={{
                  textAlign: "center", padding: "12px 8px",
                  background: i === 0 ? "rgba(74,124,89,0.08)" : "#f7f5f0",
                  borderRadius: 6,
                  border: i === 0 ? "1px solid rgba(74,124,89,0.2)" : "1px solid transparent",
                }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, color: i === 0 ? "#2d5a27" : "#9a9a9a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    {dias[i]}
                  </div>
                  <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{dWmo.emoji}</div>
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "0.9rem", color: "#1a2e1a", marginBottom: 2 }}>
                    {Math.round(daily.temperature_2m_max[i])}°
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#9a9a9a" }}>
                    {Math.round(daily.temperature_2m_min[i])}°
                  </div>
                  {precip > 0 && (
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", color: "#3b82f6", marginTop: 4, fontWeight: 500 }}>
                      💧{precip}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fuente */}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", color: "#c0c0c0", marginTop: 16, textAlign: "right" }}>
          Datos: Open-Meteo · Popayán, Colombia
        </p>
      </div>
    </div>
  );
}