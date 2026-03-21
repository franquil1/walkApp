import { Link } from "react-router-dom";
import { FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const LINKS = {
    Explorar: [
      { label: "Inicio",     path: "/" },
      { label: "Rutas",      path: "/rutas" },
      { label: "Comunidad",  path: "/comunidad" },
      { label: "Ranking",    path: "/ranking" },
      { label: "Juegos",     path: "/juegos" },
    ],
    Cuenta: [
      { label: "Iniciar Sesión", path: "/login" },
      { label: "Registrarse",    path: "/registro" },
      { label: "Mi Perfil",      path: "/perfil" },
    ],
    Legal: [
      { label: "Privacidad",    path: "/privacidad" },
      { label: "Términos de uso", path: "/terminos" },
      { label: "Contacto",      path: "/contacto" },
    ],
  };

  const SOCIAL = [
    { icon: <FaInstagram />, label: "Instagram", url: "https://instagram.com" },
    { icon: <FaTwitter />,   label: "Twitter",   url: "https://twitter.com" },
    { icon: <FaFacebookF />, label: "Facebook",  url: "https://facebook.com" },
  ];

  return (
    <footer className="footer-root">
      <div className="footer-container">
        <div className="footer-grid">

          {/* Marca */}
          <div>
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">🌿</div>
              <span className="footer-logo-text">Walk App</span>
            </Link>
            <p className="footer-desc">
              Descubre los senderos más hermosos de Popayán y sus alrededores.
              Cada paso cuenta, cada ruta es una historia.
            </p>
            <div className="footer-social-wrap">
              {SOCIAL.map((s) => (
                <a key={s.label} href={s.url} className="footer-social" title={s.label} target="_blank" rel="noopener noreferrer">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="footer-col-title">{category}</h4>
              <nav className="footer-nav">
                {links.map((link) => (
                  <Link key={link.label} to={link.path} className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copy">
            © {currentYear} Walk App · Popayán, Cauca, Colombia · Todos los derechos reservados
          </p>
          <div className="footer-made">
            <span className="footer-made-text">Hecho con</span>
            <span style={{ fontSize: "0.85rem" }}>💚</span>
            <span className="footer-made-text">en Popayán</span>
          </div>
        </div>
      </div>
    </footer>
  );
}