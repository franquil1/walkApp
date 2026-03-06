from rest_framework import serializers
from .models import UsuarioPersonalizado, AlertaSOS

class UsuarioPerSerlializers(serializers.ModelSerializer):
    class Meta:
        model = UsuarioPersonalizado
        fields = ['email']
class AlertaSerlializers(serializers.ModelSerializer):
    class Meta:
        model = AlertaSOS
        fields = ['usuario','ruta','latitud','longitud','maps_url','mensaje','estado','fecha_hora','atendida_por','notas_admin']