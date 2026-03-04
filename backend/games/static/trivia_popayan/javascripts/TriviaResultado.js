// ========== SISTEMA DE GUARDADO DE RESULTADOS ==========

/**
 * Función para obtener el CSRF token de Django
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

/**
 * Función para guardar los resultados del juego en la base de datos
 * @param {Object} resultados - Objeto con los datos del juego
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
async function guardarResultadoTrivia(resultados) {
    const {
        categoria,
        puntos,
        respuestas_correctas,
        respuestas_incorrectas,
        duracion_segundos = null
    } = resultados;

    try {
        const response = await fetch('/trivia/api/guardar-resultado/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                categoria: categoria,
                puntos: puntos,
                respuestas_correctas: respuestas_correctas,
                respuestas_incorrectas: respuestas_incorrectas,
                duracion_segundos: duracion_segundos
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Resultado guardado exitosamente:', data);
            
            // Si el usuario está autenticado, mostrar sus estadísticas
            if (data.usuario_autenticado && data.estadisticas) {
                console.log('📊 Estadísticas actualizadas:', data.estadisticas);
                mostrarEstadisticas(data.estadisticas);
            }
        } else {
            // Si es usuario no autenticado, no es un error
            if (!data.usuario_autenticado) {
                console.log('ℹ️ Usuario no autenticado. Juego no guardado.');
            } else {
                console.error('❌ Error al guardar resultado:', data.error || data.message);
            }
        }

        return data;

    } catch (error) {
        console.error('❌ Error en la petición:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Función para mostrar las estadísticas del usuario
 * @param {Object} estadisticas - Objeto con las estadísticas
 */
function mostrarEstadisticas(estadisticas) {
    // Puedes personalizar esto según tu interfaz
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TUS ESTADÍSTICAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total de juegos: ${estadisticas.total_juegos}`);
    console.log(`Puntos totales: ${estadisticas.total_puntos}`);
    console.log(`Mejor puntaje: ${estadisticas.mejor_puntaje}`);
    console.log(`Promedio: ${estadisticas.promedio_puntos} pts/juego`);
    console.log(`Tasa de acierto: ${estadisticas.tasa_acierto_global}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * Función para obtener el historial del usuario
 * @returns {Promise} - Promesa con el historial
 */
async function obtenerHistorial() {
    try {
        const response = await fetch('/trivia/api/historial/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log('📜 Historial obtenido:', data.historial);
            console.log('📊 Estadísticas:', data.estadisticas);
            return data;
        } else {
            console.error('Error al obtener historial:', data.error);
            return null;
        }

    } catch (error) {
        console.error('Error en la petición:', error);
        return null;
    }
}

/**
 * Función para obtener el ranking de jugadores
 * @returns {Promise} - Promesa con el ranking
 */
async function obtenerRanking() {
    try {
        const response = await fetch('/trivia/api/ranking/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log('🏆 Ranking obtenido:', data.ranking);
            return data.ranking;
        } else {
            console.error('Error al obtener ranking:', data.error);
            return null;
        }

    } catch (error) {
        console.error('Error en la petición:', error);
        return null;
    }
}

// ========== EJEMPLO DE USO EN TU JUEGO ==========

/**
 * Ejemplo de cómo usar la función cuando el juego termine
 * Llama a esta función al finalizar el juego
 */
function finalizarJuego() {
    // Variables del juego (reemplaza con tus variables reales)
    const categoria = 'rutas'; // o 'equipo', 'seguridad', etc.
    const respuestasCorrectas = 4;
    const respuestasIncorrectas = 1;
    const puntos = respuestasCorrectas * 100; // 100 puntos por respuesta correcta
    const duracionSegundos = 120; // Opcional: tiempo que tardó en completar

    // Crear objeto con los resultados
    const resultados = {
        categoria: categoria,
        puntos: puntos,
        respuestas_correctas: respuestasCorrectas,
        respuestas_incorrectas: respuestasIncorrectas,
        duracion_segundos: duracionSegundos
    };

    // Guardar en la base de datos
    guardarResultadoTrivia(resultados).then(response => {
        if (response.success) {
            console.log('✅ ¡Juego guardado!');
            // Redirigir a la página final o mostrar resultados
            // window.location.href = '/trivia/final/';
        } else {
            console.log('ℹ️ Juego no guardado (usuario no autenticado o error)');
            // Aún así mostrar los resultados al usuario
        }
    });
}

// ========== INTEGRACIÓN CON TU CÓDIGO EXISTENTE ==========

/**
 * Agrega esto a tu archivo trivia-final.js
 * En el momento en que muestres los resultados finales
 */

// Ejemplo de integración en trivia-final.js:
/*
document.addEventListener('DOMContentLoaded', function() {
    // Obtener datos del juego desde localStorage o variables globales
    const categoriaJugada = localStorage.getItem('categoria') || 'rutas';
    const correctas = parseInt(localStorage.getItem('correctas')) || 0;
    const incorrectas = parseInt(localStorage.getItem('incorrectas')) || 0;
    const puntosTotales = correctas * 100;
    
    // Mostrar resultados en la interfaz
    document.getElementById('total-acertadas').textContent = correctas;
    document.getElementById('total-no-acertadas').textContent = incorrectas;
    document.getElementById('puntaje-final').textContent = puntosTotales + ' Puntos';
    
    // GUARDAR EN LA BASE DE DATOS
    guardarResultadoTrivia({
        categoria: categoriaJugada,
        puntos: puntosTotales,
        respuestas_correctas: correctas,
        respuestas_incorrectas: incorrectas
    }).then(response => {
        if (response.success && response.estadisticas) {
            // Opcional: Mostrar estadísticas generales del usuario
            console.log('Tus estadísticas han sido actualizadas');
        }
    });
});
*/

// ========== EXPORTAR FUNCIONES ==========
window.TriviaAPI = {
    guardarResultado: guardarResultadoTrivia,
    obtenerHistorial: obtenerHistorial,
    obtenerRanking: obtenerRanking,
    getCsrfToken: () => csrftoken
};

console.log('✅ Sistema de guardado de trivia inicializado');
console.log('📚 Funciones disponibles: window.TriviaAPI');