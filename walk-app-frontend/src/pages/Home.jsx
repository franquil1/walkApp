import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://127.0.0.1:8000";

const TESTIMONIALS = [
  {
    name: "Juan Pérez",
    role: "Explorador Activo",
    text: "Walk App ha transformado mis caminatas. Encuentro rutas increíbles y la comunidad es fantástica.",
    imagen: "/images/cambiar1.png",
  },
  {
    name: "María González",
    role: "Amante de la Naturaleza",
    text: "Me encanta la función de dificultad y distancia. Siempre encuentro la ruta perfecta para mi nivel.",
    imagen: "/images/cambiar2 (1).png",
  },
  {
    name: "Carlos Rodríguez",
    role: "Caminante Urbano",
    text: "La app es súper intuitiva. Ahora planificar mis salidas es mucho más fácil y divertido.",
    imagen: "/images/cambiar3.png",
  },
];

const CAROUSEL_MSGS = [
  "Descarga mapas y rutas para navegación offline.",
  "Planifica tu aventura con mapas, rutas y recomendaciones.",
  "Comparte tus recorridos y experiencias con otros caminantes.",
  "Conéctate con la naturaleza desde tu smartphone.",
  "Rutas, mapas y más a un clic.",
  "La herramienta ideal para caminantes.",
];

const DIFICULTAD_COLORS = {
  FACIL: "#4caf50",
  MODERADO: "#ff9800",
  DIFICIL: "#f44336",
  EXTREMO: "#9c27b0",
};

const DIFICULTAD_LABELS = {
  FACIL: "Fácil",
  MODERADO: "Moderado",
  DIFICIL: "Difícil",
  EXTREMO: "Extremo",
};

const RUTA_COLORS = ["#2d5a27", "#4a7c59", "#3a6b4a", "#1e3d2f", "#4d6741", "#3d7a52"];

function useIntersectionObserver(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function AnimatedSection({ children, delay = 0, direction = "bottom", className = "" }) {
  const [ref, visible] = useIntersectionObserver();
  const transforms = {
    bottom: "translateY(40px)",
    left: "translateX(-40px)",
    right: "translateX(40px)",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function DifficultyBadge({ level }) {
  return (
    <span
      style={{
        background: DIFICULTAD_COLORS[level] || "#888",
        color: "#fff",
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 20,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {DIFICULTAD_LABELS[level] || level}
    </span>
  );
}

export default function WalkApp() {
  const [rutas, setRutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState({ dificultad: "", buscar: "" });
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [hoveredRuta, setHoveredRuta] = useState(null);
  
  // Cargar rutas desde la API de Django
  useEffect(() => {
    const fetchRutas = async () => {
      try {
        setCargando(true);
        setError(null);
        const params = {};
        if (filtro.dificultad) params.dificultad = filtro.dificultad;
        if (filtro.buscar) params.buscar = filtro.buscar;
        const res = await axios.get(`${API_BASE}/api/rutas/`, { params });
        setRutas(res.data);
      } catch (err) {
        setError("No se pudieron cargar las rutas. Verifica que Django esté corriendo.");
      } finally {
        setCargando(false);
      }
    };
    fetchRutas();
  }, [filtro]);

  useEffect(() => {
    const timer = setInterval(() => setCarouselIdx((i) => (i + 1) % CAROUSEL_MSGS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif", color: "#1a2e1a", background: "#f7f5f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        ::selection { background: #b5d5a0; color: #1a2e1a; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0ede6; }
        ::-webkit-scrollbar-thumb { background: #4a7c59; border-radius: 3px; }
        .btn-primary { background: #2d5a27; color: #f7f5f0; border: none; padding: 14px 36px; border-radius: 2px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 1rem; cursor: pointer; letter-spacing: 0.04em; transition: all 0.3s; text-decoration: none; display: inline-block; }
        .btn-primary:hover { background: #1e3d1a; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(45,90,39,0.3); }
        .btn-outline { background: transparent; color: #f7f5f0; border: 2px solid rgba(247,245,240,0.6); padding: 13px 34px; border-radius: 2px; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 1rem; cursor: pointer; letter-spacing: 0.04em; transition: all 0.3s; text-decoration: none; display: inline-block; }
        .btn-outline:hover { background: rgba(247,245,240,0.1); border-color: #f7f5f0; }
        .section-line { width: 60px; height: 3px; background: linear-gradient(90deg, #4a7c59, #b5d5a0); margin: 16px auto 0; border-radius: 2px; }
        input, select { font-family: 'DM Sans', sans-serif; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Navbar/>

      {/* HERO */}
      <section style={{
        minHeight: "100vh", position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, #0d1f0d 0%, #1e3d1a 40%, #2d5a27 70%, #4a7c59 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: [300, 200, 150, 400, 100, 250][i],
            height: [300, 200, 150, 400, 100, 250][i],
            borderRadius: "50%",
            background: `rgba(181,213,160,${[0.04, 0.06, 0.08, 0.03, 0.1, 0.05][i]})`,
            top: ["10%", "60%", "30%", "-10%", "70%", "20%"][i],
            left: ["-5%", "70%", "-10%", "60%", "20%", "40%"][i],
            animation: `float ${[6, 8, 7, 9, 5, 7][i]}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }} />
        ))}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          {[...Array(8)].map((_, i) => (
            <ellipse key={i} cx="500" cy="300" rx={150 + i * 60} ry={80 + i * 35} fill="none" stroke="#b5d5a0" strokeWidth="1" />
          ))}
        </svg>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 720, padding: "0 24px" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.85rem", letterSpacing: "0.25em", color: "#b5d5a0", textTransform: "uppercase", marginBottom: 24 }}>
            Popayán · Colombia
          </div>
          <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "clamp(2.8rem, 6vw, 5rem)", color: "#f7f5f0", lineHeight: 1.1, marginBottom: 24, textShadow: "0 4px 30px rgba(0,0,0,0.3)" }}>
            Descubre tu Próxima<br />
            <em style={{ color: "#b5d5a0", fontStyle: "italic" }}>Aventura</em>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1.25rem", color: "rgba(247,245,240,0.75)", marginBottom: 48, lineHeight: 1.6 }}>
            Cada Paso Cuenta
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/registro" className="btn-primary" style={{ fontSize: "1.05rem", padding: "16px 42px" }}>¡Únete Ahora!</a>
            <a href="#rutas" className="btn-outline" style={{ fontSize: "1.05rem", padding: "16px 42px" }}>Explorar Rutas</a>
          </div>
          <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 64, paddingTop: 48, borderTop: "1px solid rgba(181,213,160,0.2)" }}>
            {[["120+", "Rutas"], ["5K+", "Caminantes"], ["98%", "Satisfacción"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "2rem", color: "#b5d5a0" }}>{num}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(247,245,240,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "100px 0", background: "#f7f5f0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <AnimatedSection direction="left">
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.8rem", letterSpacing: "0.2em", color: "#4a7c59", textTransform: "uppercase", marginBottom: 16 }}>
              Tu Compañero de Senderismo en Popayán
            </div>
            <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "2.6rem", lineHeight: 1.2, marginBottom: 28, color: "#1a2e1a" }}>¿Quiénes Somos?</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1.05rem", lineHeight: 1.8, color: "#4a5a4a", marginBottom: 20 }}>
              En Walk App, creemos que cada paso es una oportunidad para conectar con la naturaleza y con otros entusiastas. Hemos creado la plataforma ideal para explorar los hermosos paisajes de Popayán y sus alrededores, desde senderos urbanos históricos hasta desafiantes rutas de montaña.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1.05rem", lineHeight: 1.8, color: "#4a5a4a" }}>
              Nuestra misión es inspirar a más personas a salir, moverse y descubrir la belleza natural y cultural que nos rodea, fomentando un estilo de vida activo y una comunidad unida.
            </p>
          </AnimatedSection>
          <AnimatedSection direction="right">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                { icon: "🗺️", title: "Rutas Verificadas", desc: "Descubre senderos detallados con información precisa." },
                { icon: "👥", title: "Comunidad Activa", desc: "Conecta con caminantes, comparte experiencias y únete a grupos." },
                { icon: "🏆", title: "Desafíos y Recompensas", desc: "Participa en retos y sube en el ranking." },
                { icon: "📍", title: "GPS Preciso", desc: "Navegación offline para rutas sin señal." },
              ].map((feat, i) => (
                <AnimatedSection key={feat.title} delay={i * 0.1}>
                  <div
                    style={{ background: "#fff", padding: "28px 24px", borderRadius: 4, border: "1px solid rgba(74,124,89,0.12)", transition: "all 0.3s", cursor: "default", boxShadow: "0 2px 15px rgba(26,46,26,0.06)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 35px rgba(26,46,26,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 15px rgba(26,46,26,0.06)"; }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 12 }}>{feat.icon}</div>
                    <h4 style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "1rem", marginBottom: 8, color: "#1a2e1a" }}>{feat.title}</h4>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.88rem", color: "#6a7a6a", lineHeight: 1.6 }}>{feat.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* RUTAS */}
      <section id="rutas" style={{ padding: "100px 0", background: "#f0ede6" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.8rem", letterSpacing: "0.2em", color: "#4a7c59", textTransform: "uppercase", marginBottom: 14 }}>Explorar</div>
              <h3 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "2.6rem", color: "#1a2e1a", marginBottom: 12 }}>Explora Nuestros Senderos en Popayán</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6a7a6a", fontSize: "1.05rem", fontStyle: "italic" }}>"Naturaleza que inspira, senderos que transforman."</p>
              <div className="section-line" />
            </div>
          </AnimatedSection>

          {/* Filtros */}
          <AnimatedSection delay={0.1}>
            <div style={{ display: "flex", gap: 16, marginBottom: 48, flexWrap: "wrap", alignItems: "center", background: "#fff", padding: 24, borderRadius: 4, boxShadow: "0 2px 15px rgba(26,46,26,0.06)", border: "1px solid rgba(74,124,89,0.1)" }}>
              <select
                value={filtro.dificultad}
                onChange={(e) => setFiltro((f) => ({ ...f, dificultad: e.target.value }))}
                style={{ flex: 1, minWidth: 160, padding: "10px 16px", border: "1px solid rgba(74,124,89,0.25)", borderRadius: 2, fontSize: "0.9rem", color: "#1a2e1a", background: "#f7f5f0", outline: "none" }}
              >
                <option value="">Todas las dificultades</option>
                <option value="FACIL">Fácil</option>
                <option value="MODERADO">Moderado</option>
                <option value="DIFICIL">Difícil</option>
                <option value="EXTREMO">Extremo</option>
              </select>
              <input
                value={filtro.buscar}
                onChange={(e) => setFiltro((f) => ({ ...f, buscar: e.target.value }))}
                placeholder="Buscar ruta..."
                style={{ flex: 2, minWidth: 200, padding: "10px 16px", border: "1px solid rgba(74,124,89,0.25)", borderRadius: 2, fontSize: "0.9rem", color: "#1a2e1a", background: "#f7f5f0", outline: "none" }}
              />
              <button
                onClick={() => setFiltro({ dificultad: "", buscar: "" })}
                style={{ padding: "10px 24px", background: "transparent", border: "1px solid rgba(74,124,89,0.4)", borderRadius: 2, color: "#4a7c59", cursor: "pointer", fontWeight: 500, fontSize: "0.88rem" }}
              >
                Limpiar
              </button>
            </div>
          </AnimatedSection>

          {/* Estado de carga */}
          {cargando && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 40, height: 40, border: "3px solid rgba(74,124,89,0.2)", borderTop: "3px solid #4a7c59", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6a7a6a" }}>Cargando rutas...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ textAlign: "center", padding: "40px", background: "#fff5f5", border: "1px solid rgba(244,67,54,0.2)", borderRadius: 4, marginBottom: 32 }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>⚠️</div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#c62828" }}>{error}</p>
            </div>
          )}

          {/* Grid de rutas */}
          {!cargando && !error && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 28 }}>
              {rutas.map((ruta, i) => (
                <AnimatedSection key={ruta.id} delay={i * 0.08}>
                  <div
                    onMouseEnter={() => setHoveredRuta(ruta.id)}
                    onMouseLeave={() => setHoveredRuta(null)}
                    style={{
                      background: "#fff", borderRadius: 4, overflow: "hidden",
                      boxShadow: hoveredRuta === ruta.id ? "0 20px 50px rgba(26,46,26,0.15)" : "0 4px 20px rgba(26,46,26,0.07)",
                      transform: hoveredRuta === ruta.id ? "translateY(-6px)" : "none",
                      transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      border: "1px solid rgba(74,124,89,0.1)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      height: 200, position: "relative", overflow: "hidden",
                      background: ruta.imagen_url ? "transparent" : `linear-gradient(135deg, ${RUTA_COLORS[i % RUTA_COLORS.length]}, #b5d5a0)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {ruta.imagen_url ? (
                        <img src={ruta.imagen_url} alt={ruta.nombre_ruta} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <>
                          <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%", position: "absolute", opacity: 0.15 }}>
                            <path d="M0,80 Q50,20 100,60 Q150,100 200,40 L200,120 L0,120 Z" fill="rgba(255,255,255,0.4)" />
                            <path d="M0,100 Q60,50 120,80 Q160,100 200,60 L200,120 L0,120 Z" fill="rgba(255,255,255,0.3)" />
                          </svg>
                          <span style={{ fontSize: "3.5rem", position: "relative", zIndex: 1 }}>🏔️</span>
                        </>
                      )}
                      <div style={{ position: "absolute", top: 16, right: 16 }}>
                        <DifficultyBadge level={ruta.dificultad} />
                      </div>
                    </div>
                    <div style={{ padding: "24px 28px" }}>
                      <h4 style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "1.2rem", color: "#1a2e1a", marginBottom: 10 }}>{ruta.nombre_ruta}</h4>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "#6a7a6a", lineHeight: 1.6, marginBottom: 18 }}>
                        {ruta.descripcion ? ruta.descripcion.substring(0, 80) + (ruta.descripcion.length > 80 ? "..." : "") : "Sin descripción"}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#4a7c59" }}>
                          📏 {ruta.longitud} km
                          {ruta.duracion_estimada && (
                            <span style={{ marginLeft: 10, color: "#6a7a6a", fontWeight: 400 }}>⏱ {ruta.duracion_estimada}</span>
                          )}
                        </span>
                        <div style={{ display: "flex", gap: 10 }}>
                          <a href={`/rutas/${ruta.id}/`}
                            style={{ padding: "8px 16px", background: "#2d5a27", color: "#f7f5f0", textDecoration: "none", borderRadius: 2, fontWeight: 500, fontSize: "0.82rem", transition: "background 0.2s" }}
                            onMouseEnter={(e) => (e.target.style.background = "#1e3d1a")}
                            onMouseLeave={(e) => (e.target.style.background = "#2d5a27")}
                          >
                            Ver Ruta
                          </a>
                          <button style={{ padding: "8px 14px", background: "transparent", color: "#e0574a", border: "1px solid rgba(224,87,74,0.3)", borderRadius: 2, fontWeight: 500, fontSize: "0.82rem", cursor: "pointer" }}>
                            ♡ Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}

          {!cargando && !error && rutas.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#6a7a6a", fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🌿</div>
              <p>No se encontraron rutas con esos filtros.</p>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 60 }}>
            <AnimatedSection>
              <a href="/rutas/"
                style={{ display: "inline-block", padding: "15px 48px", border: "2px solid #2d5a27", color: "#2d5a27", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.95rem", borderRadius: 2, letterSpacing: "0.05em", transition: "all 0.3s" }}
                onMouseEnter={(e) => { e.target.style.background = "#2d5a27"; e.target.style.color = "#f7f5f0"; }}
                onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#2d5a27"; }}
              >
                Ver Todas las Rutas
              </a>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "100px 0", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.8rem", letterSpacing: "0.2em", color: "#4a7c59", textTransform: "uppercase", marginBottom: 14 }}>Comunidad</div>
              <h3 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "2.4rem", color: "#1a2e1a", marginBottom: 12 }}>Lo que Dicen Nuestros Caminantes</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6a7a6a", fontStyle: "italic" }}>"Experiencias reales, aventuras inolvidables."</p>
              <div className="section-line" />
            </div>
          </AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {TESTIMONIALS.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.12} direction={["left", "bottom", "right"][i]}>
                <div style={{ padding: "40px 36px", background: "#f7f5f0", borderRadius: 4, border: "1px solid rgba(74,124,89,0.1)" }}>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: "4rem", color: "#b5d5a0", lineHeight: 1, marginBottom: 16, opacity: 0.7 }}>"</div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1rem", lineHeight: 1.75, color: "#4a5a4a", marginBottom: 28, fontStyle: "italic" }}>{t.text}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <img src={t.imagen} alt={t.name}
                      style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(74,124,89,0.3)" }}
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                    <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, #2d5a27, #b5d5a0)", display: "none", alignItems: "center", justifyContent: "center", fontFamily: "'Lora', serif", fontWeight: 700, color: "#f7f5f0", fontSize: "0.95rem" }}>
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "1rem", color: "#1a2e1a" }}>{t.name}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "#4a7c59", marginTop: 2 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CAROUSEL */}
      <section style={{ padding: "80px 0", background: "#1a2e1a", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(74,124,89,0.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(45,90,39,0.2) 0%, transparent 60%)" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 48px", textAlign: "center", position: "relative" }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "2rem", color: "#f7f5f0", marginBottom: 48 }}>Explora, Comparte y Conecta</h2>
          <div style={{ minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>
            <p key={carouselIdx} style={{ fontFamily: "'Lora', serif", fontSize: "1.4rem", color: "#b5d5a0", fontStyle: "italic", lineHeight: 1.5, animation: "fadeSlide 0.6s ease forwards" }}>
              "{CAROUSEL_MSGS[carouselIdx]}"
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {CAROUSEL_MSGS.map((_, i) => (
              <button key={i} onClick={() => setCarouselIdx(i)}
                style={{ width: i === carouselIdx ? 28 : 8, height: 8, borderRadius: 4, background: i === carouselIdx ? "#b5d5a0" : "rgba(181,213,160,0.3)", border: "none", cursor: "pointer", transition: "all 0.4s ease" }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "120px 48px", textAlign: "center", background: "linear-gradient(135deg, #2d5a27 0%, #4a7c59 50%, #1e3d1a 100%)", position: "relative", overflow: "hidden" }}>
        <AnimatedSection>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.8rem", letterSpacing: "0.25em", color: "#b5d5a0", textTransform: "uppercase", marginBottom: 20 }}>¿Listo para la Aventura?</div>
            <h2 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "3rem", color: "#f7f5f0", marginBottom: 20, lineHeight: 1.15 }}>¿Listo para Explorar Popayán?</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1.15rem", color: "rgba(247,245,240,0.75)", marginBottom: 48, lineHeight: 1.7 }}>
              Únete a la comunidad de Walk App y empieza tu próxima caminata hoy mismo.
            </p>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/login"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 40px", background: "#f7f5f0", color: "#1a2e1a", textDecoration: "none", borderRadius: 2, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "1rem", transition: "all 0.3s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f7f5f0"; e.currentTarget.style.transform = "none"; }}
              >
                👤 Regístrate Gratis
              </a>
              <a href="#" className="btn-outline" style={{ fontSize: "1rem", padding: "16px 40px", display: "inline-flex", alignItems: "center", gap: 10 }}>
                📱 Descarga la App
              </a>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  );
}