import { useState, useEffect, useCallback } from "react";
import api from "../axiosConfig";
import "./ComentariosRuta.css";

const AVATAR_COLORS = [
  ["#2d5a27","#b5d5a0"], ["#1e3d2f","#4a7c59"],
  ["#0d2a1a","#3a6b4a"], ["#1a3a2a","#5a8a6a"], ["#3a2a0d","#a0784a"],
];

function Estrellas({ valor, onChange, readonly = false, size = "1.4rem" }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="estrellas-wrap">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="estrella"
          onClick={() => !readonly && onChange && onChange(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            fontSize: size,
            cursor: readonly ? "default" : "pointer",
            color: i <= (hover || valor) ? "#f59e0b" : "#e5e7eb",
            transform: !readonly && i <= hover ? "scale(1.2)" : "scale(1)",
          }}
        >★</span>
      ))}
    </div>
  );
}

function AvatarComentario({ username, size = 38 }) {
  const idx = username ? username.charCodeAt(0) % AVATAR_COLORS.length : 0;
  const [from, to] = AVATAR_COLORS[idx];
  return (
    <div className="avatar-comentario" style={{ width: size, height: size, fontSize: size * 0.4, background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {username ? username[0].toUpperCase() : "?"}
    </div>
  );
}

export default function ComentariosRuta({ rutaId }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [user, setUser] = useState(null);
  const [miComentario, setMiComentario] = useState(null);
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
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        const mio = res.data.comentarios.find((c) => c.usuario === parsed.username);
        if (mio) { setMiComentario(mio); setTexto(mio.texto); setEstrellas(mio.estrellas); }
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
      setMiComentario(null); setTexto(""); setEstrellas(5);
      fetchComentarios();
    } catch {}
  };

  const promedioEstrellas = datos?.stats?.promedio || 0;
  const totalComentarios  = datos?.stats?.total || 0;
  const distribucion      = datos?.stats?.distribucion || {};

  return (
    <div className="comentarios-wrap">

      {/* Header */}
      <div className="comentarios-header">
        <h2 className="comentarios-titulo">💬 Reseñas y Opiniones</h2>
        {totalComentarios > 0 && (
          <div className="comentarios-promedio-wrap">
            <Estrellas valor={Math.round(promedioEstrellas)} readonly size="1.2rem" />
            <span className="comentarios-promedio-num">{promedioEstrellas}</span>
            <span className="comentarios-total-texto">({totalComentarios} reseña{totalComentarios !== 1 ? "s" : ""})</span>
          </div>
        )}
      </div>

      {/* Resumen rating */}
      {!cargando && totalComentarios > 0 && (
        <div className="rating-resumen">
          <div className="rating-numero-grande">
            <div className="rating-valor">{promedioEstrellas}</div>
            <Estrellas valor={Math.round(promedioEstrellas)} readonly size="1.1rem" />
            <div className="rating-total">{totalComentarios} reseña{totalComentarios !== 1 ? "s" : ""}</div>
          </div>
          <div>
            {[5, 4, 3, 2, 1].map((n) => {
              const count = distribucion[String(n)] || 0;
              const pct   = totalComentarios > 0 ? (count / totalComentarios) * 100 : 0;
              return (
                <div key={n} className="rating-barra-row">
                  <span className="rating-barra-num">{n}</span>
                  <span className="rating-barra-estrella">★</span>
                  <div className="rating-barra-track">
                    <div className="rating-barra-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="rating-barra-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulario */}
      {user ? (
        <div className="comentario-form-wrap">
          {miComentario && !modoEditar ? (
            <div>
              <div className="mi-resena-header">
                <p className="mi-resena-label">✅ Tu reseña</p>
                <div className="mi-resena-acciones">
                  <button className="btn-editar-resena" onClick={() => setModoEditar(true)}>✏️ Editar</button>
                  <button className="btn-eliminar-resena" onClick={handleEliminar}>🗑️ Eliminar</button>
                </div>
              </div>
              <Estrellas valor={miComentario.estrellas} readonly />
              <p className="mi-resena-texto">{miComentario.texto}</p>
            </div>
          ) : (
            <div>
              <p className="form-titulo">{miComentario ? "✏️ Editar tu reseña" : "⭐ Deja tu reseña"}</p>
              <div className="form-calificacion-wrap">
                <p className="form-calificacion-label">Calificación</p>
                <Estrellas valor={estrellas} onChange={setEstrellas} size="2rem" />
                <p className="form-calificacion-texto">
                  {["", "Muy mala", "Regular", "Buena", "Muy buena", "Excelente"][estrellas]}
                </p>
              </div>
              <textarea
                className="form-textarea"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Cuéntanos tu experiencia en esta ruta... ¿Cómo estuvo el camino? ¿Qué recomendarías llevar?"
                maxLength={500}
                rows={4}
              />
              <div className="form-footer">
                <span className="form-contador">{texto.length}/500</span>
                {modoEditar && (
                  <button className="btn-cancelar-edicion" onClick={() => setModoEditar(false)}>Cancelar</button>
                )}
              </div>
              {mensaje && (
                <div className={`form-mensaje ${mensaje.type}`}>{mensaje.text}</div>
              )}
              <button
                className={`btn-publicar ${enviando || !texto.trim() ? "inactivo" : "activo"}`}
                onClick={handleEnviar}
                disabled={enviando || !texto.trim()}
              >
                {enviando ? "Publicando..." : miComentario ? "Guardar cambios" : "Publicar reseña"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="comentario-login-cta">
          <p className="comentario-login-texto">Inicia sesión para dejar tu reseña</p>
          <a href="/login" className="btn-login-comentario">Iniciar sesión</a>
        </div>
      )}

      {/* Skeleton */}
      {cargando && (
        <div className="comentario-skeleton-lista">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="comentario-skeleton-card">
              <div className="comentario-skeleton-header">
                <div className="comentario-skeleton-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="comentario-skeleton-block" style={{ height: 12, width: "30%", marginBottom: 6 }} />
                  <div className="comentario-skeleton-block" style={{ height: 10, width: "20%" }} />
                </div>
              </div>
              <div className="comentario-skeleton-block" style={{ height: 12, width: "90%", marginBottom: 6 }} />
              <div className="comentario-skeleton-block" style={{ height: 12, width: "70%" }} />
            </div>
          ))}
        </div>
      )}

      {/* Vacío */}
      {!cargando && datos?.comentarios?.length === 0 && (
        <div className="comentarios-vacio">
          <div className="comentarios-vacio-icono">🌿</div>
          <p className="comentarios-vacio-titulo">Sé el primero en opinar</p>
          <p className="comentarios-vacio-texto">Aún no hay reseñas para esta ruta.</p>
        </div>
      )}

      {/* Lista */}
      {!cargando && datos?.comentarios?.map((c, i) => {
        const esYo = user && c.usuario === user.username;
        return (
          <div
            key={c.id}
            className="comentario-card"
            style={{
              border:      esYo ? "1px solid rgba(74,124,89,0.25)" : "1px solid rgba(74,124,89,0.1)",
              background:  esYo ? "linear-gradient(to right, rgba(181,213,160,0.06), #fff)" : "#fff",
              animationDelay: `${i * 0.05}s`,
            }}
          >
            <div className="comentario-card-inner">
              <AvatarComentario username={c.usuario} />
              <div className="comentario-card-body">
                <div className="comentario-card-meta">
                  <div>
                    <span className="comentario-autor-nombre">
                      {c.nombre_completo || c.usuario}
                      {esYo && <span className="comentario-yo-badge">Tú</span>}
                    </span>
                    <div className="comentario-autor-meta">@{c.usuario} · {c.fecha}</div>
                  </div>
                  <Estrellas valor={c.estrellas} readonly size="0.95rem" />
                </div>
                <p className="comentario-texto">{c.texto}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}