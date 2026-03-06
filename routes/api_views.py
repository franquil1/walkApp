from rest_framework import viewsets
from rest_framework import serializers
from .serializers import RutaFavoritaSerializer, RutaRecorridaSerializer, RutaSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Ruta, RutaRecorrida, UserRutaFavorita

class RutaViewset(viewsets.ModelViewSet):
    # definiciond e datos y el orden en que se van a mostrar
    queryset = Ruta.objects.all()
    serializer_class = RutaSerializer
    permission_classes = [IsAuthenticated]
    
class RutaRecorridaViewSet(viewsets.ModelViewSet):
    queryset = RutaRecorrida.objects.all()
    serializer_class = RutaRecorridaSerializer
    permission_classes = [IsAuthenticated]
    
    
class UserRutaViewSet(viewsets.ModelViewSet):
    queryset = UserRutaFavorita.objects.all()
    serializer_class = RutaFavoritaSerializer
    permission_classes = [IsAuthenticated]
