import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function RolBadge({ user }) {
  if (!user?.rol || user.rol === "usuario") return null;
  const config = {
    admin: { label: "Admin", bg: "#7c3aed", color: "#ede9fe", emoji: "⚙️" },
    guia:  { label: "Guía",  bg: "#0369a1", color: "#e0f2fe", emoji: "🧭" },
  };
  const c = config[user.rol];
  if (!c) return null;
  return (
    <span style={{ background: c.bg, color: c.color, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 3 }}>
      {c.emoji} {c.label}
    </span>
  );
}

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { setUser(null); }
    } else {
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await axios.post(`${API_BASE}/api/auth/logout/`, { refresh });
    } catch {}
    finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/");
    }
  };

  const NAV_LINKS = [
    { label: "Inicio",    path: "/" },
    { label: "Comunidad", path: "/comunidad" },
    { label: "Juegos",    path: "/juegos" },
    { label: "Rutas",     path: "/rutas" },
    { label: "Ranking",   path: "/ranking" },
  ];

  const isActive = (path) => location.pathname === path;
  const esAdmin = user?.es_admin || user?.is_staff || user?.rol === "admin";
  const esGuia  = user?.rol === "guia";
  const avatarGradient = esAdmin
    ? "linear-gradient(135deg,#7c3aed,#c4b5fd)"
    : esGuia
    ? "linear-gradient(135deg,#0369a1,#7dd3fc)"
    : "linear-gradient(135deg,#2d5a27,#b5d5a0)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .nav-link{color:rgba(247,245,240,0.8);text-decoration:none;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:500;letter-spacing:0.03em;transition:color 0.2s;position:relative;padding-bottom:2px;}
        .nav-link:hover{color:#b5d5a0;}
        .nav-link.active{color:#b5d5a0;}
        .nav-link.active::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;background:#b5d5a0;border-radius:1px;}
        .btn-nav-primary{background:#2d5a27;color:#f7f5f0;border:none;padding:8px 22px;border-radius:2px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:0.9rem;cursor:pointer;letter-spacing:0.04em;transition:all 0.3s;text-decoration:none;display:inline-block;}
        .btn-nav-primary:hover{background:#1e3d1a;transform:translateY(-1px);}
        .user-dropdown{position:absolute;top:calc(100% + 12px);right:0;background:#1a2e1a;border:1px solid rgba(181,213,160,0.15);border-radius:4px;min-width:210px;box-shadow:0 12px 35px rgba(0,0,0,0.3);overflow:hidden;z-index:200;animation:dropdownIn 0.2s ease forwards;}
        .dropdown-item{display:block;padding:11px 18px;color:rgba(247,245,240,0.8);text-decoration:none;font-family:'DM Sans',sans-serif;font-size:0.88rem;transition:all 0.2s;border-bottom:1px solid rgba(181,213,160,0.08);cursor:pointer;background:none;border-left:none;border-right:none;border-top:none;width:100%;text-align:left;}
        .dropdown-item:last-child{border-bottom:none;}
        .dropdown-item:hover{background:rgba(181,213,160,0.08);color:#b5d5a0;}
        .dropdown-item.danger:hover{background:rgba(244,67,54,0.1);color:#ef5350;}
        .dropdown-item.admin-item{background:rgba(124,58,237,0.08);color:#c4b5fd;}
        .dropdown-item.admin-item:hover{background:rgba(124,58,237,0.18);color:#ddd6fe;}
        .dropdown-item.guia-item{background:rgba(3,105,161,0.08);color:#7dd3fc;}
        .dropdown-item.guia-item:hover{background:rgba(3,105,161,0.18);color:#bae6fd;}
        @keyframes dropdownIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
      `}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "12px 48px" : "20px 48px",
        background: scrolled ? "rgba(26,46,26,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.4s ease",
        borderBottom: scrolled ? "1px solid rgba(181,213,160,0.2)" : "none",
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#4a7c59,#b5d5a0)", borderRadius: "50% 20% 50% 20%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "1.1rem" }}>🌿</span>
          </div>
          <span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.3rem", color: "#f7f5f0" }}>Walk App</span>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", gap: 32 }}>
          {NAV_LINKS.map((item) => (
            <Link key={item.label} to={item.path} className={`nav-link ${isActive(item.path) ? "active" : ""}`}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(!menuOpen)}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(181,213,160,0.1)", border: "1px solid rgba(181,213,160,0.25)", borderRadius: 2, padding: "8px 16px", color: "#f7f5f0", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "0.9rem", transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(181,213,160,0.18)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(181,213,160,0.1)"}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: avatarGradient, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "0.75rem", color: "#f7f5f0" }}>
                  {user.username?.[0]?.toUpperCase() || "U"}
                </div>
                <span>{user.username}</span>
                <RolBadge user={user} />
                <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>▼</span>
              </button>

              {menuOpen && (
                <div className="user-dropdown">
                  {/* Header */}
                  <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid rgba(181,213,160,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: "0.95rem", color: "#f7f5f0" }}>{user.username}</div>
                      <RolBadge user={user} />
                    </div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: "rgba(247,245,240,0.4)", marginBottom: 4 }}>{user.email}</div>
                    {/* Rol en texto */}
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", color: "rgba(247,245,240,0.35)", display: "flex", alignItems: "center", gap: 4 }}>
                      { esAdmin ? "⚙️ Administrador de la plataforma"
                      : esGuia  ? "🧭 Guía de senderismo verificado"
                      :           "🥾 Senderista · Usuario" }
                    </div>
                  </div>

                  {/* Links comunes */}
                  <Link to="/perfil" className="dropdown-item" onClick={() => setMenuOpen(false)}>👤 Mi Perfil</Link>
                  <Link to="/rutas" className="dropdown-item" onClick={() => setMenuOpen(false)}>🗺️ Mis Rutas</Link>
                  <Link to="/ranking" className="dropdown-item" onClick={() => setMenuOpen(false)}>🏆 Mi Ranking</Link>

                  {/* Solo Guía */}
                  {esGuia && (
                    <Link to="/rutas/nueva" className="dropdown-item guia-item" onClick={() => setMenuOpen(false)}>
                      🧭 Agregar Ruta
                    </Link>
                  )}

                  {/* Solo Admin */}
                  {esAdmin && (
                    <a href="/dashboard/" className="dropdown-item admin-item" onClick={() => setMenuOpen(false)}>
                      ⚙️ Panel Admin
                    </a>
                  )}

                  <button className="dropdown-item danger" onClick={handleLogout}>🚪 Cerrar Sesión</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"
                style={{ padding: "8px 20px", borderRadius: 2, color: "#b5d5a0", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "0.9rem", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.target.style.color = "#f7f5f0")}
                onMouseLeave={(e) => (e.target.style.color = "#b5d5a0")}>
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="btn-nav-primary">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
    </>
  );
}