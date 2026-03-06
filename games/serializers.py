from rest_framework import serializers
from .models import HistorialJuegoTrivia, EstadisticasUsuarioTrivia

class HistoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialJuegoTrivia
        fields = ['usuario', 'categoria', 'puntos', 'respuestas_correctas', 'respuestas_incorrectas', 'fecha_juegos', 'duracion_segundos']
        
class EstadisticasSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadisticasUsuarioTrivia
        fields = ['usuario', 'total_juegos','total_puntos','mejor_puntaje', 'categoria_favorita','total_correctas','total_incorrectas', 'ultima_actualizcion']
        
        