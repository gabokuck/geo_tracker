import { Controller } from "@hotwired/stimulus"
import L from "leaflet"

// Truco rápido: Cargamos el CSS de Leaflet dinámicamente
// En React importarías el CSS en el index.js, aquí lo hacemos al vuelo.
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
document.head.appendChild(link);

export default class extends Controller {
  // Definimos los "props" que recibiremos desde el HTML
  static values = { markers: Array }

  connect() {
    // Esto es equivalente al useEffect(() => {}, []) en React
    console.log("Mapa inicializado")
    
    // 1. Crear el mapa apuntando al div donde está este controlador (this.element)
    this.map = L.map(this.element).setView([19.4326, -99.1332], 13)

    // 2. Cargar las 'baldosas' (tiles) de OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map)

    // 3. Iterar sobre los datos que pasamos desde Rails y pintar pines
    this.markersValue.forEach(point => {
      if (point.lat && point.lng) {
        L.marker([point.lat, point.lng])
          .addTo(this.map)
          .bindPopup(`<b>${point.name}</b>`)
      }
    })
  }

  disconnect() {
    // Equivalente al cleanup function del useEffect (desmontar componente)
    this.map.remove()
  }
}