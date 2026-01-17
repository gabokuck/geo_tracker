class Device < ApplicationRecord
  # Callback: Después de guardar cambios (update), ejecuta el broadcast
  after_update_commit :broadcast_telemetry

  private

  def broadcast_telemetry
    # Si cambiaron las coordenadas, enviamos el mensaje
    if saved_change_to_last_latitude? || saved_change_to_last_longitude?
      ActionCable.server.broadcast("telemetry_updates", {
        id: id,
        lat: last_latitude,
        lng: last_longitude,
        serial: serial_number
      })
    end
  end
end