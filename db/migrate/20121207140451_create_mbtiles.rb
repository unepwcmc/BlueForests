class CreateMbtiles < ActiveRecord::Migration
  def change
    create_table :mbtiles do |t|
      t.string :status, default: 'pending'
      t.datetime :last_generation_started_at
      t.datetime :last_generated_at
      t.string :habitat
      t.integer :area_id

      t.timestamps
    end
  end
end
