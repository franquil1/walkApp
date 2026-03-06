from rest_framework import serializers
from rest_framework import viewsets
from .serializers import UsuarioPerSerlializers, AlertaSerlializers
from .models import UsuarioPersonalizado, AlertaSOS
from rest_framework.permissions import IsAuthenticated



class UsuarioPerViewset(viewsets.ModelViewSet):
    queryset = UsuarioPersonalizado.objects.all()
    serializer_class = UsuarioPerSerlializers
    permission_classes = [IsAuthenticated]
    
class AlertSosViewset(viewsets.ModelViewSet):
    queryset = AlertaSOS.objects.all()
    serializer_class = AlertaSerlializers
    permission_classes = [IsAuthenticated]