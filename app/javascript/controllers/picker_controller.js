import { Controller } from "@hotwired/stimulus"
import L from "leaflet"

// CSS de Leaflet (ya lo conoces)
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
document.head.appendChild(link);

// Fix de iconos (igual que en el otro controlador)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default class extends Controller {
  // Definimos que este controlador necesita acceder a los inputs de latitud y longitud
  static targets = ["latitude", "longitude", "map"]

  connect() {
    console.log("📍 Picker conectado")
    
    // 1. Obtener coordenadas iniciales de los inputs (o usar default CDMX)
    const lat = this.latitudeTarget.value || 19.4326
    const lng = this.longitudeTarget.value || -99.1332

    // 2. Inicializar Mapa
    this.map = L.map(this.mapTarget).setView([lat, lng], 15)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map)

    // 3. Crear el Marcador ARRASTRABLE
    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map)

    // EVENTO A: Cuando arrastras el pin, actualiza los inputs
    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng()
      this.updateInputs(position.lat, position.lng)
    })

    // EVENTO B: Cuando haces clic en el mapa, mueve el pin allí
    this.map.on('click', (e) => {
      this.marker.setLatLng(e.latlng)
      this.updateInputs(e.latlng.lat, e.latlng.lng)
    })
  }

  // Función auxiliar para escribir en los inputs
  updateInputs(lat, lng) {
    this.latitudeTarget.value = lat.toFixed(6) // Limitamos decimales para limpieza
    this.longitudeTarget.value = lng.toFixed(6)
  }

  // EVENTO C: Cuando el usuario escribe manualmente en los inputs
  // Esta función la llamaremos desde el HTML con 'data-action="input->picker#updateMapFromInputs"'
  updateMapFromInputs() {
    const lat = parseFloat(this.latitudeTarget.value)
    const lng = parseFloat(this.longitudeTarget.value)

    if (!isNaN(lat) && !isNaN(lng)) {
      const newLatLng = new L.LatLng(lat, lng)
      this.marker.setLatLng(newLatLng)
      this.map.panTo(newLatLng) // Mueve la cámara también
    }
  }

  disconnect() {
    this.map.remove()
  }
}