from django.urls import path
from . import views

urlpatterns = [
    path('', views.mostrarJuegos, name='juegos'),

    # ============================
    # MAPA ROTO
    # ============================
    path('mapa_roto/', views.mostrarMapaRoto, name='mapa_roto'),
    path('api/guardar-mapa/', views.guardar_resultado_mapa, name='guardar_mapa_roto'),
    

    # ============================
    # TRVIA
    # ============================
    path('trivia/', views.trivia_inicio, name='trivia_inicio'), 
    path('trivia/menu/', views.trivia_menu, name='juegos/trivia/menu/'),  
    path('trivia/juego/', views.trivia_juego, name='trivia/juego/'), 
    path('trivia/final/', views.trivia_final, name='trivia/final/'),  
    path('api/guardar-resultado/', views.guardar_resultado, name='guardar_resultado'),
    path('api/estadisticas/', views.obtener_estadisticas, name='obtener_estadisticas'),
    path('trivia/historial/', views.historial_completo, name='historial_trivia'),
    
]