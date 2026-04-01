from django.urls import path
from . import api_views

urlpatterns = [
    path('login/',                              api_views.api_login),
    path('logout/',                             api_views.api_logout),
    path('registro/',                           api_views.api_registro),
    path('activar/<str:uidb64>/<str:token>/',   api_views.api_activar_cuenta),
    path('perfil/',                             api_views.api_perfil),
    path('perfil/editar/',                      api_views.api_actualizar_perfil),
    path('usuarios/',                           api_views.api_lista_usuarios),
    path('usuarios/<int:user_id>/rol/',         api_views.api_cambiar_rol),
    path('sos/',                                api_views.api_crear_alerta_sos),      
    path('sos/listar/',                         api_views.api_listar_alertas_sos),     
    path('sos/<int:alerta_id>/',                api_views.api_atender_alerta_sos),
    path('api/auth/password-reset/',         api_views.api_password_reset,         name='api_password_reset'),
    path('api/auth/password-reset/verify/',  api_views.api_password_reset_verify,  name='api_password_reset_verify'),
    path('api/auth/password-reset/confirm/', api_views.api_password_reset_confirm, name='api_password_reset_confirm'),
]