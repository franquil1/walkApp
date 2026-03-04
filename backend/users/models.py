from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser


class UsuarioPersonalizado(AbstractUser):
    """
    Modelo de usuario personalizado que extiende AbstractUser.
    """
    email = models.EmailField(unique=True)

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return self.username


# ============================================================
# NUEVOS MODELOS PARA FUNCIONALIDAD DE RUTAS Y SOS
# ============================================================

class AlertaSOS(models.Model):
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('ATENDIDA',  'Atendida'),
        ('FALSA',     'Falsa alarma'),
    ]

    usuario     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='alertas_sos',
        verbose_name="Usuario"
    )
    ruta        = models.ForeignKey(
        'routes.Ruta',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name="Ruta activa"
    )
    latitud     = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitud    = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    maps_url    = models.URLField(blank=True, null=True, verbose_name="Link Google Maps")
    mensaje     = models.TextField(blank=True, null=True, verbose_name="Mensaje adicional")
    estado      = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE')
    fecha_hora  = models.DateTimeField(auto_now_add=True, verbose_name="Fecha y hora")
    atendida_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='sos_atendidas',
        verbose_name="Atendida por"
    )
    notas_admin = models.TextField(blank=True, null=True, verbose_name="Notas del admin")

    class Meta:
        verbose_name = "Alerta SOS"
        verbose_name_plural = "Alertas SOS"
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"SOS — {self.usuario.username} — {self.fecha_hora.strftime('%d/%m/%Y %H:%M')}"








