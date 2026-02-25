const QRCode = require('qrcode');


// URL de la imagen que dice "No disponible aún"
const imageUrl = 'https://via.placeholder.com/300x200.png?text=No+disponible+aun';


// Generar el código QR
QRCode.toFile('qrcode.png', imageUrl, (err) => {
    if (err) {
        console.error('Error al generar el código QR:', err);
    } else {
        console.log('Código QR generado exitosamente como "qrcode.png".');
    }
});


// animacion de texto

const elementsToFadeIn = document.querySelectorAll('.fade-in-element');

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Opcional: dejar de observar una vez que aparece
        }
    });
}, {
    threshold: 0.1 // Define qué porcentaje del elemento debe ser visible para activar la animación
});

elementsToFadeIn.forEach(element => {
    observer.observe(element);
});


//boton verde 
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".card__button.secondary");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const heart = document.createElement("span");
            heart.classList.add("heart-icon");
            heart.innerHTML = "&#x1F49A;"; // Green heart emoji
            heart.style.cursor = "pointer";
            heart.style.marginLeft = "10px";

            button.parentNode.appendChild(heart);

            heart.addEventListener("click", () => {
                heart.remove();
            });
        });
    });
});


/* overlay */

function mostrarBuscador() {
  document.getElementById("buscador-overlay").classList.add("active");
}

function ocultarBuscador() {
  document.getElementById("buscador-overlay").classList.remove("active");
}


// BONUS: cerrar con tecla ESC
document.addEventListener('keydown', function (e) {
  if (e.key === "Escape") {
    ocultarBuscador();
  }
});


/* responsit */
 document.addEventListener("DOMContentLoaded", function () {
    const menu = document.getElementById("mobileMenu");
    const toggle = document.querySelector(".hamburger");
    const closeBtn = document.getElementById("closeMenu");

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