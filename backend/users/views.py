from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.timezone import now, timedelta
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMessage
from django.core.exceptions import ValidationError
from .models import UsuarioPersonalizado
from .forms import RegistroUsuarioForms, LoginForm
from .utils import account_activation_token
from routes.models import RutaRecorrida, Ruta
from .models import AlertaSOS

# ========== LOGIN ==========
def registro_usuario(request):
    """
    Vista para registrar un nuevo usuario.
    Envía un correo de activación al usuario registrado.
    """
    if request.method == 'POST':
        form = RegistroUsuarioForms(request.POST)
        
        if form.is_valid():
            try:
                username = form.cleaned_data['username']
                email = form.cleaned_data['email']
                password = form.cleaned_data['password1']

                # Verificar si el correo ya existe
                if UsuarioPersonalizado.objects.filter(email=email).exists():
                    messages.error(request, 'El correo ya está registrado. Usa otro diferente.')
                    return render(request, 'auth/registro.html', {'form': form})

                # Validar contraseña
                try:
                    validate_password(password)
                except ValidationError as e:
                    for error in e.messages:
                        messages.error(request, error)
                    return render(request, 'auth/registro.html', {'form': form})

                # Crear usuario inactivo
                user = UsuarioPersonalizado.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    is_active=False
                )

                # Generar token de activación
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = account_activation_token.make_token(user)

                # CAUTION: Cambia 'localhost:8000' por el dominio real en producción ====================================================================================oo
                activation_link = f"http://localhost:8000/activar/{uid}/{token}/"
                # =======================================================================================================================================================oo

                # Enviar correo
                message = render_to_string('auth/correo_activacion.html', {
                    'user': user,
                    'activation_link': activation_link
                })

                email_message = EmailMessage(
                    subject='Activa tu cuenta en Walk App',
                    body=message,
                    to=[email]
                )
                email_message.content_subtype = "html"
                email_message.encoding = "utf-8"
                email_message.send()

                messages.success(request, 'Cuenta creada, Verifica tu correo electrónico para activarla.')
                return redirect('users:login')

            except Exception as e:
                messages.error(request, f'Error al crear usuario: {str(e)}')
                return render(request, 'auth/registro.html', {'form': form})

        else:
            # Mostrar errores del formulario
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        messages.error(request, error)
                    else:
                        messages.error(request, f'{field}: {error}')
    
    else:
        form = RegistroUsuarioForms()

    return render(request, 'auth/registro.html', {'form': form})


def login_usuario(request):
    """
    Vista para iniciar sesión.
    """
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                messages.success(request, f'¡Bienvenido de nuevo, {username}!')
                return redirect('home')
            else:
                messages.error(request, 'Nombre de usuario o contraseña incorrectos.')
    else:
        form = LoginForm()
    
    return render(request, 'auth/login.html', {'form': form})


def logout_usuario(request):
    """
    Vista para cerrar sesión.
    """
    logout(request)
    messages.info(request, 'Has cerrado sesión correctamente.')
    return redirect('home')


def activar_cuenta(request, uidb64, token):
    """
    Vista para activar la cuenta del usuario usando el token enviado por correo.
    """
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = UsuarioPersonalizado.objects.get(pk=uid)
    except:
        user = None

    if user and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        messages.success(request, '¡Cuenta activada! Ya puedes iniciar sesión.')
        return redirect('users:login')
    else:
        messages.error(request, 'El enlace de activación no es válido.')
        return redirect('users:registro')
    

# ========== PERFIL USUARIO ==========

@login_required
def perfil_usuario(request):
    usuario = request.user

    # Obtener o crear el perfil
    perfil, _ = UserProfile.objects.get_or_create(user=usuario)

    # Rutas recorridas
    rutas_recorridas = RutaRecorrida.objects.filter(
        usuario=usuario
    ).select_related('ruta').order_by('-fecha')

    # Rutas favoritas
    rutas_favoritas = usuario.rutas_favoritas.all()

    # Totales
    walks = Walk.objects.filter(usuario=usuario)
    total_km    = sum(w.distancia_km or 0 for w in walks)
    total_horas = sum(w.duration_horas or 0 for w in walks)

    return render(request, 'profile/perfil_usuario.html', {
        'usuario':         usuario,
        'perfil':          perfil,          # ← IMPORTANTE: esto conecta foto y SOS
        'rutas_recorridas': rutas_recorridas,
        'rutas_favoritas':  rutas_favoritas,
        'total_km':         round(total_km, 2),
        'total_horas':      round(total_horas, 2),
    })


# ========== VISTAS DE ADMINISTRADOR ==========

@staff_member_required
def admin_dashboard(request):
    return render(request, 'admin/admin_dashboard.html')

@staff_member_required
def admin_estadisticas(request):
    User = get_user_model()

    # Usuarios activos últimos 7 días
    last_7_days = [now().date() - timedelta(days=i) for i in range(6, -1, -1)]
    fechas = [d.strftime("%d/%m") for d in last_7_days]
    usuarios_por_dia = [User.objects.filter(last_login__date=dia).count() for dia in last_7_days]

    # Top 5 rutas más vistas
    rutas_top = Ruta.objects.order_by('-vistas')[:5]
    rutas_nombres = [ruta.nombre_ruta for ruta in rutas_top]
    rutas_vistas = [ruta.vistas for ruta in rutas_top]

    context = {
        'fechas': fechas,
        'usuarios_por_dia': usuarios_por_dia,
        'rutas_nombres': rutas_nombres,
        'rutas_vistas': rutas_vistas,
    }
    return render(request, 'admin/admin_estadisticas.html', context)

@staff_member_required
def admin_rutas(request):
    return render(request, 'admin/admin_rutas.html')

@staff_member_required
def admin_reportes(request):
    return render(request, 'admin/admin_reportes.html')

@user_passes_test(lambda u: u.is_superuser)
@login_required
def admin_usuarios(request):
    usuarios = UsuarioPersonalizado.objects.all().order_by('-date_joined') 
    return render(request, 'admin/admin_usuarios.html', {'usuarios': usuarios})


@csrf_exempt
@login_required
def enviar_sos(request):
    """
    Recibe POST con lat, lng, ruta_id (opcional).
    1. Guarda AlertaSOS en la BD.
    2. Envía email al admin.
    3. Devuelve JSON con el teléfono del contacto de emergencia
       para que el JS abra WhatsApp.
    """
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'error': 'Método no permitido'}, status=405)

    try:
        data    = json.loads(request.body)
        lat     = data.get('lat')
        lng     = data.get('lng')
        ruta_id = data.get('ruta_id')
        mensaje = data.get('mensaje', '')

        maps_url = f"https://maps.google.com/?q={lat},{lng}" if lat and lng else ''

        # ── Ruta activa (opcional) ────────────────────────────
        ruta = None
        if ruta_id:
            try:
                ruta = Ruta.objects.get(id=ruta_id)
            except Ruta.DoesNotExist:
                pass

        # ── Guardar en BD ────────────────────────────────────
        alerta = AlertaSOS.objects.create(
            usuario  = request.user,
            ruta     = ruta,
            latitud  = lat,
            longitud = lng,
            maps_url = maps_url,
            mensaje  = mensaje,
        )

        # ── Email al admin ────────────────────────────────────
        try:
            ruta_nombre = ruta.nombre_ruta if ruta else "No especificada"
            send_mail(
                subject = f'🆘 ALERTA SOS — {request.user.username}',
                message = (
                    f"ALERTA SOS recibida\n\n"
                    f"Usuario:  {request.user.username} ({request.user.email})\n"
                    f"Ruta:     {ruta_nombre}\n"
                    f"Fecha:    {alerta.fecha_hora.strftime('%d/%m/%Y %H:%M:%S')}\n"
                    f"Ubicación: {lat}, {lng}\n"
                    f"Maps:     {maps_url}\n"
                    f"Mensaje:  {mensaje or 'Sin mensaje'}\n\n"
                    f"Revisa el panel de administración:\n"
                    f"{settings.SITE_URL}/admin/routes/alertasos/{alerta.id}/change/"
                ),
                from_email = settings.DEFAULT_FROM_EMAIL,
                recipient_list = [settings.ADMINS[0][1]] if settings.ADMINS else [settings.DEFAULT_FROM_EMAIL],
                fail_silently = True,
            )
        except Exception:
            pass  # No bloquear si falla el correo

        # ── Teléfono contacto de emergencia ───────────────────
        telefono_contacto = None
        nombre_contacto   = None
        try:
            from ranking.models import UserProfile
            perfil = UserProfile.objects.get(user=request.user)
            telefono_contacto = perfil.contacto_emergencia_telefono
            nombre_contacto   = perfil.contacto_emergencia_nombre
        except Exception:
            pass

        return JsonResponse({
            'ok':               True,
            'alerta_id':        alerta.id,
            'maps_url':         maps_url,
            'telefono':         telefono_contacto,
            'nombre_contacto':  nombre_contacto,
        })

    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=500)
    
# ============================================================
# VISTAS DE EDICIÓN DE PERFIL Y ADMINISTRADOR
# ============================================================

from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import render, redirect
from ranking.models import UserProfile, Walk

@login_required
def editar_perfil(request):
    usuario = request.user
    perfil, _ = UserProfile.objects.get_or_create(user=usuario)

    if request.method == 'POST':
        # ── Datos básicos del usuario ──────────────────────
        username   = request.POST.get('username', '').strip()
        email      = request.POST.get('email', '').strip()
        first_name = request.POST.get('first_name', '').strip()
        last_name  = request.POST.get('last_name', '').strip()

        if username:
            usuario.username   = username
        if email:
            usuario.email      = email
        usuario.first_name = first_name
        usuario.last_name  = last_name

        # ── Foto de perfil ──────────────────────────────────
        if 'foto' in request.FILES:
            perfil.foto = request.FILES['foto']

        # ── Contraseña (solo si se ingresó) ────────────────
        password1 = request.POST.get('password1', '').strip()
        password2 = request.POST.get('password2', '').strip()

        if password1:
            if password1 != password2:
                messages.error(request, 'Las contraseñas no coinciden.')
                return redirect('users:editar_perfil')
            if len(password1) < 8:
                messages.error(request, 'La contraseña debe tener al menos 8 caracteres.')
                return redirect('users:editar_perfil')
            usuario.set_password(password1)

        # ── Contacto de emergencia SOS ──────────────────────
        perfil.contacto_emergencia_nombre   = request.POST.get('contacto_emergencia_nombre', '').strip()
        perfil.contacto_emergencia_telefono = request.POST.get('contacto_emergencia_telefono', '').strip()

        # ── Guardar ─────────────────────────────────────────
        usuario.save()
        perfil.save()

        messages.success(request, '¡Perfil actualizado correctamente!')

        # Si cambió contraseña, re-autenticar para no cerrar sesión
        if password1:
            from django.contrib.auth import update_session_auth_hash
            update_session_auth_hash(request, usuario)

        return redirect('users:perfil_usuario')

    return render(request, 'profile/editar_perfil.html', {
        'usuario': usuario,
        'perfil':  perfil,
    })

