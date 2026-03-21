from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import LikePublicacion, ComentarioPublicacion, Notificacion

@receiver(post_save, sender=LikePublicacion)
def notificar_like(sender, instance, created, **kwargs):
    if created and instance.usuario != instance.publicacion.usuario:
        Notificacion.objects.create(
            destinatario=instance.publicacion.usuario,
            remitente=instance.usuario,
            tipo='like',
            publicacion=instance.publicacion,
        )

@receiver(post_save, sender=ComentarioPublicacion)
def notificar_comentario(sender, instance, created, **kwargs):
    if created and instance.usuario != instance.publicacion.usuario:
        Notificacion.objects.create(
            destinatario=instance.publicacion.usuario,
            remitente=instance.usuario,
            tipo='comentario',
            publicacion=instance.publicacion,
        )