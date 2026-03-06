from rest_framework.routers import DefaultRouter
from .api_views import EstadisticasViewSet, HistoriaViewSet

router = DefaultRouter()
router.register(r'games', EstadisticasViewSet)
router.register(r'games', HistoriaViewSet)

urlpatterns = router.urls