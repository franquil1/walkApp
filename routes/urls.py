from django.urls import path
from django import views
from users import urls 
from . import views

urlpatterns = [
    path('rutas/', views.mostrarRutas, name='rutas'),
    
    
    # ============================
    # CRUD DE RUTAS (USUARIO)
    # ============================

    # RUTAS
    path('rutas/crear/', views.crear_ruta, name='crear_ruta'),
    path('rutas/', views.lista_rutas, name='rutas'),
    path('buscar-rutas/', views.buscar_rutas, name='buscar_rutas'),
    path('<int:ruta_id>/', views.detalle_ruta, name='detalle_ruta'),
    path('rutas/eliminar/<int:pk>/', views.eliminar_ruta, name='eliminar_ruta'),
    path('rutas/<int:ruta_id>/qr/', views.generar_qr_ruta, name='generar_qr_ruta'),
    
    # FAVORITAS
    path('rutas/<int:ruta_id>/marcar-favorita/', views.marcar_favorita, name='marcar_favorita'),
    path('rutas/<int:ruta_id>/quitar-favorita/', views.quitar_favorita, name='quitar_favorita'),

    # INICIAR RUTA (para el tracking)
    path('rutas/<int:ruta_id>/iniciar/', views.iniciar_ruta, name='iniciar_ruta'),
    path('rutas/<int:ruta_id>/terminar/', views.terminar_ruta, name='terminar_ruta'),
    path('api/guardar-posicion/', views.guardar_posicion, name='guardar_posicion'),
]

    