from django.urls import path
from . import api_views

urlpatterns = [
    path('',                            api_views.api_listar_rutas),           
    path('<int:ruta_id>/',              api_views.api_detalle_ruta),            
    path('<int:ruta_id>/eliminar/',     api_views.api_eliminar_ruta),           
    path('<int:ruta_id>/favorita/',     api_views.api_marcar_favorita),         
    path('crear/',                      api_views.api_crear_ruta),              
    path('favoritas/',                  api_views.api_mis_favoritas),           
    path('mis-rutas/',                  api_views.api_mis_rutas),               
]