from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UsuarioPersonalizado

from routes.models import Ruta, RutaRecorrida, UserRutaFavorita
from django.contrib import admin
from routes.models import Ruta, UserRutaFavorita
from users.models import AlertaSOS


class UsuarioPersonalizadoAdmin(UserAdmin):
    model = UsuarioPersonalizado
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active']


admin.site.register(UsuarioPersonalizado, UsuarioPersonalizadoAdmin)

admin.site.register(Ruta)
admin.site.register(RutaRecorrida)
admin.site.register(UserRutaFavorita)

# Registro del modelo AlertaSOS con personalización en el admin


@admin.register(AlertaSOS)
class AlertaSOSAdmin(admin.ModelAdmin):
    list_display  = ('usuario', 'ruta', 'estado', 'fecha_hora', 'maps_link')
    list_filter   = ('estado', 'fecha_hora')
    search_fields = ('usuario__username', 'usuario__email')
    readonly_fields = ('usuario', 'ruta', 'latitud', 'longitud', 'maps_url', 'fecha_hora', 'maps_link')
    ordering      = ('-fecha_hora',)

    fieldsets = (
        ('📍 Información de la alerta', {
            'fields': ('usuario', 'ruta', 'latitud', 'longitud', 'maps_url', 'maps_link', 'mensaje', 'fecha_hora')
        }),
        ('✅ Gestión', {
            'fields': ('estado', 'atendida_por', 'notas_admin')
        }),
    )

    def maps_link(self, obj):
        from django.utils.html import format_html
        if obj.maps_url:
            return format_html('<a href="{}" target="_blank">📍 Ver en Maps</a>', obj.maps_url)
        return "Sin ubicación"
    maps_link.short_description = "Google Maps"