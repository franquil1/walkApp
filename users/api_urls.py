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
]