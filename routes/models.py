from django.db import models
from django.conf import settings

# ===========================
# MODELO DE RUTA
# ===========================

class Ruta(models.Model):
    vistas = models.PositiveIntegerField(default=0)
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    imagen = models.ImageField(upload_to='rutas/', blank=True, null=True)
    longitud = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Longitud (km)")
    coordenadas_ruta = models.JSONField(blank=True, null=True, verbose_name="Coordenadas de la Ruta")
    nombre_ruta = models.CharField(max_length=255, verbose_name="Nombre de la Ruta")

    dificultad_choices = [
        ('FACIL', 'Fácil'),
        ('MODERADO', 'Moderado'),
        ('DIFICIL', 'Difícil'),
        ('EXTREMO', 'Extremo'),
    ]
    dificultad = models.CharField(
        max_length=50,
        choices=dificultad_choices,
        default='MODERADO',
        verbose_name="Dificultad"
    )

    duracion_estimada = models.CharField(max_length=100, blank=True, null=True, verbose_name="Duración Estimada")
    
    # Campos simplificados para ubicaciones
    ubicacion_inicio = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ubicación de Inicio")
    ubicacion_fin = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ubicación de Fin")
    
    ubicacion = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ubicación General")
    puntos_interes = models.TextField(blank=True, null=True, verbose_name="Puntos de Interés")

    creada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rutas_creadas',
        verbose_name="Creada por"
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")

    usuarios_favoritos = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='UserRutaFavorita',
        related_name='rutas_favoritas',
        verbose_name="Marcada como Favorita por"
    )

    class Meta:
        verbose_name = "Ruta"
        verbose_name_plural = "Rutas"
        ordering = ['nombre_ruta']

    def __str__(self):
        return self.nombre_ruta
    
    
# ===========================
# MODELO: RUTA FAVORITA
# ===========================

class UserRutaFavorita(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favoritas_intermedias'  # nombre exclusivo para evitar conflicto
    )
    ruta = models.ForeignKey(
        Ruta,
        on_delete=models.CASCADE,
        related_name='favorita_por_usuarios'
    )
    fecha_agregado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'ruta')
        verbose_name = "Ruta Favorita de Usuario"
        verbose_name_plural = "Rutas Favoritas de Usuarios"

    def __str__(self):
        return f"{self.usuario.username} - {self.ruta.nombre_ruta}"
    

# ===========================
# MODELO: RUTA RECORRIDA
# ===========================

class RutaRecorrida(models.Model):
    usuario        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recorridos')
    ruta           = models.ForeignKey(Ruta, on_delete=models.CASCADE, related_name='recorridos')
    fecha          = models.DateField(auto_now_add=True)
    distancia_km   = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    tiempo_segundos = models.PositiveIntegerField(default=0)
    puntos_ganados = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Ruta Recorrida"
        verbose_name_plural = "Rutas Recorridas"
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.usuario.username} - {self.ruta.nombre_ruta} ({self.fecha})"