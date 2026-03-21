import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../axiosConfig";
import "./Navbar.css";

function RolBadge({ user }) {
  if (!user?.rol || user.rol === "usuario") return null;
  return (
    <span style={{ background: "#7c3aed22", color: "#c4b5fd", border: "1px solid #7c3aed44", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 10 }}>
      ⚙️ Admin
    </span>
  );
}

function Campanita({ user }) {
  const [notifs, setNotifs]     = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [open, setOpen]         = useState(false);
  const [cargando, setCargando] = useState(false);
  const ref = useRef(null);

  const fetchNotifs = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      setCargando(true);
      const res = await api.get("/api/comunidad/notificaciones/");
      setNotifs(res.data.notificaciones || []);
      setNoLeidas(res.data.no_leidas || 0);
    } catch {}
    finally { setCargando(false); }
  };

  const marcarLeidas = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      await api.post("/api/comunidad/notificaciones/leer/", {});
      setNoLeidas(0);
      setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch {}
  };

  const handleOpen = () => {
    setOpen((v) => {
      if (!v) { fetchNotifs(); setTimeout(marcarLeidas, 1500); }
      return !v;
    });
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const iconoTipo = { like: "❤️", comentario: "💬", ruta: "🗺️" };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={handleOpen}
        style={{ position: "relative", background: "rgba(181,213,160,0.1)", border: "1px solid rgba(181,213,160,0.25)", borderRadius: 2, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
        <span style={{ fontSize: "1.1rem" }}>🔔</span>
        {noLeidas > 0 && (
          <span style={{ position: "absolute", top: -4, right: -4, background: "#dc2626", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: "0.62rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", border: "2px solid #1a2e1a" }}>
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, background: "#1a2e1a", border: "1px solid rgba(181,213,160,0.15)", borderRadius: 8, width: 300, maxWidth: "90vw", maxHeight: 420, overflowY: "auto", boxShadow: "0 12px 35px rgba(0,0,0,0.35)", zIndex: 300, animation: "dropdownIn 0.2s ease forwards" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(181,213,160,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#1a2e1a" }}>
            <span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "0.95rem", color: "#f7f5f0" }}>🔔 Notificaciones</span>
            {noLeidas > 0 && (
              <span style={{ background: "#dc2626", color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
                {noLeidas} nueva{noLeidas !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {cargando && <div style={{ padding: "24px", textAlign: "center", color: "rgba(247,245,240,0.4)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem" }}>Cargando...</div>}
          {!cargando && notifs.length === 0 && (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔕</div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: "rgba(247,245,240,0.4)" }}>No tienes notificaciones</p>
            </div>
          )}
          {!cargando && notifs.map((n) => (
            <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(181,213,160,0.07)", display: "flex", gap: 10, alignItems: "flex-start", background: n.leida ? "transparent" : "rgba(181,213,160,0.05)" }}>
              <div style={{ flexShrink: 0 }}>
                {n.foto_remitente
                  ? <img src={n.foto_remitente} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(181,213,160,0.3)" }} />
                  : <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2d5a27,#b5d5a0)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "0.8rem", color: "#f7f5f0" }}>
                      {n.remitente?.[0]?.toUpperCase() || "?"}
                    </div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: "0.85rem" }}>{iconoTipo[n.tipo] || "🔔"}</span>
                  {!n.leida && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#b5d5a0", flexShrink: 0 }} />}
                </div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(247,245,240,0.85)", lineHeight: 1.4, margin: 0 }}>{n.mensaje}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(247,245,240,0.35)", marginTop: 4 }}>{n.fecha}</p>
              </div>
            </div>
          ))}
          {notifs.length > 0 && (
            <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(181,213,160,0.08)", textAlign: "center" }}>
              <button onClick={marcarLeidas} style={{ background: "none", border: "none", color: "rgba(181,213,160,0.6)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}>
                Marcar todas como leídas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [user, setUser]           = useState(null);
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) { try { setUser(JSON.parse(storedUser)); } catch { setUser(null); } }
    else { setUser(null); }
  }, [location]);

  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    const handleUserUpdated = () => {
      const stored = localStorage.getItem("user");
      if (stored) try { setUser(JSON.parse(stored)); } catch {}
    };
    window.addEventListener("userUpdated", handleUserUpdated);
    return () => window.removeEventListener("userUpdated", handleUserUpdated);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await api.post("/api/auth/logout/", { refresh });
    } catch {}
    finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      if (user?.id) localStorage.removeItem(`favoritos_${user.id}`);
      localStorage.removeItem("favoritos");
      localStorage.removeItem("user");
      setUser(null);
      setMobileOpen(false);
      navigate("/");
    }
  };

  const NAV_LINKS = [
    { label: "Inicio",    path: "/",         icon: "🏠" },
    { label: "Comunidad", path: "/comunidad", icon: "👥" },
    { label: "Juegos",    path: "/juegos",    icon: "🎮" },
    { label: "Rutas",     path: "/rutas",     icon: "🗺️" },
    { label: "Ranking",   path: "/ranking",   icon: "🏆" },
  ];

  const isActive      = (path) => location.pathname === path;
  const esAdmin       = user?.es_admin || user?.is_staff || user?.rol === "admin";
  const avatarGradient = esAdmin ? "linear-gradient(135deg,#7c3aed,#c4b5fd)" : "linear-gradient(135deg,#2d5a27,#b5d5a0)";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "12px 20px" : "16px 20px",
        background: scrolled ? "rgba(26,46,26,0.97)" : "rgba(26,46,26,0.85)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.4s ease",
        borderBottom: "1px solid rgba(181,213,160,0.15)",
      }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#4a7c59,#b5d5a0)", borderRadius: "50% 20% 50% 20%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "1.1rem" }}>🌿</span>
          </div>
          <span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.3rem", color: "#f7f5f0" }}>Walk App</span>
        </Link>

        <div className="nav-links-desktop">
          {NAV_LINKS.map((item) => (
            <Link key={item.label} to={item.path} className={`nav-link ${isActive(item.path) ? "active" : ""}`}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="nav-auth-desktop">
          {user ? (
            <>
              <Campanita user={user} />
              <div style={{ position: "relative" }}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(181,213,160,0.1)", border: "1px solid rgba(181,213,160,0.25)", borderRadius: 2, padding: "8px 16px", color: "#f7f5f0", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "0.9rem", transition: "all 0.2s" }}>
                  {user.foto_perfil
                    ? <img src={user.foto_perfil} alt="foto" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(181,213,160,0.5)", flexShrink: 0 }} />
                    : <div style={{ width: 28, height: 28, borderRadius: "50%", background: avatarGradient, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "0.75rem", color: "#f7f5f0", flexShrink: 0 }}>
                        {user.username?.[0]?.toUpperCase() || "U"}
                      </div>
                  }
                  <span>{user.username}</span>
                  <RolBadge user={user} />
                  <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>▼</span>
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid rgba(181,213,160,0.1)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: "0.95rem", color: "#f7f5f0" }}>{user.username}</div>
                        <RolBadge user={user} />
                      </div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: "rgba(247,245,240,0.4)", marginBottom: 4 }}>{user.email}</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", color: "rgba(247,245,240,0.35)" }}>
                        {esAdmin ? "⚙️ Administrador de la plataforma" : "🥾 Senderista"}
                      </div>
                    </div>
                    <Link to="/perfil"  className="dropdown-item" onClick={() => setMenuOpen(false)}>👤 Mi Perfil</Link>
                    <Link to="/rutas"   className="dropdown-item" onClick={() => setMenuOpen(false)}>🗺️ Mis Rutas</Link>
                    <Link to="/ranking" className="dropdown-item" onClick={() => setMenuOpen(false)}>🏆 Mi Ranking</Link>
                    {esAdmin && <Link to="/dashboard" className="dropdown-item admin-item" onClick={() => setMenuOpen(false)}>⚙️ Panel Admin</Link>}
                    <button className="dropdown-item danger" onClick={handleLogout}>🚪 Cerrar Sesión</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: "8px 20px", borderRadius: 2, color: "#b5d5a0", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "0.9rem" }}>
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="btn-nav-primary">Registrarse</Link>
            </>
          )}
        </div>

        <button className="hamburger-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "rgba(181,213,160,0.1)", border: "1px solid rgba(181,213,160,0.25)", borderRadius: 6, width: 42, height: 42, alignItems: "center", justifyContent: "center", cursor: "pointer", flexDirection: "column", gap: 5, padding: "10px 8px" }}>
          <span style={{ display: "block", width: "100%", height: 2, background: "#f7f5f0", transition: "all 0.3s", transform: mobileOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
          <span style={{ display: "block", width: "100%", height: 2, background: "#f7f5f0", transition: "all 0.3s", opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: "100%", height: 2, background: "#f7f5f0", transition: "all 0.3s", transform: mobileOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
        </button>
      </nav>

      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 150, backdropFilter: "blur(2px)" }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0,
            width: "min(320px, 85vw)",
            background: "#1a2e1a", zIndex: 200,
            boxShadow: "-8px 0 30px rgba(0,0,0,0.4)",
            animation: "slideIn 0.3s ease forwards",
            display: "flex", flexDirection: "column", overflowY: "auto",
          }}>
            <div style={{ padding: "20px", borderBottom: "1px solid rgba(181,213,160,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#4a7c59,#b5d5a0)", borderRadius: "50% 20% 50% 20%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span>🌿</span>
                </div>
                <span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.1rem", color: "#f7f5f0" }}>Walk App</span>
              </div>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: "rgba(181,213,160,0.1)", border: "1px solid rgba(181,213,160,0.2)", borderRadius: 6, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f7f5f0", fontSize: "1rem" }}>
                ✕
              </button>
            </div>

            {user && (
              <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(181,213,160,0.1)", display: "flex", alignItems: "center", gap: 14 }}>
                {user.foto_perfil
                  ? <img src={user.foto_perfil} alt="foto" style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(181,213,160,0.4)", flexShrink: 0 }} />
                  : <div style={{ width: 46, height: 46, borderRadius: "50%", background: avatarGradient, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1rem", color: "#f7f5f0", flexShrink: 0 }}>
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </div>
                }
                <div>
                  <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, color: "#f7f5f0", fontSize: "0.95rem" }}>{user.username}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "rgba(247,245,240,0.45)", marginTop: 2 }}>
                    {esAdmin ? "⚙️ Administrador" : "🥾 Senderista"}
                  </div>
                </div>
              </div>
            )}

            <div style={{ flex: 1, paddingTop: 8 }}>
              <div style={{ padding: "10px 20px 4px", fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(181,213,160,0.45)" }}>
                Navegación
              </div>
              {NAV_LINKS.map((item) => (
                <Link key={item.label} to={item.path} onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
                    color: isActive(item.path) ? "#b5d5a0" : "rgba(247,245,240,0.8)",
                    textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "1rem",
                    borderLeft: isActive(item.path) ? "3px solid #b5d5a0" : "3px solid transparent",
                    background: isActive(item.path) ? "rgba(181,213,160,0.08)" : "transparent",
                    transition: "all 0.2s",
                  }}>
                  <span style={{ fontSize: "1.1rem", width: 24, textAlign: "center" }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {user && (
                <>
                  <div style={{ margin: "8px 0", borderTop: "1px solid rgba(181,213,160,0.08)" }} />
                  <div style={{ padding: "10px 20px 4px", fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(181,213,160,0.45)" }}>
                    Mi cuenta
                  </div>
                  <Link to="/perfil" onClick={() => setMobileOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", color: "rgba(247,245,240,0.8)", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "1rem", borderLeft: "3px solid transparent" }}>
                    <span style={{ fontSize: "1.1rem", width: 24, textAlign: "center" }}>👤</span> Mi Perfil
                  </Link>
                  {esAdmin && (
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", color: "#c4b5fd", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "1rem", borderLeft: "3px solid transparent", background: "rgba(124,58,237,0.08)" }}>
                      <span style={{ fontSize: "1.1rem", width: 24, textAlign: "center" }}>⚙️</span> Panel Admin
                    </Link>
                  )}
                </>
              )}
            </div>

            <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(181,213,160,0.1)" }}>
              {user ? (
                <button onClick={handleLogout}
                  style={{ width: "100%", padding: "13px", background: "rgba(239,83,80,0.12)", border: "1px solid rgba(239,83,80,0.25)", borderRadius: 6, color: "#ef5350", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  🚪 Cerrar Sesión
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    style={{ display: "block", padding: "13px", textAlign: "center", border: "1px solid rgba(181,213,160,0.3)", borderRadius: 6, color: "#b5d5a0", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "0.95rem" }}>
                    Iniciar Sesión
                  </Link>
                  <Link to="/registro" onClick={() => setMobileOpen(false)}
                    style={{ display: "block", padding: "13px", textAlign: "center", background: "#2d5a27", borderRadius: 6, color: "#f7f5f0", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.95rem" }}>
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
    </>
  );
}