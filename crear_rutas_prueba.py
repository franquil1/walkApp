"""
Script para recrear rutas de prueba en WalkApp con coordenadas reales.
Todas las rutas parten desde el Parque Caldas, Popayán [2.441555, -76.606380].
Uso:
    python crear_rutas_prueba.py
Requisitos:
    pip install requests
"""

import requests
import json

# ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
BASE_URL   = "http://localhost:8000"
USERNAME   = "kevinscc96"
PASSWORD   = "kevin12345"
# ──────────────────────────────────────────────────────────────────────────────

INICIO = [2.441555, -76.606380]  # Parque Caldas, Popayán

NOMBRES_A_ELIMINAR = [
    "Sendero Laguna del Buey",
    "Cráter Volcán Puracé",
    "Cascadas de Coconuco",
    "El Morro de Tulcán",
    "Serranía de las Minas",
    "Sendero Río Molino",
    "Alto de las Papas",
    "Cañón del Río Cauca - Ruta La Balsa",
]

RUTAS = [
    {
        "nombre_ruta":       "Sendero Laguna del Buey",
        "descripcion":       "Recorrido por el páramo de Puracé hasta la hermosa Laguna del Buey. Rodeado de frailejones y fauna andina única. Ideal para fotografía de naturaleza y avistamiento de aves.",
        "longitud":          "8.5",
        "dificultad":        "MODERADO",
        "duracion_estimada": "4-5 horas",
        "ubicacion":         "Puracé, Cauca",
        "ubicacion_inicio":  "Parque Caldas, Popayán",
        "ubicacion_fin":     "Laguna del Buey",
        "puntos_interes":    "Frailejones gigantes, Laguna del Buey, cascadas, cóndores andinos",
        "coordenadas_ruta": [
            INICIO,
            [2.4200, -76.5800],[2.3900, -76.5500],[2.3700, -76.5200],
            [2.3520, -76.5020],[2.3440, -76.4890],[2.3360, -76.4750],
            [2.3270, -76.4610],[2.3230, -76.4540],
        ],
    },
    {
        "nombre_ruta":       "Cráter Volcán Puracé",
        "descripcion":       "Ascenso al volcán Puracé (4.646 msnm), uno de los más activos de Colombia. El sendero atraviesa zona de páramo con vistas espectaculares del Macizo Colombiano.",
        "longitud":          "12.0",
        "dificultad":        "DIFICIL",
        "duracion_estimada": "6-7 horas",
        "ubicacion":         "Puracé, Cauca",
        "ubicacion_inicio":  "Parque Caldas, Popayán",
        "ubicacion_fin":     "Cráter del Volcán Puracé",
        "puntos_interes":    "Cráter activo, vistas al Macizo Colombiano, páramo de altura, fumarolas",
        "coordenadas_ruta": [
            INICIO,
            [2.4100, -76.5600],[2.3800, -76.5000],[2.3500, -76.4500],
            [2.3200, -76.4000],[2.3050, -76.3820],[2.2950, -76.3680],
            [2.2850, -76.3530],[2.2760, -76.3390],
        ],
    },
    {
        "nombre_ruta":       "Cascadas de Coconuco",
        "descripcion":       "Caminata tranquila por el cañón del río Vinagre hasta las termales y cascadas de Coconuco. Perfecta para familias y principiantes. Aguas termales naturales al llegar.",
        "longitud":          "4.2",
        "dificultad":        "FACIL",
        "duracion_estimada": "2 horas",
        "ubicacion":         "Coconuco, Cauca",
        "ubicacion_inicio":  "Parque Caldas, Popayán",
        "ubicacion_fin":     "Cascadas termales Coconuco",
        "puntos_interes":    "Termales naturales, cascadas, río Vinagre, flora andina",
        "coordenadas_ruta": [
            INICIO,
            [2.4200, -76.5900],[2.3900, -76.5600],[2.3600, -76.5400],
            [2.3400, -76.5300],[2.3310, -76.5280],[2.3265, -76.5200],
            [2.3215, -76.5120],[2.3190, -76.5080],
        ],
    },
    {
        "nombre_ruta":       "El Morro de Tulcán",
        "descripcion":       "Ascenso al cerro El Morro de Tulcán, sitio arqueológico precolombino y mirador natural de Popayán. Desde la cima se aprecia la ciudad blanca y los volcanes del Macizo.",
        "longitud":          "3.0",
        "dificultad":        "FACIL",
        "duracion_estimada": "1.5 horas",
        "ubicacion":         "Popayán, Cauca",
        "ubicacion_inicio":  "Parque Caldas, Popayán",
        "ubicacion_fin":     "Cima El Morro de Tulcán",
        "puntos_interes":    "Sitio arqueológico precolombino, mirador 360° de Popayán, estatuas de piedra",
        "coordenadas_ruta": [
            INICIO,
            [2.4490, -76.6080],[2.4505, -76.6030],[2.4488, -76.6010],
            [2.4472, -76.5990],[2.4455, -76.5970],[2.4440, -76.5950],
        ],
    },
    {
        "nombre_ruta":       "Serranía de las Minas",
        "descripcion":       "Travesía por la Serranía de las Minas en busca del Pico de las Minas. Sendero técnico con vistas al Patía y el Macizo. Requiere buena condición física y equipo adecuado.",
        "longitud":          "22.0",
        "dificultad":        "EXTREMO",
        "duracion_estimada": "2 días",
        "ubicacion":         "La Sierra, Cauca",
        "ubicacion_inicio":  "Parque Caldas, Popayán",
        "ubicacion_fin":     "Pico de las Minas",
        "puntos_interes":    "Pico de las Minas, bosque de niebla, nacimientos de agua, vistas al Valle del Patía",
        "coordenadas_ruta": [
            INICIO,
            [2.3800, -76.6500],[2.3200, -76.7000],[2.2500, -76.7500],
            [2.1800, -76.7900],[2.1500, -76.8200],[2.1300, -76.7800],
            [2.1150, -76.7500],[2.1050, -76.7300],
        ],
    },
    {
        "nombre_ruta":       "Sendero Río Molino",
        "descripcion":       "Caminata urbana y ecológica siguiendo el cauce del río Molino desde el centro de Popayán. Ideal para hacer en la mañana. Conecta parques y humedales de la ciudad.",
        "longitud":          "5.5",
        "dificultad":        "FACIL",
        "duracion_estimada": "2-3 horas",
        "ubicacion":         "Popayán, Cauca",
        "ubicacion_inicio":  "Parque Caldas, Popayán",
        "ubicacion_fin":     "Reserva Natural Río Molino",
        "puntos_interes":    "Río Molino, aves urbanas, humedales, jardines botánicos informales",
        "coordenadas_ruta": [
            INICIO,
            [2.4420, -76.6120],[2.4390, -76.6095],[2.4360, -76.6070],
            [2.4330, -76.6045],[2.4300, -76.6020],[2.4270, -76.5995],
            [2.4240, -76.5970],
        ],
    },
    {
        "nombre_ruta":       "Alto de las Papas",
        "descripcion":       "Recorrido por el Páramo de las Papas, cuna del río Magdalena. Ecosistema único en el mundo donde nacen los cuatro ríos más importantes del Macizo Colombiano.",
        "longitud":          "15.0",
        "dificultad":        "MODERADO",
        "duracion_estimada": "7-8 horas",
        "ubicacion":         "San Agustín, Huila — límite Cauca",
        "ubicacion_inicio":  "Parque Caldas, Popayán",
        "ubicacion_fin":     "Estrella Fluvial del Macizo",
        "puntos_interes":    "Nacimiento río Magdalena, páramo de altura, lagunas, frailejones, cóndores",
        "coordenadas_ruta": [
            INICIO,
            [2.3500, -76.5000],[2.2500, -76.4000],[2.1500, -76.3500],
            [2.0500, -76.3000],[1.9500, -76.2800],[1.8800, -76.2800],
            [1.8600, -76.2480],[1.8400, -76.2160],[1.8350, -76.2080],
        ],
    },
    {
        "nombre_ruta":       "Cañón del Río Cauca - Ruta La Balsa",
        "descripcion":       "Descenso por el cañón del río Cauca entre cafetales y guaduales. Ruta histórica que conecta veredas del norte de Popayán. Buenas vistas del río y la cordillera Occidental.",
        "longitud":          "9.0",
        "dificultad":        "MODERADO",
        "duracion_estimada": "4-5 horas",
        "ubicacion":         "Norte de Popayán, Cauca",
        "ubicacion_inicio":  "Parque Caldas, Popayán",
        "ubicacion_fin":     "Puente La Balsa",
        "puntos_interes":    "Cañón del Cauca, cafetales, guaduales, puente colgante, pesca artesanal",
        "coordenadas_ruta": [
            INICIO,
            [2.4600, -76.6200],[2.4800, -76.6300],[2.5000, -76.6350],
            [2.5100, -76.6400],[2.5060, -76.6350],[2.4980, -76.6250],
            [2.4900, -76.6150],[2.4820, -76.6050],
        ],
    },
]


def login(session):
    url = f"{BASE_URL}/api/auth/login/"
    resp = session.post(url, json={"username": USERNAME, "password": PASSWORD})
    if resp.status_code == 200:
        data = resp.json()
        token = data.get("access") or data.get("token") or data.get("access_token")
        if token:
            print(f"✅ Login exitoso como {USERNAME}")
            return token
    print(f"❌ Login fallido ({resp.status_code}): {resp.text}")
    return None


def obtener_todas_las_rutas(session, token):
    url = f"{BASE_URL}/api/rutas/"
    headers = {"Authorization": f"Bearer {token}"}
    resp = session.get(url, headers=headers)
    if resp.status_code == 200:
        return resp.json().get("rutas", [])
    return []


def eliminar_ruta(session, token, ruta_id, nombre):
    url = f"{BASE_URL}/api/rutas/{ruta_id}/eliminar/"
    headers = {"Authorization": f"Bearer {token}"}
    resp = session.delete(url, headers=headers)
    if resp.status_code == 200:
        print(f"  🗑  '{nombre}' eliminada")
        return True
    print(f"  ⚠️  No se pudo eliminar '{nombre}' ({resp.status_code}): {resp.text}")
    return False


def crear_ruta(session, token, ruta_data, numero):
    url = f"{BASE_URL}/api/rutas/crear/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {k: v for k, v in ruta_data.items() if k != "coordenadas_ruta"}
    if "coordenadas_ruta" in ruta_data:
        data["coordenadas_ruta"] = json.dumps(ruta_data["coordenadas_ruta"])
    resp = session.post(url, data=data, headers=headers)
    if resp.status_code == 201:
        n_coords = len(ruta_data.get("coordenadas_ruta", []))
        print(f"  ✅ [{numero}] '{ruta_data['nombre_ruta']}' creada con {n_coords} coordenadas")
        return True
    print(f"  ❌ [{numero}] Error '{ruta_data['nombre_ruta']}' ({resp.status_code}): {resp.text}")
    return False


def main():
    print("=" * 55)
    print("   WalkApp — Recrear rutas con coordenadas reales")
    print(f"   Inicio común: Parque Caldas {INICIO}")
    print("=" * 55)

    session = requests.Session()

    token = login(session)
    if not token:
        print("\n⛔ No se pudo autenticar. Revisa USERNAME y PASSWORD.")
        return

    print(f"\n🗑  Buscando rutas anteriores para eliminar...")
    todas = obtener_todas_las_rutas(session, token)
    eliminadas = 0
    for ruta in todas:
        if ruta.get("nombre_ruta") in NOMBRES_A_ELIMINAR:
            if eliminar_ruta(session, token, ruta["id"], ruta["nombre_ruta"]):
                eliminadas += 1
    print(f"  → {eliminadas} rutas eliminadas\n")

    print(f"📍 Creando {len(RUTAS)} rutas con coordenadas reales...\n")
    creadas = 0
    for i, ruta in enumerate(RUTAS, 1):
        if crear_ruta(session, token, ruta, i):
            creadas += 1

    print(f"\n{'=' * 55}")
    print(f"   Resultado: {creadas}/{len(RUTAS)} rutas creadas")
    if creadas == len(RUTAS):
        print("   🎉 ¡Todas las rutas recreadas con coordenadas!")
    else:
        print("   ⚠️  Algunas rutas fallaron. Revisa los mensajes arriba.")
    print("=" * 55)


if __name__ == "__main__":
    main()