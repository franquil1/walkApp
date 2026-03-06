from rest_framework.routers import DefaultRouter
from .api_views import RutaRecorridaViewSet, RutaViewset, UserRutaViewSet

router = DefaultRouter()
router.register(r'routes', RutaRecorridaViewSet)
router.register(r'routes', RutaViewset)
router.register(r'routes', UserRutaViewSet)

urlpatterns = router.urls