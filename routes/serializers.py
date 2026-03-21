from rest_framework import serializers
from .models import Ruta, UserRutaFavorita, RutaRecorrida


class RutaSerializer(serializers.ModelSerializer):
    creada_por_username = serializers.SerializerMethodField()
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = Ruta
        fields = [
            'id',
            'nombre_ruta',
            'descripcion',
            'imagen',
            'imagen_url',
            'longitud',
            'dificultad',
            'duracion_estimada',
            'ubicacion',
            'ubicacion_inicio',
            'ubicacion_fin',
            'puntos_interes',
            'coordenadas_ruta',
            'vistas',
            'creada_por',
            'creada_por_username',
            'fecha_creacion',
        ]
        read_only_fields = ['id', 'vistas', 'creada_por', 'creada_por_username', 'fecha_creacion', 'imagen_url']

    def get_creada_por_username(self, obj):
        return obj.creada_por.username if obj.creada_por else None

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and request:
            return request.build_absolute_uri(obj.imagen.url)
        return None


class RutaFavoritaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRutaFavorita
        fields = ['id', 'usuario', 'ruta', 'fecha_agregado']
        read_only_fields = ['id', 'fecha_agregado']


class RutaRecorridaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RutaRecorrida
        fields = ['id', 'usuario', 'ruta', 'fecha']
        read_only_fields = ['id', 'fecha']