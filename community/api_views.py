from rest_framework import viewsets
from rest_framework import serializers
from .serializers import PublicacionSerializer, ComentarioSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Publicacion, Comentario

class PublicacionViewSet(viewsets.ModelViewSet):
    # definiciond e datos y el orden en que se van a mostrar
    queryset = Publicacion.objects.all().order_by('-fecha_publicacion')
    serializer_class = PublicacionSerializer
    permission_classes = [IsAuthenticated]
    
class ComentarioViewSet(viewsets.ModelViewSet):
    queryset = Comentario.objects.all().order_by('-fecha_publicacion')
    serializer_class = ComentarioSerializer
    permission_classes = [IsAuthenticated]
