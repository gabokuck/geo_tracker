class CreateDevices < ActiveRecord::Migration[8.1]
  def change
    create_table :devices do |t|
      t.string :serial_number
      t.text :description
      t.float :last_latitude
      t.float :last_longitude

      t.timestamps
    end
  end
end
