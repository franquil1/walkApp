from django.urls import path
from rest_framework.routers import DefaultRouter
from .api_views import RankingViewset, WalkViewset, UserViewset, ranking_completo, estadisticas_usuario

router = DefaultRouter()
router.register(r'walks', WalkViewset)
router.register(r'usuarios', UserViewset)
router.register(r'semanal', RankingViewset)

urlpatterns = router.urls + [
    path('ranking-completo/', ranking_completo),
    path('estadisticas-usuario/', estadisticas_usuario),
]