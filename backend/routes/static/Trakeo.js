// ================================
// CONFIGURACIÓN INICIAL
// ================================
// rutaId, rutaCoordsRaw, urlGuardarPosicion, urlTerminarRuta
// son inyectadas desde el HTML por Django

let rutaCoords = [];

try {
  if (rutaCoordsRaw && rutaCoordsRaw !== 'null' && rutaCoordsRaw !== 'None' && rutaCoordsRaw !== '') {
    rutaCoords = JSON.parse(rutaCoordsRaw);
  }
} catch (e) {
  console.error('Error parseando coordenadas:', e);
}

// Variables de tracking
let watchId = null;
let lastPosition = null;
let userPath = [];
let totalDistanciaMetros = 0;
let userPolyline = null;
let currentMarker = null;
let startTime = Date.now();
let timerInterval = null;

// ================================
// INICIALIZAR MAPA
// ================================
const defaultCenter = rutaCoords.length > 0 ? rutaCoords[0] : [2.444814, -76.614739];
const map = L.map('map').setView(defaultCenter, 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Dibujar ruta planificada (en azul)
if (rutaCoords.length > 1) {
  L.polyline(rutaCoords, {
    color: '#2196F3',
    weight: 4,
    opacity: 0.6,
    dashArray: '10, 10'
  }).addTo(map);

  // Marcador de inicio
  L.marker(rutaCoords[0], {
    icon: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    })
  }).addTo(map).bindPopup('🏁 Inicio de la ruta');

  // Marcador de fin
  L.marker(rutaCoords[rutaCoords.length - 1], {
    icon: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    })
  }).addTo(map).bindPopup('🏆 Meta');

  map.fitBounds(L.polyline(rutaCoords).getBounds());
}

// ================================
// FUNCIONES DE CÁLCULO
// ================================
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function actualizarEstadisticas() {
  const distanciaKm = totalDistanciaMetros / 1000;
  document.getElementById('distancia-recorrida').textContent = distanciaKm.toFixed(2);

  const puntos = Math.floor((totalDistanciaMetros / 5) * 10);
  document.getElementById('puntos-ganados').textContent = puntos;
}

function actualizarTiempo() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  document.getElementById('tiempo-transcurrido').textContent =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const debugLog = document.getElementById('debug-log');
  debugLog.innerHTML += `<div style="color: ${type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue'}">[${timestamp}] ${message}</div>`;
  debugLog.scrollTop = debugLog.scrollHeight;
  console.log(message);
}

// ================================
// TRACKING GPS
// ================================
function iniciarTracking() {
  if (!navigator.geolocation) {
    alert('❌ Tu navegador no soporta geolocalización');
    updateGPSStatus('error', 'GPS no disponible');
    return;
  }

  log('🚀 Iniciando tracking GPS...', 'info');
  updateGPSStatus('active', 'GPS Activo');

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  watchId = navigator.geolocation.watchPosition(
    onGPSSuccess,
    onGPSError,
    options
  );

  timerInterval = setInterval(actualizarTiempo, 1000);
}

function onGPSSuccess(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  log(`📍 Posición: ${lat.toFixed(6)}, ${lng.toFixed(6)} (±${accuracy.toFixed(0)}m)`, 'success');

  if (currentMarker) {
    map.removeLayer(currentMarker);
  }

  currentMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: 'position-marker',
      html: '<div style="background: #FF5722; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  }).addTo(map);

  if (!lastPosition) {
    lastPosition = { lat, lng };
    userPath.push([lat, lng]);
    map.setView([lat, lng], 17);
    log('✅ Primera posición registrada', 'success');
    return;
  }

  const distanciaMetros = calcularDistancia(
    lastPosition.lat, lastPosition.lng,
    lat, lng
  );

  log(`📏 Distancia desde último punto: ${distanciaMetros.toFixed(2)}m`, 'info');

  if (distanciaMetros >= 3) {
    totalDistanciaMetros += distanciaMetros;
    userPath.push([lat, lng]);

    if (userPolyline) {
      map.removeLayer(userPolyline);
    }
    userPolyline = L.polyline(userPath, {
      color: '#FF5722',
      weight: 5,
      opacity: 0.9
    }).addTo(map);

    map.setView([lat, lng], map.getZoom());
    actualizarEstadisticas();
    enviarPosicion(lat, lng, distanciaMetros);

    lastPosition = { lat, lng };

    log(`✅ Movimiento registrado: ${(totalDistanciaMetros / 1000).toFixed(3)} km totales`, 'success');
  } else {
    log(`⏸️ Movimiento muy pequeño (${distanciaMetros.toFixed(2)}m), esperando...`, 'info');
  }
}

function onGPSError(error) {
  log(`❌ Error GPS (${error.code}): ${error.message}`, 'error');
  updateGPSStatus('error', 'Error GPS');

  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert('⚠️ Debes permitir el acceso a tu ubicación para usar esta función');
      break;
    case error.POSITION_UNAVAILABLE:
      log('⚠️ Posición no disponible, reintentando...', 'error');
      break;
    case error.TIMEOUT:
      log('⚠️ Timeout, reintentando...', 'error');
      break;
  }
}

function enviarPosicion(lat, lng, distanciaMetros) {
  fetch(urlGuardarPosicion, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({
      ruta_id: rutaId,
      lat: lat,
      lng: lng,
      distancia_metros: distanciaMetros,
      distancia_total: totalDistanciaMetros
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        log('💾 Datos guardados en servidor', 'success');
      } else {
        log('⚠️ Error en servidor: ' + (data.error || 'desconocido'), 'error');
      }
    })
    .catch(error => {
      log('❌ Error de red: ' + error.message, 'error');
    });
}

function updateGPSStatus(status, text) {
  const statusEl = document.getElementById('gps-status');
  statusEl.className = 'gps-status gps-' + status;
  statusEl.innerHTML = `<i class="fas fa-${status === 'active' ? 'satellite-dish' : 'exclamation-triangle'}"></i> ${text}`;
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// ================================
// CONTROLES
// ================================
document.getElementById('terminar-btn').addEventListener('click', function () {
  if (!confirm(`¿Terminar ruta?\n\n📏 Distancia: ${(totalDistanciaMetros / 1000).toFixed(2)} km\n⭐ Puntos: ${Math.floor((totalDistanciaMetros / 5) * 10)}`)) {
    return;
  }

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    log('⏹️ Tracking detenido', 'info');
  }
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  window.location.href = urlTerminarRuta;
});

// ================================
// INICIAR AL CARGAR
// ================================
window.addEventListener('load', function () {
  log('🎯 Página cargada, iniciando tracking...', 'info');
  iniciarTracking();
});

// Prevenir cierre accidental
window.addEventListener('beforeunload', function (e) {
  if (totalDistanciaMetros > 0) {
    e.preventDefault();
    e.returnValue = '¿Seguro que quieres salir? Se perderá tu progreso.';
    return e.returnValue;
  }
});