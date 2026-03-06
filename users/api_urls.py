from rest_framework.routers import DefaultRouter
from .api_views import UsuarioPerViewset, AlertSosViewset

router = DefaultRouter()

router.register(r'editar_perfil', UsuarioPerViewset)
router.register(r'perfil_usuario', AlertSosViewset)

urlpatterns = router.urls