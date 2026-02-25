from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UsuarioPersonalizado

from routes.models import Ruta, RutaRecorrida, UserRutaFavorita


class UsuarioPersonalizadoAdmin(UserAdmin):
    model = UsuarioPersonalizado
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active']


admin.site.register(UsuarioPersonalizado, UsuarioPersonalizadoAdmin)

admin.site.register(Ruta)
admin.site.register(RutaRecorrida)
admin.site.register(UserRutaFavorita)