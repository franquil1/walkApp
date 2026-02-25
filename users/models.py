from django.db import models
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
