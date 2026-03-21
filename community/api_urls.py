from django.urls import path
from . import api_views

urlpatterns = [
    path('publicaciones/', api_views.api_listar_publicaciones),
    path('publicaciones/crear/', api_views.api_crear_publicacion),
    path('publicaciones/<int:pub_id>/eliminar/', api_views.api_eliminar_publicacion),
    path('publicaciones/<int:pub_id>/like/', api_views.api_toggle_like),
    path('publicaciones/<int:pub_id>/comentarios/', api_views.api_comentarios_publicacion),
    path('publicaciones/<int:pub_id>/comentarios/crear/', api_views.api_crear_comentario_pub),
    path('publicaciones/<int:pub_id>/comentarios/<int:comentario_id>/eliminar/', api_views.api_eliminar_comentario_pub),

    path('notificaciones/', api_views.api_mis_notificaciones),
    path('notificaciones/leer/', api_views.api_marcar_leidas),
]