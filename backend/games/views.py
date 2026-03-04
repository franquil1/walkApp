from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
import json



""" ==========| SITIO DE LOS JUEGOS |=========="""

def mostrarJuegos(request):
    return render(request, 'Juegos-Principal/juegos.html')


""" ==========| JUEGO MAPA ROTO |=========="""

def mostrarMapaRoto(request):
    return render(request, 'mapa_roto/mapa_roto.html')




""" ==========| JUEGO TRIVIA POPAYAN |=========="""

# Vista para la pantalla de inicio
def trivia_inicio(request):
    """Pantalla de bienvenida donde el usuario ingresa su nombre"""
    context = {}
    if request.user.is_authenticated:
        context['usuario_nombre'] = request.user.username
    return render(request, 'trivia_popayan/index.html', context)


# Vista para el menú de categorías
def trivia_menu(request):
    """Menú de selección de categorías"""
    context = {}
    if request.user.is_authenticated:
        context['usuario_nombre'] = request.user.username
        context['total_puntos'] = 0
    else:
        context['usuario_nombre'] = 'Invitado'
        context['total_puntos'] = 0
    
    return render(request, 'trivia_popayan/menu.html', context)


# Vista para el juego
def trivia_juego(request):
    """Pantalla del juego donde se muestran las preguntas"""
    categoria = request.GET.get('categoria', 'rutas')
    
    context = {
        'categoria': categoria,
    }
    
    if request.user.is_authenticated:
        context['usuario_nombre'] = request.user.username
    
    return render(request, 'html/juegos/trivia/juego.html', context)


# Vista para la pantalla final
def trivia_final(request):
    """Pantalla final con los resultados"""
    return render(request, 'trivia_popayan/final.html')


# API para guardar resultados del juego
@require_http_methods(["POST"])
def guardar_resultado(request):
    """
    Endpoint que recibe los resultados del juego pero no los persiste en BD
    """
    try:
        data = json.loads(request.body)
        
        categoria = data.get('categoria')
        puntos = int(data.get('puntos', 0))
        respuestas_correctas = int(data.get('respuestas_correctas', 0))
        respuestas_incorrectas = int(data.get('respuestas_incorrectas', 0))

        # Validar que la categoría no esté vacía
        if not categoria:
            return JsonResponse({
                'success': False,
                'error': 'Categoría inválida'
            }, status=400)

        # Calcular porcentaje y calificación en memoria
        total_preguntas = respuestas_correctas + respuestas_incorrectas
        porcentaje = round((respuestas_correctas / total_preguntas) * 100, 1) if total_preguntas > 0 else 0

        if porcentaje >= 90:
            calificacion = 'Excelente'
        elif porcentaje >= 70:
            calificacion = 'Bueno'
        elif porcentaje >= 50:
            calificacion = 'Regular'
        else:
            calificacion = 'Insuficiente'

        return JsonResponse({
            'success': True,
            'message': 'Juego completado' if request.user.is_authenticated else 'Juego completado (usuario invitado)',
            'guest': not request.user.is_authenticated,
            'calificacion': calificacion,
            'porcentaje': porcentaje
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


# API para obtener estadísticas del usuario
@login_required
def obtener_estadisticas(request):
    """
    Endpoint que retorna estadísticas vacías sin consultar la BD
    """
    return JsonResponse({
        'success': True,
        'estadisticas': {
            'total_juegos': 0,
            'total_puntos': 0,
            'mejor_puntaje': 0,
            'promedio_puntos': 0,
            'tasa_acierto': 0,
            'categoria_favorita': 'N/A'
        },
        'ultimos_juegos': []
    })


# Vista para el historial completo
@login_required
def historial_completo(request):
    """Vista de historial sin datos de BD"""
    context = {
        'juegos': [],
        'estadisticas': None
    }
    return render(request, 'html/juegos/trivia/historial.html', context)