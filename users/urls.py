from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from . import api_views
from . import views

app_name = 'users'

urlpatterns = [
    # ============================
    # AUTENTICACIÓN
    # ============================
    path('login/', views.login_usuario, name='login'),
    path('logout/', views.logout_usuario, name='logout'),
    path('registro/', views.registro_usuario, name='registro'),
    path('activar/<uidb64>/<token>/', views.activar_cuenta, name='activar_cuenta'),


    # ============================
    # RECUPERACIÓN DE CONTRASEÑA
    # ============================
    path('password_reset/', 
         auth_views.PasswordResetView.as_view(
             success_url=reverse_lazy('users:password_reset_done') # <--- Fuerza el nombre con el namespace
         ), 
         name='password_reset'),

    path('password_reset_done/', auth_views.PasswordResetDoneView.as_view(
        template_name='auth-forgot_password/password_reset_done.html'), name='password_reset_done'),

    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
        template_name='auth-forgot_password/password_reset_confirm.html'), name='password_reset_confirm'),

    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(
        template_name='auth-forgot_password/password_reset_complete.html'), name='password_reset_complete'),
    

    # ============================
    # VISTAS DE ADMINISTRADOR
    # ============================
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('estadisticas/', views.admin_estadisticas, name='admin_estadisticas'),
    path('reportes/', views.admin_reportes, name='admin_reportes'),
    path('rutas_admin/', views.admin_rutas, name='admin_rutas'),
    path('usuarios/', views.admin_usuarios, name='admin_usuarios'),
    
    # ============================
    # VISTAS DE ALERTAS SOS
    # ============================
    path('sos/', views.enviar_sos, name='enviar_sos'),

    # ============================
    # VISTAS DE EDITAR PERFIL
    # ============================
    path('perfil_editar/', views.editar_perfil, name='editar_perfil'),
    path('perfil_usuario/', views.perfil_usuario, name='perfil_usuario'),

    path('api/auth/login/',    api_views.api_login,    name='api_login'),
    path('api/auth/registro/', api_views.api_registro, name='api_registro'),
    path('api/auth/perfil/',   api_views.api_perfil,   name='api_perfil'),
    path('api/auth/perfil/actualizar/', api_views.api_actualizar_perfil, name='api_actualizar_perfil'),
    path('api/auth/usuarios/', api_views.api_lista_usuarios, name='api_lista_usuarios'),
    path('api/auth/usuarios/<int:user_id>/rol/', api_views.api_cambiar_rol, name='api_cambiar_rol'),
    
]
