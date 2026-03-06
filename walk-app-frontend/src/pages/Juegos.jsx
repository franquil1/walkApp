import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../axiosConfig";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BASE_STATIC = "http://127.0.0.1:8000/static/mapa_roto/images/imagenes_niveles";

const MAPAS = {
  facil:  { grid: 3, piezaSize: 110, mapas: ["coconuco_sanNicolas.png", "Pilimbala_CraterPurace.png", "Popayan_TresCruces.png"] },
  normal: { grid: 4, piezaSize: 90,  mapas: ["Popayan_TermalesCoconuco.png", "Popayán-Purace.png"] },
  dificil:{ grid: 5, piezaSize: 70,  mapas: [] },
};

const PREGUNTAS = {
  rutas: [
    { pregunta: "¿Cuál es la dificultad más alta en la app?", opciones: ["Difícil","Extremo","Experto","Avanzado"], correcta: 1 },
    { pregunta: "¿Qué unidad se usa para medir la longitud de las rutas?", opciones: ["Metros","Millas","Kilómetros","Pasos"], correcta: 2 },
    { pregunta: "¿Qué muestra el mapa en el detalle de una ruta?", opciones: ["Solo llegada","Nada","Inicio, fin y trayecto","Solo el nombre"], correcta: 2 },
    { pregunta: "¿Cuántas categorías de dificultad existen?", opciones: ["2","3","4","5"], correcta: 2 },
    { pregunta: "¿Qué es la duración estimada de una ruta?", opciones: ["Tiempo en carro","Tiempo para completarla","Tiempo de registro","Tiempo de descanso"], correcta: 1 },
  ],
  equipo: [
    { pregunta: "¿Cuál es el calzado más recomendado para senderismo?", opciones: ["Tenis de ciudad","Botas de senderismo","Sandalias","Zapatos de cuero"], correcta: 1 },
    { pregunta: "¿Qué prenda es esencial para lluvia en el sendero?", opciones: ["Jeans","Camiseta de algodón","Impermeable o poncho","Suéter de lana"], correcta: 2 },
    { pregunta: "¿Cuántos litros de agua llevar en una caminata de 4 horas?", opciones: ["0.5 litros","1 litro","2 litros","5 litros"], correcta: 2 },
    { pregunta: "¿Para qué sirven los bastones de trekking?", opciones: ["Decorar","Apoyarse y reducir impacto","Marcar el camino","No tienen utilidad"], correcta: 1 },
    { pregunta: "¿Qué tipo de ropa es mejor para climas variables?", opciones: ["Algodón grueso","Ropa en capas","Solo una camiseta","Ropa de noche"], correcta: 1 },
  ],
  seguridad: [
    { pregunta: "¿Qué hacer antes de iniciar una ruta desconocida?", opciones: ["Salir sin avisar","Informar tu ruta y hora de regreso","Ir solo sin teléfono","Salir de noche"], correcta: 1 },
    { pregunta: "¿Qué hacer si te pierdes en el sendero?", opciones: ["Correr en cualquier dirección","Quedarte tranquilo y buscar referencias","Gritar sin parar","Dejar el equipo"], correcta: 1 },
    { pregunta: "¿Qué elemento de primeros auxilios es básico?", opciones: ["Tijeras de cocina","Botiquín con vendas","Libros","Ropa extra"], correcta: 1 },
    { pregunta: "¿Qué hacer si hay tormenta eléctrica?", opciones: ["Refugiarse bajo árbol alto","Caminar rápido","Alejarse de árboles y buscar terreno bajo","Usar paraguas metálico"], correcta: 2 },
    { pregunta: "¿Con qué frecuencia descansar en caminatas largas?", opciones: ["Solo al final","Cada 10 minutos","Cada 1-2 horas por 10-15 min","Nunca"], correcta: 2 },
  ],
  "flora-fauna": [
    { pregunta: "¿Qué ecosistema predomina cerca de Popayán?", opciones: ["Desierto","Bosque andino y páramo","Selva tropical baja","Tundra"], correcta: 1 },
    { pregunta: "¿Actitud correcta ante fauna silvestre?", opciones: ["Alimentarla con comida","Observar sin tocar","Intentar atraparla","Ahuyentarla con piedras"], correcta: 1 },
    { pregunta: "¿Qué ave es símbolo del Cauca?", opciones: ["Loro orejiamarillo","Cóndor de los Andes","Colibrí de vientre canela","Tángara"], correcta: 1 },
    { pregunta: "¿Qué hacer con los residuos en el recorrido?", opciones: ["Enterrarlos","Dejarlos en el camino","Llevarlos de vuelta","Quemarlos"], correcta: 2 },
    { pregunta: "¿Qué planta es común en los páramos colombianos?", opciones: ["Cactus","Frailejón","Palma de coco","Bambú gigante"], correcta: 1 },
  ],
  tecnicas: [
    { pregunta: "¿Cómo se llama caminar en zigzag en pendientes?", opciones: ["Sprint","Travesía o switchback","Carrera cruzada","Paso doble"], correcta: 1 },
    { pregunta: "¿Qué es el 'Leave No Trace'?", opciones: ["Tipo de sendero","Principio de no dejar rastro","Marca de equipos","Técnica de escalada"], correcta: 1 },
    { pregunta: "¿Cómo se llama el punto más alto de un sendero?", opciones: ["Nadir","Cima o cumbre","Base camp","Zenit"], correcta: 1 },
    { pregunta: "¿Qué significa 'desnivel' en una ruta?", opciones: ["Color del sendero","Diferencia de altura entre inicio y fin","Largo del camino","Dificultad del terreno"], correcta: 1 },
    { pregunta: "¿Qué se recomienda al descender pendientes empinadas?", opciones: ["Correr rápido","Ir de lado controlando el paso","Saltar de piedra en piedra","Bajar de espaldas"], correcta: 1 },
  ],
  lugares: [
    { pregunta: "¿En qué departamento está Popayán?", opciones: ["Nariño","Valle del Cauca","Cauca","Huila"], correcta: 2 },
    { pregunta: "¿Por qué apodo es conocida Popayán?", opciones: ["La Ciudad Roja","La Ciudad Blanca","La Ciudad de las Flores","La Ciudad Eterna"], correcta: 1 },
    { pregunta: "¿Cuál es el volcán más cercano a Popayán?", opciones: ["Nevado del Ruiz","Volcán Puracé","Volcán Galeras","Nevado del Huila"], correcta: 1 },
    { pregunta: "¿Qué parque natural está cerca de Popayán?", opciones: ["PNN Tayrona","PNN Puracé","PNN Los Nevados","PNN Amacayacu"], correcta: 1 },
    { pregunta: "¿Qué río atraviesa Popayán?", opciones: ["Río Cauca","Río Magdalena","Río Molino","Río Palacé"], correcta: 0 },
  ],
};

const CATEGORIAS = [
  { key: "rutas",       label: "Rutas",           emoji: "🗺️" },
  { key: "equipo",      label: "Equipo",           emoji: "🎒" },
  { key: "seguridad",   label: "Seguridad",        emoji: "⛑️" },
  { key: "flora-fauna", label: "Flora y Fauna",    emoji: "🌿" },
  { key: "tecnicas",    label: "Técnicas",         emoji: "🧗" },
  { key: "lugares",     label: "Lugares Icónicos", emoji: "📍" },
];

// ═══════════════════════════════════════════
// MAPA ROTO
// ═══════════════════════════════════════════
function MapaRoto({ onVolver }) {
  const [fase, setFase] = useState("menu");
  const [dificultad, setDificultad] = useState("facil");
  const [piezas, setPiezas] = useState([]);
  const [tablero, setTablero] = useState([]);
  const [pistas, setPistas] = useState(3);
  const [mostrarPista, setMostrarPista] = useState(false);
  const [mostrarAgotadas, setMostrarAgotadas] = useState(false);
  const [imagenURL, setImagenURL] = useState("");
  const [arrastrando, setArrastrando] = useState(null);
  const cfg = MAPAS[dificultad];

  const iniciarJuego = () => {
    const c = MAPAS[dificultad];
    if (c.mapas.length === 0) { alert("No hay imágenes para esta dificultad aún."); return; }
    const mapa = c.mapas[Math.floor(Math.random() * c.mapas.length)];
    setImagenURL(`${BASE_STATIC}/${dificultad}/${mapa}`);
    const total = c.grid * c.grid;
    const idx = Array.from({ length: total }, (_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [idx[i],idx[j]]=[idx[j],idx[i]]; }
    setPiezas(idx);
    setTablero(Array(total).fill(null));
    setPistas(3);
    setFase("jugando");
  };

  const handleDropEnZona = (e, zonaIdx) => {
    e.preventDefault();
    if (!arrastrando) return;
    const nuevoPiezas = [...piezas];
    const nuevoTablero = [...tablero];
    const piezaId = arrastrando.id;
    const origen = arrastrando.origen;
    if (origen === "piezas") {
      if (nuevoTablero[zonaIdx] !== null) nuevoPiezas.push(nuevoTablero[zonaIdx]);
      nuevoTablero[zonaIdx] = piezaId;
      const i = nuevoPiezas.indexOf(piezaId);
      if (i !== -1) nuevoPiezas.splice(i, 1);
    } else {
      const orig = origen;
      nuevoTablero[orig] = nuevoTablero[zonaIdx] !== null ? nuevoTablero[zonaIdx] : null;
      nuevoTablero[zonaIdx] = piezaId;
    }
    setPiezas(nuevoPiezas);
    setTablero(nuevoTablero);
    setArrastrando(null);
    if (nuevoTablero.every((p, i) => p === i)) setTimeout(() => setFase("ganado"), 300);
  };

  const handleDropEnPiezas = (e) => {
    e.preventDefault();
    if (!arrastrando || arrastrando.origen === "piezas") return;
    const nuevoTablero = [...tablero];
    nuevoTablero[arrastrando.origen] = null;
    setTablero(nuevoTablero);
    setPiezas((prev) => [...prev, arrastrando.id]);
    setArrastrando(null);
  };

  const verPista = () => {
    if (pistas <= 0) { setMostrarAgotadas(true); return; }
    setPistas((p) => p - 1);
    setMostrarPista(true);
    setTimeout(() => setMostrarPista(false), 5000);
  };

  const fullSize = cfg.grid * cfg.piezaSize;

  const renderPieza = (piezaId, size) => {
    const col = piezaId % cfg.grid;
    const row = Math.floor(piezaId / cfg.grid);
    return (
      <div style={{ width: size, height: size, backgroundImage: `url(${imagenURL})`, backgroundSize: `${fullSize}px ${fullSize}px`, backgroundPosition: `${-col*size}px ${-row*size}px`, border: "2px solid rgba(255,255,255,0.25)", boxSizing: "border-box" }} />
    );
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.8rem" }}>🧩</span>
          <div>
            <h2 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.4rem", color: "#f7f5f0" }}>Mapa Roto</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "rgba(247,245,240,0.45)" }}>Arma el rompecabezas del sendero</p>
          </div>
        </div>
        <button onClick={onVolver} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, padding: "8px 16px", color: "rgba(247,245,240,0.65)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", cursor: "pointer" }}>← Volver</button>
      </div>

      {fase === "menu" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 14, animation: "float 3s ease-in-out infinite" }}>🗺️</div>
          <h3 style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: "1.3rem", color: "#f7f5f0", marginBottom: 8 }}>¿Puedes armar el mapa?</h3>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "rgba(247,245,240,0.5)", marginBottom: 32 }}>Reconstruye las rutas de Popayán pieza a pieza</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
            {[
              { key: "facil",   label: "Fácil",   sub: "3×3 · 9 piezas",  color: "#4caf50", n: MAPAS.facil.mapas.length },
              { key: "normal",  label: "Normal",  sub: "4×4 · 16 piezas", color: "#ff9800", n: MAPAS.normal.mapas.length },
              { key: "dificil", label: "Difícil", sub: "5×5 · 25 piezas", color: "#f44336", n: MAPAS.dificil.mapas.length },
            ].map((d) => (
              <button key={d.key} onClick={() => d.n > 0 && setDificultad(d.key)}
                style={{ padding: "18px 26px", background: dificultad === d.key ? `${d.color}22` : "rgba(255,255,255,0.07)", border: `2px solid ${dificultad === d.key ? d.color : "rgba(255,255,255,0.1)"}`, borderRadius: 8, cursor: d.n === 0 ? "not-allowed" : "pointer", opacity: d.n === 0 ? 0.4 : 1, transition: "all 0.2s", minWidth: 120 }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: dificultad === d.key ? d.color : "#f7f5f0", marginBottom: 4 }}>{d.label}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", color: "rgba(247,245,240,0.4)" }}>{d.n === 0 ? "Próximamente" : d.sub}</div>
              </button>
            ))}
          </div>
          <button onClick={iniciarJuego}
            style={{ padding: "13px 36px", background: "#b5d5a0", color: "#1a2e1a", border: "none", borderRadius: 4, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.25s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background="#f7f5f0"; e.currentTarget.style.transform="translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background="#b5d5a0"; e.currentTarget.style.transform="none"; }}>
            🎮 Comenzar
          </button>
        </div>
      )}

      {fase === "jugando" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(247,245,240,0.55)" }}>
              Correctas: <strong style={{ color: "#b5d5a0" }}>{tablero.filter((p,i)=>p===i).length}/{cfg.grid*cfg.grid}</strong>
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={verPista}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: pistas > 0 ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${pistas > 0 ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 4, color: pistas > 0 ? "#fbbf24" : "rgba(247,245,240,0.25)", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.8rem", cursor: pistas > 0 ? "pointer" : "not-allowed" }}>
                🔍 Pista ({pistas})
              </button>
              <button onClick={() => setFase("menu")}
                style={{ padding: "7px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 4, color: "rgba(247,245,240,0.5)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", cursor: "pointer" }}>
                ↩ Menú
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(181,213,160,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Tablero</p>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${cfg.grid},${cfg.piezaSize}px)`, gap: 2, background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 8 }}>
                {tablero.map((piezaId, zonaIdx) => (
                  <div key={zonaIdx}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background="rgba(181,213,160,0.15)"; }}
                    onDragLeave={(e) => { e.currentTarget.style.background="transparent"; }}
                    onDrop={(e) => { e.currentTarget.style.background="transparent"; handleDropEnZona(e, zonaIdx); }}
                    style={{ width: cfg.piezaSize, height: cfg.piezaSize, background: "transparent", border: `2px dashed ${piezaId === zonaIdx && piezaId !== null ? "rgba(76,175,80,0.5)" : "rgba(255,255,255,0.12)"}`, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transition: "background 0.15s" }}>
                    {piezaId !== null && (
                      <div draggable onDragStart={(e) => { setArrastrando({ id: piezaId, origen: zonaIdx }); e.dataTransfer.effectAllowed="move"; }}
                        style={{ cursor: "grab", width: "100%", height: "100%", outline: piezaId === zonaIdx ? "2px solid #4caf50" : "none" }}>
                        {renderPieza(piezaId, cfg.piezaSize)}
                        {piezaId === zonaIdx && <div style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, borderRadius: "50%", background: "#4caf50", boxShadow: "0 0 5px #4caf50" }} />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 180 }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(181,213,160,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Piezas ({piezas.length})</p>
              <div onDragOver={(e) => e.preventDefault()} onDrop={handleDropEnPiezas}
                style={{ minHeight: 110, background: "rgba(255,255,255,0.04)", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 8, padding: 8, display: "flex", flexWrap: "wrap", gap: 4, alignContent: "flex-start" }}>
                {piezas.map((piezaId) => (
                  <div key={piezaId} draggable onDragStart={(e) => { setArrastrando({ id: piezaId, origen: "piezas" }); e.dataTransfer.effectAllowed="move"; }}
                    style={{ cursor: "grab", border: "2px solid rgba(255,255,255,0.18)", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                    {renderPieza(piezaId, cfg.piezaSize)}
                  </div>
                ))}
                {piezas.length === 0 && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: "rgba(247,245,240,0.25)", padding: "12px", width: "100%", textAlign: "center" }}>Todas en el tablero</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {fase === "ganado" && (
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 14, animation: "float 3s ease-in-out infinite" }}>🎉</div>
          <h3 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "2rem", color: "#f7f5f0", marginBottom: 8 }}>¡Felicidades!</h3>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, color: "rgba(247,245,240,0.55)", marginBottom: 24 }}>Completaste el rompecabezas · nivel {dificultad}</p>
          <img src={imagenURL} alt="Mapa completo" style={{ maxWidth: 300, borderRadius: 8, marginBottom: 24, boxShadow: "0 12px 40px rgba(0,0,0,0.35)" }} />
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={iniciarJuego} style={{ padding: "11px 24px", background: "#b5d5a0", color: "#1a2e1a", border: "none", borderRadius: 4, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, cursor: "pointer" }}>🔄 Otro mapa</button>
            <button onClick={() => setFase("menu")} style={{ padding: "11px 20px", background: "rgba(255,255,255,0.09)", color: "#f7f5f0", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, cursor: "pointer" }}>Cambiar nivel</button>
          </div>
        </div>
      )}

      {mostrarPista && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setMostrarPista(false)}>
          <div style={{ background: "#1a2e1a", borderRadius: 8, padding: 8, animation: "fadeUp 0.3s ease" }}>
            <img src={imagenURL} alt="Pista" style={{ maxWidth: "80vw", maxHeight: "68vh", borderRadius: 6, display: "block" }} />
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "rgba(247,245,240,0.4)", textAlign: "center", marginTop: 8 }}>Cierra en 5s · Clic para cerrar</p>
          </div>
        </div>
      )}

      {mostrarAgotadas && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setMostrarAgotadas(false)}>
          <div style={{ background: "#fff", borderRadius: 8, padding: "28px 36px", textAlign: "center", maxWidth: 320, animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>🔍</div>
            <h3 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.1rem", color: "#1a2e1a", marginBottom: 8 }}>¡Pistas agotadas!</h3>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, color: "#6a7a6a", marginBottom: 18 }}>No quedan más pistas para este nivel.</p>
            <button onClick={() => setMostrarAgotadas(false)} style={{ padding: "9px 22px", background: "#2d5a27", color: "#f7f5f0", border: "none", borderRadius: 4, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer" }}>Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// TRIVIA
// ═══════════════════════════════════════════
function TriviaJuego({ categoria, onFinalizar }) {
  const preguntas = PREGUNTAS[categoria.key];
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [tiempo, setTiempo] = useState(20);
  const [tiempoInicio] = useState(Date.now());
  const timerRef = useRef(null);
  const pregunta = preguntas[indice];

  const avanzar = useCallback((opcion) => {
    clearInterval(timerRef.current);
    const correcta = opcion === pregunta.correcta;
    const nuevas = [...respuestas, { correcta }];
    setRespuestas(nuevas);
    setSeleccionada(opcion);
    setMostrarRespuesta(true);
    setTimeout(() => {
      if (indice + 1 >= preguntas.length) {
        const duracion = Math.round((Date.now() - tiempoInicio) / 1000);
        const correctas = nuevas.filter((r) => r.correcta).length;
        onFinalizar({ correctas, incorrectas: preguntas.length - correctas, duracion });
      } else {
        setIndice((i) => i + 1);
        setSeleccionada(null);
        setMostrarRespuesta(false);
        setTiempo(20);
      }
    }, 1200);
  }, [indice, pregunta, preguntas, respuestas, tiempoInicio, onFinalizar]);

  useEffect(() => {
    setTiempo(20);
    timerRef.current = setInterval(() => {
      setTiempo((t) => { if (t <= 1) { clearInterval(timerRef.current); avanzar(null); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [indice]);

  const pct = (tiempo / 20) * 100;
  const tc = tiempo > 10 ? "#4caf50" : tiempo > 5 ? "#ff9800" : "#f44336";

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.2rem" }}>{categoria.emoji}</span>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(247,245,240,0.55)" }}>{categoria.label}</span>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {preguntas.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < indice ? (respuestas[i]?.correcta ? "#4caf50" : "#f44336") : i === indice ? "#f7f5f0" : "rgba(247,245,240,0.18)" }} />
          ))}
        </div>
        <div style={{ position: "relative", width: 42, height: 42 }}>
          <svg width="42" height="42" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="21" cy="21" r="17" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle cx="21" cy="21" r="17" fill="none" stroke={tc} strokeWidth="3" strokeDasharray={`${2*Math.PI*17}`} strokeDashoffset={`${2*Math.PI*17*(1-pct/100)}`} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear,stroke 0.3s" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "0.8rem", color: tc }}>{tiempo}</div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.66rem", color: "rgba(181,213,160,0.55)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Pregunta {indice+1} de {preguntas.length}</div>
        <p style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: "1.05rem", color: "#f7f5f0", lineHeight: 1.6 }}>{pregunta.pregunta}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {pregunta.opciones.map((opcion, i) => {
          let bg = "rgba(255,255,255,0.07)"; let border = "1px solid rgba(255,255,255,0.1)"; let color = "#f7f5f0";
          if (mostrarRespuesta) {
            if (i === pregunta.correcta) { bg="rgba(76,175,80,0.18)"; border="1px solid #4caf50"; color="#a5d6a7"; }
            else if (i === seleccionada) { bg="rgba(244,67,54,0.16)"; border="1px solid #f44336"; color="#ef9a9a"; }
            else { bg="rgba(255,255,255,0.02)"; color="rgba(247,245,240,0.22)"; }
          }
          return (
            <button key={i} onClick={() => !mostrarRespuesta && avanzar(i)} disabled={mostrarRespuesta}
              style={{ background: bg, border, borderRadius: 6, padding: "12px 14px", cursor: mostrarRespuesta?"default":"pointer", textAlign: "left", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}
              onMouseEnter={(e) => { if (!mostrarRespuesta) e.currentTarget.style.background="rgba(255,255,255,0.13)"; }}
              onMouseLeave={(e) => { if (!mostrarRespuesta) e.currentTarget.style.background=bg; }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.68rem", color, flexShrink: 0 }}>{["A","B","C","D"][i]}</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, fontSize: "0.82rem", color, lineHeight: 1.4 }}>{opcion}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Trivia({ user, stats, onVolver, onActualizarStats }) {
  const [pantalla, setPantalla] = useState("menu"); // menu | jugando | resultado_cat | final
  const [categoria, setCategoria] = useState(null);
  const [completadas, setCompletadas] = useState({}); // { key: { correctas, incorrectas, puntos } }
  const [puntajeTotal, setPuntajeTotal] = useState(0);
  const [resultadoCat, setResultadoCat] = useState(null);
  const [guardadoFinal, setGuardadoFinal] = useState(false);

  const todasCompletadas = CATEGORIAS.every((c) => completadas[c.key]);
  const categoriasPendientes = CATEGORIAS.filter((c) => !completadas[c.key]);

  const handleSeleccionar = (cat) => {
    if (completadas[cat.key]) return;
    setCategoria(cat);
    setPantalla("jugando");
  };

  const handleFinalizar = async (res) => {
    const puntosCategoria = res.correctas * 100;
    const nuevasCompletadas = {
      ...completadas,
      [categoria.key]: { correctas: res.correctas, incorrectas: res.incorrectas, puntos: puntosCategoria, duracion: res.duracion },
    };
    const nuevoTotal = Object.values(nuevasCompletadas).reduce((acc, c) => acc + c.puntos, 0);
    setCompletadas(nuevasCompletadas);
    setPuntajeTotal(nuevoTotal);
    setResultadoCat({ ...res, puntos: puntosCategoria });
    setPantalla("resultado_cat");

    // Guardar en Django por categoría
    try {
      await api.post("/api/juegos/guardar-resultado/", {
        categoria: categoria.key,
        puntos: puntosCategoria,
        respuestas_correctas: res.correctas,
        respuestas_incorrectas: res.incorrectas,
        duracion_segundos: res.duracion,
      });
      onActualizarStats();
    } catch {}
  };

  const handleReiniciar = () => {
    setCompletadas({});
    setPuntajeTotal(0);
    setResultadoCat(null);
    setCategoria(null);
    setGuardadoFinal(false);
    setPantalla("menu");
  };

  const emojis = ["💪","🥉","🥈","🥇","🥇","🏆"];
  const labels = ["¡Sigue practicando!","Bien","¡Muy bien!","¡Excelente!","¡Perfecto!","¡Perfecto!"];
  const colors = ["#9e9e9e","#cd7f32","#9e9e9e","#4caf50","#f6d365","#f6d365"];

  // Calificación final basada en puntaje total (máx 3000)
  const pctFinal = Math.round((puntajeTotal / 3000) * 100);
  const emojiFinal = pctFinal === 100 ? "🏆" : pctFinal >= 80 ? "🥇" : pctFinal >= 60 ? "🥈" : pctFinal >= 40 ? "🥉" : "💪";
  const labelFinal = pctFinal === 100 ? "¡Maestro Senderista!" : pctFinal >= 80 ? "¡Excelente resultado!" : pctFinal >= 60 ? "¡Muy bien!" : pctFinal >= 40 ? "Buen intento" : "¡Sigue practicando!";

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.6rem" }}>🧠</span>
          <div>
            <h2 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.4rem", color: "#f7f5f0" }}>Trivia Senderista</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "rgba(247,245,240,0.45)" }}>
              {Object.keys(completadas).length}/{CATEGORIAS.length} categorías · {puntajeTotal} pts acumulados
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.keys(completadas).length > 0 && pantalla === "menu" && (
            <button onClick={handleReiniciar}
              style={{ background: "rgba(244,67,54,0.12)", border: "1px solid rgba(244,67,54,0.25)", borderRadius: 4, padding: "7px 14px", color: "#ef9a9a", fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", cursor: "pointer" }}>
              🔄 Reiniciar
            </button>
          )}
          <button onClick={onVolver} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, padding: "8px 16px", color: "rgba(247,245,240,0.65)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", cursor: "pointer" }}>← Volver</button>
        </div>
      </div>

      {/* BARRA DE PROGRESO GLOBAL */}
      {Object.keys(completadas).length > 0 && pantalla === "menu" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "rgba(181,213,160,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Progreso total</span>
            <span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "0.88rem", color: "#b5d5a0" }}>{puntajeTotal} / 3000 pts</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(puntajeTotal/3000)*100}%`, background: "linear-gradient(to right, #4a7c59, #b5d5a0)", borderRadius: 4, transition: "width 0.6s ease" }} />
          </div>
        </div>
      )}

      {/* MENU DE CATEGORÍAS */}
      {pantalla === "menu" && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          {user && stats && (
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(181,213,160,0.12)", borderRadius: 6, padding: "12px 18px", marginBottom: 18, display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[{l:"Partidas",v:stats.total_juegos},{l:"Mejor",v:`${stats.mejor_puntaje} pts`},{l:"Acierto",v:`${stats.tasa_acierto}%`}].map((s) => (
                <div key={s.l} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.15rem", color: "#f7f5f0" }}>{s.v}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem", color: "rgba(247,245,240,0.38)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.l}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 10 }}>
            {CATEGORIAS.map((cat) => {
              const done = completadas[cat.key];
              const disabled = !!done;
              return (
                <button key={cat.key} onClick={() => handleSeleccionar(cat)} disabled={disabled}
                  style={{
                    background: done ? "rgba(76,175,80,0.12)" : "rgba(255,255,255,0.07)",
                    border: `1px solid ${done ? "rgba(76,175,80,0.35)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 6, padding: "16px 12px", cursor: disabled ? "default" : "pointer",
                    textAlign: "center", transition: "all 0.2s", position: "relative", opacity: disabled ? 0.75 : 1,
                  }}
                  onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background="rgba(255,255,255,0.14)"; e.currentTarget.style.transform="translateY(-3px)"; } }}
                  onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.transform="none"; } }}>
                  {/* Badge completada */}
                  {done && (
                    <div style={{ position: "absolute", top: 6, right: 6, background: "#4caf50", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem" }}>✓</div>
                  )}
                  <div style={{ fontSize: "1.7rem", marginBottom: 7 }}>{cat.emoji}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.82rem", color: "#f7f5f0", marginBottom: done ? 4 : 0 }}>{cat.label}</div>
                  {done && (
                    <div style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "0.9rem", color: done.puntos === 500 ? "#f6d365" : done.puntos >= 300 ? "#4caf50" : "#9e9e9e" }}>
                      {done.puntos} pts
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Botón ver resultado final si todas completadas */}
          {todasCompletadas && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button onClick={() => setPantalla("final")}
                style={{ padding: "13px 32px", background: "linear-gradient(135deg,#f6d365,#fda085)", color: "#1a2e1a", border: "none", borderRadius: 4, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 8px 24px rgba(246,211,101,0.3)", transition: "all 0.25s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(246,211,101,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 8px 24px rgba(246,211,101,0.3)"; }}>
                🏆 Ver resultado final
              </button>
            </div>
          )}
        </div>
      )}

      {/* JUGANDO */}
      {pantalla === "jugando" && categoria && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          <TriviaJuego categoria={categoria} onFinalizar={handleFinalizar} />
        </div>
      )}

      {/* RESULTADO POR CATEGORÍA */}
      {pantalla === "resultado_cat" && resultadoCat && categoria && (
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
          <div style={{ fontSize: "2.8rem", marginBottom: 10, animation: "float 3s ease-in-out infinite" }}>{emojis[resultadoCat.correctas]}</div>
          <h3 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.6rem", color: "#f7f5f0", marginBottom: 4 }}>{labels[resultadoCat.correctas]}</h3>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, color: "rgba(247,245,240,0.45)", marginBottom: 20 }}>{categoria.label} · {resultadoCat.duracion}s</p>

          {/* Puntaje de esta categoría */}
          <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "20px", display: "inline-block", minWidth: 220, marginBottom: 16 }}>
            <div style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "2.5rem", color: colors[resultadoCat.correctas], lineHeight: 1 }}>{resultadoCat.puntos}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.66rem", color: "rgba(247,245,240,0.35)", textTransform: "uppercase", marginBottom: 12 }}>puntos esta categoría</div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <div><div style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.2rem", color: "#4caf50" }}>{resultadoCat.correctas}</div><div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.62rem", color: "rgba(247,245,240,0.3)" }}>Correctas</div></div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
              <div><div style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.2rem", color: "#f44336" }}>{resultadoCat.incorrectas}</div><div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.62rem", color: "rgba(247,245,240,0.3)" }}>Incorrectas</div></div>
            </div>
          </div>

          {/* Acumulado */}
          <div style={{ background: "rgba(181,213,160,0.1)", border: "1px solid rgba(181,213,160,0.2)", borderRadius: 6, padding: "12px 20px", marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(247,245,240,0.6)" }}>Total acumulado:</span>
            <span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.2rem", color: "#b5d5a0" }}>{puntajeTotal} pts</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "rgba(247,245,240,0.4)" }}>({Object.keys(completadas).length}/{CATEGORIAS.length} categorías)</span>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {todasCompletadas ? (
              <button onClick={() => setPantalla("final")}
                style={{ padding: "11px 28px", background: "linear-gradient(135deg,#f6d365,#fda085)", color: "#1a2e1a", border: "none", borderRadius: 4, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(246,211,101,0.3)" }}>
                🏆 Ver resultado final
              </button>
            ) : (
              <button onClick={() => { setCategoria(null); setPantalla("menu"); }}
                style={{ padding: "11px 24px", background: "#b5d5a0", color: "#1a2e1a", border: "none", borderRadius: 4, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, cursor: "pointer" }}>
                Siguiente categoría →
              </button>
            )}
          </div>
        </div>
      )}

      {/* RESULTADO FINAL — todas las categorías completadas */}
      {pantalla === "final" && (
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
          <div style={{ fontSize: "4rem", marginBottom: 12, animation: "float 3s ease-in-out infinite" }}>{emojiFinal}</div>
          <h3 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "2rem", color: "#f7f5f0", marginBottom: 6 }}>{labelFinal}</h3>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, color: "rgba(247,245,240,0.5)", marginBottom: 24 }}>Completaste las 6 categorías</p>

          {/* Puntaje total grande */}
          <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "28px 40px", display: "inline-block", marginBottom: 24 }}>
            <div style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "4rem", color: "#f6d365", lineHeight: 1 }}>{puntajeTotal}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "rgba(247,245,240,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>puntos totales · máx 3000</div>
            {/* Barra */}
            <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden", width: 220, margin: "0 auto" }}>
              <div style={{ height: "100%", width: `${pctFinal}%`, background: "linear-gradient(to right,#f6d365,#4caf50)", borderRadius: 4 }} />
            </div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: "rgba(247,245,240,0.5)", marginTop: 8 }}>{pctFinal}% de acierto</div>
          </div>

          {/* Resumen por categoría */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 24, maxWidth: 440, margin: "0 auto 24px" }}>
            {CATEGORIAS.map((cat) => {
              const r = completadas[cat.key];
              return (
                <div key={cat.key} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.1rem", marginBottom: 4 }}>{cat.emoji}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem", color: "rgba(247,245,240,0.45)", marginBottom: 3 }}>{cat.label}</div>
                  <div style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "0.95rem", color: r?.puntos === 500 ? "#f6d365" : r?.puntos >= 300 ? "#4caf50" : "#9e9e9e" }}>{r?.puntos || 0}</div>
                </div>
              );
            })}
          </div>

          {!user && (
            <div style={{ background: "rgba(181,213,160,0.07)", border: "1px solid rgba(181,213,160,0.14)", borderRadius: 4, padding: "9px 14px", marginBottom: 16, fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(247,245,240,0.55)" }}>
              💡 <Link to="/login" style={{ color: "#b5d5a0", fontWeight: 600 }}>Inicia sesión</Link> para guardar tu puntaje en el ranking
            </div>
          )}

          <button onClick={handleReiniciar}
            style={{ padding: "12px 32px", background: "#b5d5a0", color: "#1a2e1a", border: "none", borderRadius: 4, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
            🔄 Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════
export default function Juegos() {
  const [user, setUser] = useState(null);
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [stats, setStats] = useState(null);
  const [ultimos, setUltimos] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) try { setUser(JSON.parse(u)); } catch {}
  }, []);

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await api.get("/api/juegos/estadisticas/");
      setStats(res.data.estadisticas);
      setUltimos(res.data.ultimos_juegos);
    } catch {}
  }, []);

  useEffect(() => { if (user) fetchStats(); }, [user, fetchStats]);

  return (
    <div style={{ fontFamily: "'Lora',Georgia,serif", background: "#f7f5f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      `}</style>

      <Navbar />

      <div style={{ background: "linear-gradient(160deg,#0d1f0d 0%,#1e3d1a 55%,#2d5a27 100%)", paddingTop: 90, paddingBottom: 0, minHeight: juegoActivo ? "auto" : "60vh", position: "relative", overflow: "hidden" }}>
        {[...Array(3)].map((_,i) => (
          <div key={i} style={{ position:"absolute", borderRadius:"50%", pointerEvents:"none", width:[300,180,240][i], height:[300,180,240][i], background:`rgba(181,213,160,${[0.04,0.06,0.03][i]})`, top:["-15%","35%","5%"][i], left:["-5%","68%","38%"][i] }} />
        ))}

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 32px 52px", position: "relative" }}>

          {!juegoActivo && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={{ textAlign: "center", marginBottom: 44 }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, fontSize: "0.75rem", letterSpacing: "0.25em", color: "#b5d5a0", textTransform: "uppercase", marginBottom: 12 }}>Zona de juegos</div>
                <h1 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#f7f5f0", lineHeight: 1.2, marginBottom: 10 }}>
                  Aprende jugando<br /><em style={{ color: "#b5d5a0" }}>los senderos</em>
                </h1>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, color: "rgba(247,245,240,0.5)", fontSize: "0.9rem" }}>Dos juegos para conocer Popayán y sus rutas</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 620, margin: "0 auto 32px" }}>
                {[
                  { key: "trivia", emoji: "🧠", titulo: "Trivia Senderista", sub: "6 categorías · 5 preguntas · 100 pts c/u", delay: "0s" },
                  { key: "mapa",   emoji: "🧩", titulo: "Mapa Roto",         sub: "Rompecabezas · 3 dificultades · 3 pistas", delay: "0.1s" },
                ].map((j) => (
                  <button key={j.key} onClick={() => setJuegoActivo(j.key)}
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(181,213,160,0.18)", borderRadius: 12, padding: "32px 24px", cursor: "pointer", textAlign: "center", transition: "all 0.25s", animation: `fadeUp 0.5s ease ${j.delay} both` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.13)"; e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.boxShadow="0 16px 40px rgba(0,0,0,0.22)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                    <div style={{ fontSize: "2.8rem", marginBottom: 12, animation: `float 3s ease-in-out ${j.delay} infinite` }}>{j.emoji}</div>
                    <h3 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.2rem", color: "#f7f5f0", marginBottom: 8 }}>{j.titulo}</h3>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "rgba(247,245,240,0.45)", lineHeight: 1.6, marginBottom: 16 }}>{j.sub}</p>
                    <span style={{ background: "rgba(181,213,160,0.13)", border: "1px solid rgba(181,213,160,0.22)", borderRadius: 20, padding: "4px 14px", fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", fontWeight: 600, color: "#b5d5a0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Jugar →</span>
                  </button>
                ))}
              </div>

              {user && ultimos.length > 0 && (
                <div style={{ maxWidth: 620, margin: "0 auto", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(181,213,160,0.1)", borderRadius: 8, padding: "18px 22px" }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(181,213,160,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Últimas partidas de trivia</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {ultimos.slice(0,4).map((j) => {
                      const cat = CATEGORIAS.find((c) => c.key === j.categoria_key) || {};
                      return (
                        <div key={j.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "8px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: "0.9rem" }}>{cat.emoji || "🎮"}</span>
                            <div>
                              <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "0.78rem", color: "#f7f5f0" }}>{j.categoria}</div>
                              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem", color: "rgba(247,245,240,0.3)" }}>{j.fecha}</div>
                            </div>
                          </div>
                          <span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "0.88rem", color: j.puntos===500?"#f6d365":j.puntos>=300?"#4caf50":"#9e9e9e" }}>{j.puntos} pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {juegoActivo && (
            <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(181,213,160,0.14)", borderRadius: 12, padding: "36px 40px" }}>
              {juegoActivo === "trivia" && <Trivia user={user} stats={stats} onVolver={() => setJuegoActivo(null)} onActualizarStats={fetchStats} />}
              {juegoActivo === "mapa"   && <MapaRoto onVolver={() => setJuegoActivo(null)} />}
            </div>
          )}
        </div>
      </div>

      {!juegoActivo && (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {[
              { emoji: "🧠", titulo: "Trivia Senderista", desc: "Pon a prueba tu conocimiento sobre rutas, equipos, seguridad, flora y fauna, técnicas y lugares icónicos del Cauca. Acumula puntos y sube en el ranking.", tags: ["6 categorías","Puntos para ranking","Historial de partidas"] },
              { emoji: "🧩", titulo: "Mapa Roto", desc: "Reconstruye los mapas de las rutas reales de Popayán pieza a pieza. Tres niveles con 9, 16 y 25 piezas. Usa tus 3 pistas sabiamente.", tags: ["Drag & Drop","3 dificultades","Rutas reales"] },
            ].map((j) => (
              <div key={j.titulo} style={{ background: "#fff", borderRadius: 8, padding: "26px", border: "1px solid rgba(74,124,89,0.1)", boxShadow: "0 2px 12px rgba(26,46,26,0.05)" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>{j.emoji}</div>
                <h3 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.05rem", color: "#1a2e1a", marginBottom: 8 }}>{j.titulo}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, fontSize: "0.82rem", color: "#6a7a6a", lineHeight: 1.7, marginBottom: 14 }}>{j.desc}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {j.tags.map((t) => <span key={t} style={{ background: "#f0f7ee", color: "#2d5a27", fontSize: "0.68rem", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: "3px 9px", borderRadius: 20, border: "1px solid rgba(74,124,89,0.13)" }}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}