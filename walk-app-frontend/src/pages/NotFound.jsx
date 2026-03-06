import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  const navigate = useNavigate();
  const [cuenta, setCuenta] = useState(10);

  // Countdown para redirigir al home
  useEffect(() => {
    if (cuenta <= 0) { navigate("/"); return; }
    const timer = setTimeout(() => setCuenta((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cuenta, navigate]);

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif", background: "#f7f5f0", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp   { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
        @keyframes float    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        @keyframes sway     { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
        @keyframes fogDrift { from { transform: translateX(-60px); opacity: 0; } 60% { opacity: 1; } to { transform: translateX(60px); opacity: 0; } }
        @keyframes countPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes shimmerBg  { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; background: #2d5a27; color: #f7f5f0;
          text-decoration: none; border-radius: 4px;
          font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.95rem;
          transition: all 0.25s; border: none; cursor: pointer;
          letter-spacing: 0.02em;
        }
        .btn-primary:hover { background: #1e3d1a; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(45,90,39,0.3); }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; background: transparent; color: #2d5a27;
          text-decoration: none; border-radius: 4px;
          font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.92rem;
          transition: all 0.25s; border: 1.5px solid rgba(45,90,39,0.3); cursor: pointer;
        }
        .btn-secondary:hover { background: rgba(45,90,39,0.06); border-color: #2d5a27; transform: translateY(-2px); }

        .quick-link {
          display: flex; align-items: center; gap: 12px; padding: 14px 20px;
          background: #fff; border: 1px solid rgba(74,124,89,0.1); border-radius: 6px;
          text-decoration: none; color: #1a2e1a;
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500;
          transition: all 0.25s;
        }
        .quick-link:hover { border-color: #4a7c59; box-shadow: 0 6px 20px rgba(26,46,26,0.1); transform: translateX(4px); }
      `}</style>

      <Navbar />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 60px" }}>
        <div style={{ maxWidth: 700, width: "100%", textAlign: "center" }}>

          {/* Ilustración animada */}
          <div style={{ position: "relative", height: 220, marginBottom: 16, userSelect: "none" }}>

            {/* Niebla de fondo */}
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{
                position: "absolute", borderRadius: "50%",
                width: [260, 180, 220][i], height: [60, 40, 50][i],
                background: "rgba(181,213,160,0.18)",
                top: [160, 170, 155][i], left: [`${[10, 35, 55][i]}%`],
                filter: "blur(18px)",
                animation: `fogDrift ${[4, 5, 3.5][i]}s ease-in-out ${[0, 1, 2][i]}s infinite`,
              }} />
            ))}

            {/* Montaña grande */}
            <svg viewBox="0 0 400 180" style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 380, opacity: 0.18 }}>
              <polygon points="200,10 320,170 80,170" fill="#2d5a27" />
              <polygon points="310,60 390,170 230,170" fill="#4a7c59" />
              <polygon points="90,80 160,170 20,170" fill="#1e3d1a" />
            </svg>

            {/* 404 flotando */}
            <div style={{
              position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
              fontFamily: "'Lora', serif", fontWeight: 700,
              fontSize: "clamp(5rem, 14vw, 8rem)",
              lineHeight: 1,
              background: "linear-gradient(135deg, #1e3d1a 0%, #4a7c59 50%, #b5d5a0 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "float 4s ease-in-out infinite",
              letterSpacing: "-0.04em",
              filter: "drop-shadow(0 8px 24px rgba(45,90,39,0.2))",
              whiteSpace: "nowrap",
            }}>
              404
            </div>

            {/* Caminante */}
            <div style={{
              position: "absolute", bottom: 28, right: "18%",
              fontSize: "2.8rem",
              animation: "sway 3s ease-in-out infinite",
              transformOrigin: "bottom center",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
            }}>
              🥾
            </div>

            {/* Árbol */}
            <div style={{ position: "absolute", bottom: 20, left: "15%", fontSize: "2.2rem", opacity: 0.7 }}>🌲</div>
            <div style={{ position: "absolute", bottom: 14, left: "22%", fontSize: "1.6rem", opacity: 0.5 }}>🌿</div>
            <div style={{ position: "absolute", bottom: 18, right: "10%", fontSize: "1.8rem", opacity: 0.6 }}>🌳</div>
          </div>

          {/* Texto principal */}
          <div style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.8rem", letterSpacing: "0.25em", color: "#4a7c59", textTransform: "uppercase", marginBottom: 14 }}>
              Sendero no encontrado
            </div>
            <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "#1a2e1a", lineHeight: 1.25, marginBottom: 16 }}>
              Parece que te perdiste<br />
              <em style={{ color: "#4a7c59" }}>en el camino</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1rem", color: "#6a7a6a", lineHeight: 1.8, marginBottom: 36, maxWidth: 420, margin: "0 auto 36px" }}>
              La página que buscas no existe o fue movida. No te preocupes, hay muchos senderos por explorar.
            </p>
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 52, animation: "fadeUp 0.5s ease 0.2s both" }}>
            <Link to="/" className="btn-primary">🏠 Volver al inicio</Link>
            <Link to="/rutas" className="btn-secondary">🗺️ Ver rutas</Link>
          </div>

          {/* Links rápidos */}
          <div style={{ animation: "fadeUp 0.5s ease 0.3s both" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#9a9a9a", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16 }}>
              O ve directamente a
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, maxWidth: 560, margin: "0 auto" }}>
              {[
                { to: "/rutas",    icon: "🏔️", label: "Rutas"     },
                { to: "/ranking",  icon: "🏆", label: "Ranking"   },
                { to: "/comunidad",icon: "👥", label: "Comunidad" },
                { to: "/perfil",   icon: "👤", label: "Mi Perfil" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="quick-link">
                  <span style={{ fontSize: "1.2rem" }}>{link.icon}</span>
                  <span>{link.label}</span>
                  <span style={{ marginLeft: "auto", color: "#b5d5a0", fontSize: "0.8rem" }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Countdown */}
          <div style={{ marginTop: 48, animation: "fadeUp 0.5s ease 0.4s both" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.82rem", color: "#b5b5b5" }}>
              Regresando al inicio en{" "}
              <span style={{
                fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1rem",
                color: "#4a7c59",
                display: "inline-block",
                animation: "countPulse 1s ease infinite",
                minWidth: 18, textAlign: "center",
              }}>
                {cuenta}
              </span>
              {" "}segundos
            </p>
            <button onClick={() => setCuenta(999)}
              style={{ marginTop: 8, background: "none", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#c0c0c0", cursor: "pointer", textDecoration: "underline" }}>
              Cancelar
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}