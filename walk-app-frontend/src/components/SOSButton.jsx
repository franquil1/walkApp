import { useState, useEffect } from "react";
import api from "../axiosConfig";
import "./SOSButton.css";

const EMERGENCY_CONTACTS = [
  { name: "Policía Nacional",       number: "112", icon: "🚔" },
  { name: "Bomberos",               number: "119", icon: "🚒" },
  { name: "Cruz Roja / Ambulancia", number: "132", icon: "🚑" },
  { name: "Defensa Civil",          number: "144", icon: "🛡️" },
];

export default function SOSButton() {
  const [open, setOpen]             = useState(false);
  const [location, setLocation]     = useState(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [trusted, setTrusted]       = useState(() => localStorage.getItem("sos_trusted") || "");
  const [editando, setEditando]     = useState(false);
  const [inputTel, setInputTel]     = useState("");

  const getLocation = () => {
    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        });
        setLoadingGPS(false);
      },
      () => setLoadingGPS(false),
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    if (open) getLocation();
  }, [open]);

  const guardarContacto = () => {
    const clean = inputTel.replace(/\s+/g, "").replace(/^0+/, "");
    if (!clean) return;
    localStorage.setItem("sos_trusted", clean);
    setTrusted(clean);
    setEditando(false);
    setInputTel("");
  };

  const abrirWhatsApp = async () => {
    const mapsLink = location
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : "(ubicación no disponible)";
    const msg = encodeURIComponent(
      `🆘 *EMERGENCIA* — Necesito ayuda urgente.\n📍 Mi ubicación: ${mapsLink}\nPor favor comunícate conmigo lo antes posible.`
    );
    const num = trusted.startsWith("57") ? trusted : `57${trusted}`;
    window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
    try {
      await api.post("/api/auth/sos/", {
        latitud:  location?.lat || null,
        longitud: location?.lng || null,
        mensaje:  "Alerta enviada por WhatsApp",
      });
    } catch {}
  };

  const shareLocation = async () => {
    const text = location
      ? `🆘 EMERGENCIA — Necesito ayuda. Mi ubicación: https://maps.google.com/?q=${location.lat},${location.lng}`
      : "🆘 EMERGENCIA — Necesito ayuda. (Ubicación no disponible)";
    if (navigator.share) {
      await navigator.share({ title: "SOS Emergencia", text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    try {
      await api.post("/api/auth/sos/", {
        latitud:  location?.lat || null,
        longitud: location?.lng || null,
        mensaje:  "Ubicación compartida en emergencia",
      });
    } catch {}
  };

  return (
    <>
      <button className="sos-fab" onClick={() => setOpen(true)} title="Emergencia SOS">
        🆘
      </button>

      {open && (
        <div className="sos-overlay" onClick={() => setOpen(false)}>
          <div className="sos-modal" onClick={(e) => e.stopPropagation()}>

            <div className="sos-header">
              <div>
                <div className="sos-header-title">🆘 Emergencia SOS</div>
                <div className="sos-header-sub">Selecciona un servicio o contacta tu red</div>
              </div>
              <button onClick={() => setOpen(false)} className="sos-close">&times;</button>
            </div>

            <div className="sos-section">
              <div className="sos-section-title">📞 Servicios de emergencia</div>
              {EMERGENCY_CONTACTS.map((c) => (
                <a key={c.number} href={`tel:${c.number}`} className="sos-contact">
                  <div className="sos-contact-left">
                    <span className="sos-contact-icon">{c.icon}</span>
                    <div>
                      <div className="sos-contact-name">{c.name}</div>
                      <div className="sos-contact-hint">Toca para llamar</div>
                    </div>
                  </div>
                  <span className="sos-contact-number">{c.number}</span>
                </a>
              ))}
            </div>

            <div className="sos-section sos-section--pb">
              <div className="sos-section-title">💚 Contacto de confianza (WhatsApp)</div>

              <div className="sos-gps-box">
                <div className="sos-gps-label">📍 Tu ubicación GPS</div>
                {loadingGPS && <div className="sos-gps-text sos-gps-text--loading">Obteniendo ubicación...</div>}
                {!loadingGPS && location && (
                  <div className="sos-gps-text sos-gps-text--coords">{location.lat}, {location.lng}</div>
                )}
                {!loadingGPS && !location && (
                  <div className="sos-gps-text sos-gps-text--loading">No disponible</div>
                )}
              </div>

              {!editando && trusted ? (
                <div className="sos-trusted-box">
                  <div>
                    <div className="sos-trusted-label">Contacto guardado</div>
                    <div className="sos-trusted-number">+57 {trusted}</div>
                  </div>
                  <button className="sos-edit-btn" onClick={() => { setEditando(true); setInputTel(trusted); }}>
                    ✏️ Cambiar
                  </button>
                </div>
              ) : (
                <div className="sos-input-wrap">
                  <input
                    className="sos-input"
                    type="tel"
                    placeholder="Ej: 3001234567 (sin +57)"
                    value={inputTel}
                    onChange={(e) => setInputTel(e.target.value)}
                  />
                  <div className="sos-input-actions">
                    <button onClick={guardarContacto} className="sos-btn-save">💾 Guardar</button>
                    {trusted && (
                      <button onClick={() => setEditando(false)} className="sos-btn-cancel">Cancelar</button>
                    )}
                  </div>
                </div>
              )}

              <button className="sos-wa-btn" onClick={abrirWhatsApp} disabled={!trusted}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.862L.057 23.428a.75.75 0 00.916.916l5.569-1.476A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.725 9.725 0 01-4.964-1.36l-.356-.212-3.683.975.991-3.615-.232-.373A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                </svg>
                {trusted ? "Enviar alerta por WhatsApp" : "Guarda un contacto primero"}
              </button>

              <button className="sos-share-btn" onClick={shareLocation}>
                {copied ? "✅ Copiado al portapapeles" : "📤 Compartir ubicación de emergencia"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}