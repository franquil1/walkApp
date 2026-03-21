from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings 

from users.models import UsuarioPersonalizado
from routes.models import Ruta

# ===========================
# COMUNIDAD
# ===========================

class Publicacion(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    ruta = models.ForeignKey(Ruta, on_delete=models.CASCADE, null=True, blank=True)
    contenido = models.TextField()
    imagen = models.ImageField(upload_to='publicaciones/', null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.contenido[:30]}"

class Comentario(models.Model):
    publicacion = models.ForeignKey(Publicacion, on_delete=models.CASCADE, related_name='comentarios')
    usuario = models.ForeignKey(UsuarioPersonalizado, on_delete=models.CASCADE)
    texto = models.TextField(max_length=300)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} comentó en {self.publicacion}"
    
class LikePublicacion(models.Model):
    publicacion = models.ForeignKey(Publicacion, on_delete=models.CASCADE, related_name='likes')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('publicacion', 'usuario')

    def __str__(self):
        return f"{self.usuario.username} ❤️ {self.publicacion.id}"


class ComentarioPublicacion(models.Model):
    publicacion = models.ForeignKey(Publicacion, on_delete=models.CASCADE, related_name='comentarios_comunidad')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    texto = models.TextField(max_length=500)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} en publicacion {self.publicacion.id}"

# ===========================
# NOTIFICACIONES
# ===========================

class Notificacion(models.Model):
    TIPO_CHOICES = [
        ('like',        'Like en publicación'),
        ('comentario',  'Comentario en publicación'),
        ('ruta',        'Comentario en ruta'),
    ]

    destinatario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notificaciones'
    )
    remitente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notificaciones_enviadas'
    )
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    publicacion = models.ForeignKey(
        Publicacion, on_delete=models.CASCADE,
        null=True, blank=True
    )
    leida = models.BooleanField(default=False)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.remitente.username} → {self.destinatario.username} ({self.tipo})"