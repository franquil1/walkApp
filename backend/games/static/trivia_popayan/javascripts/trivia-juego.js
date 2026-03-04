// trivia-juego.js - Lógica del juego con seguimiento de datos

// Base de preguntas por categoría
const basePreguntas = {
    rutas: [
        {
            pregunta: "¿Cuál es la ruta de senderismo más famosa del mundo?",
            opciones: ["El Camino de Santiago", "Ruta 66", "Vía Apia", "Ruta de la Seda"],
            correcta: 0
        },
        {
            pregunta: "¿Qué tipo de ruta NO requiere equipo técnico?",
            opciones: ["Alpinismo", "Trekking suave", "Escalada", "Vía ferrata"],
            correcta: 1
        },
        {
            pregunta: "¿Cuántos kilómetros aproximadamente tiene el Camino Inca?",
            opciones: ["20 km", "43 km", "100 km", "150 km"],
            correcta: 1
        },
        {
            pregunta: "¿En qué país se encuentra el Tour del Mont Blanc?",
            opciones: ["Suiza", "Austria", "Francia, Italia y Suiza", "Alemania"],
            correcta: 2
        },
        {
            pregunta: "¿Qué significa 'sendero circular'?",
            opciones: ["Sendero en círculo perfecto", "Inicia y termina en el mismo punto", "Sendero con curvas", "Sendero redondo"],
            correcta: 1
        }
    ],
    equipo: [
        {
            pregunta: "¿Cuál es el equipo esencial para senderismo?",
            opciones: ["Botas de senderismo", "Zapatos de vestir", "Sandalias", "Tacones"],
            correcta: 0
        },
        {
            pregunta: "¿Para qué sirve un bastón de senderismo?",
            opciones: ["Decoración", "Equilibrio y apoyo", "Defensa", "Medir distancias"],
            correcta: 1
        },
        {
            pregunta: "¿Qué capacidad debe tener una mochila para una caminata de un día?",
            opciones: ["10-15 litros", "20-30 litros", "50-60 litros", "80-100 litros"],
            correcta: 1
        },
        {
            pregunta: "¿Qué tipo de ropa es mejor para senderismo?",
            opciones: ["Algodón", "Sintética transpirable", "Lana gruesa", "Cuero"],
            correcta: 1
        },
        {
            pregunta: "¿Por qué son importantes las capas de ropa?",
            opciones: ["Moda", "Regular temperatura", "Peso extra", "Protección solar únicamente"],
            correcta: 1
        }
    ],
    seguridad: [
        {
            pregunta: "¿Qué debes hacer si te pierdes en el sendero?",
            opciones: ["Seguir caminando", "Quedarte en un lugar visible", "Gritar sin parar", "Esconderte"],
            correcta: 1
        },
        {
            pregunta: "¿Cuánta agua se recomienda llevar por hora de caminata?",
            opciones: ["100 ml", "500 ml", "1 litro", "2 litros"],
            correcta: 1
        },
        {
            pregunta: "¿Qué hacer si encuentras un animal salvaje?",
            opciones: ["Acercarte", "Hacer ruido y retroceder lentamente", "Correr", "Tirarle piedras"],
            correcta: 1
        },
        {
            pregunta: "¿Qué debe contener un botiquín básico de senderismo?",
            opciones: ["Solo vendas", "Curitas, vendas, analgésicos y desinfectante", "Antibióticos", "Nada"],
            correcta: 1
        },
        {
            pregunta: "¿Cuál es la regla más importante en senderismo?",
            opciones: ["Ir rápido", "Avisar tu ruta a alguien", "Llevar poco peso", "Caminar solo"],
            correcta: 1
        }
    ],
    'flora-fauna': [
        {
            pregunta: "¿Qué debes hacer si ves una planta desconocida?",
            opciones: ["Comerla", "No tocarla", "Arrancarla", "Olerla de cerca"],
            correcta: 1
        },
        {
            pregunta: "¿Qué animal es común en senderos de montaña?",
            opciones: ["Tiburón", "Águila", "Ballena", "Cocodrilo"],
            correcta: 1
        },
        {
            pregunta: "¿Qué es la fauna silvestre?",
            opciones: ["Animales domésticos", "Animales en su hábitat natural", "Animales extintos", "Animales marinos"],
            correcta: 1
        },
        {
            pregunta: "¿Por qué no debemos alimentar a los animales salvajes?",
            opciones: ["Son vegetarianos", "Altera su comportamiento natural", "No tienen hambre", "Es ilegal siempre"],
            correcta: 1
        },
        {
            pregunta: "¿Qué tipo de árbol es común en bosques de montaña?",
            opciones: ["Palmera", "Pino", "Cactus", "Bambú"],
            correcta: 1
        }
    ],
    tecnicas: [
        {
            pregunta: "¿Qué es la técnica de 'paso de descanso'?",
            opciones: ["Correr", "Caminar lento con pausas breves", "Saltar", "Gatear"],
            correcta: 1
        },
        {
            pregunta: "¿Para qué sirve una brújula en senderismo?",
            opciones: ["Decoración", "Orientación", "Medir altura", "Ver la hora"],
            correcta: 1
        },
        {
            pregunta: "¿Qué significa 'desnivel positivo'?",
            opciones: ["Bajada", "Subida acumulada", "Terreno plano", "Camino recto"],
            correcta: 1
        },
        {
            pregunta: "¿Cómo se lee un mapa topográfico?",
            opciones: ["Solo colores", "Líneas de contorno indican elevación", "No se puede", "Solo símbolos"],
            correcta: 1
        },
        {
            pregunta: "¿Qué es el 'ritmo de marcha'?",
            opciones: ["Bailar", "Velocidad constante y sostenible", "Correr rápido", "Detenerse mucho"],
            correcta: 1
        }
    ],
    lugares: [
        {
            pregunta: "¿Dónde está el Parque Nacional Torres del Paine?",
            opciones: ["Argentina", "Chile", "Perú", "Bolivia"],
            correcta: 1
        },
        {
            pregunta: "¿Qué montaña es la más alta del mundo?",
            opciones: ["K2", "Kilimanjaro", "Everest", "Mont Blanc"],
            correcta: 2
        },
        {
            pregunta: "¿En qué país se encuentra Machu Picchu?",
            opciones: ["Chile", "Bolivia", "Perú", "Ecuador"],
            correcta: 2
        },
        {
            pregunta: "¿Cuál es el cañón más profundo del mundo?",
            opciones: ["Gran Cañón", "Cañón del Colca", "Cañón del Chicamocha", "Cañón del Antílope"],
            correcta: 1
        },
        {
            pregunta: "¿Dónde se encuentra el sendero de los Apalaches?",
            opciones: ["Canadá", "México", "Estados Unidos", "Brasil"],
            correcta: 2
        }
    ]
};

// Variables del juego
let preguntaActual = 0;
let puntos = 0;
let acertadas = 0;
let incorrectas = 0;
let preguntas = [];
let categoria = '';

// Elementos del DOM
const txtPregunta = document.getElementById('txt-pregunta');
const numPregunta = document.getElementById('num-pregunta');
const opciones = document.getElementById('opciones');
const btnSiguiente = document.getElementById('siguiente');
const puntosElement = document.getElementById('puntos');
const nombreElement = document.getElementById('nombre');

// Inicializar juego
function inicializarJuego() {
    // Obtener datos guardados
    const nombre = localStorage.getItem('nombre') || 'Explorador';
    nombreElement.textContent = nombre;
    
    // Obtener categoría de la URL
    const urlParams = new URLSearchParams(window.location.search);
    categoria = urlParams.get('categoria') || 'rutas';
    
    // Guardar categoría y tiempo de inicio
    localStorage.setItem('categoria', categoria);
    if (!localStorage.getItem('tiempoInicio')) {
        localStorage.setItem('tiempoInicio', Date.now().toString());
    }
    
    // Cargar preguntas de la categoría
    preguntas = basePreguntas[categoria] || basePreguntas.rutas;
    
    // Resetear contadores
    puntos = parseInt(localStorage.getItem('puntos')) || 0;
    acertadas = parseInt(localStorage.getItem('acertadas')) || 0;
    incorrectas = parseInt(localStorage.getItem('incorrectas')) || 0;
    
    puntosElement.textContent = puntos;
    
    // Mostrar primera pregunta
    mostrarPregunta();
}

// Mostrar pregunta
function mostrarPregunta() {
    if (preguntaActual >= preguntas.length) {
        finalizarJuego();
        return;
    }
    
    const pregunta = preguntas[preguntaActual];
    
    // Actualizar número de pregunta
    numPregunta.textContent = String(preguntaActual + 1).padStart(2, '0');
    
    // Mostrar pregunta
    txtPregunta.textContent = pregunta.pregunta;
    
    // Limpiar opciones anteriores
    opciones.innerHTML = '';
    
    // Crear botones de opciones
    const letras = ['a', 'b', 'c', 'd'];
    pregunta.opciones.forEach((opcion, index) => {
        const btn = document.createElement('button');
        btn.className = 'opcion';
        btn.id = letras[index];
        btn.textContent = opcion;
        btn.addEventListener('click', () => seleccionarOpcion(index, btn));
        opciones.appendChild(btn);
    });
    
    btnSiguiente.disabled = true;
}

// Seleccionar opción
function seleccionarOpcion(index, botonSeleccionado) {
    const pregunta = preguntas[preguntaActual];
    const todosLosBotones = document.querySelectorAll('.opcion');
    
    // Deshabilitar todos los botones
    todosLosBotones.forEach(btn => btn.disabled = true);
    
    // Verificar si es correcta
    if (index === pregunta.correcta) {
        botonSeleccionado.classList.add('correcta');
        puntos += 100;
        acertadas++;
    } else {
        botonSeleccionado.classList.add('incorrecta');
        incorrectas++;
        // Mostrar la respuesta correcta
        todosLosBotones[pregunta.correcta].classList.add('correcta');
    }
    
    // Actualizar puntos en pantalla
    puntosElement.textContent = puntos;
    
    // Guardar en localStorage
    localStorage.setItem('puntos', puntos);
    localStorage.setItem('acertadas', acertadas);
    localStorage.setItem('incorrectas', incorrectas);
    
    // Habilitar botón siguiente
    btnSiguiente.disabled = false;
}

// Siguiente pregunta
btnSiguiente.addEventListener('click', () => {
    preguntaActual++;
    btnSiguiente.disabled = true;
    mostrarPregunta();
});

// Finalizar juego
function finalizarJuego() {
    // Guardar datos finales
    localStorage.setItem('puntos', puntos);
    localStorage.setItem('acertadas', acertadas);
    localStorage.setItem('incorrectas', incorrectas);
    
    // Redirigir a pantalla final
    window.location.href = '/trivia/final/';
}

// Iniciar cuando carga la página
window.addEventListener('DOMContentLoaded', inicializarJuego);