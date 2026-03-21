from django.urls import path
from . import api_views_admin

urlpatterns = [
    path('dashboard/',                      api_views_admin.api_admin_dashboard),
    path('usuarios/',                       api_views_admin.api_admin_usuarios),
    path('usuarios/<int:user_id>/rol/',     api_views_admin.api_admin_cambiar_rol),
    path('usuarios/<int:user_id>/eliminar/', api_views_admin.api_admin_eliminar_usuario),
    path('rutas/',                          api_views_admin.api_admin_rutas),
    path('rutas/<int:ruta_id>/eliminar/',   api_views_admin.api_admin_eliminar_ruta),
    path('sos/',                            api_views_admin.api_admin_sos),
    path('sos/<int:sos_id>/atender/',       api_views_admin.api_admin_sos_atender),
]