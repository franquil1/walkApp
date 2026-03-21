from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Vistas HTML (Django clásico) ──────────────────────────────────────────
    path('', include('core.urls')),
    path('', include('users.urls')),
    path('', include('community.urls')),
    path('', include('routes.urls')),
    path('', include('ranking.urls')),
    path('juegos/', include('games.urls')),

    # ── APIs ──────────────────────────────────────────────────────────────────
    path('api/auth/token/refresh/', TokenRefreshView.as_view()),  # JWT refresh
    path('api/auth/',       include('users.api_urls')),    # login, logout, registro, perfil, activar
    path('api/comunidad/',  include('community.api_urls')), # publicaciones, notificaciones
    path('api/rutas/',      include('routes.api_urls')),    # rutas, favoritas
    path('api/ranking/',    include('ranking.api_urls')),   # ranking, estadisticas
    path('api/juegos/',     include('games.api_urls')),
    path('api/admin/', include('users.api_urls_admin')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)