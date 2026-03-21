from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from .models import UsuarioPersonalizado
from routes.models import Ruta
from community.models import Publicacion


def es_admin(user):
    return user.is_staff or getattr(user, 'rol', '') == 'admin'


# ─── DASHBOARD ───────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_admin_dashboard(request):
    if not es_admin(request.user):
        return Response({'error': 'Sin permisos.'}, status=403)

    hoy = timezone.now().date()

    # Resumen general
    resumen = {
        'total_usuarios':       UsuarioPersonalizado.objects.count(),
        'usuarios_activos_hoy': UsuarioPersonalizado.objects.filter(last_login__date=hoy).count(),
        'total_rutas':          Ruta.objects.count(),
        'total_publicaciones':  Publicacion.objects.count(),
    }

    # Usuarios activos últimos 7 días
    usuarios_por_dia = []
    for i in range(6, -1, -1):
        dia = hoy - timedelta(days=i)
        count = UsuarioPersonalizado.objects.filter(last_login__date=dia).count()
        usuarios_por_dia.append({
            'fecha': dia.strftime('%d/%m'),
            'count': count,
        })

    # Top 5 rutas más vistas
    rutas_top = list(
        Ruta.objects.order_by('-vistas')[:5].values('id', 'nombre_ruta', 'vistas')
    )
    for r in rutas_top:
        r['nombre'] = r.pop('nombre_ruta')

    # Distribución de roles
    roles = {
        'usuario': UsuarioPersonalizado.objects.filter(rol='usuario').count(),
        'admin':   UsuarioPersonalizado.objects.filter(rol='admin').count(),
    }

    return Response({
        'resumen': resumen,
        'usuarios_por_dia': usuarios_por_dia,
        'rutas_top': rutas_top,
        'roles': roles,
    })


# ─── USUARIOS ────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_admin_usuarios(request):
    if not es_admin(request.user):
        return Response({'error': 'Sin permisos.'}, status=403)

    usuarios = UsuarioPersonalizado.objects.all().order_by('date_joined')
    data = []
    for u in usuarios:
        foto_url = None
        if u.foto_perfil:
            foto_url = request.build_absolute_uri(u.foto_perfil.url)
        data.append({
            'id':          u.id,
            'username':    u.username,
            'email':       u.email,
            'first_name':  u.first_name,
            'last_name':   u.last_name,
            'rol':         getattr(u, 'rol', 'usuario'),
            'is_staff':    u.is_staff,
            'is_active':   u.is_active,
            'date_joined': u.date_joined.strftime('%d/%m/%Y'),
            'last_login':  u.last_login.strftime('%d/%m/%Y %H:%M') if u.last_login else None,
            'foto_perfil': foto_url,
        })
    return Response({'usuarios': data, 'total': len(data)})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def api_admin_cambiar_rol(request, user_id):
    if not es_admin(request.user):
        return Response({'error': 'Sin permisos.'}, status=403)
    try:
        u = UsuarioPersonalizado.objects.get(id=user_id)
    except UsuarioPersonalizado.DoesNotExist:
        return Response({'error': 'Usuario no encontrado.'}, status=404)
    nuevo_rol = request.data.get('rol')
    if nuevo_rol not in ['usuario', 'admin']:
        return Response({'error': 'Rol inválido.'}, status=400)
    u.rol      = nuevo_rol
    u.is_staff = (nuevo_rol == 'admin')
    u.save()
    return Response({'mensaje': f'Rol actualizado a {nuevo_rol}.', 'rol': nuevo_rol})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_admin_eliminar_usuario(request, user_id):
    if not es_admin(request.user):
        return Response({'error': 'Sin permisos.'}, status=403)
    if request.user.id == user_id:
        return Response({'error': 'No puedes eliminarte a ti mismo.'}, status=400)
    try:
        u = UsuarioPersonalizado.objects.get(id=user_id)
        u.delete()
        return Response({'mensaje': 'Usuario eliminado.'})
    except UsuarioPersonalizado.DoesNotExist:
        return Response({'error': 'Usuario no encontrado.'}, status=404)


# ─── RUTAS ───────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_admin_rutas(request):
    if not es_admin(request.user):
        return Response({'error': 'Sin permisos.'}, status=403)

    rutas = Ruta.objects.select_related('creada_por').order_by('-fecha_creacion')
    data = []
    for r in rutas:
        imagen_url = None
        if r.imagen:
            imagen_url = request.build_absolute_uri(r.imagen.url)
        data.append({
            'id':             r.id,
            'nombre_ruta':    r.nombre_ruta,
            'dificultad':     r.dificultad,
            'longitud':       str(r.longitud),
            'vistas':         r.vistas,
            'creada_por':     r.creada_por.username if r.creada_por else 'Desconocido',
            'fecha_creacion': r.fecha_creacion.strftime('%d/%m/%Y'),
            'imagen_url':     imagen_url,
        })
    return Response({'rutas': data, 'total': len(data)})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_admin_eliminar_ruta(request, ruta_id):
    if not es_admin(request.user):
        return Response({'error': 'Sin permisos.'}, status=403)
    try:
        r = Ruta.objects.get(id=ruta_id)
        r.delete()
        return Response({'mensaje': 'Ruta eliminada.'})
    except Ruta.DoesNotExist:
        return Response({'error': 'Ruta no encontrada.'}, status=404)


# ─── SOS ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_admin_sos(request):
    if not es_admin(request.user):
        return Response({'error': 'Sin permisos.'}, status=403)

    alertas = AlertaSOS.objects.select_related('usuario', 'ruta').order_by('-fecha_hora')
    data = []
    for a in alertas:
        data.append({
            'id':          a.id,
            'usuario':     a.usuario.username,
            'ruta':        a.ruta.nombre_ruta if a.ruta else None,
            'estado':      a.estado,
            'mensaje':     a.mensaje,
            'maps_url':    a.maps_url,
            'fecha_hora':  a.fecha_hora.strftime('%d/%m/%Y %H:%M'),
            'notas_admin': a.notas_admin,
        })
    return Response({'alertas': data, 'total': len(data)})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def api_admin_sos_atender(request, sos_id):
    if not es_admin(request.user):
        return Response({'error': 'Sin permisos.'}, status=403)
    try:
        alerta = AlertaSOS.objects.get(id=sos_id)
    except AlertaSOS.DoesNotExist:
        return Response({'error': 'Alerta no encontrada.'}, status=404)

    estado = request.data.get('estado')
    if estado not in ['PENDIENTE', 'ATENDIDA', 'FALSA']:
        return Response({'error': 'Estado inválido.'}, status=400)

    alerta.estado       = estado
    alerta.notas_admin  = request.data.get('notas_admin', alerta.notas_admin)
    alerta.atendida_por = request.user
    alerta.save()
    return Response({'mensaje': 'Alerta actualizada.', 'estado': alerta.estado})