from rest_framework import viewsets
from rest_framework import serializers
from .serializers import RankingSerializer, WalkSerializer, UserSelializer
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile, Walk, RankingSemanal

class UserViewset(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserSelializer
    permission_classes = [IsAuthenticated]
    
class WalkViewset(viewsets.ModelViewSet):
    queryset = Walk.objects.all()
    serializer_class = WalkSerializer
    permission_classes = [IsAuthenticated]
    
class RankingViewset(viewsets.ModelViewSet):
    queryset = RankingSemanal.objects.all()
    serializer_class= RankingSerializer
    permission_classes = [IsAuthenticated]