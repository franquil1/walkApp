import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const LINKS = {
    Explorar: [
      { label: "Inicio", path: "/" },
      { label: "Rutas", path: "/rutas" },
      { label: "Comunidad", path: "/comunidad" },
      { label: "Ranking", path: "/ranking" },
      { label: "Juegos", path: "/juegos" },
    ],
    Cuenta: [
      { label: "Iniciar Sesión", path: "/login" },
      { label: "Registrarse", path: "/registro" },
      { label: "Mi Perfil", path: "/perfil" },
    ],
    Legal: [
      { label: "Privacidad", path: "#" },
      { label: "Términos de uso", path: "#" },
      { label: "Contacto", path: "#" },
    ],
  };

  return (
    <footer style={{
      background: "#0d1a0d",
      borderTop: "1px solid rgba(181,213,160,0.1)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .footer-link { color: rgba(247,245,240,0.45); text-decoration: none; font-size: 0.88rem; font-weight: 400; transition: color 0.2s; display: block; padding: 4px 0; }
        .footer-link:hover { color: #b5d5a0; }
        .footer-social { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(181,213,160,0.2); display: flex; align-items: center; justify-content: center; font-size: 0.95rem; transition: all 0.2s; cursor: pointer; text-decoration: none; }
        .footer-social:hover { border-color: #b5d5a0; background: rgba(181,213,160,0.08); transform: translateY(-2px); }
      `}</style>

      {/* Main footer content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 48px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #4a7c59, #b5d5a0)", borderRadius: "50% 20% 50% 20%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                🌿
              </div>
              <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.3rem", color: "#f7f5f0" }}>Walk App</span>
            </Link>
            <p style={{ fontWeight: 300, fontSize: "0.9rem", color: "rgba(247,245,240,0.45)", lineHeight: 1.75, marginBottom: 24, maxWidth: 280 }}>
              Descubre los senderos más hermosos de Popayán y sus alrededores. Cada paso cuenta, cada ruta es una historia.
            </p>
            {/* Redes sociales */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { icon: "📸", label: "Instagram" },
                { icon: "🐦", label: "Twitter" },
                { icon: "👥", label: "Facebook" },
              ].map((s) => (
                <a key={s.label} href="#" className="footer-social" title={s.label}>{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "0.95rem", color: "#f7f5f0", marginBottom: 18, letterSpacing: "0.03em" }}>
                {category}
              </h4>
              <nav style={{ display: "flex", flexDirection: "column" }}>
                {links.map((link) => (
                  <Link key={link.label} to={link.path} className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(181,213,160,0.08)", marginBottom: 28 }} />

        {/* Bottom bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <p style={{ fontWeight: 300, fontSize: "0.82rem", color: "rgba(247,245,240,0.3)" }}>
            © {currentYear} Walk App · Popayán, Cauca, Colombia · Todos los derechos reservados
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.75rem", color: "rgba(247,245,240,0.25)" }}>Hecho con</span>
            <span style={{ fontSize: "0.85rem" }}>💚</span>
            <span style={{ fontSize: "0.75rem", color: "rgba(247,245,240,0.25)" }}>en Popayán</span>
          </div>
        </div>
      </div>
    </footer>
  );
}