from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .serializers import RankingSerializer, WalkSerializer, UserSelializer
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
    serializer_class = RankingSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([AllowAny])  # Público para que se vea aunque no haya sesión
def ranking_completo(request):
    perfiles = UserProfile.objects.select_related('user').order_by('-puntos_semanales')
    resultado = []
    for i, perfil in enumerate(perfiles, start=1):
        resultado.append({
            "posicion": i,
            "username": perfil.user.username,
            "nombre_completo": f"{perfil.user.first_name} {perfil.user.last_name}".strip(),
            "puntos_semanales": perfil.puntos_semanales,
            "total_puntos": perfil.total_puntos,
            "distancia_km": perfil.distancia_total_km,
            "dias_activos": perfil.dias_activos,
        })
    return Response(resultado)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estadisticas_usuario(request):
    try:
        perfil = UserProfile.objects.get(user=request.user)
        perfiles_ordenados = list(
            UserProfile.objects.order_by('-puntos_semanales').values_list('user_id', flat=True)
        )
        posicion = perfiles_ordenados.index(request.user.id) + 1 if request.user.id in perfiles_ordenados else None
        return Response({
            "username": request.user.username,
            "puntos_semanales": perfil.puntos_semanales,
            "total_puntos": perfil.total_puntos,
            "distancia_total_km": perfil.distancia_total_km,
            "dias_activos": perfil.dias_activos,
            "posicion": posicion,
        })
    except UserProfile.DoesNotExist:
        return Response({
            "username": request.user.username,
            "puntos_semanales": 0,
            "total_puntos": 0,
            "distancia_total_km": 0.0,
            "dias_activos": 0,
            "posicion": None,
        })