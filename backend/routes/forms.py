from django import forms
from .models import Ruta

# ============================
# FORMULARIO DE CREACIÓN DE RUTA
# ============================
class RutaForm(forms.ModelForm):
    class Meta:
        model = Ruta
        fields = [
            'nombre_ruta',
            'descripcion',
            'imagen',
            'longitud',
            'dificultad',
            'duracion_estimada',
            'ubicacion_inicio',
            'ubicacion_fin',
            'ubicacion',
            'puntos_interes',
            'coordenadas_ruta',  # Añadido
        ]
        
        widgets = {
            'nombre_ruta': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: Sendero Alto de San Miguel'
            }),
            'descripcion': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Describe la ruta, qué pueden esperar los excursionistas...'
            }),
            'longitud': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: 5.5',
                'step': '0.1',
                'min': '0'
            }),
            'dificultad': forms.Select(attrs={
                'class': 'form-control'
            }),
            'duracion_estimada': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: 2-3 horas'
            }),
            'ubicacion_inicio': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: Calle #3 - 5...'
            }),
            'ubicacion_fin': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: carrera #5 - A2...'
            }),
            'ubicacion': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: Popayan, Parque caldas'
            }),
            'puntos_interes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Ej: Pueblo Patojo, El Morro, Zona de camping...'
            }),
            'imagen': forms.FileInput(attrs={
                'class': 'form-control-file',
                'accept': 'image/*'
            }),
            'coordenadas_ruta': forms.HiddenInput(attrs={
                'id': 'id_coordenadas_ruta'
            }),
        }
        
        labels = {
            'nombre_ruta': 'Nombre de la Ruta',
            'descripcion': 'Descripción',
            'imagen': 'Imagen de la Ruta',
            'longitud': 'Longitud (km)',
            'dificultad': 'Dificultad',
            'duracion_estimada': 'Duración Estimada',
            'ubicacion_inicio': 'Ubicación de Inicio',
            'ubicacion_fin': 'Ubicación de Fin',
            'ubicacion': 'Ubicación General',
            'puntos_interes': 'Puntos de Interés',
            'coordenadas_ruta': 'Coordenadas de la Ruta',
        }
