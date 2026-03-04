from django.shortcuts import redirect, render
from routes.models import Ruta


""" ==========| MOSTRAR VISTAS GENERALES |=========="""

def mostrar_home(request):
    # Obtener todas las rutas
    rutas = Ruta.objects.all().order_by('-fecha_creacion')
    
    # Aplicar filtros si existen
    dificultad = request.GET.get('dificultad')
    longitud = request.GET.get('longitud')
    buscar = request.GET.get('buscar')
    
    if dificultad:
        rutas = rutas.filter(dificultad__iexact=dificultad)
    
    if longitud:
        longitud = float(longitud)
        if longitud == 5:
            rutas = rutas.filter(longitud__lt=5)
        elif longitud == 10:
            rutas = rutas.filter(longitud__gte=5, longitud__lte=10)
        elif longitud == 100:
            rutas = rutas.filter(longitud__gt=10)
    
    if buscar:
        rutas = rutas.filter(nombre_ruta__icontains=buscar)
    
    context = {
        'rutas': rutas[:6]  # Mostrar solo las primeras 6 rutas en la home
    }
    
    return render(request, 'home/home.html', context)







""" ==========| FUNCION DE BUSCADOR DE RUTAS |=========="""

""" def buscar_rutas(request):
    query = request.GET.get('q', '').strip()

    if query:
        rutas = Ruta.objects.filter(nombre_ruta__icontains=query)
        
        if rutas.count() == 1:
            return redirect('detalle_ruta', ruta_id=rutas.first().id)
        elif rutas.exists():
            return render(request, 'sin_resultados.html', {'query': query})
        else:
            return render(request, 'sin_resultados.html', {'query': query})
        
    return redirect('rutas') """
