import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../axiosConfig";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ─── AVATAR ──────────────────────────────────────────────────────────────────
function Avatar({ username, size = 44, fontSize = "1.1rem" }) {
  const paletas = [
    ["#2d5a27", "#b5d5a0"], ["#1e3d2f", "#4a7c59"],
    ["#0d2a1a", "#3a6b4a"], ["#1a3a2a", "#5a8a6a"],
    ["#3a2a0d", "#a0784a"], ["#1a1a3a", "#6a6aaa"],
  ];
  const idx = username ? username.charCodeAt(0) % paletas.length : 0;
  const [from, to] = paletas[idx];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Lora', serif", fontWeight: 700, fontSize, color: "#f7f5f0",
      boxShadow: "0 2px 8px rgba(26,46,26,0.2)",
    }}>
      {username ? username[0].toUpperCase() : "?"}
    </div>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(74,124,89,0.08)", marginBottom: 20 }}>
      <div style={{ height: 220, background: "linear-gradient(90deg, #f0ede6 25%, #e8e4dc 50%, #f0ede6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#f0ede6", animation: "shimmer 1.5s infinite" }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: "40%", background: "#f0ede6", borderRadius: 4, marginBottom: 8, animation: "shimmer 1.5s infinite" }} />
            <div style={{ height: 11, width: "25%", background: "#f0ede6", borderRadius: 4, animation: "shimmer 1.5s infinite" }} />
          </div>
        </div>
        <div style={{ height: 13, width: "90%", background: "#f0ede6", borderRadius: 4, marginBottom: 8, animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 13, width: "70%", background: "#f0ede6", borderRadius: 4, animation: "shimmer 1.5s infinite" }} />
      </div>
    </div>
  );
}

// ─── COMENTARIOS DE PUBLICACIÓN ───────────────────────────────────────────────
function ComentariosPub({ pubId, user, totalInicial }) {
  const [abierto, setAbierto] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [total, setTotal] = useState(totalInicial);
  const inputRef = useRef(null);

  const fetchComentarios = useCallback(async () => {
    setCargando(true);
    try {
      const res = await api.get(`/api/comunidad/${pubId}/comentarios/`);
      setComentarios(res.data.comentarios);
      setTotal(res.data.comentarios.length);
    } catch {} finally { setCargando(false); }
  }, [pubId]);

  const handleAbrir = () => {
    if (!abierto) fetchComentarios();
    setAbierto((a) => !a);
  };

  const handleEnviar = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      const res = await api.post(`/api/comunidad/${pubId}/comentarios/crear/`, { texto });
      setComentarios((prev) => [...prev, res.data]);
      setTotal((t) => t + 1);
      setTexto("");
    } catch {} finally { setEnviando(false); }
  };

  return (
    <div>
      <button onClick={handleAbrir} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 0", color: "#6a7a6a", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", transition: "color 0.2s" }}
        onMouseEnter={(e) => e.currentTarget.style.color = "#2d5a27"}
        onMouseLeave={(e) => e.currentTarget.style.color = "#6a7a6a"}>
        <span style={{ fontSize: "1rem" }}>💬</span>
        {total > 0 ? `${total} comentario${total !== 1 ? "s" : ""}` : "Comentar"}
      </button>

      {abierto && (
        <div style={{ marginTop: 12, borderTop: "1px solid rgba(74,124,89,0.08)", paddingTop: 16 }}>
          {cargando && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#9a9a9a", textAlign: "center", padding: "12px 0" }}>Cargando...</p>}

          {!cargando && comentarios.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 14, animation: "fadeUp 0.3s ease" }}>
              <Avatar username={c.usuario} size={32} fontSize="0.75rem" />
              <div style={{ flex: 1, background: "#f7f5f0", borderRadius: "4px 12px 12px 12px", padding: "10px 14px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#1a2e1a" }}>{c.nombre_completo || c.usuario}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "#b0b0b0" }}>{c.fecha}</span>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#4a5a4a", lineHeight: 1.6 }}>{c.texto}</p>
              </div>
            </div>
          ))}

          {!cargando && comentarios.length === 0 && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#9a9a9a", textAlign: "center", padding: "8px 0 16px" }}>Sé el primero en comentar</p>
          )}

          {user ? (
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <Avatar username={user.username} size={32} fontSize="0.75rem" />
              <div style={{ flex: 1, display: "flex", gap: 8 }}>
                <input
                  ref={inputRef}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
                  placeholder="Escribe un comentario..."
                  maxLength={300}
                  style={{ flex: 1, padding: "9px 14px", border: "1.5px solid rgba(74,124,89,0.2)", borderRadius: 20, fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#1a2e1a", background: "#f7f5f0", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={(e) => e.target.style.borderColor = "#4a7c59"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(74,124,89,0.2)"}
                />
                <button onClick={handleEnviar} disabled={enviando || !texto.trim()}
                  style={{ padding: "9px 16px", background: texto.trim() ? "#2d5a27" : "#d0d0d0", color: "#f7f5f0", border: "none", borderRadius: 20, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.82rem", cursor: texto.trim() ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
                  {enviando ? "..." : "↑"}
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "#9a9a9a", marginTop: 8 }}>
              <Link to="/login" style={{ color: "#2d5a27", fontWeight: 600 }}>Inicia sesión</Link> para comentar
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TARJETA DE PUBLICACIÓN ───────────────────────────────────────────────────
function TarjetaPublicacion({ pub, user, onEliminar }) {
  const esYo = user && pub.usuario === user.username;

  return (
    <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(74,124,89,0.08)", boxShadow: "0 2px 12px rgba(26,46,26,0.05)", marginBottom: 20, animation: "fadeUp 0.4s ease" }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,46,26,0.1)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,46,26,0.05)"}>

      {/* Imagen */}
      {pub.imagen && (
        <div style={{ height: 240, overflow: "hidden", position: "relative" }}>
          <img src={pub.imagen} alt="publicación" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.03)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"} />
          {/* Badge ruta */}
          <div style={{ position: "absolute", bottom: 12, left: 16, background: "rgba(13,31,13,0.75)", backdropFilter: "blur(8px)", borderRadius: 4, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.8rem" }}>🏔️</span>
            <Link to={`/rutas/${pub.ruta_id}`} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#b5d5a0", textDecoration: "none" }}>{pub.ruta_nombre}</Link>
          </div>
        </div>
      )}

      <div style={{ padding: "20px 24px" }}>
        {/* Header usuario */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar username={pub.usuario} size={44} />
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.92rem", color: "#1a2e1a", display: "flex", alignItems: "center", gap: 6 }}>
                {pub.nombre_completo || pub.usuario}
                {esYo && <span style={{ background: "#2d5a27", color: "#f7f5f0", fontSize: "0.58rem", fontWeight: 700, padding: "2px 6px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tú</span>}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#9a9a9a" }}>@{pub.usuario} · {pub.fecha}</div>
            </div>
          </div>
          {/* Sin imagen: badge ruta a la derecha */}
          {!pub.imagen && (
            <Link to={`/rutas/${pub.ruta_id}`} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f7ee", border: "1px solid rgba(74,124,89,0.2)", borderRadius: 4, padding: "6px 12px", textDecoration: "none" }}>
              <span style={{ fontSize: "0.8rem" }}>🏔️</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#2d5a27" }}>{pub.ruta_nombre}</span>
            </Link>
          )}
        </div>

        {/* Texto */}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.95rem", color: "#3a4a3a", lineHeight: 1.75, marginBottom: 16 }}>{pub.comentario}</p>

        {/* Acciones */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(74,124,89,0.07)" }}>
          <ComentariosPub pubId={pub.id} user={user} totalInicial={pub.total_comentarios} />
          {esYo && (
            <button onClick={() => onEliminar(pub.id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 10px", color: "#d0d0d0", fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s", borderRadius: 4 }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#d0d0d0"}>
              🗑️ Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MODAL NUEVA PUBLICACIÓN ──────────────────────────────────────────────────
function ModalPublicacion({ rutas, onCerrar, onPublicado }) {
  const [rutaId, setRutaId] = useState("");
  const [comentario, setComentario] = useState("");
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleEnviar = async () => {
    if (!rutaId) { setError("Selecciona una ruta."); return; }
    if (!comentario.trim()) { setError("Escribe algo sobre tu experiencia."); return; }
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("ruta_id", rutaId);
      formData.append("comentario", comentario);
      if (imagen) formData.append("imagen", imagen);
      const res = await api.post("/api/comunidad/crear/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onPublicado(res.data);
      onCerrar();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo publicar.");
    } finally { setEnviando(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(13,31,13,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <div style={{ background: "#fff", borderRadius: 8, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", animation: "fadeUp 0.3s ease" }}>

        {/* Header modal */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(74,124,89,0.1)" }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.2rem", color: "#1a2e1a" }}>🌿 Nueva publicación</h2>
          <button onClick={onCerrar} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#9a9a9a", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Ruta */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#4a5a4a", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Ruta que recorriste *</label>
            <select value={rutaId} onChange={(e) => setRutaId(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid rgba(74,124,89,0.2)", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", color: rutaId ? "#1a2e1a" : "#9a9a9a", background: "#f7f5f0", outline: "none" }}>
              <option value="">Selecciona una ruta...</option>
              {rutas.map((r) => <option key={r.id} value={r.id}>{r.nombre_ruta}</option>)}
            </select>
          </div>

          {/* Comentario */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#4a5a4a", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Tu experiencia *</label>
            <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={500} rows={4}
              placeholder="¿Cómo fue el recorrido? ¿Qué te encontraste? Comparte tu experiencia con la comunidad..."
              style={{ width: "100%", padding: "12px 14px", border: "1.5px solid rgba(74,124,89,0.2)", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.92rem", color: "#1a2e1a", background: "#f7f5f0", resize: "vertical", lineHeight: 1.65, outline: "none" }}
              onFocus={(e) => e.target.style.borderColor = "#4a7c59"}
              onBlur={(e) => e.target.style.borderColor = "rgba(74,124,89,0.2)"} />
            <div style={{ textAlign: "right", fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "#b0b0b0", marginTop: 4 }}>{comentario.length}/500</div>
          </div>

          {/* Imagen */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#4a5a4a", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Foto (opcional)</label>
            {preview ? (
              <div style={{ position: "relative", borderRadius: 6, overflow: "hidden", height: 180 }}>
                <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => { setImagen(null); setPreview(null); }}
                  style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
              </div>
            ) : (
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 110, border: "2px dashed rgba(74,124,89,0.25)", borderRadius: 6, cursor: "pointer", background: "#f7f5f0", transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#4a7c59"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(74,124,89,0.25)"}>
                <span style={{ fontSize: "2rem", marginBottom: 8 }}>📷</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#9a9a9a" }}>Haz clic para subir una foto</span>
                <input type="file" accept="image/*" onChange={handleImagen} style={{ display: "none" }} />
              </label>
            )}
          </div>

          {error && <div style={{ padding: "10px 14px", background: "#fce4ec", border: "1px solid #f48fb1", borderRadius: 4, color: "#b71c1c", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", marginBottom: 16 }}>❌ {error}</div>}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onCerrar} style={{ flex: 1, padding: "12px", background: "transparent", border: "1.5px solid rgba(74,124,89,0.2)", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.9rem", color: "#6a7a6a", cursor: "pointer" }}>Cancelar</button>
            <button onClick={handleEnviar} disabled={enviando}
              style={{ flex: 2, padding: "12px", background: enviando ? "#6a9b6a" : "#2d5a27", color: "#f7f5f0", border: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.9rem", cursor: enviando ? "not-allowed" : "pointer" }}>
              {enviando ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function Comunidad() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [user, setUser] = useState(null);
  const [rutas, setRutas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) try { setUser(JSON.parse(u)); } catch {}
    // Cargar rutas para el modal
    api.get("/api/rutas/").then((r) => setRutas(r.data)).catch(() => {});
  }, []);

  const fetchPublicaciones = useCallback(async (p = 1) => {
    setCargando(true);
    try {
      const res = await api.get(`/api/comunidad/?pagina=${p}`);
      if (p === 1) {
        setPublicaciones(res.data.publicaciones);
      } else {
        setPublicaciones((prev) => [...prev, ...res.data.publicaciones]);
      }
      setTotalPaginas(res.data.paginas);
      setPagina(res.data.pagina_actual);
    } catch {} finally { setCargando(false); }
  }, []);

  useEffect(() => { fetchPublicaciones(1); }, [fetchPublicaciones]);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta publicación?")) return;
    try {
      await api.delete(`/api/comunidad/${id}/eliminar/`);
      setPublicaciones((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  const handlePublicado = (nueva) => {
    setPublicaciones((prev) => [nueva, ...prev]);
  };

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif", background: "#f7f5f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes shimmer  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes float    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>

      <Navbar />

      {/* HERO */}
      <div style={{ background: "linear-gradient(160deg, #0d1f0d 0%, #1e3d1a 55%, #2d5a27 100%)", paddingTop: 110, paddingBottom: 52, position: "relative", overflow: "hidden" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", width: [350,200,280,150][i], height: [350,200,280,150][i], background: `rgba(181,213,160,${[0.04,0.06,0.03,0.07][i]})`, top: ["-20%","30%","10%","60%"][i], left: ["-5%","70%","40%","15%"][i] }} />
        ))}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px", position: "relative" }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.78rem", letterSpacing: "0.25em", color: "#b5d5a0", textTransform: "uppercase", marginBottom: 14 }}>Comunidad de caminantes</div>
            <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#f7f5f0", lineHeight: 1.2, marginBottom: 16 }}>
              Comparte tu <em style={{ color: "#b5d5a0" }}>experiencia</em><br />en los senderos
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1rem", color: "rgba(247,245,240,0.65)", lineHeight: 1.75, marginBottom: 32 }}>
              Fotos, consejos y recuerdos de cada ruta. La comunidad de senderistas de Popayán comparte aquí.
            </p>
            {user ? (
              <button onClick={() => setMostrarModal(true)}
                style={{ padding: "14px 32px", background: "#b5d5a0", color: "#1a2e1a", border: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.25s", display: "inline-flex", alignItems: "center", gap: 8 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f7f5f0"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#b5d5a0"; e.currentTarget.style.transform = "none"; }}>
                📸 Publicar experiencia
              </button>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <Link to="/login" style={{ padding: "13px 28px", background: "#b5d5a0", color: "#1a2e1a", textDecoration: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.92rem" }}>Iniciar sesión</Link>
                <Link to="/registro" style={{ padding: "13px 24px", background: "rgba(255,255,255,0.1)", color: "#f7f5f0", textDecoration: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.92rem", border: "1px solid rgba(255,255,255,0.15)" }}>Registrarse</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "44px 24px 80px" }}>

        {/* Botón flotante publicar (si logueado) */}
        {user && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
            <button onClick={() => setMostrarModal(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "#2d5a27", color: "#f7f5f0", border: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(45,90,39,0.25)", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(45,90,39,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(45,90,39,0.25)"; }}>
              ✏️ Nueva publicación
            </button>
          </div>
        )}

        {/* Skeletons */}
        {cargando && pagina === 1 && [...Array(3)].map((_, i) => <SkeletonCard key={i} />)}

        {/* Publicaciones */}
        {!cargando && publicaciones.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "#fff", borderRadius: 8, border: "1px solid rgba(74,124,89,0.1)" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🌿</div>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: "1.3rem", color: "#1a2e1a", marginBottom: 10 }}>Aún no hay publicaciones</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: "#6a7a6a", marginBottom: 24 }}>¡Sé el primero en compartir tu experiencia en los senderos!</p>
            {user
              ? <button onClick={() => setMostrarModal(true)} style={{ padding: "12px 28px", background: "#2d5a27", color: "#f7f5f0", border: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" }}>📸 Publicar ahora</button>
              : <Link to="/login" style={{ padding: "12px 28px", background: "#2d5a27", color: "#f7f5f0", textDecoration: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Iniciar sesión</Link>
            }
          </div>
        )}

        {publicaciones.map((pub) => (
          <TarjetaPublicacion key={pub.id} pub={pub} user={user} onEliminar={handleEliminar} />
        ))}

        {/* Cargar más */}
        {pagina < totalPaginas && (
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <button onClick={() => fetchPublicaciones(pagina + 1)} disabled={cargando}
              style={{ padding: "12px 32px", background: "transparent", border: "1.5px solid rgba(74,124,89,0.25)", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.9rem", color: "#2d5a27", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(74,124,89,0.06)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              {cargando ? "Cargando..." : "Ver más publicaciones"}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <ModalPublicacion rutas={rutas} onCerrar={() => setMostrarModal(false)} onPublicado={handlePublicado} />
      )}

      <Footer />
    </div>
  );
}