from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .serializers import RutaSerializer, RutaFavoritaSerializer, RutaRecorridaSerializer
from .models import Ruta, RutaRecorrida, UserRutaFavorita


# ─── VIEWSETS (existentes) ────────────────────────────────────────────────────

class RutaViewset(viewsets.ModelViewSet):
    queryset = Ruta.objects.all().order_by('nombre_ruta')
    serializer_class = RutaSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Listar y ver detalle es público
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(creada_por=self.request.user)


class RutaRecorridaViewSet(viewsets.ModelViewSet):
    queryset = RutaRecorrida.objects.all()
    serializer_class = RutaRecorridaSerializer
    permission_classes = [IsAuthenticated]


class UserRutaViewSet(viewsets.ModelViewSet):
    queryset = UserRutaFavorita.objects.all()
    serializer_class = RutaFavoritaSerializer
    permission_classes = [IsAuthenticated]


# ─── ENDPOINTS FUNCIONALES ────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def api_crear_ruta(request):
    """
    Crea una nueva ruta. Acepta multipart/form-data para subir imagen.
    POST /api/rutas/crear/
    Body: { nombre_ruta, descripcion, longitud, dificultad, duracion_estimada,
            ubicacion, ubicacion_inicio, ubicacion_fin, puntos_interes,
            coordenadas_ruta (JSON string), imagen (file, opcional) }
    """
    serializer = RutaSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(creada_por=request.user)
        return Response({'mensaje': 'Ruta creada exitosamente.', 'ruta': serializer.data}, status=201)
    return Response({'errores': serializer.errors}, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_listar_rutas(request):
    """
    Lista todas las rutas con filtros opcionales.
    GET /api/rutas/
    Query params: dificultad, buscar
    """
    rutas = Ruta.objects.all().order_by('nombre_ruta')

    dificultad = request.GET.get('dificultad')
    buscar = request.GET.get('buscar')

    if dificultad:
        rutas = rutas.filter(dificultad__iexact=dificultad)
    if buscar:
        rutas = rutas.filter(nombre_ruta__icontains=buscar)

    serializer = RutaSerializer(rutas, many=True, context={'request': request})
    return Response({'rutas': serializer.data, 'total': rutas.count()})


@api_view(['GET'])
@permission_classes([AllowAny])
def api_detalle_ruta(request, ruta_id):
    """
    Devuelve el detalle de una ruta e incrementa las vistas.
    GET /api/rutas/<id>/
    """
    try:
        ruta = Ruta.objects.get(id=ruta_id)
    except Ruta.DoesNotExist:
        return Response({'error': 'Ruta no encontrada.'}, status=404)

    from django.db.models import F
    ruta.vistas = F('vistas') + 1
    ruta.save(update_fields=['vistas'])
    ruta.refresh_from_db()

    es_favorita = False
    if request.user.is_authenticated:
        es_favorita = UserRutaFavorita.objects.filter(usuario=request.user, ruta=ruta).exists()

    serializer = RutaSerializer(ruta, context={'request': request})
    return Response({**serializer.data, 'es_favorita': es_favorita})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_eliminar_ruta(request, ruta_id):
    """
    Elimina una ruta. Solo el creador o un admin puede eliminarla.
    DELETE /api/rutas/<id>/eliminar/
    """
    try:
        ruta = Ruta.objects.get(id=ruta_id)
    except Ruta.DoesNotExist:
        return Response({'error': 'Ruta no encontrada.'}, status=404)

    es_admin = request.user.is_staff or getattr(request.user, 'rol', '') == 'admin'
    es_creador = ruta.creada_por == request.user

    if not (es_admin or es_creador):
        return Response({'error': 'No tienes permisos para eliminar esta ruta.'}, status=403)

    nombre = ruta.nombre_ruta
    ruta.delete()
    return Response({'mensaje': f'Ruta "{nombre}" eliminada correctamente.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_marcar_favorita(request, ruta_id):
    """
    Marca o desmarca una ruta como favorita (toggle).
    POST /api/rutas/<id>/favorita/
    """
    try:
        ruta = Ruta.objects.get(id=ruta_id)
    except Ruta.DoesNotExist:
        return Response({'error': 'Ruta no encontrada.'}, status=404)

    favorita, created = UserRutaFavorita.objects.get_or_create(
        usuario=request.user, ruta=ruta
    )
    if not created:
        favorita.delete()
        return Response({'favorita': False, 'mensaje': 'Ruta quitada de favoritas.'})

    return Response({'favorita': True, 'mensaje': 'Ruta marcada como favorita.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_mis_favoritas(request):
    """
    Devuelve los IDs de las rutas favoritas del usuario autenticado.
    GET /api/rutas/favoritas/
    """
    ids = UserRutaFavorita.objects.filter(
        usuario=request.user
    ).values_list('ruta_id', flat=True)
    return Response({'favoritas': list(ids)})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_mis_rutas(request):
    """
    Devuelve las rutas creadas por el usuario autenticado.
    GET /api/rutas/mis-rutas/
    """
    rutas = Ruta.objects.filter(creada_por=request.user).order_by('-fecha_creacion')
    serializer = RutaSerializer(rutas, many=True, context={'request': request})
    return Response({'rutas': serializer.data, 'total': rutas.count()})