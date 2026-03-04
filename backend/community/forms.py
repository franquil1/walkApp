from django import forms
from .models import Publicacion, Comentario

#==================
# COMUNIDAD
#==================
class PublicacionForm(forms.ModelForm):
    class Meta:
        model = Publicacion
        fields = ['ruta', 'comentario', 'imagen']
        widgets = {
            'comentario': forms.Textarea(attrs={'rows': 3}),
        }

class ComentarioForm(forms.ModelForm):
    class Meta:
        model = Comentario
        fields = ['texto']
        widgets = {
            'texto': forms.TextInput(attrs={'placeholder': 'Añadir un comentario...'}),
        }