import { useState, useEffect } from "react";

const EMERGENCY_CONTACTS = [
  { name: "Policía Nacional",       number: "112", icon: "🚔" },
  { name: "Bomberos",               number: "119", icon: "🚒" },
  { name: "Cruz Roja / Ambulancia", number: "132", icon: "🚑" },
  { name: "Defensa Civil",          number: "144", icon: "🛡️" },
];

export default function SOSButton() {
  const [open, setOpen]           = useState(false);
  const [location, setLocation]   = useState(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [copied, setCopied]       = useState(false);

  // Contacto de confianza
  const [trusted, setTrusted]     = useState(() => localStorage.getItem("sos_trusted") || "");
  const [editando, setEditando]   = useState(false);
  const [inputTel, setInputTel]   = useState("");

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

  // Guardar contacto
  const guardarContacto = () => {
    const clean = inputTel.replace(/\s+/g, "").replace(/^0+/, "");
    if (!clean) return;
    localStorage.setItem("sos_trusted", clean);
    setTrusted(clean);
    setEditando(false);
    setInputTel("");
  };

  // Abrir WhatsApp con mensaje de emergencia
  const abrirWhatsApp = () => {
    const mapsLink = location
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : "(ubicación no disponible)";
    const msg = encodeURIComponent(
      `🆘 *EMERGENCIA* — Necesito ayuda urgente.\n📍 Mi ubicación: ${mapsLink}\nPor favor comunícate conmigo lo antes posible.`
    );
    const num = trusted.startsWith("57") ? trusted : `57${trusted}`;
    window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
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
  };

  return (
    <>
      <style>{`
        @keyframes sosPulse {
          0%   { box-shadow: 0 0 0 0 rgba(220,38,38,0.6); }
          70%  { box-shadow: 0 0 0 14px rgba(220,38,38,0); }
          100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
        }
        .sos-fab {
          position: fixed !important;
          bottom: 30px !important;
          right: 30px !important;
          z-index: 99999 !important;
          width: 58px; height: 58px;
          border-radius: 50%;
          background: #dc2626;
          border: none; cursor: pointer;
          font-size: 1.6rem; color: white;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(220,38,38,0.45);
          animation: sosPulse 2s infinite;
          transition: transform 0.2s, background 0.2s;
        }
        .sos-fab:hover { background: #b91c1c; transform: scale(1.08); }
        .sos-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 99998;
          display: flex; align-items: center; justify-content: center;
        }
        .sos-modal {
          background: #fff; border-radius: 18px;
          width: 100%; max-width: 370px; margin: 16px;
          overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-height: 90vh; overflow-y: auto;
        }
        .sos-header {
          background: #dc2626; padding: 18px 20px;
          display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0;
        }
        .sos-contact {
          display: flex; align-items: center; justify-content: space-between;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 12px; padding: 12px 16px;
          text-decoration: none; transition: background 0.2s; margin-bottom: 8px;
        }
        .sos-contact:hover { background: #fee2e2; }
        .sos-section { padding: 14px 16px 0; }
        .sos-section-title {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 10px;
        }
        .sos-wa-btn {
          width: 100%; background: #25d366; color: white;
          border: none; padding: 12px; border-radius: 12px;
          font-size: 0.92rem; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s; margin-bottom: 8px;
        }
        .sos-wa-btn:hover { background: #1ebe5d; }
        .sos-wa-btn:disabled { background: #a7f3d0; cursor: not-allowed; }
        .sos-share-btn {
          width: 100%; background: #dc2626; color: white;
          border: none; padding: 11px; border-radius: 12px;
          font-size: 0.88rem; font-weight: 600; cursor: pointer;
          transition: background 0.2s;
        }
        .sos-share-btn:hover { background: #b91c1c; }
        .sos-input {
          width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
          padding: 9px 12px; font-size: 0.9rem; outline: none;
          transition: border 0.2s; box-sizing: border-box;
        }
        .sos-input:focus { border-color: #25d366; }
        .sos-trusted-box {
          background: #f0fdf4; border: 1.5px solid #bbf7d0;
          border-radius: 12px; padding: 10px 14px;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px;
        }
        .sos-edit-btn {
          background: none; border: none; color: #16a34a;
          font-size: 0.78rem; font-weight: 600; cursor: pointer;
          text-decoration: underline;
        }
      `}</style>

      {/* Botón flotante */}
      <button className="sos-fab" onClick={() => setOpen(true)} title="Emergencia SOS">
        🆘
      </button>

      {/* Modal */}
      {open && (
        <div className="sos-overlay" onClick={() => setOpen(false)}>
          <div className="sos-modal" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="sos-header">
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>🆘 Emergencia SOS</div>
                <div style={{ color: "#fecaca", fontSize: "0.78rem" }}>Selecciona un servicio o contacta tu red</div>
              </div>
              <button onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>
                &times;
              </button>
            </div>

            {/* Servicios de emergencia */}
            <div className="sos-section">
              <div className="sos-section-title">📞 Servicios de emergencia</div>
              {EMERGENCY_CONTACTS.map((c) => (
                <a key={c.number} href={`tel:${c.number}`} className="sos-contact">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: "1.4rem" }}>{c.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#111" }}>{c.name}</div>
                      <div style={{ fontSize: "0.73rem", color: "#6b7280" }}>Toca para llamar</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: "#dc2626", fontSize: "1.1rem" }}>{c.number}</span>
                </a>
              ))}
            </div>

            {/* WhatsApp contacto de confianza */}
            <div className="sos-section" style={{ paddingBottom: 16 }}>
              <div className="sos-section-title">💚 Contacto de confianza (WhatsApp)</div>

              {/* GPS */}
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", marginBottom: 10 }}>
                <div style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 2 }}>📍 Tu ubicación GPS</div>
                {loadingGPS && <div style={{ fontSize: "0.82rem", color: "#9ca3af" }}>Obteniendo ubicación...</div>}
                {!loadingGPS && location && (
                  <div style={{ fontSize: "0.82rem", fontFamily: "monospace", color: "#374151" }}>{location.lat}, {location.lng}</div>
                )}
                {!loadingGPS && !location && (
                  <div style={{ fontSize: "0.82rem", color: "#9ca3af" }}>No disponible</div>
                )}
              </div>

              {/* Contacto guardado o form */}
              {!editando && trusted ? (
                <div className="sos-trusted-box">
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>Contacto guardado</div>
                    <div style={{ fontSize: "0.9rem", color: "#111", fontWeight: 700 }}>+57 {trusted}</div>
                  </div>
                  <button className="sos-edit-btn" onClick={() => { setEditando(true); setInputTel(trusted); }}>
                    ✏️ Cambiar
                  </button>
                </div>
              ) : (
                <div style={{ marginBottom: 8 }}>
                  <input
                    className="sos-input"
                    type="tel"
                    placeholder="Ej: 3001234567 (sin +57)"
                    value={inputTel}
                    onChange={(e) => setInputTel(e.target.value)}
                    style={{ marginBottom: 6 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={guardarContacto}
                      style={{ flex: 1, background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, padding: "9px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>
                      💾 Guardar
                    </button>
                    {trusted && (
                      <button onClick={() => setEditando(false)}
                        style={{ flex: 1, background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 10, padding: "9px", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Botón WhatsApp */}
              <button className="sos-wa-btn" onClick={abrirWhatsApp} disabled={!trusted}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.862L.057 23.428a.75.75 0 00.916.916l5.569-1.476A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.725 9.725 0 01-4.964-1.36l-.356-.212-3.683.975.991-3.615-.232-.373A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                </svg>
                {trusted ? "Enviar alerta por WhatsApp" : "Guarda un contacto primero"}
              </button>

              {/* Compartir ubicación */}
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