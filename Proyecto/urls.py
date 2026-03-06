from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('', include('users.urls')),
    path('', include('community.urls')),
    path('juegos/', include('games.urls')),
    path('', include('routes.urls')),
    path('', include('ranking.urls')),
    path('rutas/', include('routes.urls')),
    # ====================================
    # Apis
    # ====================================  
    # API
    path('api/comunidad/', include('community.api_urls')),
    path('api/ranking/', include('ranking.api_urls')), 
    path('api/juegos/', include('games.api_urls')), 
    path('api/dashboard/', include('users.api_urls')), 
    path('api/estadisticas/', include('users.api_urls')), 
    path('api/reportes/', include('users.api_urls')), 
    path('api/rutas_admin/', include('users.api_urls')), 
    path('api/usuarios/', include('users.api_urls')), 
    path('api/correo_activacion/', include('users.api_urls')), 
    path('api/login/', include('users.api_urls')), 
    path('api/registro/', include('users.api_urls')), 
    path('api/password_reset_complete/', include('users.api_urls')), 
    path('api/password_reset_confirm/', include('users.api_urls')), 
    path('api/password_reset_done/', include('users.api_urls')), 
    path('api/password_reset/', include('users.api_urls')), 
    path('api/perfil_editar/', include('users.api_urls')), 
    path('api/perfil_usuario/', include('users.api_urls')), 
    path('api/rutas/rutas/', include('routes.api_urls')), 
    path('api/rutas/', include('routes.api_urls')), 
]


# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
