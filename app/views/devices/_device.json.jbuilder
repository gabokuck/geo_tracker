json.extract! device, :id, :serial_number, :description, :last_latitude, :last_longitude, :created_at, :updated_at
json.url device_url(device, format: :json)
