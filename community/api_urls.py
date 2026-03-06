from rest_framework.routers import DefaultRouter
from .api_views import PublicacionViewSet, ComentarioViewSet

router = DefaultRouter()
router.register(r'comunidad', PublicacionViewSet)
router.register(r'comunidad', ComentarioViewSet)

urlpatterns = router.urls