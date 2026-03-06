from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .api_views import PublicacionViewSet, ComentarioViewSet

router = DefaultRouter()
router.register(r'publicaciones', PublicacionViewSet)
router.register(r'comentarios',ComentarioViewSet )

urlpatterns = router.urls

urlpatterns = [
    path('comunidad', views.mostrarComunidad, name='comunidad')
]