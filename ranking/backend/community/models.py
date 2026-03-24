from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings 

from users.models import UsuarioPersonalizado
from routes.models import Ruta

# ===========================
# COMUNIDAD
# ===========================


class Publicacion(models.Model):
    usuario = models.ForeignKey(UsuarioPersonalizado, on_delete=models.CASCADE)
    ruta = models.ForeignKey(Ruta, on_delete=models.CASCADE)
    comentario = models.TextField(max_length=500)
    imagen = models.ImageField(upload_to='publicaciones/')
    fecha_publicacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.ruta.nombre_ruta}"


class Comentario(models.Model):
    publicacion = models.ForeignKey(Publicacion, on_delete=models.CASCADE, related_name='comentarios')
    usuario = models.ForeignKey(UsuarioPersonalizado, on_delete=models.CASCADE)
    texto = models.TextField(max_length=300)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} comentó en {self.publicacion}"
