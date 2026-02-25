// ===================== CONFIGURACIÓN ===================== //
const rutasMapas = {
    // Asegúrate de que los nombres de los archivos coincidan con los de tu carpeta
    facil: ["Pilimbala_CraterPurace.png"],
    normal: ["Popayan_TermalesCoconuco.png"],
    dificil: ["Pilimbala_CraterPurace.jpg"]
};

let dificultadActual = "facil";
let imagenSeleccionada = "";
let piezasCorrectas = 0;
let totalPiezas = 9;
let pistasDisponibles = 3;

// Objeto de imagen global que se cargará una sola vez
let puzzleImage = new Image();

// ===================== INICIO ===================== //
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("pantallaInicio").style.display = "flex";
    document.getElementById("dificultad").value = "facil";
});

// ===================== FUNCIONES DE INICIO ===================== //
function iniciarJuego() {
    const dificultad = document.getElementById("dificultad").value;
    dificultadActual = dificultad;

    const mapas = rutasMapas[dificultad];
    const randomMapa = mapas[Math.floor(Math.random() * mapas.length)];
    imagenSeleccionada = randomMapa;

    document.getElementById("pantallaInicio").style.display = "none";

    const imageBaseURL = document.querySelector('.container').dataset.imageBaseUrl;
    const fullImageURL = `${imageBaseURL}${dificultad}/${imagenSeleccionada}`;

    puzzleImage.src = fullImageURL;
    puzzleImage.onload = () => {
        cargarTableroYPiezas(dificultadActual);
    };
    puzzleImage.onerror = () => {
        console.error("Error al cargar la imagen del puzzle. Revisa la ruta:", fullImageURL);
    };
}

// ===================== TABLERO Y PIEZAS ===================== //
function cargarTableroYPiezas(dificultad) {
    const tablero = document.getElementById("tablero");
    const piezasContenedor = document.getElementById("piezas");
    tablero.innerHTML = "";
    piezasContenedor.innerHTML = "";

    let gridSize = 3;
    let piezaSize = 100;

    if (dificultad === "normal") {
        gridSize = 4;
        piezaSize = 100;
    }
    if (dificultad === "dificil") {
        gridSize = 5;
        piezaSize = 70;
    }

    totalPiezas = gridSize * gridSize;
    piezasCorrectas = 0;
    pistasDisponibles = 3;
    document.getElementById("pistas-restantes").textContent = pistasDisponibles;

    const fullSize = gridSize * piezaSize;

    tablero.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    tablero.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    tablero.parentElement.dataset.dificultad = dificultad;
    piezasContenedor.dataset.dificultad = dificultad;

    piezasContenedor.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    piezasContenedor.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    const indices = Array.from({ length: totalPiezas }, (_, i) => i);
    const desordenadas = [...indices].sort(() => Math.random() - 0.5);

    // Crear zonas de drop
    for (let i = 0; i < totalPiezas; i++) {
        const drop = document.createElement("div");
        drop.classList.add("dropzone");
        drop.dataset.pos = i;
        drop.style.width = `${piezaSize}px`;
        drop.style.height = `${piezaSize}px`;
        drop.addEventListener("dragover", permitirDrop);
        drop.addEventListener("drop", soltarPieza);
        tablero.appendChild(drop);
    }
    
    // Configurar el contenedor de piezas para que acepte piezas de vuelta
    piezasContenedor.addEventListener("dragover", permitirDrop);
    piezasContenedor.addEventListener("drop", soltarPiezaEnContenedor);


    // Crear piezas arrastrables
    desordenadas.forEach((indexAleatorio) => {
        const pieza = document.createElement("div");
        pieza.classList.add("pieza");
        pieza.classList.add("pieza-borde-discreto");
        pieza.setAttribute("draggable", true);
        pieza.dataset.pos = indexAleatorio;
        pieza.id = `pieza-${indexAleatorio}`;

        const img = document.createElement("img");
        img.src = puzzleImage.src;
        img.alt = `Pieza ${indexAleatorio}`;
        img.style.width = `${fullSize}px`;
        img.style.height = `${fullSize}px`;

        const col = indexAleatorio % gridSize;
        const row = Math.floor(indexAleatorio / gridSize);
        img.style.objectPosition = `${-col * piezaSize}px ${-row * piezaSize}px`;

        pieza.appendChild(img);

        pieza.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/html", pieza.id);
            setTimeout(() => {
                pieza.classList.add("dragging");
            }, 0);
        });

        pieza.addEventListener("dragend", () => {
            pieza.classList.remove("dragging");
        });

        pieza.style.width = `${piezaSize}px`;
        pieza.style.height = `${piezaSize}px`;

        piezasContenedor.appendChild(pieza);
    });
}

// ===================== DRAG AND DROP ===================== //
function permitirDrop(e) {
    e.preventDefault();
}

function soltarPieza(e) {
    e.preventDefault();
    const piezaId = e.dataTransfer.getData("text/html");
    const piezaArrastrada = document.getElementById(piezaId);
    const dropzone = e.currentTarget;

    if (!piezaArrastrada || piezaArrastrada.parentElement === dropzone) return;

    const contenedorOriginal = piezaArrastrada.parentElement;

    if (dropzone.children.length > 0) {
        const piezaExistente = dropzone.children[0];

        dropzone.removeChild(piezaExistente);
        contenedorOriginal.removeChild(piezaArrastrada);

        piezaArrastrada.classList.add('pieza-movimiento-intercambio');
        piezaExistente.classList.add('pieza-movimiento-intercambio');

        dropzone.appendChild(piezaArrastrada);
        contenedorOriginal.appendChild(piezaExistente);

        setTimeout(() => {
            piezaArrastrada.classList.remove('pieza-movimiento-intercambio');
            piezaExistente.classList.remove('pieza-movimiento-intercambio');
        }, 300);

        verificarPosicion(piezaExistente);
        verificarPosicion(piezaArrastrada);
    } else {
        dropzone.appendChild(piezaArrastrada);
        verificarPosicion(piezaArrastrada);
    }
    actualizarEstadoJuego();
}

function soltarPiezaEnContenedor(e) {
    e.preventDefault();
    const piezaId = e.dataTransfer.getData("text/html");
    const piezaArrastrada = document.getElementById(piezaId);
    const contenedorPiezas = document.getElementById("piezas");

    if (piezaArrastrada && piezaArrastrada.parentElement !== contenedorPiezas) {
        // La pieza estaba en una dropzone, ahora se mueve de vuelta al contenedor de piezas
        const dropzone = piezaArrastrada.parentElement;
        dropzone.removeChild(piezaArrastrada);
        contenedorPiezas.appendChild(piezaArrastrada);
        verificarPosicion(piezaArrastrada); // Esto la marcará como "incorrecta"
    }
    actualizarEstadoJuego();
}


function verificarPosicion(pieza) {
    const posCorrecta = parseInt(pieza.dataset.pos);
    const dropzone = pieza.parentElement;

    pieza.classList.remove("pieza-correcta-animacion");

    if (dropzone && dropzone.classList.contains("dropzone")) {
        const posZona = parseInt(dropzone.dataset.pos);
        pieza.classList.add("pieza-correcta-animacion");

        if (posCorrecta === posZona) {
            pieza.classList.add("correcta");
        } else {
            pieza.classList.remove("correcta");
        }
    } else {
        pieza.classList.remove("correcta");
    }
}

function actualizarEstadoJuego() {
    piezasCorrectas = document.querySelectorAll('.dropzone > .correcta').length;

    if (piezasCorrectas === totalPiezas) {
        setTimeout(() => {
            abrirModal('modalFelicidades');
        }, 300);
    }
}

// ===================== BOTÓN DE PISTA ===================== //
function verPista() {
    if (pistasDisponibles <= 0) {
        abrirModal('modalPistasAgotadas');
        return;
    }

    pistasDisponibles--;
    document.getElementById("pistas-restantes").textContent = pistasDisponibles;

    const modal = document.getElementById("modalPista");
    const img = document.getElementById("imagenPista");
    img.src = puzzleImage.src;
    modal.style.display = "flex";

    setTimeout(() => {
        if (modal.style.display === "flex") {
            cerrarModal('modalPista');
        }
    }, 5000);
}

// ===================== MODALES ===================== //
function abrirModal(id) {
    document.getElementById(id).style.display = "flex";
}

function cerrarModal(id) {
    document.getElementById(id).style.display = "none";
}

function mostrarInicio() {
    location.reload();
}