from rest_framework import viewsets
from rest_framework import serializers
from .serializers import HistoriaSerializer, EstadisticasSerializer
from rest_framework.permissions import IsAuthenticated
from .models import HistorialJuegoTrivia, EstadisticasUsuarioTrivia


class HistoriaViewSet(viewsets.ModelViewSet):
    queryset = HistorialJuegoTrivia.objects.all().order_by('-fecha_juego')
    serializer_class = HistoriaSerializer
    permission_classes = [IsAuthenticated]


class EstadisticasViewSet(viewsets.ModelViewSet):
    queryset = EstadisticasUsuarioTrivia.objects.all().order_by('-total_puntos')
    serializer_class = EstadisticasSerializer
    permission_classes = [IsAuthenticated]