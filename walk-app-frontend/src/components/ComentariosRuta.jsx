import { useState, useEffect, useCallback } from "react";
import api from "../axiosConfig";

function Estrellas({ valor, onChange, readonly = false, size = "1.4rem" }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          onClick={() => !readonly && onChange && onChange(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            fontSize: size,
            cursor: readonly ? "default" : "pointer",
            color: i <= (hover || valor) ? "#f59e0b" : "#e5e7eb",
            transition: "color 0.15s, transform 0.15s",
            transform: !readonly && i <= hover ? "scale(1.2)" : "scale(1)",
            display: "inline-block",
            userSelect: "none",
          }}
        >★</span>
      ))}
    </div>
  );
}

function AvatarComentario({ username, size = 38 }) {
  const colors = [
    ["#2d5a27", "#b5d5a0"], ["#1e3d2f", "#4a7c59"],
    ["#0d2a1a", "#3a6b4a"], ["#1a3a2a", "#5a8a6a"],
    ["#3a2a0d", "#a0784a"],
  ];
  const idx = username ? username.charCodeAt(0) % colors.length : 0;
  const [from, to] = colors[idx];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Lora', serif", fontWeight: 700,
      fontSize: size * 0.4, color: "#f7f5f0",
      boxShadow: "0 2px 8px rgba(26,46,26,0.2)",
    }}>
      {username ? username[0].toUpperCase() : "?"}
    </div>
  );
}

export default function ComentariosRuta({ rutaId }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [user, setUser] = useState(null);
  const [miComentario, setMiComentario] = useState(null);

  // Formulario
  const [texto, setTexto] = useState("");
  const [estrellas, setEstrellas] = useState(5);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [modoEditar, setModoEditar] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) try { setUser(JSON.parse(u)); } catch {}
  }, []);

  const fetchComentarios = useCallback(async () => {
    try {
      setCargando(true);
      const res = await api.get(`/api/rutas/${rutaId}/comentarios/`);
      setDatos(res.data);
      // Detectar si el usuario ya comentó
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        const mio = res.data.comentarios.find((c) => c.usuario === parsed.username);
        if (mio) {
          setMiComentario(mio);
          setTexto(mio.texto);
          setEstrellas(mio.estrellas);
        }
      }
    } catch {} finally { setCargando(false); }
  }, [rutaId]);

  useEffect(() => { fetchComentarios(); }, [fetchComentarios]);

  const handleEnviar = async () => {
    if (!texto.trim()) { setMensaje({ type: "error", text: "Escribe algo antes de enviar." }); return; }
    setEnviando(true);
    try {
      await api.post(`/api/rutas/${rutaId}/comentarios/crear/`, { texto, estrellas });
      setMensaje({ type: "success", text: miComentario ? "Reseña actualizada." : "¡Reseña publicada!" });
      setModoEditar(false);
      fetchComentarios();
    } catch (e) {
      setMensaje({ type: "error", text: e.response?.data?.error || "No se pudo enviar." });
    } finally {
      setEnviando(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm("¿Eliminar tu reseña?")) return;
    try {
      await api.delete(`/api/rutas/${rutaId}/comentarios/eliminar/`);
      setMiComentario(null);
      setTexto("");
      setEstrellas(5);
      fetchComentarios();
    } catch {}
  };

  const promedioEstrellas = datos?.stats?.promedio || 0;
  const totalComentarios = datos?.stats?.total || 0;
  const distribucion = datos?.stats?.distribucion || {};

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .comentario-card { background: #fff; border-radius: 6px; padding: 20px 24px; border: 1px solid rgba(74,124,89,0.1); margin-bottom: 12px; transition: box-shadow 0.2s; animation: fadeUp 0.4s ease; }
        .comentario-card:hover { box-shadow: 0 6px 20px rgba(26,46,26,0.08); }
        textarea:focus { outline: none; border-color: #4a7c59 !important; box-shadow: 0 0 0 3px rgba(74,124,89,0.1); }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.4rem", color: "#1a2e1a" }}>
          💬 Reseñas y Opiniones
        </h2>
        {totalComentarios > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Estrellas valor={Math.round(promedioEstrellas)} readonly size="1.2rem" />
            <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.1rem", color: "#1a2e1a" }}>{promedioEstrellas}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#9a9a9a" }}>({totalComentarios} reseña{totalComentarios !== 1 ? "s" : ""})</span>
          </div>
        )}
      </div>

      {/* RESUMEN DE RATING */}
      {!cargando && totalComentarios > 0 && (
        <div style={{ background: "#fff", borderRadius: 6, padding: "24px", border: "1px solid rgba(74,124,89,0.1)", marginBottom: 24, display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "center" }}>
          {/* Número grande */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "3.5rem", color: "#1a2e1a", lineHeight: 1 }}>{promedioEstrellas}</div>
            <Estrellas valor={Math.round(promedioEstrellas)} readonly size="1.1rem" />
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#9a9a9a", marginTop: 6 }}>{totalComentarios} reseña{totalComentarios !== 1 ? "s" : ""}</div>
          </div>
          {/* Barras */}
          <div>
            {[5, 4, 3, 2, 1].map((n) => {
              const count = distribucion[String(n)] || 0;
              const pct = totalComentarios > 0 ? (count / totalComentarios) * 100 : 0;
              return (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#6a7a6a", width: 10, textAlign: "right", flexShrink: 0 }}>{n}</span>
                  <span style={{ fontSize: "0.75rem", color: "#f59e0b", flexShrink: 0 }}>★</span>
                  <div style={{ flex: 1, height: 8, background: "#f0ede6", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(to right, #f59e0b, #fbbf24)", borderRadius: 4, transition: "width 0.8s ease" }} />
                  </div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#9a9a9a", width: 16, flexShrink: 0 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FORMULARIO */}
      {user ? (
        <div style={{ background: "linear-gradient(to bottom right, #f0f7ee, #f7f5f0)", borderRadius: 6, padding: "24px", border: "1px solid rgba(74,124,89,0.15)", marginBottom: 28 }}>
          {miComentario && !modoEditar ? (
            // Ya comentó — mostrar su reseña con opciones
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", color: "#2d5a27" }}>✅ Tu reseña</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setModoEditar(true)} style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(74,124,89,0.3)", borderRadius: 3, fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#2d5a27", cursor: "pointer" }}>✏️ Editar</button>
                  <button onClick={handleEliminar} style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 3, fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#ef4444", cursor: "pointer" }}>🗑️ Eliminar</button>
                </div>
              </div>
              <Estrellas valor={miComentario.estrellas} readonly />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "#4a5a4a", marginTop: 10, lineHeight: 1.7 }}>{miComentario.texto}</p>
            </div>
          ) : (
            // Formulario nuevo o edición
            <div>
              <p style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "1rem", color: "#1a2e1a", marginBottom: 16 }}>
                {miComentario ? "✏️ Editar tu reseña" : "⭐ Deja tu reseña"}
              </p>

              {/* Estrellas interactivas */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#6a7a6a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Calificación</p>
                <Estrellas valor={estrellas} onChange={setEstrellas} size="2rem" />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#9a9a9a", marginTop: 6 }}>
                  {["", "Muy mala", "Regular", "Buena", "Muy buena", "Excelente"][estrellas]}
                </p>
              </div>

              {/* Textarea */}
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Cuéntanos tu experiencia en esta ruta... ¿Cómo estuvo el camino? ¿Qué recomendarías llevar?"
                maxLength={500}
                rows={4}
                style={{ width: "100%", padding: "12px 16px", border: "1.5px solid rgba(74,124,89,0.2)", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.92rem", color: "#1a2e1a", background: "#fff", resize: "vertical", transition: "all 0.2s", lineHeight: 1.6 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 14 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#b0b0b0" }}>{texto.length}/500</span>
                {modoEditar && <button onClick={() => setModoEditar(false)} style={{ background: "none", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#9a9a9a", cursor: "pointer", textDecoration: "underline" }}>Cancelar</button>}
              </div>

              {mensaje && (
                <div style={{ padding: "10px 14px", borderRadius: 4, marginBottom: 12, background: mensaje.type === "success" ? "#e8f5e9" : "#fce4ec", color: mensaje.type === "success" ? "#2d5a27" : "#b71c1c", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem" }}>
                  {mensaje.text}
                </div>
              )}

              <button onClick={handleEnviar} disabled={enviando || !texto.trim()}
                style={{ padding: "12px 28px", background: enviando || !texto.trim() ? "#9a9a9a" : "#2d5a27", color: "#f7f5f0", border: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.9rem", cursor: enviando || !texto.trim() ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                {enviando ? "Publicando..." : miComentario ? "Guardar cambios" : "Publicar reseña"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 6, padding: "24px", border: "1px solid rgba(74,124,89,0.1)", marginBottom: 28, textAlign: "center" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "#6a7a6a", marginBottom: 16 }}>
            Inicia sesión para dejar tu reseña
          </p>
          <a href="/login" style={{ padding: "10px 24px", background: "#2d5a27", color: "#f7f5f0", textDecoration: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem" }}>
            Iniciar sesión
          </a>
        </div>
      )}

      {/* LISTA DE COMENTARIOS */}
      {cargando && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 6, padding: "20px 24px", border: "1px solid rgba(74,124,89,0.08)" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f0ede6", animation: "shimmer 1.5s infinite" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, width: "30%", background: "#f0ede6", borderRadius: 4, marginBottom: 6, animation: "shimmer 1.5s infinite" }} />
                  <div style={{ height: 10, width: "20%", background: "#f0ede6", borderRadius: 4, animation: "shimmer 1.5s infinite" }} />
                </div>
              </div>
              <div style={{ height: 12, width: "90%", background: "#f0ede6", borderRadius: 4, marginBottom: 6, animation: "shimmer 1.5s infinite" }} />
              <div style={{ height: 12, width: "70%", background: "#f0ede6", borderRadius: 4, animation: "shimmer 1.5s infinite" }} />
            </div>
          ))}
        </div>
      )}

      {!cargando && datos?.comentarios?.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 24px", background: "#fff", borderRadius: 6, border: "1px solid rgba(74,124,89,0.08)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🌿</div>
          <p style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", color: "#1a2e1a", marginBottom: 8 }}>Sé el primero en opinar</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#9a9a9a" }}>Aún no hay reseñas para esta ruta.</p>
        </div>
      )}

      {!cargando && datos?.comentarios?.map((c, i) => {
        const esYo = user && c.usuario === user.username;
        return (
          <div key={c.id} className="comentario-card"
            style={{ border: esYo ? "1px solid rgba(74,124,89,0.25)" : "1px solid rgba(74,124,89,0.1)", background: esYo ? "linear-gradient(to right, rgba(181,213,160,0.06), #fff)" : "#fff", animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <AvatarComentario username={c.usuario} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                  <div>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#1a2e1a" }}>
                      {c.nombre_completo || c.usuario}
                      {esYo && <span style={{ marginLeft: 8, background: "#2d5a27", color: "#f7f5f0", fontSize: "0.6rem", fontWeight: 700, padding: "2px 7px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tú</span>}
                    </span>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#9a9a9a", marginTop: 2 }}>@{c.usuario} · {c.fecha}</div>
                  </div>
                  <Estrellas valor={c.estrellas} readonly size="0.95rem" />
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "#4a5a4a", lineHeight: 1.75 }}>
                  {c.texto}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}