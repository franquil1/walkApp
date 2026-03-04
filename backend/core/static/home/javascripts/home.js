// ================================
// CÓDIGO QR - generado en el navegador via CDN
// ================================
// QRCode.toFile() es de Node.js y NO funciona en el navegador.
// Usamos la librería qrcodejs del CDN que ya tenemos en el HTML.
// para poder mostrar un QR en algún elemento del DOM, usamos:
//
//   new QRCode(document.getElementById("qrcode-container"), {
//       text: "https://via.placeholder.com/300x200.png?text=No+disponible+aun",
//       width: 128,
//       height: 128,
//   });
//
// Por ahora se dejo comentado para no romper nada.


// ================================
// ANIMACIÓN DE TEXTO (fade-in)
// ================================
const elementsToFadeIn = document.querySelectorAll('.fade-in-element');

if (elementsToFadeIn.length > 0) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elementsToFadeIn.forEach(element => {
        observer.observe(element);
    });
}


// ================================
// BOTÓN VERDE (corazón)
// ================================
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".card__button.secondary");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const heart = document.createElement("span");
            heart.classList.add("heart-icon");
            heart.innerHTML = "&#x1F49A;";
            heart.style.cursor = "pointer";
            heart.style.marginLeft = "10px";

            button.parentNode.appendChild(heart);

            heart.addEventListener("click", () => {
                heart.remove();
            });
        });
    });
});


// ================================
// OVERLAY BUSCADOR
// ================================
function mostrarBuscador() {
    const overlay = document.getElementById("buscador-overlay");
    if (overlay) overlay.classList.add("active");
}

function ocultarBuscador() {
    const overlay = document.getElementById("buscador-overlay");
    if (overlay) overlay.classList.remove("active");
}

// Cerrar con tecla ESC
document.addEventListener('keydown', function (e) {
    if (e.key === "Escape") {
        ocultarBuscador();
    }
});


// ================================
// MENÚ MÓVIL (hamburger)
// ================================
document.addEventListener("DOMContentLoaded", function () {
    const menu = document.getElementById("mobileMenu");
    const toggle = document.querySelector(".hamburger");
    const closeBtn = document.getElementById("closeMenu");

    // Protección: si algún elemento no existe, no hace nada
    if (!menu || !toggle || !closeBtn) return;

    // Abrir menú
    toggle.addEventListener("click", () => {
        menu.classList.add("active");
        document.body.classList.add("menu-open");
    });

    // Cerrar menú
    closeBtn.addEventListener("click", () => {
        menu.classList.remove("active");
        document.body.classList.remove("menu-open");
    });

    // Cerrar al hacer clic fuera
    window.addEventListener("click", (e) => {
        if (
            menu.classList.contains("active") &&
            !menu.contains(e.target) &&
            !toggle.contains(e.target)
        ) {
            menu.classList.remove("active");
            document.body.classList.remove("menu-open");
        }
    });
});