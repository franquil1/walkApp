from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from .models import Ruta, UserRutaFavorita
from ranking.models import UserProfile, Walk
from django.db.models import F
from .forms import RutaForm
import qrcode 
import json
from geopy.distance import geodesic
from io import BytesIO
from users import views 


def mostrarRutas(request):
    # Reuse the lista_rutas view so the template receives the 'rutas' context
    return lista_rutas(request)




# ========== BUSCADOR DE RUTAS (AJAX) ==========
# Reemplaza tu función buscar_rutas actual en routes/views.py
# Asegúrate de que 'reverse' y 'JsonResponse' ya estén importados (ya los tienes)

def buscar_rutas(request):
    """
    Endpoint AJAX — devuelve JSON con rutas encontradas.
    Busca por: nombre_ruta, descripcion, ubicacion, puntos_interes.
    Diferencia entre coincidencias exactas (nombre) y similares (resto).
    """
    from django.db.models import Q

    query = request.GET.get('q', '').strip()

    if not query:
        return JsonResponse({
            'rutas': [],
            'query': '',
            'total_exactas': 0,
            'total_similares': 0
        })

    # ── Búsqueda exacta: por nombre ───────────────────────────────────────
    rutas_exactas = Ruta.objects.filter(
        nombre_ruta__icontains=query
    )

    # ── Búsqueda similar: resto de campos ─────────────────────────────────
    ids_exactas = rutas_exactas.values_list('id', flat=True)

    rutas_similares = Ruta.objects.filter(
        Q(descripcion__icontains=query)     |
        Q(ubicacion__icontains=query)       |
        Q(ubicacion_inicio__icontains=query)|
        Q(ubicacion_fin__icontains=query)   |
        Q(puntos_interes__icontains=query)
    ).exclude(id__in=ids_exactas)

    # ── Serializar ─────────────────────────────────────────────────────────
    def serializar(rutas, tipo):
        resultado = []
        for r in rutas:
            try:
                url = reverse('detalle_ruta', args=[r.id])
            except Exception:
                url = f'/rutas/{r.id}/'

            desc = ''
            if r.descripcion:
                desc = r.descripcion[:110] + '...' if len(r.descripcion) > 110 else r.descripcion

            imagen_url = ''
            if r.imagen:
                try:
                    imagen_url = r.imagen.url
                except Exception:
                    imagen_url = ''

            resultado.append({
                'id':             r.id,
                'nombre':         r.nombre_ruta,
                'descripcion':    desc,
                'dificultad':     r.get_dificultad_display(),  # "Fácil", "Moderado", etc.
                'dificultad_key': r.dificultad.lower(),         # 'facil', 'moderado', etc.
                'longitud':       str(r.longitud),
                'duracion':       r.duracion_estimada or '',
                'ubicacion':      r.ubicacion or r.ubicacion_inicio or '',
                'imagen':         imagen_url,
                'url':            url,
                'tipo':           tipo,
            })
        return resultado

    data = {
        'query':           query,
        'rutas':           serializar(rutas_exactas, 'exacta') + serializar(rutas_similares, 'similar'),
        'total_exactas':   rutas_exactas.count(),
        'total_similares': rutas_similares.count(),
    }

    return JsonResponse(data)





# ========== CRUD RUTAS ==========
def lista_rutas(request):
    """Vista para mostrar todas las rutas disponibles"""
    rutas = Ruta.objects.all().order_by('nombre_ruta')
    
    # Filtros opcionales
    dificultad = request.GET.get('dificultad')
    buscar = request.GET.get('buscar')
    
    if dificultad:
        rutas = rutas.filter(dificultad__iexact=dificultad)
    if buscar:
        rutas = rutas.filter(nombre_ruta__icontains=buscar)
    
    return render(request, 'Rutas-Principal/rutas.html', {'rutas': rutas})

def detalle_ruta(request, ruta_id):
    ruta = get_object_or_404(Ruta, id=ruta_id)
    
    # Incrementar el contador de vistas
    ruta.vistas = F('vistas') + 1
    ruta.save(update_fields=['vistas'])
    ruta.refresh_from_db()  # Recargar para obtener el valor actualizado
    
    es_favorita = False
    if request.user.is_authenticated:
        es_favorita = UserRutaFavorita.objects.filter(usuario=request.user, ruta=ruta).exists()
    
    return render(request, 'rutas/detalle_ruta.html', {
        'ruta': ruta,
        'es_favorita': es_favorita
    })

def crear_ruta(request):
    if request.method == 'POST':
        form = RutaForm(request.POST, request.FILES)
        if form.is_valid():
            ruta = form.save(commit=False)
            ruta.creada_por = request.user
            ruta.save()
            messages.success(request, 'Ruta creada exitosamente!')
            return redirect('rutas')
        else:
            messages.error(request, 'Error al crear la ruta. Revisa los campos.')
    else:
        form = RutaForm()
    
    return render(request, 'rutas/crear_ruta.html', {'form': form})

@staff_member_required
def eliminar_ruta(request, pk):
    ruta = get_object_or_404(Ruta, pk=pk)
    nombre = ruta.nombre_ruta
    ruta.delete()
    messages.success(request, f'Ruta "{nombre}" eliminada correctamente.')
    return redirect('rutas')


# ========== CRUD RUTAS FUNCIONAMIENTO ==========
@login_required
def iniciar_ruta(request, ruta_id):
    # Detectar si viene de móvil
    user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
    
    is_mobile = any(x in user_agent for x in ['android', 'iphone', 'ipad', 'ipod', 'windows phone', 'mobile'])
    
    if not is_mobile:
        messages.warning(request, '⚠️ Esta función solo está disponible desde dispositivos móviles.')
        return redirect('detalle_ruta', ruta_id=ruta_id)
    
    ruta = get_object_or_404(Ruta, id=ruta_id)
    walk, created = Walk.objects.get_or_create(
        usuario=request.user,
        titulo=f"Recorrido de {ruta.nombre_ruta}",
        defaults={
            'localizacion': ruta.ubicacion,
            'fecha': timezone.now().date(),
            'distancia_km': 0,
            'duration_horas': 0,
            'puntos_caminata': 0,
            'coordenadas_recorrido': []
        }
    )
    return render(request, 'rutas/iniciar_ruta.html', {'ruta': ruta, 'walk_id': walk.id})
@csrf_exempt
@login_required
def guardar_posicion(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        ruta_id = data['ruta_id']
        lat = data['lat']
        lng = data['lng']
        timestamp = timezone.now()
        
        ruta = get_object_or_404(Ruta, id=ruta_id)
        walk, created = Walk.objects.get_or_create(
            usuario=request.user,
            titulo=f"Recorrido de {ruta.nombre_ruta}",
            defaults={'coordenadas_recorrido': []}
        )
        
        # Agregar coordenada al recorrido
        recorrido = walk.coordenadas_recorrido or []
        recorrido.append([lat, lng, timestamp.isoformat()])
        walk.coordenadas_recorrido = recorrido
        walk.save()
        
        return JsonResponse({'status': 'ok'})
    return JsonResponse({'status': 'error'})

@login_required
def terminar_ruta(request, ruta_id):
    ruta = get_object_or_404(Ruta, id=ruta_id)
    walk = get_object_or_404(Walk, usuario=request.user, titulo=f"Recorrido de {ruta.nombre_ruta}")
    
    # Calcular distancia y tiempo
    recorrido = walk.coordenadas_recorrido or []
    if len(recorrido) > 1:
        total_distance = 0
        start_time = timezone.datetime.fromisoformat(recorrido[0][2])
        end_time = timezone.datetime.fromisoformat(recorrido[-1][2])
        duracion_segundos = (end_time - start_time).total_seconds()
        
        for i in range(1, len(recorrido)):
            prev = (recorrido[i-1][0], recorrido[i-1][1])
            curr = (recorrido[i][0], recorrido[i][1])
            total_distance += geodesic(prev, curr).km
        
        walk.distancia_km = total_distance
        walk.duration_horas = duracion_segundos / 3600
        walk.duracion_segundos = duracion_segundos
        walk.puntos_caminata = int(total_distance * 100)  # 1 km = 100 puntos
        walk.save()
        
        # Actualizar UserProfile
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        profile.Puntos_mensuales += walk.puntos_caminata
        profile.total_puntos += walk.puntos_caminata
        profile.save()
    
    return redirect('rutas')  # Redirige al Rutas después de terminar


# ========== FAVORITOS ==========

@login_required
def marcar_favorita(request, ruta_id):
    ruta = get_object_or_404(Ruta, id=ruta_id)
    UserRutaFavorita.objects.get_or_create(usuario=request.user, ruta=ruta)
    return redirect('detalle_ruta', ruta_id=ruta.id)

@login_required
def quitar_favorita(request, ruta_id):
    ruta = get_object_or_404(Ruta, id=ruta_id)
    UserRutaFavorita.objects.filter(usuario=request.user, ruta=ruta).delete()
    return redirect('users:perfil_usuario')

def detalle_ruta(request, ruta_id):
    ruta = get_object_or_404(Ruta, id=ruta_id)
    es_favorita = False
    if request.user.is_authenticated:
        es_favorita = UserRutaFavorita.objects.filter(usuario=request.user, ruta=ruta).exists()
    return render(request, 'rutas/detalle_ruta.html', {
        'ruta': ruta,
        'es_favorita': es_favorita
    })





# Generar QR para compartir la ruta

def generar_qr_ruta(request, ruta_id):
    """Genera un código QR para compartir la ruta"""
    ruta = get_object_or_404(Ruta, id=ruta_id)
    
    # URL completa de la ruta
    url = request.build_absolute_uri(reverse('detalle_ruta', args=[ruta_id]))
    
    # Generar QR
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convertir a bytes
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='image/png')
    response['Content-Disposition'] = f'inline; filename="qr_ruta_{ruta.nombre_ruta}.png"'
    return response