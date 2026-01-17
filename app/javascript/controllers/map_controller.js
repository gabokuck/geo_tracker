import { Controller } from "@hotwired/stimulus"
import L from "leaflet"
import { createConsumer } from "@rails/actioncable" // Importamos WebSockets

// CSS de Leaflet (igual que antes)
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
document.head.appendChild(link);

export default class extends Controller {
  static values = { markers: Array }

  connect() {
    console.log("Mapa y WebSockets conectados")
    this.markersMap = {} // Para guardar referencias a los pines (id -> marker)

    // 1. Iniciar Mapa
    this.map = L.map(this.element).setView([19.4326, -99.1332], 13)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map)

    // 2. Dibujar pines iniciales
    this.markersValue.forEach(point => {
      this.addOrUpdateMarker(point) // Usamos una función auxiliar
    })

    // 3. SUSCRIPCIÓN WEBSOCKET
    this.subscription = createConsumer().subscriptions.create("TelemetryChannel", {
      received: (data) => {
        console.log("¡Dato recibido en vivo!", data)
        this.addOrUpdateMarker({
          id: data.id, // Ojo: Asegúrate de pasar el ID en el HTML inicial también
          lat: data.lat,
          lng: data.lng,
          name: data.serial
        })
      }
    })
  }

  // Función inteligente: Crea el pin si no existe, o lo mueve si ya existe
  addOrUpdateMarker(point) {
    // Nota: Necesitamos un ID único para rastrear el marker. 
    // Usaremos el serial_number como clave si el ID no viene en el JSON inicial.
    const key = point.serial || point.name 

    if (this.markersMap[key]) {
      // MOVER PIN EXISTENTE
      const newLatLng = new L.LatLng(point.lat, point.lng)
      this.markersMap[key].setLatLng(newLatLng)
    } else {
      // CREAR NUEVO PIN
      const marker = L.marker([point.lat, point.lng])
        .addTo(this.map)
        .bindPopup(`<b>${point.name}</b>`)
      
      this.markersMap[key] = marker
    }
  }

  disconnect() {
    this.map.remove()
    if (this.subscription) this.subscription.unsubscribe()
  }
}