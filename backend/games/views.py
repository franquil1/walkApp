from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
import json

from .models import EstadisticasUsuarioTrivia, HistorialJuegoTrivia

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
        # Obtener estadísticas del usuario
        try:
            estadisticas = EstadisticasUsuarioTrivia.objects.get(usuario=request.user)
            context['total_puntos'] = estadisticas.total_puntos
        except EstadisticasUsuarioTrivia.DoesNotExist:
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
    Endpoint para guardar los resultados del juego en la base de datos
    """
    try:
        # Obtener datos del POST
        data = json.loads(request.body)
        
        categoria = data.get('categoria')
        puntos = int(data.get('puntos', 0))
        respuestas_correctas = int(data.get('respuestas_correctas', 0))
        respuestas_incorrectas = int(data.get('respuestas_incorrectas', 0))
        duracion_segundos = data.get('duracion_segundos')
        
        # Validar datos
        if not categoria or categoria not in dict(HistorialJuegoTrivia.CATEGORIAS_CHOICES):
            return JsonResponse({
                'success': False,
                'error': 'Categoría inválida'
            }, status=400)
        
        # Solo guardar si el usuario está autenticado
        if request.user.is_authenticated:
            # Crear registro en el historial
            juego = HistorialJuegoTrivia.objects.create(
                usuario=request.user,
                categoria=categoria,
                puntos=puntos,
                respuestas_correctas=respuestas_correctas,
                respuestas_incorrectas=respuestas_incorrectas,
                duracion_segundos=duracion_segundos,
                fecha_juego=timezone.now()
            )
            
            # Las estadísticas se actualizan automáticamente por la señal
            
            return JsonResponse({
                'success': True,
                'message': 'Resultados guardados exitosamente',
                'juego_id': juego.id,
                'calificacion': juego.calificacion,
                'porcentaje': juego.porcentaje_acierto
            })
        else:
            # Usuario no autenticado - solo retornar éxito sin guardar
            return JsonResponse({
                'success': True,
                'message': 'Juego completado (no guardado - usuario invitado)',
                'guest': True
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
    Endpoint para obtener las estadísticas del usuario actual
    """
    try:
        estadisticas = EstadisticasUsuarioTrivia.objects.get(usuario=request.user)
        
        # Obtener últimos 10 juegos
        ultimos_juegos = HistorialJuegoTrivia.objects.filter(
            usuario=request.user
        ).order_by('-fecha_juego')[:10]
        
        juegos_data = [{
            'categoria': juego.get_categoria_display(),
            'puntos': juego.puntos,
            'fecha': juego.fecha_juego.strftime('%d/%m/%Y %H:%M'),
            'calificacion': juego.calificacion
        } for juego in ultimos_juegos]
        
        return JsonResponse({
            'success': True,
            'estadisticas': {
                'total_juegos': estadisticas.total_juegos,
                'total_puntos': estadisticas.total_puntos,
                'mejor_puntaje': estadisticas.mejor_puntaje,
                'promedio_puntos': estadisticas.promedio_puntos,
                'tasa_acierto': estadisticas.tasa_acierto_global,
                'categoria_favorita': estadisticas.get_categoria_favorita_display() if estadisticas.categoria_favorita else 'N/A'
            },
            'ultimos_juegos': juegos_data
        })
        
    except EstadisticasUsuarioTrivia.DoesNotExist:
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
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
    

# Vista opcional para ver el historial completo
@login_required
def historial_completo(request):
    """Vista para mostrar el historial completo de juegos del usuario"""
    juegos = HistorialJuegoTrivia.objects.filter(
        usuario=request.user
    ).order_by('-fecha_juego')
    
    try:
        estadisticas = EstadisticasUsuarioTrivia.objects.get(usuario=request.user)
    except EstadisticasUsuarioTrivia.DoesNotExist:
        estadisticas = None
    
    context = {
        'juegos': juegos,
        'estadisticas': estadisticas
    }
    
    return render(request, 'html/juegos/trivia/historial.html', context)