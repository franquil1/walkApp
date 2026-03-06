from django.shortcuts import render,redirect
from .models import Publicacion, Comentario
from .forms import PublicacionForm, ComentarioForm
from django.contrib import messages
# ===============================================
# Api Rest
# ===============================================
from rest_framework import viewsets
from rest_framework import serializers
from .serializers import PublicacionSerializer, ComentarioSerializer
from rest_framework.permissions import IsAuthenticated

def mostrarComunidad(request):
    publicaciones = Publicacion.objects.all().order_by('-fecha_publicacion')

    publicacion_form = PublicacionForm()
    comentario_form = ComentarioForm()

    if request.method == 'POST':
        # Comentario
        if 'comentario_submit' in request.POST:
            texto = request.POST.get("texto")
            publicacion_id = request.POST.get("publicacion_id")
            if texto and publicacion_id:
                try:
                    comentario = Comentario.objects.create(
                        usuario=request.user,
                        publicacion_id=int(publicacion_id),
                        texto=texto
                    )
                    messages.success(request, "Comentario agregado con éxito.")
                    return redirect("comunidad")
                except Exception as e:
                    print("⚠️ Error al guardar comentario:", e)
                    messages.error(request, "No se pudo guardar el comentario.")
            else:
                messages.error(request, "El comentario no puede estar vacío.")
        
        # Publicación
        else:
            publicacion_form = PublicacionForm(request.POST, request.FILES)
            if publicacion_form.is_valid():
                publicacion = publicacion_form.save(commit=False)
                publicacion.usuario = request.user
                publicacion.save()
                messages.success(request, "Publicación creada con éxito.")
                return redirect('comunidad')
            else:
                messages.error(request, "Error al crear publicación.")
                print("Errores de publicación:", publicacion_form.errors)

    context = {
        'publicaciones': publicaciones,
        'publicacion_form': publicacion_form,
        'comentario_form': ComentarioForm(),
    }
    return render(request, 'comunidad/comunidad.html', context)
