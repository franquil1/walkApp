import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../axiosConfig";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MEDALLAS = ["🥇", "🥈", "🥉"];
const POSICION_COLORS = {
  1: { bg: "linear-gradient(135deg, #f6d365, #fda085)", border: "#f6d365", text: "#7a4a00" },
  2: { bg: "linear-gradient(135deg, #e0e0e0, #bdbdbd)", border: "#e0e0e0", text: "#424242" },
  3: { bg: "linear-gradient(135deg, #cd7f32, #a0522d)", border: "#cd7f32", text: "#fff" },
};

function AvatarIcon({ username, size = 44, fontSize = "1.1rem", pos }) {
  const colors = [
    ["#2d5a27", "#b5d5a0"], ["#1e3d2f", "#4a7c59"],
    ["#0d2a1a", "#3a6b4a"], ["#1a3a2a", "#5a8a6a"],
    ["#3a2a0d", "#a0784a"],
  ];
  const idx = username ? username.charCodeAt(0) % colors.length : 0;
  const [from, to] = colors[idx];
  const posColor = pos && POSICION_COLORS[pos];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: posColor ? posColor.bg : `linear-gradient(135deg, ${from}, ${to})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Lora', serif", fontWeight: 700, fontSize, color: posColor ? posColor.text : "#f7f5f0",
      flexShrink: 0,
      boxShadow: pos === 1 ? "0 0 0 3px #f6d365, 0 8px 20px rgba(246,211,101,0.4)"
        : pos === 2 ? "0 0 0 3px #bdbdbd, 0 8px 20px rgba(189,189,189,0.3)"
        : pos === 3 ? "0 0 0 3px #cd7f32, 0 8px 20px rgba(205,127,50,0.3)"
        : "0 4px 12px rgba(26,46,26,0.2)",
    }}>
      {username ? username[0].toUpperCase() : "?"}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", background: "#fff", borderRadius: 6, marginBottom: 8 }}>
      <div style={{ width: 32, height: 20, background: "#f0ede6", borderRadius: 4, animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#f0ede6", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 14, width: "40%", background: "#f0ede6", borderRadius: 4, marginBottom: 8, animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
        <div style={{ height: 12, width: "25%", background: "#f0ede6", borderRadius: 4, animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
      </div>
      <div style={{ height: 20, width: 60, background: "#f0ede6", borderRadius: 4, animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
    </div>
  );
}

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [misStats, setMisStats] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoStats, setCargandoStats] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("semanal");
  const [buscar, setBuscar] = useState("");
  const [miPosicion, setMiPosicion] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) try { setUser(JSON.parse(u)); } catch {}
  }, []);

  const fetchRanking = useCallback(async () => {
    try {
      const res = await api.get("/api/ranking-completo/");
      setRanking(Array.isArray(res.data) ? res.data : []);
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        const found = res.data.find((r) => r.username === parsed.username);
        if (found) setMiPosicion(found.posicion);
      }
    } catch (e) {
      if (e.response?.status === 401) {
        setError("Inicia sesión para ver el ranking.");
      } else {
        setError("No se pudo cargar el ranking.");
      }
    } finally {
      setCargando(false);
    }
  }, []);

  const fetchMisStats = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      setCargandoStats(true);
      const res = await api.get("/api/estadisticas-usuario/");
      setMisStats(res.data);
    } catch {} finally { setCargandoStats(false); }
  }, []);

  useEffect(() => {
    fetchRanking();
    fetchMisStats();
    intervalRef.current = setInterval(() => { fetchRanking(); fetchMisStats(); }, 15000);
    return () => clearInterval(intervalRef.current);
  }, [fetchRanking, fetchMisStats]);

  const rankingFiltrado = ranking.filter((r) =>
    r.username.toLowerCase().includes(buscar.toLowerCase()) ||
    r.nombre_completo?.toLowerCase().includes(buscar.toLowerCase())
  );

  const top3 = ranking.slice(0, 3);

  return (
    <div style={{ fontFamily: "'Lora', Georgia, serif", background: "#f7f5f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes podiumRise { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .tab-btn { padding: 10px 22px; border: none; background: none; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500; cursor: pointer; color: rgba(247,245,240,0.5); border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab-btn.active { color: #b5d5a0; border-bottom-color: #b5d5a0; }
        .ranking-row { display: flex; align-items: center; gap: 16px; padding: 14px 24px; background: #fff; border-radius: 6px; margin-bottom: 8px; border: 1px solid rgba(74,124,89,0.08); transition: all 0.25s; cursor: default; }
        .ranking-row:hover { box-shadow: 0 6px 24px rgba(26,46,26,0.1); transform: translateX(4px); }
        .ranking-row.yo { border: 1.5px solid rgba(74,124,89,0.4); background: linear-gradient(to right, rgba(181,213,160,0.08), #fff); }
        input:focus { outline: none; border-color: #4a7c59 !important; box-shadow: 0 0 0 3px rgba(74,124,89,0.1); }
      `}</style>

      <Navbar />

      {/* HERO */}
      <div style={{ background: "linear-gradient(160deg, #0d1f0d 0%, #1e3d1a 50%, #2d5a27 100%)", paddingTop: 110, paddingBottom: 0, position: "relative", overflow: "hidden" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", width: [350,200,280,150][i], height: [350,200,280,150][i], background: `rgba(181,213,160,${[0.04,0.06,0.03,0.07][i]})`, top: ["-20%","30%","10%","60%"][i], left: ["-5%","70%","40%","15%"][i] }} />
        ))}

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px" }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.8rem", letterSpacing: "0.25em", color: "#b5d5a0", textTransform: "uppercase", marginBottom: 12 }}>
              Clasificación semanal
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
              <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#f7f5f0", lineHeight: 1.15 }}>
                🏆 Ranking de <em style={{ color: "#b5d5a0" }}>Caminantes</em>
              </h1>
              {miPosicion && (
                <div style={{ background: "rgba(181,213,160,0.12)", border: "1px solid rgba(181,213,160,0.25)", borderRadius: 6, padding: "12px 20px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(181,213,160,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Tu posición</div>
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "2rem", color: "#f7f5f0", lineHeight: 1 }}>#{miPosicion}</div>
                </div>
              )}
            </div>
          </div>

          {/* PODIO */}
          {!cargando && !error && top3.length > 0 && (
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 16, marginBottom: 0 }}>
              {top3[1] && (
                <div style={{ textAlign: "center", animation: "podiumRise 0.6s ease 0.1s both" }}>
                  <AvatarIcon username={top3[1].username} size={64} fontSize="1.6rem" pos={2} />
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", color: "#f7f5f0", marginTop: 10, marginBottom: 4 }}>{top3[1].username}</div>
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.1rem", color: "#b5d5a0", marginBottom: 8 }}>{top3[1].puntos_semanales?.toLocaleString()} pts</div>
                  <div style={{ background: "linear-gradient(to top, rgba(189,189,189,0.3), rgba(189,189,189,0.1))", border: "1px solid rgba(189,189,189,0.3)", borderBottom: "none", borderRadius: "6px 6px 0 0", height: 80, width: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "2rem" }}>🥈</span>
                  </div>
                </div>
              )}
              {top3[0] && (
                <div style={{ textAlign: "center", animation: "podiumRise 0.6s ease both" }}>
                  <AvatarIcon username={top3[0].username} size={80} fontSize="2rem" pos={1} />
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#f7f5f0", marginTop: 12, marginBottom: 4 }}>{top3[0].username}</div>
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.3rem", color: "#f6d365", marginBottom: 8 }}>{top3[0].puntos_semanales?.toLocaleString()} pts</div>
                  <div style={{ background: "linear-gradient(to top, rgba(246,211,101,0.3), rgba(246,211,101,0.1))", border: "1px solid rgba(246,211,101,0.4)", borderBottom: "none", borderRadius: "6px 6px 0 0", height: 110, width: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "2.5rem" }}>🥇</span>
                  </div>
                </div>
              )}
              {top3[2] && (
                <div style={{ textAlign: "center", animation: "podiumRise 0.6s ease 0.2s both" }}>
                  <AvatarIcon username={top3[2].username} size={56} fontSize="1.3rem" pos={3} />
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.82rem", color: "#f7f5f0", marginTop: 10, marginBottom: 4 }}>{top3[2].username}</div>
                  <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1rem", color: "#cd7f32", marginBottom: 8 }}>{top3[2].puntos_semanales?.toLocaleString()} pts</div>
                  <div style={{ background: "linear-gradient(to top, rgba(205,127,50,0.3), rgba(205,127,50,0.1))", border: "1px solid rgba(205,127,50,0.3)", borderBottom: "none", borderRadius: "6px 6px 0 0", height: 60, width: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.8rem" }}>🥉</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", marginTop: 8, borderTop: "1px solid rgba(181,213,160,0.1)" }}>
            {[{ key: "semanal", label: "📅 Semanal" }, { key: "total", label: "🏆 Total" }].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`tab-btn ${tab === t.key ? "active" : ""}`}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 48px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start" }}>
          <div>
            <div style={{ marginBottom: 20, position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "0.95rem", pointerEvents: "none" }}>🔍</span>
              <input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar caminante..."
                style={{ width: "100%", padding: "11px 16px 11px 40px", border: "1.5px solid rgba(74,124,89,0.2)", borderRadius: 4, fontSize: "0.9rem", color: "#1a2e1a", background: "#fff", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }} />
            </div>

            {error && (
              <div style={{ textAlign: "center", padding: "60px 40px", background: "#fff", borderRadius: 6, border: "1px solid rgba(74,124,89,0.1)" }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: "1.3rem", color: "#1a2e1a", marginBottom: 8 }}>Inicia sesión para ver el ranking</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: "#6a7a6a", marginBottom: 24 }}>El ranking está disponible para usuarios registrados.</p>
                <Link to="/login" style={{ padding: "12px 28px", background: "#2d5a27", color: "#f7f5f0", textDecoration: "none", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Iniciar Sesión</Link>
              </div>
            )}

            {cargando && !error && [...Array(8)].map((_, i) => <SkeletonRow key={i} />)}

            {!cargando && !error && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px 80px 80px", gap: 8, padding: "8px 24px", marginBottom: 8 }}>
                  {["#", "Caminante", "Puntos", "Km", "Días"].map((h) => (
                    <div key={h} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "#9a9a9a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
                  ))}
                </div>

                {rankingFiltrado.length === 0 && (
                  <div style={{ textAlign: "center", padding: "48px", background: "#fff", borderRadius: 6 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#6a7a6a" }}>No se encontraron resultados para "{buscar}"</p>
                  </div>
                )}

                {rankingFiltrado.map((entry, i) => {
                  const esYo = user && entry.username === user.username;
                  const puntos = entry.puntos_semanales;
                  return (
                    <div key={entry.username} className={`ranking-row ${esYo ? "yo" : ""}`}
                      style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px 80px 80px", gap: 8, alignItems: "center",
                        background: entry.posicion <= 3 ? `linear-gradient(to right, ${["rgba(246,211,101,0.06)","rgba(189,189,189,0.06)","rgba(205,127,50,0.06)"][entry.posicion-1]}, #fff)` : esYo ? "linear-gradient(to right, rgba(181,213,160,0.1), #fff)" : "#fff",
                        border: esYo ? "1.5px solid rgba(74,124,89,0.3)" : "1px solid rgba(74,124,89,0.08)",
                        animation: `fadeUp 0.4s ease ${i * 0.03}s both`,
                      }}>
                      <div style={{ textAlign: "center" }}>
                        {entry.posicion <= 3
                          ? <span style={{ fontSize: "1.4rem" }}>{MEDALLAS[entry.posicion - 1]}</span>
                          : <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1rem", color: "#9a9a9a" }}>#{entry.posicion}</span>
                        }
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <AvatarIcon username={entry.username} size={40} fontSize="1rem" pos={entry.posicion <= 3 ? entry.posicion : null} />
                        <div>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.92rem", color: "#1a2e1a", display: "flex", alignItems: "center", gap: 6 }}>
                            {entry.username}
                            {esYo && <span style={{ background: "#2d5a27", color: "#f7f5f0", fontSize: "0.6rem", fontWeight: 700, padding: "2px 7px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tú</span>}
                          </div>
                          {entry.nombre_completo?.trim() && (
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "#9a9a9a" }}>{entry.nombre_completo}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "0.95rem", color: entry.posicion === 1 ? "#c8960c" : entry.posicion === 2 ? "#757575" : entry.posicion === 3 ? "#a0522d" : "#2d5a27" }}>
                        {puntos?.toLocaleString() || 0}
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#4a5a4a" }}>{entry.distancia_km?.toFixed(1) || "0.0"}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#4a5a4a" }}>{entry.dias_activos || 0}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {!error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf50", animation: "pulse 2s infinite" }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#9a9a9a" }}>Actualiza cada 15 segundos</span>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ position: "sticky", top: 90 }}>
            {user && (
              <div style={{ background: "#fff", borderRadius: 6, padding: "24px", border: "1px solid rgba(74,124,89,0.1)", boxShadow: "0 2px 12px rgba(26,46,26,0.06)", marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
                <h3 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.05rem", color: "#1a2e1a", marginBottom: 18 }}>📊 Mis estadísticas</h3>
                {cargandoStats ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ width: 28, height: 28, border: "2px solid rgba(74,124,89,0.2)", borderTop: "2px solid #4a7c59", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                  </div>
                ) : misStats ? (
                  <div>
                    {[
                      { icon: "⭐", label: "Puntos semanales", value: misStats.puntos_semanales?.toLocaleString() || 0 },
                      { icon: "🏅", label: "Puntos totales", value: misStats.total_puntos?.toLocaleString() || 0 },
                      { icon: "📏", label: "Km totales", value: `${misStats.distancia_total_km?.toFixed(1) || 0} km` },
                      { icon: "📅", label: "Días activos", value: misStats.dias_activos || 0 },
                    ].map((s) => (
                      <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(74,124,89,0.07)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: "1.1rem" }}>{s.icon}</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.84rem", color: "#6a7a6a" }}>{s.label}</span>
                        </div>
                        <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a2e1a" }}>{s.value}</span>
                      </div>
                    ))}
                    {miPosicion && (
                      <div style={{ marginTop: 16, background: "linear-gradient(135deg, #1e3d1a, #2d5a27)", borderRadius: 4, padding: "14px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(181,213,160,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Tu posición actual</div>
                        <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "2rem", color: "#f7f5f0" }}>#{miPosicion}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#9a9a9a", textAlign: "center", padding: "16px 0" }}>No hay estadísticas disponibles.</p>
                )}
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 6, padding: "24px", border: "1px solid rgba(74,124,89,0.1)", boxShadow: "0 2px 12px rgba(26,46,26,0.06)", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1.05rem", color: "#1a2e1a", marginBottom: 16 }}>ℹ️ ¿Cómo funciona?</h3>
              {[
                { icon: "🚶", text: "Cada 5 metros caminados = 10 puntos" },
                { icon: "📅", text: "El ranking semanal se resetea cada lunes" },
                { icon: "🏆", text: "Los top 3 reciben medalla de reconocimiento" },
                { icon: "📍", text: "Tus recorridos se rastrean con GPS" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#6a7a6a", lineHeight: 1.5 }}>{item.text}</p>
                </div>
              ))}
            </div>

            {!user && (
              <div style={{ background: "linear-gradient(135deg, #1e3d1a, #2d5a27)", borderRadius: 6, padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🏆</div>
                <h3 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: "1rem", color: "#f7f5f0", marginBottom: 8 }}>¿Quieres aparecer aquí?</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "rgba(247,245,240,0.65)", marginBottom: 18, lineHeight: 1.6 }}>Regístrate y empieza a sumar puntos caminando.</p>
                <Link to="/registro" style={{ display: "block", padding: "11px", background: "#f7f5f0", color: "#1a2e1a", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", marginBottom: 8 }}>Registrarse gratis</Link>
                <Link to="/login" style={{ display: "block", padding: "11px", background: "transparent", color: "rgba(247,245,240,0.65)", border: "1px solid rgba(247,245,240,0.2)", borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.85rem", textDecoration: "none" }}>Iniciar sesión</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}