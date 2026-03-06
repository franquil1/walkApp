from rest_framework import serializers
from .models import Ruta, UserRutaFavorita, RutaRecorrida

class RutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ruta
        fields = ['vistas', 'descripcion', 'imagen', 'longitud','coordenadas_ruta','nombre_ruta','dificultad_choices','dificultad','duracion_estimada','ubicacion_inicio','ubicacion_fin','ubicacion','puntos_interes','creada_por','fecha_creacion','usuarios_favoritos','','','']
        
        
class RutaFavoritaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRutaFavorita
        fields = ['usuario', 'ruta', 'fecha_agregado', 'fecha']
        
class RutaRecorridaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RutaRecorrida
        fields = ['usuario', 'ruta', 'fecha']