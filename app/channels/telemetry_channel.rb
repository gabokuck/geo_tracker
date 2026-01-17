class TelemetryChannel < ApplicationCable::Channel
  def subscribed
    # Cuando el cliente (navegador) se conecta, lo escuchamos en "telemetry_updates"
    stream_from "telemetry_updates"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end