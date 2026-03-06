// 3_buscador.js — versión corregida con debug y URL dinámica

document.addEventListener("DOMContentLoaded", function () {

  const overlay    = document.getElementById("buscador-overlay");
  const input      = document.getElementById("buscador-input");
  const resultados = document.getElementById("buscador-resultados");

  // URL dinámica desde Django (se pasa en el HTML con data-url)
  const BUSCAR_URL = document.getElementById("buscador-url")?.dataset.url || "/rutas/buscar-rutas/";
  console.log("[Buscador] URL configurada:", BUSCAR_URL);

  let timer = null;

  // Abrir / cerrar overlay
  window.mostrarBuscador = function () {
    overlay.classList.add("active");
    setTimeout(() => input && input.focus(), 80);
  };

  window.ocultarBuscador = function () {
    overlay.classList.remove("active");
    if (input) input.value = "";
    resultados.innerHTML = "";
  };

  document.addEventListener("keydown", e => { if (e.key === "Escape") ocultarBuscador(); });
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) ocultarBuscador();
  });

  if (!input) {
    console.error("[Buscador] No se encontró #buscador-input en el DOM");
    return;
  }

  // Escucha escritura con debounce 350ms
  input.addEventListener("input", function () {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) { resultados.innerHTML = ""; return; }
    mostrarCargando();
    timer = setTimeout(() => buscar(q), 350);
  });

  // Llamada AJAX
  function buscar(q) {
    const url = `${BUSCAR_URL}?q=${encodeURIComponent(q)}`;
    console.log("[Buscador] Fetching:", url);

    fetch(url)
      .then(r => {
        console.log("[Buscador] Status:", r.status);
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(data => {
        console.log("[Buscador] Respuesta:", data);
        renderResultados(data);
      })
      .catch(err => {
        console.error("[Buscador] Error:", err);
        mostrarError();
      });
  }

  function renderResultados(data) {
    resultados.innerHTML = "";
    if (data.rutas.length === 0) {
      resultados.innerHTML = `
        <div class="buscar-vacio">
          <i class="fas fa-map-marked-alt"></i>
          <p>No encontramos rutas para <strong>"${data.query}"</strong></p>
          <span>Intenta con otra palabra clave</span>
        </div>`;
      return;
    }
    if (data.total_exactas === 1 && data.total_similares === 0) {
      window.location.href = data.rutas[0].url;
      return;
    }
    const exactas   = data.rutas.filter(r => r.tipo === "exacta");
    const similares = data.rutas.filter(r => r.tipo === "similar");
    if (exactas.length)   resultados.appendChild(crearSeccion("Rutas encontradas", exactas));
    if (similares.length) resultados.appendChild(crearSeccion("Resultados similares", similares));
  }

  function crearSeccion(titulo, rutas) {
    const sec = document.createElement("div");
    sec.className = "buscar-seccion";
    sec.innerHTML = `<p class="buscar-seccion-titulo">${titulo}</p>`;
    rutas.forEach(r => sec.appendChild(crearCard(r)));
    return sec;
  }

  function crearCard(r) {
    const a = document.createElement("a");
    a.href = r.url;
    a.className = "buscar-card";
    const imgHTML = r.imagen
      ? `<img src="${r.imagen}" alt="${r.nombre}" class="buscar-card-img">`
      : `<div class="buscar-card-img buscar-card-img--placeholder"><i class="fas fa-route"></i></div>`;
    const badgeColor = { facil:"badge--verde", moderado:"badge--naranja", dificil:"badge--rojo", extremo:"badge--negro" }[r.dificultad_key] || "";
    a.innerHTML = `
      ${imgHTML}
      <div class="buscar-card-info">
        <span class="buscar-card-nombre">${r.nombre}</span>
        <div class="buscar-card-meta">
          ${r.dificultad ? `<span class="buscar-badge ${badgeColor}">${r.dificultad}</span>` : ""}
          ${r.longitud   ? `<span class="buscar-meta-item"><i class="fas fa-ruler-horizontal"></i> ${r.longitud} km</span>` : ""}
          ${r.duracion   ? `<span class="buscar-meta-item"><i class="fas fa-clock"></i> ${r.duracion}</span>` : ""}
        </div>
        ${r.descripcion ? `<p class="buscar-card-desc">${r.descripcion}</p>` : ""}
      </div>
      <i class="fas fa-chevron-right buscar-card-arrow"></i>`;
    return a;
  }

  function mostrarCargando() {
    resultados.innerHTML = `<div class="buscar-cargando"><i class="fas fa-circle-notch fa-spin"></i><span>Buscando rutas...</span></div>`;
  }

  function mostrarError() {
    resultados.innerHTML = `<div class="buscar-vacio"><i class="fas fa-exclamation-triangle"></i><p>No se pudo conectar. Revisa la consola (F12).</p></div>`;
  }

});