from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
import json

from routes.models import Ruta
from .models import UserProfile, Walk


# ---------------------------------
# VISTA PRINCIPAL DE RANKING
# ---------------------------------
def mostrarRanking(request):
    """Vista del ranking - accesible para todos los usuarios"""
    
    # Obtener top 5 del ranking
    top_5 = obtener_top_5_semanal()
    
    # Inicializar variables por defecto
    user_profile = None
    user_walks = []
    chart_data = {'Semana Actual': [0, 0, 0]}
    
    # SOLO si el usuario está autenticado, obtener sus datos
    if request.user.is_authenticated:
        try:
            # Crear UserProfile si no existe
            user_profile, created = UserProfile.objects.get_or_create(
                user=request.user,
                defaults={
                    'total_puntos': 0,
                    'Puntos_mensuales': 0,
                    'puntos_semanales': 0,
                    'distancia_total_km': 0,
                    'dias_activos': 0
                }
            )
            
            # Caminatas recientes (solo 3)
            user_walks = Walk.objects.filter(
                usuario=request.user
            ).order_by('-fecha')[:3]
            
            # Datos para el gráfico
            chart_data = {
                'Semana Actual': [
                    user_profile.puntos_semanales,
                    round(user_profile.distancia_total_km, 2),
                    user_profile.dias_activos
                ]
            }
        except Exception as e:
            # Si hay cualquier error, usar valores por defecto
            print(f"Error al obtener datos del usuario: {e}")
            user_profile = None
            user_walks = []
            chart_data = {'Semana Actual': [0, 0, 0]}
    
    context = {
        'monthly_ranking': top_5,
        'chart_data': json.dumps(chart_data),
        'user_walks': user_walks,
        'user_profile': user_profile,
        'user_authenticated': request.user.is_authenticated,
    }
    
    return render(request, 'ranking-Principal/ranking.html', context)


# ---------------------------------
# API: TOP 5 RANKING SEMANAL
# ---------------------------------
def obtener_top_5_semanal():
    """Obtiene los top 5 usuarios de la semana - NO requiere usuario autenticado"""
    try:
        top_5 = UserProfile.objects.all().order_by('-puntos_semanales')[:5]
        return top_5
    except Exception as e:
        print(f"Error al obtener top 5: {e}")
        return []

def api_recorridos_top5(request):
    """Obtiene los recorridos de los top 5 usuarios - NO requiere autenticación"""
    try:
        top_5_profiles = obtener_top_5_semanal()
        top_5_user_ids = [p.user.id for p in top_5_profiles]
        
        now = timezone.now()
        start_of_week = now - timedelta(days=now.weekday())
        
        recorridos = Walk.objects.filter(
            usuario_id__in=top_5_user_ids,
            fecha__gte=start_of_week.date(),
            coordenadas_recorrido__isnull=False
        ).values('usuario__username', 'coordenadas_recorrido', 'titulo', 'puntos_caminata')
        
        data = []
        for r in recorridos:
            coords = r['coordenadas_recorrido'] or []
            if coords and len(coords) > 0:
                coords_formatted = [[c[0], c[1]] for c in coords if len(c) >= 2]
                if coords_formatted:
                    data.append({
                        'user': r['usuario__username'],
                        'coords': coords_formatted,
                        'titulo': r['titulo'],
                        'puntos': r['puntos_caminata']
                    })
        
        return JsonResponse(data, safe=False)
    except Exception as e:
        print(f"Error en api_recorridos_top5: {e}")
        return JsonResponse([], safe=False)

@staff_member_required
def admin_rutas(request):
    rutas = Ruta.objects.all().order_by('-fecha_creacion')
    return render(request, 'admin/admin_rutas.html', {'rutas': rutas})


# ---------------------------------
# API: RECORRIDOS DE TOP 5 (MAPA)
# ---------------------------------
@login_required
def api_top_5_ranking(request):
    """API para obtener top 5 en tiempo real (polling cada 10s)"""
    top_5 = obtener_top_5_semanal()
    
    data = []
    for idx, profile in enumerate(top_5, 1):
        data.append({
            'posicion': idx,
            'username': profile.user.username,
            'nombre_completo': f"{profile.user.first_name} {profile.user.last_name}",
            'puntos': profile.puntos_semanales,
            'distancia_km': round(profile.distancia_total_km, 2),
        })
    
    return JsonResponse(data, safe=False)
@login_required
def api_recorridos_top5(request):
    """Obtiene los recorridos de los top 5 usuarios"""
    top_5_profiles = obtener_top_5_semanal()
    top_5_user_ids = [p.user.id for p in top_5_profiles]
    
    now = timezone.now()
    start_of_week = now - timedelta(days=now.weekday())
    
    recorridos = Walk.objects.filter(
        usuario_id__in=top_5_user_ids,
        fecha__gte=start_of_week.date(),
        coordenadas_recorrido__isnull=False
    ).values('usuario__username', 'coordenadas_recorrido', 'titulo', 'puntos_caminata')
    
    data = []
    for r in recorridos:
        coords = r['coordenadas_recorrido'] or []
        if coords:
            # Convertir coordenadas al formato [lat, lng]
            coords_formatted = [[c[0], c[1]] for c in coords if len(c) >= 2]
            data.append({
                'user': r['usuario__username'],
                'coords': coords_formatted,
                'titulo': r['titulo'],
                'puntos': r['puntos_caminata']
            })
    
    return JsonResponse(data, safe=False)


# ---------------------------------
# API: ESTADÍSTICAS DEL USUARIO EN TIEMPO REAL
# ---------------------------------
@login_required  # ← Mantener esto solo en las APIs
def api_estadisticas_usuario(request):
    """API para obtener estadísticas del usuario actual"""
    user_profile, created = UserProfile.objects.get_or_create(
        user=request.user,
        defaults={
            'total_puntos': 0,
            'Puntos_mensuales': 0,
            'puntos_semanales': 0,
            'distancia_total_km': 0,
            'dias_activos': 0
        }
    )
    
    data = {
        'puntos_semanales': user_profile.puntos_semanales,
        'distancia_total_km': round(user_profile.distancia_total_km, 2),
        'dias_activos': user_profile.dias_activos,
        'total_puntos': user_profile.total_puntos,
    }
    
    return JsonResponse(data)


# ---------------------------------
# API: RANKING COMPLETO
# ---------------------------------
@login_required
def api_ranking_completo(request):
    """Obtiene el ranking completo de todos los usuarios"""
    ranking_completo = UserProfile.objects.all().order_by('-puntos_semanales')
    
    data = []
    for idx, profile in enumerate(ranking_completo, 1):
        # Obtener total de caminatas de la semana
        now = timezone.now()
        start_of_week = now - timedelta(days=now.weekday())
        
        total_caminatas = Walk.objects.filter(
            usuario=profile.user,
            fecha__gte=start_of_week.date()
        ).count()
        
        data.append({
            'posicion': idx,
            'username': profile.user.username,
            'nombre_completo': f"{profile.user.first_name} {profile.user.last_name}",
            'puntos_semanales': profile.puntos_semanales,
            'distancia_km': round(profile.distancia_total_km, 2),
            'dias_activos': profile.dias_activos,
            'total_caminatas': total_caminatas,
        })
    
    return JsonResponse(data, safe=False)


# ---------------------------------
# API: ACTUALIZAR POSICIÓN EN TIEMPO REAL
# ---------------------------------
@csrf_exempt
@login_required
def api_actualizar_posicion(request):
    """
    API que recibe las coordenadas del usuario mientras camina
    y actualiza sus puntos en tiempo real
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            lat = data.get('lat')
            lng = data.get('lng')
            distancia_metros = data.get('distancia_metros', 0)  # Distancia recorrida desde último punto
            walk_id = data.get('walk_id')  # ID de la caminata actual
            
            # Obtener el perfil del usuario
            user_profile = UserProfile.objects.get(user=request.user)
            
            # Calcular puntos: 5 metros = 10 puntos
            puntos_ganados = int((distancia_metros / 5) * 10)
            distancia_km = distancia_metros / 1000
            
            # Actualizar estadísticas
            user_profile.actualizar_estadisticas(puntos_ganados, distancia_km)
            
            # Actualizar la caminata en progreso
            if walk_id:
                walk = Walk.objects.get(id=walk_id, usuario=request.user)
                
                # Agregar coordenada al recorrido
                if not walk.coordenadas_recorrido:
                    walk.coordenadas_recorrido = []
                
                walk.coordenadas_recorrido.append([lat, lng, timezone.now().isoformat()])
                walk.distancia_km += distancia_km
                walk.puntos_caminata += puntos_ganados
                walk.save()
            
            return JsonResponse({
                'success': True,
                'puntos_totales': user_profile.puntos_semanales,
                'distancia_total_km': round(user_profile.distancia_total_km, 2),
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)


# ---------------------------------
# COMANDO PARA RESETEAR RANKING SEMANAL (Ejecutar cada lunes)
# ---------------------------------
# Crear archivo: management/commands/reset_ranking_semanal.py
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.walk.models import UserProfile, RankingSemanal

class Command(BaseCommand):
    help = 'Resetea el ranking semanal cada lunes'
    
    def handle(self, *args, **kwargs):
        now = timezone.now()
        start_of_week = now - timezone.timedelta(days=now.weekday())
        end_of_week = start_of_week + timezone.timedelta(days=6)
        
        # Guardar snapshot del ranking de la semana pasada
        usuarios = UserProfile.objects.all()
        for idx, usuario in enumerate(usuarios.order_by('-puntos_semanales'), 1):
            RankingSemanal.objects.create(
                usuario=usuario.user,
                semana_inicio=start_of_week.date(),
                semana_fin=end_of_week.date(),
                puntos_semana=usuario.puntos_semanales,
                distancia_semana=usuario.distancia_total_km,
                posicion=idx
            )
        
        # Resetear puntos semanales
        UserProfile.objects.all().update(puntos_semanales=0)
        
        self.stdout.write(self.style.SUCCESS('Ranking semanal reseteado exitosamente'))
"""