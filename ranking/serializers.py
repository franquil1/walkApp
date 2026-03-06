from rest_framework import serializers
from .models import UserProfile, Walk, RankingSemanal


class UserSelializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user', 'total_puntos', 'Puntos_mensuales','puntos_semanales','distancia_total_km','dias_activos','ultima_actividad','contacto_emergencia_nombre','contacto_emergencia_telefono']


class WalkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Walk
        fields = ['coordenadas_recorrido','duracion_segundos','usuario','titulo','localizacion','fecha','distancia_km','duration_horas','puntos_caminata','image','en_progreso','fecha_inicio']

class RankingSerializer(serializers.ModelSerializer):
    class Meta:
        model = RankingSemanal
        fields = ['usuario','semana_inicio','semana_fin','puntos_semana','distancia_semana','posicion']