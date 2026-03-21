import { useState, useEffect, useCallback, useRef } from "react";
import api from "../axiosConfig";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Comunidad.css";

const AVATAR_COLORS = [
  ["#2d5a27", "#b5d5a0"], ["#1e3d2f", "#4a7c59"],
  ["#0d2a1a", "#3a6b4a"], ["#3a2a0d", "#a0784a"],
  ["#1a2e4a", "#4a6a9a"],
];

function Avatar({ username, foto, size = 42 }) {
  if (foto) return (
    <img src={foto} alt={username} className="avatar-foto" style={{ width: size, height: size }} />
  );
  const idx = username ? username.charCodeAt(0) % AVATAR_COLORS.length : 0;
  const [from, to] = AVATAR_COLORS[idx];
  return (
    <div className="avatar-icono" style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {username ? username[0].toUpperCase() : "?"}
    </div>
  );
}

function ModalComentarios({ pub, user, onClose, onComentarioAdded }) {
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef(null);

  const fetchComentarios = useCallback(async () => {
    try {
      const res = await api.get(`/api/comunidad/publicaciones/${pub.id}/comentarios/`);
      setComentarios(res.data.comentarios);
    } catch {} finally { setCargando(false); }
  }, [pub.id]);

  useEffect(() => {
    fetchComentarios();
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [fetchComentarios]);

  const handleEnviar = async () => {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    try {
      const res = await api.post(`/api/comunidad/publicaciones/${pub.id}/comentarios/crear/`, { texto });
      setComentarios(prev => [...prev, res.data.comentario]);
      setTexto("");
      onComentarioAdded(pub.id);
    } catch {} finally { setEnviando(false); }
  };

  const handleEliminar = async (cId) => {
    if (!window.confirm("¿Eliminar comentario?")) return;
    try {
      await api.delete(`/api/comunidad/publicaciones/${pub.id}/comentarios/${cId}/eliminar/`);
      setComentarios(prev => prev.filter(c => c.id !== cId));
      onComentarioAdded(pub.id);
    } catch {}
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-comentarios" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-comentarios-pub-header">
            <Avatar username={pub.usuario} foto={pub.foto_usuario} size={36} />
            <div>
              <p className="modal-comentarios-autor-nombre">{pub.nombre_completo || pub.usuario}</p>
              <p className="modal-comentarios-autor-user">@{pub.usuario}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-comentarios-contenido">
          <p className="modal-comentarios-texto">{pub.contenido}</p>
        </div>

        <div className="modal-comentarios-lista">
          {cargando && <p className="modal-comentarios-cargando">Cargando...</p>}
          {!cargando && comentarios.length === 0 && (
            <p className="modal-comentarios-vacio">Sin comentarios aún. ¡Sé el primero!</p>
          )}
          {comentarios.map(c => (
            <div key={c.id} className="comentario-row">
              <Avatar username={c.usuario} foto={c.foto_usuario} size={32} />
              <div className="comentario-burbuja">
                <div className="comentario-burbuja-header">
                  <span className="comentario-burbuja-nombre">{c.nombre_completo || c.usuario}</span>
                  <div className="comentario-burbuja-meta">
                    <span className="comentario-burbuja-fecha">{c.fecha}</span>
                    {user && (c.usuario === user.username || user.rol === "admin") && (
                      <button className="btn-eliminar-comentario" onClick={() => handleEliminar(c.id)}>✕</button>
                    )}
                  </div>
                </div>
                <p className="comentario-burbuja-texto">{c.texto}</p>
              </div>
            </div>
          ))}
        </div>

        {user ? (
          <div className="modal-comentarios-input-wrap">
            <Avatar username={user.username} foto={user.foto_perfil} size={34} />
            <div className="modal-comentarios-textarea-wrap">
              <textarea
                ref={inputRef}
                className="modal-comentarios-textarea"
                value={texto}
                onChange={e => setTexto(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnviar(); } }}
                placeholder="Escribe un comentario..."
                rows={2}
                maxLength={500}
              />
              <button
                className={`btn-enviar-comentario ${texto.trim() ? "activo" : "inactivo"}`}
                onClick={handleEnviar}
                disabled={!texto.trim() || enviando}
              >
                →
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-login-hint">
            <a href="/login" className="modal-login-link">Inicia sesión para comentar →</a>
          </div>
        )}
      </div>
    </div>
  );
}

function ModalCrear({ user, onClose, onCreada }) {
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleImagen = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImagen(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleEnviar = async () => {
    if (!contenido.trim()) { setError("Escribe algo para publicar."); return; }
    setEnviando(true); setError("");
    try {
      const fd = new FormData();
      fd.append("contenido", contenido);
      if (imagen) fd.append("imagen", imagen);
      const res = await api.post("/api/comunidad/publicaciones/crear/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onCreada(res.data.publicacion);
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || "No se pudo publicar.");
    } finally { setEnviando(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-crear" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-titulo">Nueva publicación</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-crear-body">
          <div className="modal-crear-autor">
            <Avatar username={user.username} foto={user.foto_perfil} size={40} />
            <div style={{ flex: 1 }}>
              <p className="modal-crear-autor-nombre">{user.first_name || user.username}</p>
              <textarea
                className="modal-crear-textarea"
                value={contenido}
                onChange={e => setContenido(e.target.value)}
                placeholder="¿Cómo estuvo tu senderismo hoy? Comparte tu experiencia..."
                rows={4}
                maxLength={1000}
              />
              <div className="modal-crear-contador">{contenido.length}/1000</div>
            </div>
          </div>

          {preview && (
            <div className="modal-crear-preview-wrap">
              <img src={preview} alt="preview" className="modal-crear-preview" />
              <button className="btn-quitar-preview" onClick={() => { setImagen(null); setPreview(null); }}>×</button>
            </div>
          )}

          {error && <p className="modal-crear-error">{error}</p>}

          <div className="modal-crear-footer">
            <button className="btn-adjuntar-foto" onClick={() => fileRef.current?.click()}>📷 Foto</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImagen} style={{ display: "none" }} />
            <button
              className={`btn-publicar-enviar ${contenido.trim() ? "activo" : "inactivo"}`}
              onClick={handleEnviar}
              disabled={!contenido.trim() || enviando}
            >
              {enviando ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TarjetaPub({ pub, user, onLike, onAbrirComentarios, onEliminar }) {
  const [likeAnim, setLikeAnim] = useState(false);

  const handleLike = () => {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
    onLike(pub.id);
  };

  return (
    <div className="tarjeta-pub">
      <div className="tarjeta-pub-header">
        <div className="tarjeta-pub-autor">
          <Avatar username={pub.usuario} foto={pub.foto_usuario} size={42} />
          <div>
            <p className="tarjeta-pub-nombre">{pub.nombre_completo || pub.usuario}</p>
            <p className="tarjeta-pub-meta">@{pub.usuario} · {pub.fecha}</p>
          </div>
        </div>
        <div className="tarjeta-pub-acciones">
          {pub.ruta && (
            <a href={`/rutas/${pub.ruta.id}`} className="tarjeta-pub-ruta-link">
              🥾 {pub.ruta.nombre}
            </a>
          )}
          {user && (pub.usuario === user.username || user.rol === "admin") && (
            <button className="btn-eliminar-pub" onClick={() => onEliminar(pub.id)}>🗑</button>
          )}
        </div>
      </div>

      <div className="tarjeta-pub-contenido">
        <p className="tarjeta-pub-texto">{pub.contenido}</p>
      </div>

      {pub.imagen && (
        <div className="tarjeta-pub-imagen-wrap">
          <img src={pub.imagen} alt="publicación" className="tarjeta-pub-imagen" />
        </div>
      )}

      <div className="tarjeta-pub-footer">
        <button
          className="btn-like"
          onClick={handleLike}
          style={{
            cursor: user ? "pointer" : "default",
            color: pub.me_gusta ? "#e53935" : "#9a9a9a",
            transform: likeAnim ? "scale(1.3)" : "scale(1)",
          }}
        >
          <span className="btn-like-icon">{pub.me_gusta ? "❤️" : "🤍"}</span>
          <span style={{ fontWeight: pub.me_gusta ? 600 : 400 }}>{pub.likes}</span>
        </button>
        <button className="btn-comentarios" onClick={() => onAbrirComentarios(pub)}>
          <span style={{ fontSize: "1.1rem" }}>💬</span>
          <span>{pub.comentarios} {pub.comentarios === 1 ? "comentario" : "comentarios"}</span>
        </button>
      </div>
    </div>
  );
}

export default function Comunidad() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [user, setUser] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalComentarios, setModalComentarios] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) try { setUser(JSON.parse(u)); } catch {}
  }, []);

  const fetchPublicaciones = useCallback(async (p = 1) => {
    try {
      setCargando(true);
      const res = await api.get(`/api/comunidad/publicaciones/?pagina=${p}`);
      if (p === 1) setPublicaciones(res.data.publicaciones);
      else setPublicaciones(prev => [...prev, ...res.data.publicaciones]);
      setTotalPaginas(res.data.paginas);
    } catch {} finally { setCargando(false); }
  }, []);

  useEffect(() => { fetchPublicaciones(1); }, [fetchPublicaciones]);

  const handleLike = async (pubId) => {
    if (!user) return;
    try {
      const res = await api.post(`/api/comunidad/publicaciones/${pubId}/like/`);
      setPublicaciones(prev => prev.map(p => p.id === pubId ? { ...p, likes: res.data.likes, me_gusta: res.data.me_gusta } : p));
    } catch {}
  };

  const handleEliminar = async (pubId) => {
    if (!window.confirm("¿Eliminar esta publicación?")) return;
    try {
      await api.delete(`/api/comunidad/publicaciones/${pubId}/eliminar/`);
      setPublicaciones(prev => prev.filter(p => p.id !== pubId));
    } catch {}
  };

  const handleCreada = (nuevaPub) => setPublicaciones(prev => [nuevaPub, ...prev]);

  const handleComentarioAdded = (pubId) => {
    api.get(`/api/comunidad/publicaciones/?pagina=1`).then(res => {
      const updated = res.data.publicaciones.find(p => p.id === pubId);
      if (updated) setPublicaciones(prev => prev.map(p => p.id === pubId ? { ...p, comentarios: updated.comentarios } : p));
    }).catch(() => {});
  };

  const cargarMas = () => { const next = pagina + 1; setPagina(next); fetchPublicaciones(next); };

  return (
    <div className="comunidad-page">
      <Navbar />

      {}
      <div className="comunidad-hero">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="comunidad-hero-orb" style={{
            width:  [500, 300, 200][i],
            height: [500, 300, 200][i],
            background: `rgba(181,213,160,${[0.04, 0.06, 0.08][i]})`,
            top:  ["-30%", "20%",  "-10%"][i],
            left: ["60%",  "80%",  "40%"][i],
          }} />
        ))}
        <div className="comunidad-hero-inner">
          <p className="comunidad-hero-label">Comunidad Walk App</p>
          <h1 className="comunidad-hero-titulo">
            Comparte tus aventuras<br /><em>en los senderos</em>
          </h1>
          <p className="comunidad-hero-subtitulo">
            Conecta con otros senderistas, comparte fotos y experiencias de las rutas de Popayán.
          </p>
          {user ? (
            <button className="btn-nueva-pub" onClick={() => setModalCrear(true)}>✏️ Nueva publicación</button>
          ) : (
            <a href="/login" className="btn-nueva-pub">Inicia sesión para publicar</a>
          )}
        </div>
      </div>

      {}
      <div className="feed-wrap">
        {user && (
          <div className="feed-publicar-btn-wrap">
            <button className="btn-publicar" onClick={() => setModalCrear(true)}>+ Publicar</button>
          </div>
        )}

        {cargando && pagina === 1 && [...Array(3)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-avatar" />
              <div className="skeleton-lines">
                <div className="skeleton-line skeleton-line-md" />
                <div className="skeleton-line skeleton-line-sm" />
              </div>
            </div>
            <div className="skeleton-line skeleton-line-lg" />
            <div className="skeleton-line skeleton-line-md" />
          </div>
        ))}

        {!cargando && publicaciones.length === 0 && (
          <div className="feed-vacio">
            <div className="feed-vacio-icono">🌿</div>
            <h3 className="feed-vacio-titulo">La comunidad está esperando</h3>
            <p className="feed-vacio-texto">Sé el primero en compartir tu aventura.</p>
          </div>
        )}

        {publicaciones.map(pub => (
          <TarjetaPub
            key={pub.id}
            pub={pub}
            user={user}
            onLike={handleLike}
            onAbrirComentarios={setModalComentarios}
            onEliminar={handleEliminar}
          />
        ))}

        {!cargando && pagina < totalPaginas && (
          <div className="cargar-mas-wrap">
            <button className="btn-cargar-mas" onClick={cargarMas}>Cargar más publicaciones</button>
          </div>
        )}

        {cargando && pagina > 1 && (
          <div className="spinner-wrap">
            <div className="spinner" />
          </div>
        )}
      </div>

      {modalCrear && (
        <ModalCrear user={user} onClose={() => setModalCrear(false)} onCreada={handleCreada} />
      )}
      {modalComentarios && (
        <ModalComentarios
          pub={modalComentarios}
          user={user}
          onClose={() => setModalComentarios(null)}
          onComentarioAdded={handleComentarioAdded}
        />
      )}

      <Footer />
    </div>
  );
}