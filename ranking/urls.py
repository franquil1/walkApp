from django.urls import path
from . import views


urlpatterns = [
    # ============================
    # RANKING
    # ============================
    path('ranking/', views.mostrarRanking, name='ranking'),
    path('api/top-5-ranking/', views.api_top_5_ranking, name='api_top_5'),
    path('api/estadisticas-usuario/', views.api_estadisticas_usuario, name='api_stats_usuario'),
    path('api/estadisticas-globales/', views.api_estadisticas_globales, name='api_stats_globales'),
    path('api/recorridos-top5/', views.api_recorridos_top5, name='api_recorridos_top5'),
    path('api/ranking-completo/', views.api_ranking_completo, name='api_ranking_completo'),
    path('api/actualizar-posicion/', views.api_actualizar_posicion, name='api_actualizar_posicion'),
]