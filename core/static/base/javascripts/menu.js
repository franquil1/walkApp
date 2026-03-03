// scripts/menu.js

document.addEventListener("DOMContentLoaded", function () {
  const hamburger   = document.getElementById("hamburger-btn");
  const navLinks    = document.getElementById("nav-links");
  const navOverlay  = document.getElementById("nav-overlay");

  // ── Abrir / cerrar menú lateral ──────────────────────────
  function openMenu() {
    navLinks.classList.add("open");
    navOverlay.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.innerHTML = '<i class="fas fa-times"></i>';
  }

  function closeMenu() {
    navLinks.classList.remove("open");
    navOverlay.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
  }

  function toggleMenu() {
    navLinks.classList.contains("open") ? closeMenu() : openMenu();
  }

  // Click en hamburguesa
  hamburger.addEventListener("click", toggleMenu);

  // Click en overlay oscuro → cierra menú
  navOverlay.addEventListener("click", closeMenu);

  // Click en cualquier enlace del menú → cierra
  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  // Tecla ESC → cierra menú
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  // Cerrar menú si se redimensiona a desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 992) closeMenu();
  });
});

// ── Buscador overlay ─────────────────────────────────────
function mostrarBuscador() {
  const overlay = document.getElementById("buscador-overlay");
  if (overlay) {
    overlay.classList.add("active");
    // Enfocar input automáticamente
    const input = overlay.querySelector("input[type='text']");
    if (input) setTimeout(function () { input.focus(); }, 50);
  }
}

function ocultarBuscador() {
  const overlay = document.getElementById("buscador-overlay");
  if (overlay) overlay.classList.remove("active");
}

// Cerrar buscador con ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") ocultarBuscador();
});