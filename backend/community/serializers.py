from rest_framework import serializers
from .models import Publicacion, Comentario

class PublicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publicacion
        fields = ['usuario', 'ruta', 'comentario', 'imagen']
        
        
class ComentarioSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    class Meta:
        model = Comentario
        fields = ['publicacion', 'usuario', 'texto', 'fecha']