class Api::TelemetryController < ApplicationController
  # ⚠️ MUY IMPORTANTE: 
  # Rails protege por defecto contra ataques CSRF esperando un token que solo los navegadores tienen.
  # Como el ESP32 es un hardware, debemos desactivar esta protección para este controlador.
  skip_before_action :verify_authenticity_token

  def create
    # 1. Buscamos el dispositivo por su Serial (que enviará el ESP32)
    device = Device.find_by(serial_number: params[:serial])

    if device.nil?
      render json: { error: "Dispositivo no encontrado" }, status: :not_found
      return
    end

    # 2. Intentamos actualizar las coordenadas
    # Nota: Usamos params[:lat] y params[:lng] para que sea corto para el microcontrolador
    if device.update(last_latitude: params[:lat], last_longitude: params[:lng])
      
      # ¡ÉXITO!
      # Al hacer update, Rails dispara automáticamente el ActionCable que configuramos antes.
      # El mapa se moverá solo sin que hagamos nada extra aquí.
      render json: { status: "ok", message: "Coordenadas recibidas" }, status: :ok
    
    else
      render json: { error: "Datos inválidos", details: device.errors }, status: :unprocessable_entity
    end
  end
end