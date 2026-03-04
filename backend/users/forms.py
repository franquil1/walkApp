from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import UsuarioPersonalizado


class RegistroUsuarioForms(UserCreationForm):
    """
    Formulario para registro de nuevo usuario.
    """
    class Meta:
        model = UsuarioPersonalizado
        fields = ['username', 'email']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = 'Nombre de usuario'
        self.fields['email'].label = 'Correo electrónico'
        self.fields['password1'].label = 'Contraseña'
        self.fields['password2'].label = 'Confirmar contraseña'


class LoginForm(forms.Form):
    """
    Formulario para inicio de sesión.
    """
    username = forms.CharField(label='Nombre de usuario', max_length=100)
    password = forms.CharField(label='Contraseña', widget=forms.PasswordInput)
