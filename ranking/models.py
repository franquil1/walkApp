from django.db import models
from django.conf import settings
from django.utils import timezone

#=================================================
#  MODELO DE RANKING
#=================================================

class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,  # ← Esto debe estar así
        on_delete=models.CASCADE
    )
    total_puntos = models.IntegerField(default=0)
    Puntos_mensuales = models.IntegerField(default=0)
    puntos_semanales = models.IntegerField(default=0)
    distancia_total_km = models.FloatField(default=0)
    dias_activos = models.IntegerField(default=0)
    ultima_actividad = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.user.username
    
    def actualizar_estadisticas(self, puntos, distancia_km):
        """Actualiza estadísticas del usuario en tiempo real"""
        self.puntos_semanales += puntos
        self.total_puntos += puntos
        self.Puntos_mensuales += puntos
        self.distancia_total_km += distancia_km
        
        # Actualizar días activos
        hoy = timezone.now().date()
        if self.ultima_actividad != hoy:
            self.dias_activos += 1
            self.ultima_actividad = hoy
        
        self.save()

class Walk(models.Model):
    coordenadas_recorrido = models.JSONField(blank=True, null=True, verbose_name="Coordenadas del Recorrido")
    duracion_segundos = models.IntegerField(default=0, verbose_name="Duración en Segundos")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    localizacion = models.CharField(max_length=100)
    fecha = models.DateField()
    distancia_km = models.FloatField()
    duration_horas = models.FloatField()
    puntos_caminata = models.IntegerField()
    image = models.ImageField(upload_to='walks/', blank=True, null=True)
    en_progreso = models.BooleanField(default=False)  # NUEVO: Si está caminando ahora
    fecha_inicio = models.DateTimeField(null=True, blank=True)  # NUEVO: Cuándo empezó
    
    def __str__(self):
        return self.titulo
    
    def calcular_puntos_por_distancia(self, distancia_metros):
        """Convierte metros a puntos: 5 metros = 10 puntos"""
        return int((distancia_metros / 5) * 10)

class RankingSemanal(models.Model):
    """Modelo para guardar snapshots del ranking semanal"""
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    semana_inicio = models.DateField()
    semana_fin = models.DateField()
    puntos_semana = models.IntegerField()
    distancia_semana = models.FloatField()
    posicion = models.IntegerField()
    
    class Meta:
        ordering = ['posicion']
        unique_together = ['usuario', 'semana_inicio']
    
    def __str__(self):
        return f"{self.usuario.username} - Semana {self.semana_inicio}"
    
    
""" comentario para probar las rama optimizacion """