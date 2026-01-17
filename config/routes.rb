Rails.application.routes.draw do
  # Rutas de la web (HTML)
  resources :devices
  root "devices#index"

  # --- AQUÍ AGREGAMOS LA API ---
  namespace :api do
    # POST /api/telemetry
    post 'telemetry', to: 'telemetry#create'
  end
end