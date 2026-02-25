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

from django.core.mail import EmailMessage
from django.core.exceptions import ValidationError

from .models import UsuarioPersonalizado
from .forms import RegistroUsuarioForms, LoginForm
from .utils import account_activation_token

from routes.models import RutaRecorrida, Ruta

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

                messages.success(request, 'Cuenta creada. Verifica tu correo electrónico para activarla.')
                return redirect('login')

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

    # Rutas recorridas
    rutas_recorridas = RutaRecorrida.objects.filter(usuario=usuario)

    # Total kilómetros y horas
    total_km = sum([r.ruta.longitud for r in rutas_recorridas if r.ruta.longitud])
    total_horas = len(rutas_recorridas) * 3  # Supongamos 3h por ruta

    # Rutas favoritas usando el related_name correcto
    rutas_favoritas = usuario.rutas_favoritas.all()

    context = {
        'usuario': usuario,
        'rutas_recorridas': rutas_recorridas,
        'total_km': total_km,
        'total_horas': total_horas,
        'rutas_favoritas': rutas_favoritas,
    }

    return render(request, 'profile/perfil_usuario.html', context)


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
