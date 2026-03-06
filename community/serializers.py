from rest_framework import serializers
from .models import Publicacion, Comentario

class PublicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publicacion
        fields = ['usuario', 'ruta', 'comentario', 'imagen']
        
        
class ComentarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comentario
        fields = ['publicacion', 'usuario', 'texto', 'fecha']