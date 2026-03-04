from django.urls import path
from . import views

urlpatterns = [
    path('comunidad', views.mostrarComunidad, name='comunidad')
]