from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


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
    path('api/community/', include('community.urls')),
]


# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
