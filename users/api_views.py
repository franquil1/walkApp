from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import UsuarioPersonalizado
from .utils import account_activation_token


# ─── LOGIN ───────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if not user:
        # Verificar si el usuario existe pero está inactivo (cuenta no verificada)
        try:
            u = UsuarioPersonalizado.objects.get(username=username)
            if not u.is_active:
                return Response(
                    {'error': 'Cuenta no verificada. Revisa tu correo electrónico y activa tu cuenta.'},
                    status=403
                )
        except UsuarioPersonalizado.DoesNotExist:
            pass
        return Response({'error': 'Credenciales incorrectas.'}, status=400)

    refresh = RefreshToken.for_user(user)
    foto_url = None
    if user.foto_perfil:
        foto_url = request.build_absolute_uri(user.foto_perfil.url)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'rol': getattr(user, 'rol', 'usuario'),
            'is_staff': user.is_staff,
            'es_admin': getattr(user, 'es_admin', False),
            'foto_perfil': foto_url,
            'bio': getattr(user, 'bio', None),
        }
    })


# ─── LOGOUT ──────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def api_logout(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token requerido.'}, status=400)
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'mensaje': 'Sesión cerrada correctamente.'})
    except TokenError:
        # Token ya expirado o inválido — igual se considera logout exitoso
        return Response({'mensaje': 'Sesión cerrada.'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)


# ─── REGISTRO ────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def api_registro(request):
    username = request.data.get('username', '').strip()
    email    = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not username or not email or not password:
        return Response({'error': 'Todos los campos son obligatorios.'}, status=400)
    if len(password) < 8:
        return Response({'error': 'La contraseña debe tener al menos 8 caracteres.'}, status=400)
    if UsuarioPersonalizado.objects.filter(username=username).exists():
        return Response({'error': 'El nombre de usuario ya está en uso.'}, status=400)
    if UsuarioPersonalizado.objects.filter(email=email).exists():
        return Response({'error': 'El correo ya está registrado.'}, status=400)

    # Crear usuario INACTIVO hasta que verifique el correo
    user = UsuarioPersonalizado.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_active=False
    )

    # Generar token de activación
    uid   = urlsafe_base64_encode(force_bytes(user.pk))
    token = account_activation_token.make_token(user)

    # Link de activación — apunta al frontend React
    activation_link = f"http://localhost:3000/activar/{uid}/{token}/"

    # Enviar correo usando el mismo template HTML que el flujo Django
    try:
        message = render_to_string('auth/correo_activacion.html', {
            'user': user,
            'activation_link': activation_link,
        })
        email_message = EmailMessage(
            subject='Activa tu cuenta en Walk App',
            body=message,
            to=[email]
        )
        email_message.content_subtype = "html"
        email_message.encoding = "utf-8"
        email_message.send()
    except Exception as e:
        # Si falla el correo, eliminar el usuario para que pueda reintentar
        user.delete()
        return Response(
            {'error': f'No se pudo enviar el correo de verificación: {str(e)}'},
            status=500
        )

    return Response({
        'mensaje': 'Cuenta creada. Revisa tu correo electrónico para activarla.',
        'email': email,
    }, status=201)


# ─── ACTIVAR CUENTA (para el frontend React) ─────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def api_activar_cuenta(request, uidb64, token):
    try:
        uid  = urlsafe_base64_decode(uidb64).decode()
        user = UsuarioPersonalizado.objects.get(pk=uid)
    except Exception:
        user = None

    if user and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()

        # Generar tokens JWT para que el usuario quede logueado automáticamente
        refresh  = RefreshToken.for_user(user)
        foto_url = None
        if user.foto_perfil:
            foto_url = request.build_absolute_uri(user.foto_perfil.url)

        return Response({
            'mensaje': '¡Cuenta activada! Ya puedes usar la app.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'rol': getattr(user, 'rol', 'usuario'),
                'is_staff': user.is_staff,
                'es_admin': getattr(user, 'es_admin', False),
                'foto_perfil': foto_url,
                'bio': getattr(user, 'bio', None),
            }
        })
    else:
        return Response(
            {'error': 'El enlace de activación no es válido o ya expiró.'},
            status=400
        )


# ─── PERFIL ───────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_perfil(request):
    user = request.user
    foto_url = None
    if user.foto_perfil:
        foto_url = request.build_absolute_uri(user.foto_perfil.url)
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'rol': getattr(user, 'rol', 'usuario'),
        'is_staff': user.is_staff,
        'es_admin': getattr(user, 'es_admin', False),
        'foto_perfil': foto_url,
        'bio': getattr(user, 'bio', None),
    })


# ─── EDITAR PERFIL ────────────────────────────────────────────────────────────

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def api_actualizar_perfil(request):
    user = request.user
    data = request.data

    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data:
        email = data['email'].strip()
        if UsuarioPersonalizado.objects.filter(email=email).exclude(id=user.id).exists():
            return Response({'error': 'Ese correo ya está en uso.'}, status=400)
        user.email = email
    if 'bio' in data:
        user.bio = data['bio']
    if 'foto_perfil' in request.FILES:
        user.foto_perfil = request.FILES['foto_perfil']

    user.save()

    foto_url = None
    if user.foto_perfil:
        foto_url = request.build_absolute_uri(user.foto_perfil.url)

    return Response({
        'mensaje': 'Perfil actualizado correctamente.',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'rol': getattr(user, 'rol', 'usuario'),
            'is_staff': user.is_staff,
            'es_admin': getattr(user, 'es_admin', False),
            'foto_perfil': foto_url,
            'bio': getattr(user, 'bio', None),
        }
    })


# ─── ADMIN: LISTA USUARIOS ────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_lista_usuarios(request):
    if not (request.user.is_staff or getattr(request.user, 'rol', '') == 'admin'):
        return Response({'error': 'Sin permisos.'}, status=403)
    usuarios = UsuarioPersonalizado.objects.all().order_by('date_joined')
    data = []
    for u in usuarios:
        foto_url = None
        if u.foto_perfil:
            foto_url = request.build_absolute_uri(u.foto_perfil.url)
        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'rol': getattr(u, 'rol', 'usuario'),
            'is_staff': u.is_staff,
            'is_active': u.is_active,
            'date_joined': u.date_joined.strftime('%d/%m/%Y'),
            'foto_perfil': foto_url,
        })
    return Response({'usuarios': data, 'total': len(data)})


# ─── ADMIN: CAMBIAR ROL ───────────────────────────────────────────────────────

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def api_cambiar_rol(request, user_id):
    if not (request.user.is_staff or getattr(request.user, 'rol', '') == 'admin'):
        return Response({'error': 'Sin permisos.'}, status=403)
    try:
        u = UsuarioPersonalizado.objects.get(id=user_id)
    except UsuarioPersonalizado.DoesNotExist:
        return Response({'error': 'Usuario no encontrado.'}, status=404)
    nuevo_rol = request.data.get('rol')
    if nuevo_rol not in ['usuario', 'admin']:
        return Response({'error': 'Rol inválido.'}, status=400)
    u.rol     = nuevo_rol
    u.is_staff = (nuevo_rol == 'admin')
    u.save()
    return Response({'mensaje': f'Rol actualizado a {nuevo_rol}.', 'rol': nuevo_rol})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_crear_alerta_sos(request):
    """
    Registra una alerta SOS en la base de datos.
    POST /api/auth/sos/
    Body: { latitud, longitud, mensaje (opcional), ruta_id (opcional) }
    """
    from .models import AlertaSOS
    from routes.models import Ruta

    latitud  = request.data.get('latitud')
    longitud = request.data.get('longitud')
    mensaje  = request.data.get('mensaje', '')
    ruta_id  = request.data.get('ruta_id')

    maps_url = None
    if latitud and longitud:
        maps_url = f"https://maps.google.com/?q={latitud},{longitud}"

    ruta = None
    if ruta_id:
        try:
            ruta = Ruta.objects.get(id=ruta_id)
        except Ruta.DoesNotExist:
            pass

    alerta = AlertaSOS.objects.create(
        usuario=request.user,
        ruta=ruta,
        latitud=latitud,
        longitud=longitud,
        maps_url=maps_url,
        mensaje=mensaje,
        estado='PENDIENTE',
    )

    return Response({
        'mensaje': 'Alerta SOS registrada.',
        'alerta_id': alerta.id,
        'maps_url': maps_url,
        'estado': alerta.estado,
    }, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_listar_alertas_sos(request):
    """
    Lista todas las alertas SOS. Solo admins.
    GET /api/auth/sos/
    """
    from .models import AlertaSOS

    if not (request.user.is_staff or getattr(request.user, 'rol', '') == 'admin'):
        return Response({'error': 'No tienes permisos.'}, status=403)

    alertas = AlertaSOS.objects.select_related('usuario', 'ruta').order_by('-fecha_hora')[:50]
    data = [
        {
            'id': a.id,
            'usuario': a.usuario.username,
            'ruta': a.ruta.nombre_ruta if a.ruta else None,
            'latitud': str(a.latitud) if a.latitud else None,
            'longitud': str(a.longitud) if a.longitud else None,
            'maps_url': a.maps_url,
            'mensaje': a.mensaje,
            'estado': a.estado,
            'fecha_hora': a.fecha_hora.strftime('%d/%m/%Y %H:%M'),
        }
        for a in alertas
    ]
    return Response({'alertas': data, 'total': len(data)})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def api_atender_alerta_sos(request, alerta_id):
    """
    Cambia el estado de una alerta SOS. Solo admins.
    PATCH /api/auth/sos/<id>/
    Body: { estado: 'ATENDIDA' | 'FALSA' }
    """
    from .models import AlertaSOS

    if not (request.user.is_staff or getattr(request.user, 'rol', '') == 'admin'):
        return Response({'error': 'No tienes permisos.'}, status=403)

    try:
        alerta = AlertaSOS.objects.get(id=alerta_id)
    except AlertaSOS.DoesNotExist:
        return Response({'error': 'Alerta no encontrada.'}, status=404)

    nuevo_estado = request.data.get('estado')
    if nuevo_estado not in ['ATENDIDA', 'FALSA']:
        return Response({'error': 'Estado inválido. Usa ATENDIDA o FALSA.'}, status=400)

    alerta.estado = nuevo_estado
    alerta.atendida_por = request.user
    alerta.save()

    return Response({'mensaje': f'Alerta marcada como {nuevo_estado}.', 'estado': alerta.estado})